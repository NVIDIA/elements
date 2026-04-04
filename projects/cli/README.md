# @nvidia-elements/cli

The **@nvidia-elements/cli** is a dual-mode command-line tool for the Elements Design System that provides both interactive CLI commands and a Model Context Protocol (MCP) server for AI assistant integration.

## Purpose

This package serves two primary modes:

1. **Interactive CLI (`nve` command)** - Command-line interface with interactive prompts for:
   - Component API discovery and search
   - Example template browsing and searching
   - Playground creation and validation
   - Project scaffolding and health checks
   - Changelog and version information
   - Design token access

2. **MCP Server (`nve mcp` command)** - Model Context Protocol server that:
   - Exposes all CLI tools to AI assistants (Claude, Cursor, etc.)
   - Provides context-specific prompts for common tasks
   - Enables AI-assisted development with Elements components
   - Integrates Elements knowledge directly into AI workflows

- [Documentation](https://NVIDIA.github.io/elements/docs/cli/)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [GitHub Repo](https://github.com/NVIDIA/elements)
- [NPM](https://registry.npmjs.org

## Getting Started

To use the Elements CLI you must have [NodeJS](https://nodejs.org/) installed.

```shell
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

npm install -g @nvidia-elements/cli

nve
```

## Usage

| Command                                                           | Description                                                                                        |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `nve api.list [format]`                                           | Get list of all available Elements (nve-*) APIs and components.                                    |
| `nve api.search [query] [format]`                                 | Search and retrieve a list of Elements (nve-*) components and APIs using keywords.                 |
| `nve api.get [names] [format]`                                    | Get documentation known components or attributes by name (nve-*).                                  |
| `nve api.template.validate [template]`                            | Validates HTML templates using Elements APIs and components (nve-*).                               |
| `nve api.imports.get [template]`                                  | Get esm imports for a given HTML template using Elements APIs (nve-*).                             |
| `nve api.tokens.list [format]`                                    | Get available semantic CSS custom properties / design tokens for theming.                                   |
| `nve packages.list`                                               | Get latest published versions of all Elements packages.                                            |
| `nve packages.get [name]`                                         | Get details for a specific Elements package.                                                       |
| `nve packages.changelogs.get [name] [format]`                     | Retrieve changelog details by package name.                                                        |
| `nve examples.list [format]`                                      | Get list of available Elements (nve-*) patterns and examples.                                      |
| `nve playground.validate [template]`                              | Validates HTML templates specifically for playground examples.                                      |
| `nve playground.create [template] [type] [name] [author]` | Create a shareable playground URL from an HTML template.                                           |
| `nve project.create [type] [cwd] [start]`                         | Create a new starter project.                                                                      |
| `nve project.validate [type] [cwd]`                               | Check project for configuration issues and dependencies.                                 |
| `nve project.setup [cwd]`                                         | Setup or update a project to use Elements.                                                         |

## MCP

### Quick Setup

The fastest way to configure MCP is with the `setup` command:

```shell
nve project.setup
```

This detects your package manager, configures the MCP server for both Cursor and Claude Code, and adds Elements core dependencies to the project.

### Claude Code

Install to Claude Code by adding the configuration to your `.mcp.json` file. Add the following configuration to your `.mcp.json` file (typically located at `~/.config/claude-code/.mcp.json` or `%APPDATA%\claude-code\.mcp.json` on Windows):

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

After adding the configuration, restart Claude Code for the changes to take effect. The Elements MCP tools are then available for use in your conversations.

### Cursor

Install to Cursor with the MCP configuration below.

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "elements": {
      "description": "NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples",
      "command": "nve mcp"
    }
  }
}
```

### Prompts

| Prompt | Description | Example Prompt |
| ------ | ----------- | -------------- |
| `/about` | A brief introduction to Elements | `/about` |
| `/doctor` | Verify Elements setup and MCP configuration | `/doctor` |
| `/playground` | Context for creating playground prototypes | `/playground` Create an example login form |
| `/search` | Context for searching Elements APIs | `/search` What works for notifying a user of a long running process? |
| `/new-project` | Context for creating a new Elements project. | `/new-project` Create an Angular todo app |
| `/migrate` | Context for migrating from deprecated Elements APIs | `/migrate` Migrate this project from deprecated Elements APIs |

### Skills

Skills provide persistent context to AI agents for building UI with Elements.

| Skill | Description |
| ----- | ----------- |
| `elements` | Build UI with NVIDIA Elements (NVE). Provides authoring guidelines, workflow steps, and API best practices for creating, editing, or reviewing HTML templates that use nve-* components. |

### Tools

| Tool | Description |
| ---- | ----------- |
| `api_list` | Get list of all available Elements (nve-*) APIs and components. |
| `api_get` | Get documentation known components or attributes by name (nve-*). |
| `api_template_validate` | Validates HTML templates using Elements APIs and components (nve-*). |
| `api_imports_get` | Get esm imports for a given HTML template using Elements APIs (nve-*). |
| `api_tokens_list` | Get available semantic CSS custom properties / design tokens for theming. |
| `packages_list` | Get latest published versions of all Elements packages. |
| `packages_get` | Get details for a specific Elements package. |
| `packages_changelogs_get` | Retrieve changelog details by package name. |
| `examples_list` | Get list of available Elements (nve-*) patterns and examples. |
| `examples_get` | Get the full template of a known example or pattern by id. |
| `playground_validate` | Validates HTML templates specifically for playground examples. |
| `playground_create` | Create a shareable playground URL from an HTML template. |
| `project_create` | Create a new starter project. |
| `project_validate` | Check project for configuration issues and dependencies. |
| `project_setup` | Setup or update a project to use Elements. |
