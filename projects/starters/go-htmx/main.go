package main

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

type PageData struct {
	Title       string
	Description string
	Time        TimeData
}

type TimeData struct {
	Timestamp string
}

func main() {
	port := envOrDefault("PORT", "8080")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}

		renderTemplate(w, "src/index.html", PageData{
			Title:       "HTMX + Go",
			Description: "A simple starter using Elements, HTMX fragment updates, and Go templates.",
			Time:        currentTime(),
		}, "src/time.html")
	})
	http.HandleFunc("/fragment/time", func(w http.ResponseWriter, r *http.Request) {
		renderTemplate(w, "src/time.html", currentTime())
	})

	fmt.Printf("Server is running at http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func currentTime() TimeData {
	return TimeData{Timestamp: time.Now().Format("2006-01-02 15:04:05 MST")}
}

func envOrDefault(name string, defaultValue string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}

	return defaultValue
}

func renderTemplate(w http.ResponseWriter, templatePath string, data interface{}, templatePaths ...string) {
	paths := append([]string{templatePath}, templatePaths...)
	tmpl, templateError := template.ParseFiles(paths...)
	if templateError != nil {
		log.Printf("template parse error path=%s err=%v", templatePath, templateError)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	var buffer bytes.Buffer
	templateError = tmpl.ExecuteTemplate(&buffer, filepath.Base(templatePath), data)
	if templateError != nil {
		log.Printf("template execute error path=%s err=%v", templatePath, templateError)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write(buffer.Bytes())
}
