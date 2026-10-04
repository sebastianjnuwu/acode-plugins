// Full plugin build in a single Go program:
//
//  1. Generates src/generated/icon-map.json + icons.css from icons/*.svg
//     (same output as the old scripts/gen-icon-assets.js).
//  2. Bundles + minifies src/main.js with esbuild (Go, no babel/webpack).
//  3. Copies static files into .acode/build.
//  4. Zips everything into .acode/plugin.zip.
//
// Usage: go run ./scripts/build   (from the package root)
package main

import (
	"archive/zip"
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strings"
	"time"

	"github.com/evanw/esbuild/pkg/api"
)

var (
	root     string
	tTotal   = time.Now()
	stepTime = time.Now()
)

func step(name string) {
	fmt.Printf("• %s... ", name)
	stepTime = time.Now()
}

func done(extra ...any) {
	msg := fmt.Sprint(extra...)
	if msg != "" {
		msg = " " + msg
	}
	fmt.Printf("ok (%.1fs)%s\n", time.Since(stepTime).Seconds(), msg)
}

func fail(err error) {
	fmt.Printf("\nFATAL: %v\n", err)
	os.Exit(1)
}

func readJSON(path string, v any) {
	data, err := os.ReadFile(path)
	if err != nil {
		fail(err)
	}
	if err := json.Unmarshal(data, v); err != nil {
		fail(fmt.Errorf("%s: %w", path, err))
	}
}

type fileEntry struct {
	Name           string   `json:"name"`
	FileName       []string `json:"file_name"`
	FileExtensions []string `json:"file_extensions"`
}

type folderEntry struct {
	Name       string   `json:"name"`
	FolderName []string `json:"folder_name"`
}

// encodeURIComponent replica: keeps [A-Za-z0-9-_.!~*'()] raw,
// percent-encodes every other byte (uppercase hex).
func encodeURIComponent(s string) string {
	var b strings.Builder
	b.Grow(len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9' ||
			c == '-' || c == '_' || c == '.' || c == '!' || c == '~' ||
			c == '*' || c == '\'' || c == '(' || c == ')' {
			b.WriteByte(c)
		} else {
			fmt.Fprintf(&b, "%%%02X", c)
		}
	}
	return b.String()
}

var (
	reNewline = regexp.MustCompile("\r?\n")
	reSpaces  = regexp.MustCompile(`\s{2,}`)
)

func encodeSvg(svg string) string {
	s := reSpaces.ReplaceAllString(reNewline.ReplaceAllString(svg, " "), " ")
	return encodeURIComponent(strings.TrimSpace(s))
}

func genAssets() {
	step("gen icon-map.json + icons.css")

	var files []fileEntry
	var folders []folderEntry
	readJSON(filepath.Join(root, "src", "file_icons.json"), &files)
	readJSON(filepath.Join(root, "src", "folder_icons.json"), &folders)

	referenced := map[string]bool{
		"folder": true, "folder-open": true,
		"folder-root": true, "folder-root-open": true,
	}
	iconsDir := filepath.Join(root, "icons")
	for _, e := range files {
		referenced[e.Name] = true
	}
	for _, e := range folders {
		referenced[e.Name] = true
		// Expanded variant only when its asset exists; otherwise Acode
		// reuses the closed icon (no broken references).
		if _, err := os.Stat(filepath.Join(iconsDir, e.Name+"-open.svg")); err == nil {
			referenced[e.Name+"-open"] = true
		}
	}

	ids := make([]string, 0, len(referenced))
	for id := range referenced {
		ids = append(ids, id)
	}
	sort.Strings(ids)

	type group struct {
		class string
		svg   string
		ids   []string
	}
	byHash := map[string]*group{}
	order := []string{}
	for _, id := range ids {
		raw, err := os.ReadFile(filepath.Join(iconsDir, id+".svg"))
		if err != nil {
			fail(fmt.Errorf("missing SVG for %q", id))
		}
		sum := sha256.Sum256(raw)
		h := hex.EncodeToString(sum[:])
		g, ok := byHash[h]
		if !ok {
			g = &group{class: id, svg: string(raw)}
			byHash[h] = g
			order = append(order, h)
		}
		g.ids = append(g.ids, id)
	}

	iconMap := make(map[string]string, len(ids))
	var rules []string
	rules = append(rules,
		".mi { display: inline-flex; align-items: center; justify-content: center; flex: none; vertical-align: middle; }",
		".tile > .mi:first-child { display: inline-flex; align-items: center; justify-content: center; flex: none; width: 1em; height: 1em; margin-right: .25em; font-size: 1em; }",
	)
	for _, h := range order {
		g := byHash[h]
		uri := "data:image/svg+xml," + encodeSvg(g.svg)
		rules = append(rules,
			fmt.Sprintf(`.mi.mi-%s::before{content:'';display:block;width:1em;height:1em;background:url("%s") no-repeat center/contain;}`, g.class, uri))
		for _, id := range g.ids {
			iconMap[id] = "icon mi mi-" + g.class
		}
	}

	outDir := filepath.Join(root, "src", "generated")
	if err := os.MkdirAll(outDir, 0o755); err != nil {
		fail(err)
	}
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.SetEscapeHTML(false)
	enc.SetIndent("", " ")
	if err := enc.Encode(iconMap); err != nil {
		fail(err)
	}
	if err := os.WriteFile(filepath.Join(outDir, "icon-map.json"), buf.Bytes(), 0o644); err != nil {
		fail(err)
	}
	css := strings.Join(rules, "\n") + "\n"
	if err := os.WriteFile(filepath.Join(outDir, "icons.css"), []byte(css), 0o644); err != nil {
		fail(err)
	}
	done(fmt.Sprintf("%d ids, %d unique SVGs, %.0f KB", len(iconMap), len(order), float64(len(css))/1024))
}

func bundle() {
	step("esbuild bundle src/main.js")
	result := api.Build(api.BuildOptions{
		EntryPoints:       []string{filepath.Join(root, "src", "main.js")},
		Bundle:            true,
		MinifyWhitespace:  true,
		MinifyIdentifiers: true,
		MinifySyntax:      true,
		Format:            api.FormatIIFE,
		AbsWorkingDir:     root,
		Write:             false,
		LogLevel:          api.LogLevelWarning,
	})
	if len(result.Errors) > 0 {
		for _, e := range result.Errors {
			fmt.Printf("\n%s", e.Text)
		}
		fail(fmt.Errorf("esbuild failed"))
	}
	if len(result.OutputFiles) != 1 {
		fail(fmt.Errorf("expected 1 output file, got %d", len(result.OutputFiles)))
	}
	buildDir := filepath.Join(root, ".acode", "build")
	if err := os.MkdirAll(buildDir, 0o755); err != nil {
		fail(err)
	}
	out := filepath.Join(buildDir, "main.js")
	if err := os.WriteFile(out, result.OutputFiles[0].Contents, 0o644); err != nil {
		fail(err)
	}
	done(fmt.Sprintf("%.1f KB", float64(len(result.OutputFiles[0].Contents))/1024))
}

func copyFile(dst, src string) {
	in, err := os.Open(src)
	if err != nil {
		fail(err)
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		fail(err)
	}
	defer out.Close()
	if _, err := io.Copy(out, in); err != nil {
		fail(err)
	}
}

func copyStatics() {
	step("copy statics")
	buildDir := filepath.Join(root, ".acode", "build")
	for _, f := range []string{"file_icons.json", "folder_icons.json"} {
		copyFile(filepath.Join(buildDir, f), filepath.Join(root, "src", f))
	}
	copyFile(filepath.Join(buildDir, "icons.css"), filepath.Join(root, "src", "generated", "icons.css"))
	done("3 files")
}

func addToZip(w *zip.Writer, zipPath, diskPath string) {
	info, err := os.Stat(diskPath)
	if err != nil {
		fail(err)
	}
	hdr, err := zip.FileInfoHeader(info)
	if err != nil {
		fail(err)
	}
	hdr.Name = zipPath
	hdr.Method = zip.Deflate
	fw, err := w.CreateHeader(hdr)
	if err != nil {
		fail(err)
	}
	in, err := os.Open(diskPath)
	if err != nil {
		fail(err)
	}
	defer in.Close()
	if _, err := io.Copy(fw, in); err != nil {
		fail(err)
	}
}

func packZip() {
	step("zip .acode/plugin.zip")
	buildDir := filepath.Join(root, ".acode", "build")
	zipPath := filepath.Join(root, ".acode", "plugin.zip")
	out, err := os.Create(zipPath)
	if err != nil {
		fail(err)
	}
	w := zip.NewWriter(out)
	count := 0

	for _, f := range []string{"icon.png", "plugin.json"} {
		addToZip(w, f, filepath.Join(root, f))
		count++
	}
	readme := filepath.Join(root, "readme.md")
	if _, err := os.Stat(readme); os.IsNotExist(err) {
		readme = filepath.Join(root, "README.md")
	}
	addToZip(w, "readme.md", readme)
	count++
	changelogs := filepath.Join(root, "changelogs.md")
	if _, err := os.Stat(changelogs); err == nil {
		addToZip(w, "changelogs.md", changelogs)
		count++
	}

	var names []string
	err = filepath.WalkDir(buildDir, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		rel, err := filepath.Rel(buildDir, p)
		if err != nil {
			return err
		}
		names = append(names, rel)
		return nil
	})
	if err != nil {
		fail(err)
	}
	sort.Strings(names)
	for _, n := range names {
		addToZip(w, n, filepath.Join(buildDir, n))
	}
	if err := w.Close(); err != nil {
		fail(err)
	}
	if err := out.Close(); err != nil {
		fail(err)
	}
	st, _ := os.Stat(zipPath)
	done(fmt.Sprintf("%d entries, %.0f KB", len(names)+count, float64(st.Size())/1024))
}

func main() {
	_, thisFile, _, ok := runtime.Caller(0)
	if !ok {
		fail(fmt.Errorf("cannot locate source dir"))
	}
	// .acode/gobuild/main.go -> package root
	root = filepath.Dir(filepath.Dir(filepath.Dir(thisFile)))

	// Fresh build dir (replaces webpack `clean: true`).
	if err := os.RemoveAll(filepath.Join(root, ".acode", "build")); err != nil {
		fail(err)
	}

	genAssets()
	bundle()
	copyStatics()
	packZip()

	fmt.Printf("Done in %.1fs\n", time.Since(tTotal).Seconds())
}
