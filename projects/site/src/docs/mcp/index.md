---
{
  title: 'Elements MCP',
  description: 'The NVIDIA Elements MCP server: exposes component metadata, examples, and design tokens to AI assistants over the Model Context Protocol.',
  layout: 'docs.11ty.js'
}
---

# {{title}}

<h2 nve-text="heading sm muted">The Elements MCP server connects AI coding assistants to the Elements design system. It gives tools like Claude Code, Cursor, and Codex direct access to component APIs, design tokens, skills, template validation, project scaffolding, and interactive MCP Apps views so your AI assistant can build with Elements effectively</h2>

{% install-cli %}

## Quick Setup

After you install the CLI, the fastest way to configure the Elements MCP uses the setup command. This detects your package manager, configures the MCP server for Cursor, Claude Code, and Codex, and adds Elements core dependencies to the project.

```shell
nve project.setup
```

## Manual Setup

<section id="manual-tab-group" style="height: 300px;">
  <nve-tabs id="manual-tabs">
    <nve-tabs-item selected value="claude-code">Claude Code</nve-tabs-item>
    <nve-tabs-item value="cursor">Cursor</nve-tabs-item>
    <nve-tabs-item value="codex">Codex</nve-tabs-item>
  </nve-tabs>
  <nve-divider></nve-divider>
  <br />

<div id="claude-code">

After adding the configuration in the root of your project, restart Claude Code for the changes to take effect. The Elements MCP tools are then available for use in your conversations.

<br />

```json
// .mcp.json
{
  "mcpServers": {
    "elements": {
      "description": "NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples",
      "command": "nve",
      "args": ["mcp"]
    }
  }
}
```

</div>

<div id="cursor" hidden>

After adding the configuration in your project's .cursor directory, enable the MCP under `Cursor > Settings > Cursor Settings > Tools & MCP`. The Elements MCP tools are then available for use in your conversations.

<br />

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "elements": {
      "description": "NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples",
      "command": "nve",
      "args": [
        "mcp"
      ]
    }
  }
}
```

  </div>

<div id="codex" hidden>

After adding the configuration in the root of your project, restart Codex for the changes to take effect. The Elements MCP tools are then available for use in your conversations.

<br />

```toml
# .codex/config.toml
[mcp_servers.elements]
description = "NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples"
command = "nve"
args = ["mcp"]
```

  </div>
</section>

<script type="module">
  const tabs = document.querySelector('#manual-tab-group');
  const tabItems = document.querySelectorAll('#manual-tabs nve-tabs-item');
  const panels = Array.from(document.querySelectorAll('#manual-tab-group div'));
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

Skills provide persistent context to AI agents for building UI with Elements. Unlike prompts (invoked on demand) or tools (callable functions), skills give agents background knowledge about Elements components, workflows, and best practices. Call `skills_list` for the current list and `skills_get` for the full context of a specific skill.

<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="170px">Skill</nve-grid-column>
    <nve-grid-column>Description</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">about</code></nve-grid-cell>
    <nve-grid-cell>Instructions for providing a brief introduction for using the Elements Design System.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">authoring</code></nve-grid-cell>
    <nve-grid-cell>Best practices and workflow guidance for authoring UI with NVIDIA Elements.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">doctor</code></nve-grid-cell>
    <nve-grid-cell>Instructions for ensuring the Elements Design System is setup correctly.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">artifact</code></nve-grid-cell>
    <nve-grid-cell>Use when creating throwaway UI artifacts, prototypes, demos, Claude Artifacts, Codex, or GPT Sites pages, or other standalone HTML interfaces that should use the NVIDIA Elements CDN template.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">integration</code></nve-grid-cell>
    <nve-grid-cell>Best practices and workflow guidance for creating or setting up NVIDIA Elements projects.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">migration</code></nve-grid-cell>
    <nve-grid-cell>Instructions for migrating a project from deprecated Elements APIs using lint tooling and CLI health checks.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">search</code></nve-grid-cell>
    <nve-grid-cell>Best practices for providing Elements API Documentation.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">elements</code></nve-grid-cell>
    <nve-grid-cell>Default skill for UI-related work or NVIDIA Elements (<code nve-text="code">nve-*</code>), including HTML, CSS, layout, theming, components, applications, prototypes, Claude Artifacts, Codex Sites pages, and standalone UI artifacts.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>

Deployments with the playground service enabled can also expose a `playground` skill for creating Elements Playground prototypes.

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
    <nve-grid-cell><code nve-text="code">api_icons_list</code></nve-grid-cell>
    <nve-grid-cell>Get list of all available icon names for <code nve-text="code">nve-icon</code> and <code nve-text="code">nve-icon-button</code>.</nve-grid-cell>
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
    <nve-grid-cell><code nve-text="code">examples_render</code></nve-grid-cell>
    <nve-grid-cell>Render a custom Elements HTML template inline in the MCP Apps preview view.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">skills_list</code></nve-grid-cell>
    <nve-grid-cell>Get a list of available Elements agent skills and context fragments.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">skills_get</code></nve-grid-cell>
    <nve-grid-cell>Get a bundled Elements agent skill or context fragment by name.</nve-grid-cell>
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

## MCP Apps UI

The Elements MCP server supports [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview) for hosts that implement the `io.modelcontextprotocol/ui` extension. The same `nve mcp` command advertises the `text/html;profile=mcp-app` MIME type, registers `ui://elements/*` resources, and attaches `_meta.ui.resourceUri` metadata to tools that have an app view. You do not need separate setup.

Hosts with MCP Apps support can render these views inline in the conversation. Hosts without Apps support still receive the normal text and structured tool output.

<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="190px">App View</nve-grid-column>
    <nve-grid-column width="260px">Resource</nve-grid-column>
    <nve-grid-column width="260px">Tools</nve-grid-column>
    <nve-grid-column>Description</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>Example Preview</nve-grid-cell>
    <nve-grid-cell><code nve-text="code">ui://elements/example-preview</code></nve-grid-cell>
    <nve-grid-cell><code nve-text="code">examples_get</code>, <code nve-text="code">examples_render</code></nve-grid-cell>
    <nve-grid-cell>Render stored examples or validated custom Elements HTML templates with the Elements bundle and themes already loaded.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Icon List</nve-grid-cell>
    <nve-grid-cell><code nve-text="code">ui://elements/icons-list</code></nve-grid-cell>
    <nve-grid-cell><code nve-text="code">api_icons_list</code></nve-grid-cell>
    <nve-grid-cell>Search available nve-icon names and copy the matching source markup.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Token Explorer</nve-grid-cell>
    <nve-grid-cell><code nve-text="code">ui://elements/tokens-list</code></nve-grid-cell>
    <nve-grid-cell><code nve-text="code">api_tokens_list</code></nve-grid-cell>
    <nve-grid-cell>Search design tokens, preview token values, switch themes, and copy CSS custom property references.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>

Each app resource is a self-contained HTML document that includes Elements components, theme CSS, typography CSS, layout CSS, and a small MCP Apps client. The client initializes the app, reports size changes, receives tool input and result notifications, and calls server tools through the MCP Apps message channel when it needs more data. Message handling validates the parent origin before reading inbound JSON-RPC payloads.

Client support for MCP Apps is host-specific. Check the [MCP extension support matrix](https://modelcontextprotocol.io/extensions/client-matrix) before relying on inline Apps behavior in a specific assistant.

## Troubleshooting

### 403 Forbidden

A `403 Forbidden` error means your token has expired. Re-authenticate to resolve it.

```shell
npm config set registry {{ELEMENTS_REGISTRY_URL}} && npm login --auth-type=legacy
```

### Unsupported Engine

An `Unsupported engine` warning means your Node.js version is out of date. The CLI requires Node.js v20 or later. Update Node.js and try again.
