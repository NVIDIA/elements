---
{
  title: 'Go',
  description: 'Use NVIDIA Elements with Go web frameworks: serve the components from Go templates and integrate with html/template rendering.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'go' %}

{% installation 'go' %}

Elements is agnostic to any frontend or backend tooling. To use Elements in Go-based templating, two paths are available.

1. Static bundles with little to no JavaScript ecosystem tooling
2. Build-time tooling with Node.js and npm packages

The [Go starter]({{ELEMENTS_REPO_BASE_URL}}/tree/main/projects/starters/go) provides a basic Go web server that leverages the pre-built JavaScript and CSS bundles. The [HTMX + Go integration](../go-htmx/) extends that setup with fragment responses for HTMX interactions. Both starters enable Go-generated HTML pages with minimal JavaScript ecosystem tooling.

If you would like to integrate advanced tooling such as TypeScript, tree-shaking, or other JavaScript ecosystem tools and packages, consider leveraging tools like [Vite](https://vite.dev/) and [Vite Go](https://olivere.github.io/vite/).

## Registry Usage Guidelines

{% artifactory-usage %}
