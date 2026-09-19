---
{
  title: 'Sphinx',
  description: 'Build MyST Markdown documentation with Sphinx and a local NVIDIA Elements theme.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'sphinx' %}

The [Sphinx starter]({{ELEMENTS_REPO_BASE_URL}}/tree/main/projects/starters/sphinx) is a Python-only `uv` project. It uses MyST Markdown and an Elements-owned local theme that extends Sphinx's bundled `basic` theme.

## Create a Project

Use the Elements CLI to download the starter:

```shell
nve project.create --type=sphinx
cd sphinx
uv sync --locked
```

The CLI scaffolds the project and prints the `uv` commands without installing dependencies or starting a server.

## Develop Locally

```shell
uv run sphinx-autobuild docs dist
```

## Build for Production

```shell
uv run --locked sphinx-build -W --keep-going -n -b html docs dist
```

## Theme and CDN Assets

The theme source lives in `docs/_themes/nvidia_elements`. It provides Sphinx search, document and page navigation, breadcrumbs, previous and next links, responsive mobile behavior, and a persisted light or dark color scheme.

Released starter archives pin the Elements themes, fonts, styles, and core bundle to exact package versions. Source templates keep the URLs free of versions so repository builds always stamp the current package versions.
