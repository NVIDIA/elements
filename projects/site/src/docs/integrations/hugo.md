---
{
  title: 'Hugo',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'hugo' %}

{% installation %}

## Integration

Elements is agnostic to any frontend or backend tooling. To leverage Elements in Hugo-based static sites, two paths are available:

1. Static bundles with little to no JavaScript ecosystem tooling
2. Build time tooling with NodeJS and npm packages

The current simple [Hugo starter]({{ELEMENTS_REPO_BASE_URL}}/-/tree/main/projects/starters/hugo) provides an example of a basic Hugo static site leveraging the pre-built JS and CSS bundles. This enables Hugo-generated HTML pages with minimal NodeJS/JavaScript ecosystem tooling.

But, if you would like to integrate advanced tooling such as TypeScript, tree-shaking, or other JavaScript ecosystem tools and packages, consider leveraging tools like [Vite](https://vite.dev/) alongside Hugo or explore the TypeScript starter as an alternative.

## Registry Usage Guidelines

{% artifactory-usage %}
