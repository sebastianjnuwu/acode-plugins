// Publishes .acode/plugin.zip to https://acode.app/api/plugin.
//
// Credentials come from the environment (same names as publish.js):
//
//	ACODE_EMAIL, ACODE_PASSWORLD
//
// Usage: go run ./.acode/gopublish   (from the package root)
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/cookiejar"
	"os"
	"path/filepath"
	"runtime"
)

var root string

func fail(err error) {
	fmt.Printf("publish failed: %v\n", err)
	os.Exit(1)
}

func login(client *http.Client, email, password string) string {
	body, err := json.Marshal(map[string]string{
		"email":    email,
		"password": password,
	})
	if err != nil {
		fail(err)
	}
	req, err := http.NewRequest(http.MethodPost, "https://acode.app/api/login", bytes.NewReader(body))
	if err != nil {
		fail(err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		fail(err)
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		fail(fmt.Errorf("login status %s: %s", resp.Status, string(respBody)))
	}
	cookies := resp.Cookies()
	if len(cookies) == 0 {
		fail(fmt.Errorf("login response had no cookies: %s", string(respBody)))
	}
	return cookies[0].Value
}

func upload(client *http.Client, token, zipPath string) {
	var form bytes.Buffer
	w := multipart.NewWriter(&form)
	part, err := w.CreateFormFile("plugin", "plugin.zip")
	if err != nil {
		fail(err)
	}
	f, err := os.Open(zipPath)
	if err != nil {
		fail(err)
	}
	if _, err := io.Copy(part, f); err != nil {
		fail(err)
	}
	f.Close()
	if err := w.Close(); err != nil {
		fail(err)
	}

	req, err := http.NewRequest(http.MethodPut, "https://acode.app/api/plugin", &form)
	if err != nil {
		fail(err)
	}
	req.Header.Set("Content-Type", w.FormDataContentType())
	req.Header.Set("X-Requested-With", "XMLHttpRequest")
	// The login session cookies (kept in the jar) go out automatically;
	// the API token goes as an explicit cookie like the web client does.
	req.AddCookie(&http.Cookie{Name: "token", Value: token})

	resp, err := client.Do(req)
	if err != nil {
		fail(err)
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	fmt.Println(string(respBody))
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		fail(fmt.Errorf("upload status %s", resp.Status))
	}
}

func main() {
	_, thisFile, _, ok := runtime.Caller(0)
	if !ok {
		fail(fmt.Errorf("cannot locate source dir"))
	}
	// .acode/gopublish/main.go -> package root
	root = filepath.Dir(filepath.Dir(filepath.Dir(thisFile)))

	email := os.Getenv("ACODE_EMAIL")
	password := os.Getenv("ACODE_PASSWORLD")
	if email == "" || password == "" {
		fail(fmt.Errorf("set ACODE_EMAIL and ACODE_PASSWORLD env vars"))
	}

	client := &http.Client{}
	if jar, err := cookiejar.New(nil); err == nil {
		// Keep any session cookies from login so the upload request
		// carries the same session (CSRF validation depends on it).
		client.Jar = jar
	}
	token := login(client, email, password)
	upload(client, token, filepath.Join(root, ".acode", "plugin.zip"))
}
