---
{
  title: 'CDN',
  description: 'Load NVIDIA Elements from a CDN with pre-built CSS and either the full component bundle or direct ESM component imports.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

<h2 nve-text="heading sm muted">Use CDN-hosted Elements packages for prototypes, static pages, demos, and environments without a JavaScript build pipeline</h2>

CDN loading is the fastest path when you need a standalone HTML file or a server-rendered page that cannot use Vite, Rollup, ESBuild, or Webpack. For production applications with a build step, prefer package-manager installation so the app gets normal tooling, type checking, dependency locking, bundling, and tree-shaking.

Elements publishes the public packages to npm, and public CDN providers can serve those package files directly.

Browse the packages on jsDelivr:

- [`@nvidia-elements/core`](https://www.jsdelivr.com/package/npm/@nvidia-elements/core)
- [`@nvidia-elements/code`](https://www.jsdelivr.com/package/npm/@nvidia-elements/code)
- [`@nvidia-elements/forms`](https://www.jsdelivr.com/package/npm/@nvidia-elements/forms)
- [`@nvidia-elements/markdown`](https://www.jsdelivr.com/package/npm/@nvidia-elements/markdown)
- [`@nvidia-elements/monaco`](https://www.jsdelivr.com/package/npm/@nvidia-elements/monaco)
- [`@nvidia-elements/styles`](https://www.jsdelivr.com/package/npm/@nvidia-elements/styles)
- [`@nvidia-elements/themes`](https://www.jsdelivr.com/package/npm/@nvidia-elements/themes)

## Full Bundle

Use the full component bundle when you want the simplest static HTML setup. This loads the pre-built theme CSS, utility CSS, fonts, and all core component registrations.

```html
<!doctype html>
<html lang="en" nve-theme="dark" nve-transition="auto">
  <head>
    <title>NVIDIA Elements Artifact</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/bundles/index.css';
      @import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/fonts/inter.css';
      @import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/styles/dist/bundles/index.css';
    </style>
    <script type="module">
      import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/core/dist/bundles/index.min.js';
    </script>
  </head>
  <body nve-text="body" nve-layout="column gap:md pad:lg">
    <nve-alert status="success">Elements loaded from the full CDN bundle.</nve-alert>
  </body>
</html>
```

This approach keeps authoring simple because one JavaScript import registers the bundled core components. The tradeoff is payload size: the page loads the full core bundle even if it uses only one component.

## Component ESM Imports

Use jsDelivr ESM imports when the page uses only a small set of components.

Keep the pre-built CSS imports, then import only the `define.js` entrypoints for the components that appear in the page.

```html
<!doctype html>
<html lang="en" nve-theme="dark" nve-transition="auto">
  <head>
    <title>NVIDIA Elements ESM CDN</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/bundles/index.css';
      @import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/fonts/inter.css';
      @import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/styles/dist/bundles/index.css';
    </style>
    <script type="module">
      import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/core/alert/define.js/+esm';
      import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/core/badge/define.js/+esm';
    </script>
  </head>
  <body nve-text="body" nve-layout="column gap:md pad:lg">
    <nve-alert status="success">
      Only the alert and badge component modules are imported.
    </nve-alert>
    <p nve-text="body">
      Build status:
      <nve-badge status="success">ready</nve-badge>
    </p>
  </body>
</html>
```

This approach can reduce JavaScript loaded by the page, but it has more moving parts. You must import every component registration that the markup uses, and browser-loaded ESM does not provide the same type checking, build diagnostics, dependency reuse, or optimization that package-manager builds provide.

## CDN Tradeoffs

<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="220px">Approach</nve-grid-column>
    <nve-grid-column>Best For</nve-grid-column>
    <nve-grid-column>Tradeoff</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>Full CDN bundle</nve-grid-cell>
    <nve-grid-cell>Artifacts, demos, static pages, CMS pages, and environments without JavaScript package tooling.</nve-grid-cell>
    <nve-grid-cell>Simplest setup, but loads the bundled component surface even when the page uses a small subset.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>CDN ESM imports</nve-grid-cell>
    <nve-grid-cell>Small standalone pages that use a known set of components.</nve-grid-cell>
    <nve-grid-cell>Loads fewer component modules, but every used component needs an explicit registration import.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Build-time packages</nve-grid-cell>
    <nve-grid-cell>Applications, libraries, tested user workflows, and production codebases.</nve-grid-cell>
    <nve-grid-cell>Requires package tooling, but gives dependency locking, editor types, linting, test integration, bundling, and optimization.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>

For build-time package setup, use the standard installation flow:

```shell
nve project.setup
```

## Version Pinning

The examples above omit versions for readability. For shared demos or production pages, pin package versions in CDN URLs so a new package release cannot change the page without a source change.

```html
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/core@2.0.1/dist/bundles/index.min.js';
</script>
```

Pin the related `@nvidia-elements/core`, `@nvidia-elements/styles`, and `@nvidia-elements/themes` URLs together.

## Internal

NVIDIA-internal projects should use the internal CDN instead of public jsDelivr URLs. The internal CDN is the preferred CDN path for internal applications because it follows NVIDIA network policy, caching, availability, and package-distribution practices. Use public jsDelivr URLs for public examples and external demos.
