---
{
  title: 'Elements MCP',
  layout: 'docs.11ty.js'
}
---

<nve-alert-group status="warning">
  <nve-alert>
    <nve-icon name="beaker" slot="icon" style="--color:inherit"></nve-icon> Labs projects are experimental packages available for early feedback.
  </nve-alert>
</nve-alert-group>

# Elements MCP

{% install-artifactory %}

## Claude Code

Install to Claude Code by adding the configuration to your `.mcp.json` file.

### NPM

Add the following configuration to your `.mcp.json` file (typically located at `~/.config/claude-code/.mcp.json` or `%APPDATA%\claude-code\.mcp.json` on Windows):

```json
{
  "mcpServers": {
    "elements": {
      "description": "Elements API and Custom Element Schema",
      "command": "npm",
      "args": ["exec", "--package=@nvidia-elements/cli@latest", "-y", "--prefer-online", "--", "nve-mcp"],
      "env": {
        "npm_config_registry": "https://registry.npmjs.org"
      }
    }
  }
}
```

### PNPM

Alternatively, if you prefer using PNPM:

```json
{
  "mcpServers": {
    "elements": {
      "description": "Elements API and Custom Element Schema",
      "command": "pnpm",
      "args": ["--package=@nvidia-elements/cli@latest", "dlx", "nve-mcp"],
      "env": {
        "npm_config_registry": "https://registry.npmjs.org"
      }
    }
  }
}
```

After adding the configuration, restart Claude Code for the changes to take effect. The Elements MCP tools will be available for use in your conversations.

## Cursor

Install to Cursor or copy the MCP configuration below.

<div>
  <nve-button>
    <a href="cursor://anysphere.cursor-deeplink/mcp/install?name=elements&config=eyJkZXNjcmlwdGlvbiI6IkVsZW1lbnRzIEFQSSBhbmQgQ3VzdG9tIEVsZW1lbnQgU2NoZW1hIiwiZW52Ijp7Im5wbV9jb25maWdfcmVnaXN0cnkiOiJodHRwczovL3VybS5udmlkaWEuY29tL2FydGlmYWN0b3J5L2FwaS9ucG0vc3ctbmdjLXVuaWZpZWQtbnBtLXByb3h5LyJ9LCJjb21tYW5kIjoibnBtIGV4ZWMgLS1wYWNrYWdlPUBudmUtbGFicy9jbGlAbGF0ZXN0IC15IC0tcHJlZmVyLW9ubGluZSAtLSBudmUtbWNwIn0%3D">Add to Cursor with NPM</a>
  </nve-button>
</div>

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "elements": {
      "description": "Elements API and Custom Element Schema",
      "command": "npm exec --package=@nvidia-elements/cli@latest -y --prefer-online -- nve-mcp",
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
      "description": "Elements API and Custom Element Schema",
      "command": "pnpm --package=@nvidia-elements/cli@latest dlx nve-mcp",
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
    <nve-grid-cell><code nve-text="code">/doctor</code></nve-grid-cell>
    <nve-grid-cell>Verify Elements setup and MCP configuration</nve-grid-cell>
    <nve-grid-cell><code nve-text="code"><strong>/doctor</strong></code></nve-grid-cell>
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
    <nve-grid-cell>Get list of all available Elements (nve-*) APIs and components.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">api_search</code></nve-grid-cell>
    <nve-grid-cell>Search and retrieve a list of Elements (nve-*) components and APIs using keywords or natural language.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">api_get</code></nve-grid-cell>
    <nve-grid-cell>Get the documentation of a known Elements component or API by its name (nve-*).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">api_template_validate</code></nve-grid-cell>
    <nve-grid-cell>Validates HTML templates using Elements APIs and components (nve-*). Checks for invalid API usage and UX patterns.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">api_changelogs</code></nve-grid-cell>
    <nve-grid-cell>Get the changelog details for a specific component or API.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">packages_versions_list</code></nve-grid-cell>
    <nve-grid-cell>Get latest published versions of all Elements packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">packages_changelogs_list</code></nve-grid-cell>
    <nve-grid-cell>Get changelog details for all @nve packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">packages_changelogs_search</code></nve-grid-cell>
    <nve-grid-cell>Search for and retrieve changelog details by package name (supports fuzzy matching).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">examples_list</code></nve-grid-cell>
    <nve-grid-cell>Get a summary list of available Elements (nve-*) component/pattern usage examples and code snippets.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">examples_search</code></nve-grid-cell>
    <nve-grid-cell>Search Elements (nve-*) pattern usage examples by name, element type, or keywords.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">playground_validate</code></nve-grid-cell>
    <nve-grid-cell>Validates HTML templates for playground examples. Enforces additional constraints to prevent common mistakes when generating standalone demos.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">playground_create</code></nve-grid-cell>
    <nve-grid-cell>Create a shareable playground URL from an HTML template. Returns URL if valid, or validation errors if invalid.</nve-grid-cell>
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
    <nve-grid-cell><code nve-text="code">project_validate</code></nve-grid-cell>
    <nve-grid-cell>Validate project setup and check for configuration issues, outdated dependencies, or missing required packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">tokens_list</code></nve-grid-cell>
    <nve-grid-cell>Get available semantic CSS variables / design tokens for theming.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>
