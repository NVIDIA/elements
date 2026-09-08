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
   - Exposes MCP-supported tools to AI assistants (Claude, Cursor, etc.)
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

| Command                                               | Description                                                                 |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| `nve`                                                 | Show About and help output.                                                 |
| `nve api.list [format]`                               | Get a list of all available Elements (`nve-*`) APIs and components.         |
| `nve api.get <names..> [--format <format>]`           | Get documentation for one to five known components or attributes (`nve-*`). |
| `nve api.validate [paths..]`                          | Check HTML and JSON from explicit file paths, glob patterns, or standard input (`--stdin`) using Elements lint rules. |
| `nve api.imports.get <template>`                      | Get ESM imports for an HTML template using Elements APIs (`nve-*`).         |
| `nve api.tokens.list [format] [query]`                | Get available semantic CSS custom properties and design tokens for theming. |
| `nve api.icons.list [format]`                         | Get available icon names for `nve-icon` and `nve-icon-button`.              |
| `nve examples.list [format]`                          | Get available Elements (`nve-*`) starter templates, patterns, and examples. |
| `nve examples.get <id> [format]`                      | Get the full template of a known example or pattern by ID.                  |
| `nve project.create <type> [cwd] [start]`             | Create a new starter project.                                               |
| `nve project.setup [cwd]`                             | Set up or update a project to use Elements.                                 |
| `nve project.validate <type> [cwd]`                   | Check project configuration and dependencies.                               |
| `nve packages.list`                                   | Get latest published versions of all Elements packages.                     |
| `nve packages.get <name>`                             | Get details for a specific Elements package.                                |
| `nve packages.changelogs.get <name> [format] [limit]` | Retrieve changelog details by package name.                                 |
| `nve skills.install [--global]`                       | Install the Elements agent skill in the project or for the current user.    |
| `nve mcp`                                             | Start the MCP server.                                                       |

### Global Options

| Option      | Description                                         |
| ----------- | --------------------------------------------------- |
| `--help`    | Show help.                                          |
| `--version` | Show version number.                                |
| `--upgrade` | Upgrade Elements CLI (`nve`) to the latest version. |
| `--debug`   | Enable debug output for tools.                      |

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

| Prompt           | Description                                         | Example Prompt                                                        |
| ---------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| `/artifact`      | Create a standalone Elements UI artifact            | `/artifact` Create an example login form                              |
| `/doctor`        | Verify Elements setup and MCP configuration         | `/doctor`                                                             |
| `/create-project` | Create a new Elements starter project              | `/create-project` Create a todo app                                   |
| `/migrate`       | Migrate from deprecated Elements APIs               | `/migrate` Migrate this project from deprecated Elements APIs         |

## NVIDIA Elements Skill

Elements provides one `elements` skill with reference files for artifact creation, setup checks, project integration, and migration. Install the complete directory in the current project:

```shell
nve skills.install
```

This writes `.agents/skills/elements/` and `.claude/skills/elements/`. Add `--global` to install it for the current user at `~/.agents/skills/elements/` instead. The command replaces existing `elements` directories at the selected destinations so stale references do not remain.

Alternatively, install the Elements agent skill with the open [skills](https://www.skills.sh/nvidia/elements/elements) CLI:

```shell
npx skills add https://github.com/nvidia/elements --skill elements
```

This route does not install the Elements CLI or configure the MCP server. Use `nve project.setup` for complete project setup, and continue to use the CLI or MCP tools for deterministic API lookup and template validation.

## MCP Tools

| Tool                      | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| `api_list`                | Get list of all available Elements (nve-\*) APIs and components.          |
| `api_get`                 | Get documentation known components or attributes by name (nve-\*).        |
| `api_validate`            | Checks HTML and JSON files or supplied content with Elements lint rules.  |
| `api_imports_get`         | Get esm imports for a given HTML template using Elements APIs (nve-\*).   |
| `api_tokens_list`         | Get available semantic CSS custom properties / design tokens for theming. |
| `packages_list`           | Get latest published versions of all Elements packages.                   |
| `packages_get`            | Get details for a specific Elements package.                              |
| `packages_changelogs_get` | Retrieve changelog details by package name.                               |
| `examples_list`           | Get list of available Elements (nve-\*) patterns and examples.            |
| `examples_get`            | Get the full template of a known example or pattern by id.                |
| `project_create`          | Create a new starter project.                                             |
| `project_validate`        | Check project for configuration issues and dependencies.                  |
| `project_setup`           | Setup or update a project to use Elements.                                |

## Links

- [Documentation](https://NVIDIA.github.io/elements/docs/cli/)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [GitHub Repo](https://github.com/NVIDIA/elements)
- [npm](https://www.npmjs.com/package/@nvidia-elements/cli)
- [MCP Registry](https://registry.modelcontextprotocol.io/?q=io.github.NVIDIA%2Felements)
