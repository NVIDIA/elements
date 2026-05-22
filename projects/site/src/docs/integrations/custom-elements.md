---
{
  title: 'Custom Elements Manifest',
  description: 'Use the Custom Elements Manifest files published with NVIDIA Elements packages for editor integrations, generated types, documentation, validation, and AI tooling.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

<h2 nve-text="heading sm muted">Elements packages publish machine-readable component API metadata for tools that understand Web Components</h2>

A [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest) is a JSON file that describes a package's custom elements. The standard exists so editors, documentation viewers, linters, framework adapters, catalogs, and test tooling can read one package-level API description instead of scraping source code.

Elements packages that publish a manifest declare it in `package.json`:

```json
{
  "customElements": "dist/custom-elements.json"
}
```

That field is the discovery hook. Tools can inspect `package.json`, find the `customElements` path, and load the package's `dist/custom-elements.json` file from `node_modules`.

## What Is In The Manifest

The manifest describes the public Web Component surface. For Elements components, that includes:

- Tag names such as `nve-button`
- JavaScript module paths and custom element definition exports
- Public properties and reflected attributes
- Events
- Slots
- CSS custom properties
- Component descriptions, examples, status metadata, and package metadata

The manifest does not register components. Continue to use explicit registration imports such as `@nvidia-elements/core/button/define.js` when application code needs the component at runtime.

## Published Package Files

Most published `@nvidia-elements/*` packages include `customElements` metadata. Component packages commonly expose a small set of generated integration files beside the manifest:

<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="260px">File</nve-grid-column>
    <nve-grid-column>Description</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">dist/custom-elements.json</code></nve-grid-cell>
    <nve-grid-cell>The standard Custom Elements Manifest. This is the canonical component API metadata file.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">dist/data.html.json</code></nve-grid-cell>
    <nve-grid-cell>VS Code HTML custom data generated from the manifest. Editors use it for tag, attribute, hover, and reference information.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">dist/data.snippets.json</code></nve-grid-cell>
    <nve-grid-cell>Generated HTML snippets for faster component authoring.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">dist/custom-elements-jsx.d.ts</code></nve-grid-cell>
    <nve-grid-cell>Generated JSX intrinsic element types for JSX-based integrations such as Preact and SolidJS.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">dist/custom-elements-vue.d.ts</code></nve-grid-cell>
    <nve-grid-cell>Generated Vue template and JSX types where the package exposes Vue integration types.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>

The exact generated files vary by package. The `customElements` field is the stable signal that a package ships a CEM file.

## Tooling Enabled By CEM

### Editor Integration

VS Code can load custom HTML and CSS data through `html.customData`, `css.customData`, and extension contribution points. Elements converts CEM data into `data.html.json` so VS Code-compatible HTML language services can offer completions and hover docs for `nve-*` tags and attributes. The Elements project setup command writes the common Elements custom data paths into `.vscode/settings.json` for supported packages.

```json
{
  "html.customData": [
    "./node_modules/@nvidia-elements/styles/dist/data.html.json",
    "./node_modules/@nvidia-elements/core/dist/data.html.json",
    "./node_modules/@nvidia-elements/monaco/dist/data.html.json",
    "./node_modules/@nvidia-elements/code/dist/data.html.json",
    "./node_modules/@nvidia-elements/markdown/dist/data.html.json"
  ]
}
```

Some editors and extensions can consume CEM more directly. [WebComponents.dev](https://webcomponents.dev/docs/custom-elements-manifest) recognizes `custom-elements.json` and the `package.json#customElements` field. The [Custom Elements Manifest Language Server for Zed](https://zed.dev/extensions/cem) provides autocomplete and hover documentation from CEM data. The [Custom Element Language Server VS Code extension](https://open-vsx.org/extension/wc-toolkit/web-components-language-server) can find `customElements` fields and convert CEM into VS Code custom data.

### Framework Types

Elements uses CEM to generate type adapters for framework-specific authoring surfaces. The build uses `custom-element-jsx-integration` for JSX intrinsic element types and `custom-element-vuejs-integration` for Vue type declarations. These files help template and JSX tooling validate component names, attributes, properties, and events without requiring a framework-specific implementation of each component.

## References

- [Custom Elements Manifest specification](https://github.com/webcomponents/custom-elements-manifest)
- [Custom Elements Manifest analyzer](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/)
- [VS Code custom data](https://github.com/microsoft/vscode-custom-data)
- [WebComponents.dev CEM support](https://webcomponents.dev/docs/custom-elements-manifest)
