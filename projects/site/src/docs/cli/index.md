---
{
  title: 'Elements CLI',
  layout: 'docs.11ty.js',
  hideExamplesTab: true
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

The CLI can be used to quickly bootstrap frontend UIs pre-configured with Elements.

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
    <nve-grid-cell><code nve-text="code">nve api.list [format] [format]</code></nve-grid-cell>
    <nve-grid-cell>Get list of all available APIs and components.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.search [query] [format]</code></nve-grid-cell>
    <nve-grid-cell>Get API information for specific APIs and components.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.version</code></nve-grid-cell>
    <nve-grid-cell>Get latest versions of elements/@nve packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve changelogs.list [format]</code></nve-grid-cell>
    <nve-grid-cell>Get changelog details for all @nve packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve changelogs.search [name] [format]</code></nve-grid-cell>
    <nve-grid-cell>Get changelog details for specific @nve package.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve examples.list [format]</code></nve-grid-cell>
    <nve-grid-cell>Get list of available example templates/patterns.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve examples.search [query] [format]</code></nve-grid-cell>
    <nve-grid-cell>Search for example templates/patterns by name or description.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve playground.validate [template]</code></nve-grid-cell>
    <nve-grid-cell>Get validated HTML string for an example template/playground.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve playground.create [template] [type] [name] [author] [start]</code></nve-grid-cell>
    <nve-grid-cell>Creates a playground url/link generated from a html template string.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.create [type] [cwd] [start]</code></nve-grid-cell>
    <nve-grid-cell>Create a new starter project.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.update [cwd]</code></nve-grid-cell>
    <nve-grid-cell>Update a project to the latest versions of Elements packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.health [type] [cwd]</code></nve-grid-cell>
    <nve-grid-cell>Check the health of a project using Elements packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve tokens.list [format] [format]</code></nve-grid-cell>
    <nve-grid-cell>Get available semantic CSS variables / design tokens for theming.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>
