---
{
  title: 'Elements MCP',
  layout: 'docs.11ty.js',
  hideExamplesTab: true
}
---

<nve-alert-group status="warning">
  <nve-alert>
    <nve-icon name="beaker" slot="icon" style="--color:inherit"></nve-icon> Labs projects are experimental packages available for early feedback.
  </nve-alert>
</nve-alert-group>

# Elements MCP

{% install-artifactory %}

## Cursor

Install to Cursor or copy the MCP configuration below.

<div>
  <nve-button>
    <a href="cursor://anysphere.cursor-deeplink/mcp/install?name=elements&config=eyJkZXNjcmlwdGlvbiI6IkVsZW1lbnRzIEFQSSBhbmQgQ3VzdG9tIEVsZW1lbnQgU2NoZW1hIiwiZW52Ijp7Im5wbV9jb25maWdfcmVnaXN0cnkiOiJodHRwczovL3VybS5udmlkaWEuY29tL2FydGlmYWN0b3J5L2FwaS9ucG0vc3ctbmdjLXVuaWZpZWQtbnBtLXByb3h5LyJ9LCJjb21tYW5kIjoibnB4IC15IC0tcGFja2FnZT1AbnZlLWxhYnMvY2xpQGxhdGVzdCBudmUtbWNwIn0%3D">Add to Cursor with NPM</a>
  </nve-button>
</div>

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "elements": {
      "command": "npx",
      "description": "Elements API and Custom Element Schema",
      "args": ["-y", "--package=@nvidia-elements/cli@latest", "nve-mcp"],
      "env": {
        "npm_config_registry": "https://registry.npmjs.org"
      }
    }
  }
}
```

<div>
  <nve-button>
    <a href="cursor://anysphere.cursor-deeplink/mcp/install?name=elements&config=eyJkZXNjcmlwdGlvbiI6IkVsZW1lbnRzIEFQSSBhbmQgQ3VzdG9tIEVsZW1lbnQgU2NoZW1hIiwiZW52Ijp7Im5wbV9jb25maWdfcmVnaXN0cnkiOiJodHRwczovL3VybS5udmlkaWEuY29tL2FydGlmYWN0b3J5L2FwaS9ucG0vc3ctbmdjLXVuaWZpZWQtbnBtLXByb3h5LyJ9LCJjb21tYW5kIjoicG5wbSAtLXBhY2thZ2U9QG52ZS1sYWJzL2NsaUBsYXRlc3QgZGx4IG52ZS1tY3AifQ%3D%3D">Add to Cursor with PNPM</a>
  </nve-button>
</div>

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "elements": {
      "command": "pnpm",
      "description": "Elements API and Custom Element Schema",
      "args": ["--package=@nvidia-elements/cli@latest", "dlx", "nve-mcp"],
      "env": {
        "npm_config_registry": "https://registry.npmjs.org"
      }
    }
  }
}
```

<script type="module">
  const tabs = document.querySelector('#cursor-install-tabs');
  const tabPanels = {
    npm: document.querySelector('#cursor-npm-install'),
    pnpm: document.querySelector('#cursor-pnpm-install')
  };

  tabs.addEventListener('click', e => {
    tabPanels.npm.hidden = true;
    tabPanels.pnpm.hidden = true;
    tabPanels[e.target.value].hidden = false;
  });
</script>

## Usage

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
