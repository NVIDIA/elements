# @nvidia-elements/cli

NVIDIA Design System and UI Agent Harness for AI/ML Factories, Robotics, and Autonomous Vehicles.

The **@nvidia-elements/cli** is a dual-mode command-line tool for the Elements Design System. It provides interactive CLI commands and a Model Context Protocol (MCP) server for AI assistant integration.

## Purpose

This package serves two primary modes:

1. **Interactive CLI (`nve` command)** - Command-line interface with interactive prompts for:
   - Component API discovery and search
   - Example template browsing and searching
   - Template linting and validation
   - Project scaffolding and health checks
   - Changelog and version information
   - Design token access
   - Icon name lookup
   - Bundled agent skill access

2. **MCP Server (`nve mcp` command)** - Model Context Protocol server that:
   - Exposes all CLI tools to AI assistants (Claude, Cursor, etc.)
   - Provides context-specific prompts for common tasks
   - Enables AI-assisted development with Elements components
   - Integrates Elements knowledge directly into AI workflows

## Getting Started

The best way to get started is to run the install script.

```shell
curl -fsSL https://nvidia.github.io/elements/install.sh | bash
```

On Windows, run the PowerShell installer.

```powershell
irm https://nvidia.github.io/elements/install.ps1 | iex
```

For agents and CI, invoke the canonical path directly: `$HOME/.nve/bin/nve` on macOS and Linux, or `$env:LOCALAPPDATA\nve\bin\nve.exe` on Windows.

Alternatively you can install with [Node.js](https://nodejs.org/) and npm.

```shell
npm install -g @nvidia-elements/cli
```

## Usage

| Command                                                          | Description                                                                            |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `nve`                                                            | Show About and help output.                                                            |
| `nve api.list [format]`                                          | Get a list of all available Elements (`nve-*`) APIs and components.                    |
| `nve api.get <names> [format]`                                   | Get documentation for known components or attributes by name (`nve-*`).                |
| `nve api.template.validate <template>`                           | Check HTML templates using Elements APIs and components (`nve-*`).                     |
| `nve api.imports.get <template>`                                 | Get ESM imports for an HTML template using Elements APIs (`nve-*`).                    |
| `nve api.tokens.list [format] [query]`                           | Get available semantic CSS custom properties and design tokens for theming.            |
| `nve api.icons.list [format]`                                    | Get available icon names for `nve-icon` and `nve-icon-button`.                         |
| `nve examples.list [format]`                                     | Get available Elements (`nve-*`) starter templates, patterns, and examples.            |
| `nve examples.get <id> [format]`                                 | Get the full template of a known example or pattern by ID.                             |
| `nve project.create <type> [cwd] [start]`                        | Create a new starter project.                                                          |
| `nve project.setup [cwd]`                                        | Set up or update a project to use Elements.                                            |
| `nve project.validate <type> [cwd]`                              | Check project configuration and dependencies.                                          |
| `nve packages.list`                                              | Get latest published versions of all Elements packages.                                |
| `nve packages.get <name>`                                        | Get details for a specific Elements package.                                           |
| `nve packages.changelogs.get <name> [format] [limit]`            | Retrieve changelog details by package name.                                            |
| `nve skills.list [format]`                                       | Get available Elements agent skills and context.                                       |
| `nve skills.get <name> [format]`                                 | Get a bundled Elements agent skill by name.                                            |
| `nve mcp`                                                        | Start the MCP server.                                                                  |

### Global Options

| Option      | Description                                      |
| ----------- | ------------------------------------------------ |
| `--help`    | Show help.                                       |
| `--version` | Show version number.                             |
| `--upgrade` | Upgrade Elements CLI (`nve`) to the latest version. |
| `--debug`   | Enable debug output for tools.                   |

## MCP

### Quick Setup

The fastest way to configure MCP is with the `project.setup` command:

```shell
nve project.setup
```

This detects your package manager, configures the MCP server for Cursor, Codex, and Claude Code, and adds Elements core dependencies to the project.

### Claude Code

Install to Claude Code by adding the configuration to your `.mcp.json` file. The file is typically located at `~/.config/claude-code/.mcp.json` or `%APPDATA%\claude-code\.mcp.json` on Windows.

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
      "command": "nve",
      "args": ["mcp"]
    }
  }
}
```

### Codex

Install to Codex with the MCP configuration below.

```toml
[mcp_servers.elements]
description = "NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples"
command = "nve"
args = ["mcp"]
```

### Prompts

| Prompt | Description | Example Prompt |
| ------ | ----------- | -------------- |
| `/about` | A brief introduction to Elements | `/about` |
| `/doctor` | Verify Elements setup and MCP configuration | `/doctor` |
| `/search` | Context for searching Elements APIs | `/search` What works for notifying a user of a long running process? |
| `/new-project` | Context for creating a new Elements project | `/new-project` Create a todo app |
| `/migrate` | Context for migrating from deprecated Elements APIs | `/migrate` Migrate this project from deprecated Elements APIs |

### Skills

Skills provide persistent context to AI agents for building UI with Elements.

| Skill | Description |
| ----- | ----------- |
| `about` | Instructions for providing a brief introduction for using the Elements Design System. |
| `authoring` | Best practices and workflow guidance for authoring UI with NVIDIA Elements. |
| `doctor` | Instructions for ensuring the Elements Design System is setup correctly. |
| `artifact` | Use when creating throwaway UI artifacts, prototypes, demos, Claude Artifacts, Codex, or GPT Sites pages, or other standalone HTML interfaces that should use the NVIDIA Elements CDN template. |
| `integration` | Best practices and workflow guidance for creating or setting up NVIDIA Elements projects. |
| `migration` | Instructions for migrating a project from deprecated Elements APIs using lint tooling and CLI health checks. |
| `search` | Best practices for providing Elements API Documentation. |
| `elements` | Default skill for UI-related work or NVIDIA Elements (`nve-*`), including HTML, CSS, layout, theming, components, applications, prototypes, Claude Artifacts, Codex Sites pages, and standalone UI artifacts. |

Run `nve skills.list` or call MCP `skills_list` for the authoritative list. Deployments with the playground service enabled can also expose a `playground` skill for creating Elements Playground prototypes.

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
| `skills_list` | Get a list of available Elements agent skills and context fragments. |
| `skills_get` | Get a bundled Elements agent skill or context fragment by name. |
| `project_create` | Create a new starter project. |
| `project_validate` | Check project for configuration issues and dependencies. |
| `project_setup` | Setup or update a project to use Elements. |

## Links

- [Documentation](https://NVIDIA.github.io/elements/docs/cli/)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [GitHub Repo](https://github.com/NVIDIA/elements)
- [npm](https://www.npmjs.com/package/@nvidia-elements/cli)
