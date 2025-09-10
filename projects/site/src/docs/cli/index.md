---
{
  title: 'CLI',
  layout: 'docs.11ty.js',
  hideExamplesTab: true
}
---

# Elements CLI

## Installation

```shell
pnpm install -g @nvidia-elements/cli
```

```shell
nve
```

## CLI Usage

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

## MCP Installation

### Cursor

```json
{
  "mcpServers": {
    "elements": {
      "command": "pnpm",
      "description": "Elements API and Custom Element Schema",
      "args": [
        "--registry=https://registry.npmjs.org",
        "dlx",
        "nve-mcp"
      ]
    }
  }
}
```

## MCP Usage

### Prompts

<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="150px">Prompt</nve-grid-column>
    <nve-grid-column width="350px">Description</nve-grid-column>
    <nve-grid-column>Example Prompt</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">/about</code></nve-grid-cell>
    <nve-grid-cell>A brief introduction to Elements</nve-grid-cell>
    <nve-grid-cell><code nve-text="code"><strong>/about</strong></code></nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">/playground</code></nve-grid-cell>
    <nve-grid-cell>Context for creating playground prototypes</nve-grid-cell>
    <nve-grid-cell><code nve-text="code"><strong>/playground</strong> Create an example login form</code></nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">/search</code></nve-grid-cell>
    <nve-grid-cell>Context for searching Elements APIs</nve-grid-cell>
    <nve-grid-cell><code nve-text="code"><strong>/search</strong> What could I use for notifying user of a long running process?</code></nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">/new-project</code></nve-grid-cell>
    <nve-grid-cell>Context for creating a new Elements project.</nve-grid-cell>
    <nve-grid-cell><code nve-text="code"><strong>/new-project</strong> Create an Angular todo app</code></nve-grid-cell>
  </nve-grid-row>
</nve-grid>

### Tools

<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="250px">Tool</nve-grid-column>
    <nve-grid-column>Description</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">api_list</code></nve-grid-cell>
    <nve-grid-cell>Get list of all available APIs and components.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">api_search</code></nve-grid-cell>
    <nve-grid-cell>Get API information for specific APIs and components.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">api_version</code></nve-grid-cell>
    <nve-grid-cell>Get latest versions of elements/@nve packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">api_search</code></nve-grid-cell>
    <nve-grid-cell>understand components and their API details before using them</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">changelogs_list</code></nve-grid-cell>
    <nve-grid-cell>Get changelog details for all @nve packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">changelogs_search</code></nve-grid-cell>
    <nve-grid-cell>Get changelog details for specific @nve package.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">examples_list</code></nve-grid-cell>
    <nve-grid-cell>Get list of available example templates/patterns.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">examples_search</code></nve-grid-cell>
    <nve-grid-cell>Search for example templates/patterns by name or description.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">playground_validate</code></nve-grid-cell>
    <nve-grid-cell>Get validated HTML string for an example template/playground.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">playground_create</code></nve-grid-cell>
    <nve-grid-cell>Creates a playground url/link generated from a html template string.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">project_create</code></nve-grid-cell>
    <nve-grid-cell>Create a new starter project.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">project_update</code></nve-grid-cell>
    <nve-grid-cell>Update a project to the latest versions of Elements packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">project_health</code></nve-grid-cell>
    <nve-grid-cell>Check the health of a project using Elements packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">tokens_list</code></nve-grid-cell>
    <nve-grid-cell>Get available semantic CSS variables / design tokens for theming.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>
