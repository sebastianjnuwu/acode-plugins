// Full plugin build in a single Go program:
//
//  1. Bundles + minifies src/acode.js with esbuild (Go, no babel/webpack).
//  2. Zips everything into .acode/plugin.zip.
//
// Usage: go run ./.acode/gobuild   (from the package root)
package main

import (
	"archive/zip"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"runtime"
	"sort"
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

func bundle() {
	step("esbuild bundle src/acode.js")
	result := api.Build(api.BuildOptions{
		EntryPoints:       []string{filepath.Join(root, "src", "acode.js")},
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
	out := filepath.Join(buildDir, "acode.js")
	if err := os.WriteFile(out, result.OutputFiles[0].Contents, 0o644); err != nil {
		fail(err)
	}
	done(fmt.Sprintf("%.1f KB", float64(len(result.OutputFiles[0].Contents))/1024))
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

	if err := os.RemoveAll(filepath.Join(root, ".acode", "build")); err != nil {
		fail(err)
	}

	bundle()
	packZip()

	fmt.Printf("Done in %.1fs\n", time.Since(tTotal).Seconds())
}
