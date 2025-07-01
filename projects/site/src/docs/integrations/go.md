---
{
  title: 'Go',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'go' %}

{% installation %}

## Integration

Elements is agnostic to any frontend or backend tooling. To leverage elements in Go based templating two paths are available.

1. Static bundles with little to no JavScript ecosystem tooling
2. Build time tooling with NodeJS and NPM/Artifactory packages

Our current simple [Go starter](https://github.com/NVIDIA/elements/-/tree/main/projects/starters/go) provides an example of a basic Go web server leveraging our pre-built JS and CSS bundles. This enables Go generated HTML pages with minimal NodeJS/JavaScript ecosystem tooling.

However, if you would like to integrate advanced tooling such as TypeScript, treeshaking or other JavaScript ecosystem tools and packages it is recommended to leverage tools like [Vite](https://vite.dev/) and [Vite Go](https://olivere.github.io/vite/)
