package main

import (
	"io/fs"
	"log"
	"net/http"
	"path/filepath"
	"strings"
	"github.com/gin-contrib/multitemplate"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.HTMLRender = loadTemplates("templates")
	r.Static("/static", "./static")
	r.GET("/", getIndexPage)
	r.GET("/wiki/:id", getWikiPage)
	r.NoRoute(get404Page)
	r.Run()
}

func loadTemplates(templatesDir string) multitemplate.Renderer {
	r := multitemplate.NewRenderer()

	layoutFile := templatesDir + "/layout.html.tmpl"

	filepath.Walk(templatesDir, func(path string, info fs.FileInfo, err error) error {
		if path == layoutFile {
			return nil // ignore the layout file
		}

		name, foundPrefix := strings.CutPrefix(path, templatesDir + "/")
		if !foundPrefix {
			return nil
		}
		name, foundSuffix := strings.CutSuffix(name, ".tmpl")
		if !foundSuffix {
			return nil // ignore non-template files
		}

		log.Printf("r.AddFromFiles(\"%s\", \"%s\", \"%s\")\n", name, layoutFile, path)
		r.AddFromFiles(name, layoutFile, path)
		return nil
	})

	return r
}

func getIndexPage(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", gin.H{
		"Title": "home",
		"Description": "Test Description",
	})
}

var wiki = map[string]Page{
	"AAAAAA": Page{
		Title: "Test Title",
		SiteName: "Test Wiki",
		Description: "Test Description",
	},
}

func getWikiPage(c *gin.Context) {
	id := c.Param("id")
	log.Printf("ID = %s", id)
	page, page_found := wiki[id]
	if !page_found {
		get404Page(c)
		return
	}
	c.HTML(http.StatusOK, "page.html", page)
}

func get404Page(c *gin.Context) {
	c.HTML(http.StatusOK, "404.html", Page{
		Title: "404",
		Description: "This page does not exist or you don't have permission to access it",
	})
}

type Page struct {
	Title string
	SiteName string
	Description string // optional
	Keywords []string // optional
	CurrentUrl string // optional
	BannerUrl string // optional
	SiteUrl string
}

type Attribute struct {
	Name string
	Values []string
}