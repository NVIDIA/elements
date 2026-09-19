# Build documentation with Elements

This starter combines [Sphinx](https://www.sphinx-doc.org/) and MyST Markdown with an NVIDIA Elements-owned local theme. It provides accessible navigation, search, responsive layouts, and light and dark color schemes without a frontend build pipeline.

```{toctree}
:maxdepth: 2
:caption: Documentation

guide
api
```

## Start here

Use the {doc}`guide` to explore common MyST authoring patterns. See the {doc}`api` for Sphinx domain markup and cross-references.

:::{note}
The theme source lives in `docs/_themes/nvidia_elements`. Customize those templates and styles directly for your documentation.
:::

## What is included

| Capability    | Implementation                                         |
| ------------- | ------------------------------------------------------ |
| Authoring     | MyST Markdown                                          |
| Navigation    | Sphinx document tree and page table of contents        |
| Search        | Sphinx-generated search index                          |
| Theme         | Local theme extending Sphinx `basic`                   |
| Design system | Version-pinned NVIDIA Elements CDN assets in downloads |

## Production build

```shell
uv run --locked sphinx-build -W --keep-going -n -b html docs dist
```
