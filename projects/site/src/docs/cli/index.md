---
{
  title: 'Elements CLI',
  layout: 'docs.11ty.js'
}
---

<nve-alert>
  <nve-icon name="beaker" slot="icon" status="accent"></nve-icon> Labs projects are experimental packages available for early feedback.
</nve-alert>

# Elements CLI

<h2 nve-text="heading sm muted">The Elements CLI provides command-line access to the Elements design system. Use it to scaffold new projects pre-configured with Elements, look up component APIs and design tokens, validate templates, and generate shareable playgrounds -- all without leaving your terminal</h2>

{% install-cli %}

## Usage

### Project Creation

Use the CLI to quickly bootstrap frontend UIs pre-configured with Elements.

```shell
# generate a vite/typescript project and start dev server once created
nve project.create --type=typescript --start
```

### API Search

The CLI also can provide API search results withing the terminal.

```shell
nve api.search "badge"
```

Search result output:

```html
## nve-badge

A visual indicator that communicates a status description of an associated component. Status badges use short text, color, and icons for quick recognition .

### Example

    <nve-badge>badge</nve-badge>

### Import

    import '@nvidia-elements/core/badge/define.js';

### Slots

┌─────────────┬──────────────────────────┐
│ name        │ description              │
├─────────────┼──────────────────────────┤
│             │ default slot for content │
├─────────────┼──────────────────────────┤
│ prefix-icon │ slot for prefix icon     │
├─────────────┼──────────────────────────┤
│ suffix-icon │ slot for suffix icon     │
└─────────────┴──────────────────────────┘
...
```

## Commands

<nve-grid>
  <nve-grid-header>
    <nve-grid-column>Command</nve-grid-column>
    <nve-grid-column>Description</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve --upgrade</code></nve-grid-cell>
    <nve-grid-cell>Upgrade to the latest CLI release.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.list [format]</code></nve-grid-cell>
    <nve-grid-cell>Get list of all available Elements (nve-*) APIs and components.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.search &lt;query&gt; [format]</code></nve-grid-cell>
    <nve-grid-cell>Search and retrieve a list of Elements (nve-*) components and APIs using keywords or natural language.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.get &lt;names&gt; [format]</code></nve-grid-cell>
    <nve-grid-cell>Get documentation known components or attributes by name (nve-*).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.template.validate &lt;template&gt;</code></nve-grid-cell>
    <nve-grid-cell>Validates HTML templates using Elements APIs and components (nve-*).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.imports.get &lt;template&gt;</code></nve-grid-cell>
    <nve-grid-cell>Get esm imports for a given HTML template using Elements APIs (nve-*).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.tokens.list [format]</code></nve-grid-cell>
    <nve-grid-cell>Get available semantic CSS custom properties / design tokens for theming.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve packages.list</code></nve-grid-cell>
    <nve-grid-cell>Get latest published versions of all Elements packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve packages.get &lt;name&gt;</code></nve-grid-cell>
    <nve-grid-cell>Get details for a specific Elements package.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve packages.changelogs.get &lt;name&gt; [format]</code></nve-grid-cell>
    <nve-grid-cell>Retrieve changelog details by package name.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve examples.list [format]</code></nve-grid-cell>
    <nve-grid-cell>Get list of available Elements (nve-*) patterns and examples.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve playground.validate &lt;template&gt;</code></nve-grid-cell>
    <nve-grid-cell>Validates HTML templates specifically for playground examples.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve playground.create &lt;template&gt; [type] [name] [author]</code></nve-grid-cell>
    <nve-grid-cell>Create a shareable playground URL from an HTML template.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.create &lt;type&gt; [cwd] [start]</code></nve-grid-cell>
    <nve-grid-cell>Create a new starter project.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.validate &lt;type&gt; [cwd]</code></nve-grid-cell>
    <nve-grid-cell>Check project for configuration issues and dependencies.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.setup [cwd]</code></nve-grid-cell>
    <nve-grid-cell>Setup or update a project to use Elements.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>

## Troubleshooting

### 403 Forbidden

A `403 Forbidden` error means your token has expired. Re-authenticate to resolve it.

```shell
npm config set registry {{ELEMENTS_REGISTRY_URL}} && npm login --auth-type=legacy
```

### Unsupported Engine

An `Unsupported engine` warning means your Node.js version is out of date. The CLI requires Node.js v20 or later. Update Node.js and try again.
