package main

import (
	"fmt"
	"html/template"
	"net/http"
	"time"
)

type Page[T any] struct {
	Template string
	Data     T
}

type PageData struct {
	Title       string
	Description string
	Date        string
}

func main() {
	// serve the elements js/css bundles from the node_modules directory
	fs := http.FileServer(http.Dir("node_modules/@nve"))
	http.Handle("/node_modules/@nvidia-elements/", http.StripPrefix("/node_modules/@nvidia-elements/", fs))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		renderPage(w, Page[PageData]{
			Template: "src/index.html",
			Data: PageData{
				Title:       "Hello from Elements + Go!",
				Description: "This is a simple example of using Elements + Go to create a web page.",
				Date:        time.Now().Format("02-01-2006 15:04:05"),
			},
		})
	})

	fmt.Println("Server is running at http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

func renderPage[T any](w http.ResponseWriter, page Page[T]) {
	template := template.Must(template.ParseFiles(page.Template))
	templateError := template.Execute(w, page)
	if templateError != nil {
		http.Error(w, templateError.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
