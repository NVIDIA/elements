---
{
  title: 'Elements CLI',
  layout: 'docs.11ty.js'
}
---

<nve-alert-group status="warning">
  <nve-alert>
    <nve-icon name="beaker" slot="icon" style="--color:inherit"></nve-icon> Labs projects are experimental packages available for early feedback.
  </nve-alert>
</nve-alert-group>

# Elements CLI

{% install-artifactory %}

Once the registry is setup and authenticated, install the CLI:

```shell
# install CLI
npm install -g @nvidia-elements/cli@latest

# run cli
nve
```

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
    <nve-grid-cell><code nve-text="code">nve api.list [format]</code></nve-grid-cell>
    <nve-grid-cell>Get list of all available Elements (nve-*) APIs and components.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.search &lt;query&gt; [format]</code></nve-grid-cell>
    <nve-grid-cell>Search and retrieve a list of Elements (nve-*) components and APIs using keywords or natural language.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.get &lt;name&gt; [format]</code></nve-grid-cell>
    <nve-grid-cell>Get the documentation of a known Elements component or API by its name (nve-*).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.template.validate &lt;template&gt;</code></nve-grid-cell>
    <nve-grid-cell>Validates HTML templates using Elements APIs and components (nve-*). Checks for invalid API usage and UX patterns.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.imports.get &lt;template&gt;</code></nve-grid-cell>
    <nve-grid-cell>Get the ESM imports for a given HTML template using Elements APIs and components (nve-*).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.changelogs &lt;name&gt;</code></nve-grid-cell>
    <nve-grid-cell>Get the changelog details for a specific component or API.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve packages.versions.list</code></nve-grid-cell>
    <nve-grid-cell>Get latest published versions of all Elements packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve packages.changelogs.list [format]</code></nve-grid-cell>
    <nve-grid-cell>Get changelog details for all @nve packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve packages.changelogs.search &lt;name&gt; [format]</code></nve-grid-cell>
    <nve-grid-cell>Search for and retrieve changelog details by package name (supports fuzzy matching).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve examples.list [format]</code></nve-grid-cell>
    <nve-grid-cell>Get a summary list of available Elements (nve-*) component/pattern usage examples and code snippets.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve examples.search &lt;query&gt; [format]</code></nve-grid-cell>
    <nve-grid-cell>Search Elements (nve-*) pattern usage examples by name, element type, or keywords.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve playground.validate &lt;template&gt;</code></nve-grid-cell>
    <nve-grid-cell>Validates HTML templates for playground examples. Enforces extra constraints to prevent common mistakes when generating standalone demos.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve playground.create &lt;template&gt; [type] [name] [author] [start]</code></nve-grid-cell>
    <nve-grid-cell>Create a shareable playground URL from an HTML template. Returns URL if valid, or validation errors if invalid.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.create &lt;type&gt; [cwd] [start]</code></nve-grid-cell>
    <nve-grid-cell>Create a new starter project.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.update [cwd]</code></nve-grid-cell>
    <nve-grid-cell>Update a project to the latest versions of Elements packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.validate &lt;type&gt; [cwd]</code></nve-grid-cell>
    <nve-grid-cell>Check project setup for configuration issues, outdated dependencies, or missing required packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.setup.mcp &lt;ide&gt; [cwd]</code></nve-grid-cell>
    <nve-grid-cell>Configure Elements MCP server for Cursor or Claude Code.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve tokens.list [format]</code></nve-grid-cell>
    <nve-grid-cell>Get available semantic CSS variables / design tokens for theming.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>
