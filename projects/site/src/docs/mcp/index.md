---
{
  title: 'Elements MCP',
  layout: 'docs.11ty.js'
}
---

<nve-alert>
  <nve-icon name="beaker" slot="icon" status="accent"></nve-icon> Labs projects are experimental packages available for early feedback.
</nve-alert>

# {{title}}

<h2 nve-text="heading sm muted">The Elements MCP server connects AI coding assistants to the Elements design system. It gives tools like Claude Code and Cursor direct access to component APIs, design tokens, template validation, and project scaffolding so your AI assistant can build with Elements effectively</h2>

{% install-artifactory %}

## Quick Setup

The fastest way to configure the Elements MCP is with the setup command. This detects your package manager, configures the MCP server for both Cursor and Claude Code, and adds Elements core dependencies to the project.

```shell
npx --package=@nvidia-elements/cli -y nve-setup
```

## Manual Setup - Claude Code

Add the following configuration to your `.mcp.json` file (typically located at `~/.config/claude-code/.mcp.json` or `%APPDATA%\claude-code\.mcp.json` on Windows):

<section id="claude-tab-group" style="height: 300px;">
  <nve-tabs id="claude-tabs">
    <nve-tabs-item selected value="claude-npm">npm</nve-tabs-item>
    <nve-tabs-item value="claude-pnpm">Pnpm</nve-tabs-item>
  </nve-tabs>
  <nve-divider></nve-divider>
  <br />

<div id="claude-npm">

```json
// .mcp.json
{
  "mcpServers": {
    "elements": {
      "description": "NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples",
      "command": "npm",
      "args": ["exec", "--package=@nvidia-elements/cli@latest", "-y", "--prefer-online", "--", "nve-mcp"],
      "env": {
        "npm_config_registry": "https://registry.npmjs.org"
      }
    }
  }
}
```

</div>

<div id="claude-pnpm" hidden>

```json
// .mcp.json
{
  "mcpServers": {
    "elements": {
      "description": "NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples",
      "command": "pnpm",
      "args": ["--package=@nvidia-elements/cli@latest", "dlx", "nve-mcp"],
      "env": {
        "npm_config_registry": "https://registry.npmjs.org"
      }
    }
  }
}
```

  </div>
</section>

After adding the configuration, restart Claude Code for the changes to take effect. The Elements MCP tools are then available for use in your conversations.

<script type="module">
  const tabs = document.querySelector('#claude-tab-group');
  const tabItems = document.querySelectorAll('#claude-tabs nve-tabs-item');
  const panels = Array.from(document.querySelectorAll('#claude-tab-group div'));
  tabs.addEventListener('click', e => {
    if (e.target.localName === 'nve-tabs-item') {
      tabItems.forEach(t => t.selected = false);
      panels.forEach(i => i.hidden = true);
      e.target.selected = true;
      document.querySelector('#' + e.target.value).hidden = false;
    }
  });
</script>

## Manual Setup - Cursor

Install to Cursor or copy the MCP configuration below.

<section id="cursor-tab-group" style="height: 300px;">
  <nve-tabs id="cursor-tabs">
    <nve-tabs-item selected value="cursor-npm">npm</nve-tabs-item>
    <nve-tabs-item value="cursor-pnpm">Pnpm</nve-tabs-item>
  </nve-tabs>
  <nve-divider></nve-divider>
  <br />

<div id="cursor-npm">

<nve-button>
  <a href="cursor://anysphere.cursor-deeplink/mcp/install?name=elements&config=eyJkZXNjcmlwdGlvbiI6IkVsZW1lbnRzIEFQSSBhbmQgQ3VzdG9tIEVsZW1lbnQgU2NoZW1hIiwiZW52Ijp7Im5wbV9jb25maWdfcmVnaXN0cnkiOiJodHRwczovL3VybS5udmlkaWEuY29tL2FydGlmYWN0b3J5L2FwaS9ucG0vc3ctbmdjLXVuaWZpZWQtbnBtLXByb3h5LyJ9LCJjb21tYW5kIjoibnBtIGV4ZWMgLS1wYWNrYWdlPUBudmUtbGFicy9jbGlAbGF0ZXN0IC15IC0tcHJlZmVyLW9ubGluZSAtLSBudmUtbWNwIn0%3D">Add to Cursor with npm</a>
</nve-button>

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "elements": {
      "description": "NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples",
      "command": "npm exec --package=@nvidia-elements/cli@latest -y --prefer-online -- nve-mcp",
      "env": {
        "npm_config_registry": "https://registry.npmjs.org"
      }
    }
  }
}
```

</div>

<div id="cursor-pnpm" hidden>

<nve-button>
  <a href="cursor://anysphere.cursor-deeplink/mcp/install?name=elements&config=eyJkZXNjcmlwdGlvbiI6IkVsZW1lbnRzIEFQSSBhbmQgQ3VzdG9tIEVsZW1lbnQgU2NoZW1hIiwiZW52Ijp7Im5wbV9jb25maWdfcmVnaXN0cnkiOiJodHRwczovL3VybS5udmlkaWEuY29tL2FydGlmYWN0b3J5L2FwaS9ucG0vc3ctbmdjLXVuaWZpZWQtbnBtLXByb3h5LyJ9LCJjb21tYW5kIjoicG5wbSAtLXBhY2thZ2U9QG52ZS1sYWJzL2NsaUBsYXRlc3QgZGx4IG52ZS1tY3AifQ%3D%3D">Add to Cursor with pnpm</a>
</nve-button>

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "elements": {
      "description": "NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples",
      "command": "pnpm --package=@nvidia-elements/cli@latest dlx nve-mcp",
      "env": {
        "npm_config_registry": "https://registry.npmjs.org"
      }
    }
  }
}
```

 </div>
</section>

<script type="module">
  const tabs = document.querySelector('#cursor-tab-group');
  const tabItems = document.querySelectorAll('#cursor-tabs nve-tabs-item');
  const panels = Array.from(document.querySelectorAll('#cursor-tab-group > div'));
  tabs.addEventListener('click', e => {
    if (e.target.localName === 'nve-tabs-item') {
      tabItems.forEach(t => t.selected = false);
      panels.forEach(i => i.hidden = true);
      e.target.selected = true;
      document.querySelector('#' + e.target.value).hidden = false;
    }
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
    <nve-grid-cell><code nve-text="code"><strong>/search</strong> What notifies a user of a long running process?</code></nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">/new-project</code></nve-grid-cell>
    <nve-grid-cell>Context for creating a new Elements project.</nve-grid-cell>
    <nve-grid-cell><code nve-text="code"><strong>/new-project</strong> Create an Angular todo app</code></nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">/migrate</code></nve-grid-cell>
    <nve-grid-cell>Context for migrating from deprecated Elements APIs</nve-grid-cell>
    <nve-grid-cell><code nve-text="code"><strong>/migrate</strong> Migrate this project from deprecated Elements APIs</code></nve-grid-cell>
  </nve-grid-row>
</nve-grid>

### Skills

Skills provide persistent context to AI agents for building UI with Elements. Unlike prompts (invoked on demand) or tools (callable functions), skills give agents background knowledge about Elements components, workflows, and best practices.

<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="250px">Skill</nve-grid-column>
    <nve-grid-column>Description</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">elements</code></nve-grid-cell>
    <nve-grid-cell>Build UI with NVIDIA Elements (NVE). Provides authoring guidelines, workflow steps, and API best practices for creating, editing, or reviewing HTML templates that use nve-* components.</nve-grid-cell>
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
    <nve-grid-cell><code nve-text="code">api_get</code></nve-grid-cell>
    <nve-grid-cell>Get documentation known components or attributes by name (nve-*).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">api_template_validate</code></nve-grid-cell>
    <nve-grid-cell>Validates HTML templates using Elements APIs and components (nve-*).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">api_imports_get</code></nve-grid-cell>
    <nve-grid-cell>Get esm imports for a given HTML template using Elements APIs (nve-*).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">api_tokens_list</code></nve-grid-cell>
    <nve-grid-cell>Get available semantic CSS custom properties / design tokens for theming.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">packages_list</code></nve-grid-cell>
    <nve-grid-cell>Get latest published versions of all Elements packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">packages_get</code></nve-grid-cell>
    <nve-grid-cell>Get details for a specific Elements package.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">packages_changelogs_get</code></nve-grid-cell>
    <nve-grid-cell>Retrieve changelog details by package name.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">examples_list</code></nve-grid-cell>
    <nve-grid-cell>Get list of available Elements (nve-*) patterns and examples.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">examples_get</code></nve-grid-cell>
    <nve-grid-cell>Get the full template of a known example or pattern by id.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">playground_validate</code></nve-grid-cell>
    <nve-grid-cell>Validates HTML templates specifically for playground examples.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">playground_create</code></nve-grid-cell>
    <nve-grid-cell>Create a shareable playground URL from an HTML template.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">project_create</code></nve-grid-cell>
    <nve-grid-cell>Create a new starter project.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">project_validate</code></nve-grid-cell>
    <nve-grid-cell>Check project for configuration issues and dependencies.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">project_setup</code></nve-grid-cell>
    <nve-grid-cell>Setup or update a project to use Elements.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>

## Troubleshooting

### 403 Forbidden

A `403 Forbidden` error means your Artifactory token has expired. Re-authenticate to resolve it.

```shell
npm config set registry https://registry.npmjs.org && npm login --auth-type=legacy
```

### Unsupported Engine

An `Unsupported engine` warning means your Node.js version is out of date. The CLI requires Node.js v20 or later. Update Node.js and try again.
