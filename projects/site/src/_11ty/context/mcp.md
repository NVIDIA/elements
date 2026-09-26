# MCP

The NVIDIA Elements MCP server gives AI assistants Model Context Protocol access to component APIs, examples, design tokens, icons, and project setup.

## Quick setup

Install the Elements CLI, then run project setup. The command detects the package manager, configures the MCP server for Cursor, Claude Code, and Codex, and adds the Elements core dependencies.

```shell
nve project.setup
```

## Cursor

Save this configuration as `.cursor/mcp.json`, then enable the Elements server in Cursor settings.

```json
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

## Claude Code

Save this configuration as `.mcp.json`, then restart Claude Code.

```json
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

## Codex

Save this configuration as `.codex/config.toml`, then restart Codex.

```toml
[mcp_servers.elements]
description = "NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples"
command = "nve"
args = ["mcp"]
```

## Prompt examples

- `/artifact` creates a standalone Elements UI artifact. Example prompt: `/artifact Create an example login form`.
- `/doctor` checks Elements setup and MCP configuration.
- `/create-project` creates an Elements starter project. Example prompt: `/create-project Create an Angular todo app`.
- `/migrate` updates a project from deprecated Elements APIs. Example prompt: `/migrate Migrate this project from deprecated Elements APIs`.

## Tool examples

`api_validate` checks HTML or JSON. This call checks a button template:

```json
{ "template": "<nve-button>Save</nve-button>", "format": "json" }
```

`examples_get` returns a stored example template. `examples_render` renders custom Elements HTML in the MCP Apps preview.

| Tool                      | Description                                              |
| ------------------------- | -------------------------------------------------------- |
| `api_list`                | List Elements APIs and components.                       |
| `api_get`                 | Read documentation for known components or attributes.   |
| `api_validate`            | Check HTML and JSON with Elements lint rules.            |
| `api_imports_get`         | Return ESM imports for an HTML template.                 |
| `api_tokens_list`         | List semantic CSS custom properties and design tokens.   |
| `api_icons_list`          | List icon names for `nve-icon` and `nve-icon-button`.    |
| `examples_list`           | List patterns and examples.                              |
| `examples_get`            | Return a known example or pattern template.              |
| `examples_render`         | Render a custom Elements HTML template in the preview.   |
| `playground_validate`     | Validate HTML for a playground example.                  |
| `playground_create`       | Create a shareable playground URL from an HTML template. |
| `packages_list`           | List the latest published Elements package versions.     |
| `packages_get`            | Read details for one Elements package.                   |
| `packages_changelogs_get` | Read changelog details for a package.                    |
| `project_create`          | Create a starter project.                                |
| `project_validate`        | Check project configuration and dependencies.            |
| `project_setup`           | Set up or update a project to use Elements.              |

## MCP Apps

Hosts that support MCP Apps can render the example preview, icon list, and token explorer inline. The example preview uses `ui://elements/example-preview` for `examples_get` and `examples_render`.
