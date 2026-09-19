# NVIDIA Elements + Sphinx Starter

Build a Python-only Sphinx documentation site with MyST Markdown and a local NVIDIA Elements theme. The theme extends Sphinx's bundled `basic` theme and loads Elements from jsDelivr, so the project needs no Node.js metadata or frontend build step.

## Requirements

- Python 3.12 or newer
- [uv](https://docs.astral.sh/uv/)

## Install

Create the locked virtual environment without changing dependency versions:

```shell
uv sync --locked
```

## Develop

Start the development server with automatic browser reloads:

```shell
uv run sphinx-autobuild docs dist
```

## Build

Create a warning-free production build in `dist`:

```shell
uv run --locked sphinx-build -W --keep-going -n -b html docs dist
```

## Customize the theme

The local theme lives in `docs/_themes/nvidia_elements`:

- Edit `layout.html` and its partial templates to change the documentation shell.
- Edit `static/elements.css` to compose the layout with Elements design tokens.
- Edit `static/elements.js` to change navigation or color-scheme behavior.
- Keep `theme.toml` inheriting from Sphinx's `basic` theme to retain Sphinx search and generated markup support.

## Replace the CDN

Source templates intentionally use unversioned Elements URLs. The Elements download pipeline stamps exact package versions into released ZIP archives. If you host assets elsewhere, replace the four jsDelivr URLs in `docs/_themes/nvidia_elements/layout.html` with equivalent files from `@nvidia-elements/themes`, `@nvidia-elements/styles`, and `@nvidia-elements/core`.

## NVIDIA-internal registry usage

NVIDIA-internal projects should retrieve the three Elements packages from the approved internal npm registry, publish or serve the four built assets through an approved internal asset host, and replace the public jsDelivr URLs in `layout.html`. Keep the pinned asset versions aligned with the internal registry versions used by your documentation release.
