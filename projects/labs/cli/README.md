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

2. **MCP Server (`nve-mcp` command)** - Model Context Protocol server that:
   - Exposes all CLI tools to AI assistants (Claude, Cursor, etc.)
   - Provides context-specific prompts for common tasks
   - Enables AI-assisted development with Elements components
   - Integrates Elements knowledge directly into AI workflows

## Installation

To use the Elements CLI you must have [NodeJS](https://nodejs.org/) installed.

```shell
# login to artifactory
npm config set registry https://registry.npmjs.org && npm login --auth-type=legacy

# install package
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
| `nve api.tokens.list [format]`                                    | Get available semantic CSS variables / design tokens for theming.                                   |
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
npx --package=@nvidia-elements/cli -y nve-setup-mcp
```

This detects your package manager, configures the MCP server for both Cursor and Claude Code, and adds Elements core dependencies to the project.

### Claude Code

Install to Claude Code by adding the configuration to your `.mcp.json` file. Add the following configuration to your `.mcp.json` file (typically located at `~/.config/claude-code/.mcp.json` or `%APPDATA%\claude-code\.mcp.json` on Windows):

```json
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

After adding the configuration, restart Claude Code for the changes to take effect. The Elements MCP tools are then available for use in your conversations.

### Cursor

Install to Cursor with the MCP configuration below.

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
| `api_tokens_list` | Get available semantic CSS variables / design tokens for theming. |
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

## Architecture

### Entry Points

The package has three entry points:

- **`./dist/index.js`** (`nve` command) - Interactive CLI using Yargs with Inquirer for prompts
- **`./dist/mcp/index.js`** (`nve-mcp` command) - MCP server using @modelcontextprotocol/sdk
- **`./dist/setup-mcp/index.js`** (`nve-setup-mcp` command) - Quick setup wrapper that spawns `nve project.setup`

### Tool System

The CLI **dynamically loads tools from `@internals/tools`** at runtime rather than defining tools itself. This architecture provides:

- **Decorator-based discovery** - Tools marked with `@tool()` decorator are auto-discovered
- **Schema-driven** - JSON Schema definitions drive argument parsing and validation
- **Consistent interface** - All tools return `{status, message, result}` structure
- **Dual-mode operation** - Same tools work in both CLI and MCP modes

### Implementation Details

#### CLI Mode (`src/index.ts`)
- Sets `process.env.ELEMENTS_ENV = 'cli'`
- Creates Yargs instance with dynamic command registration
- **Interactive prompts** - Uses Inquirer when required arguments are missing
- **Argument parsing** - Converts JSON Schema properties to Yargs positional/optional arguments
- **Result rendering** - Uses `renderResult()` to format output (markdown, JSON, reports)

Example tool registration:
```typescript
// Dynamically registers all tools as Yargs commands
tools.forEach(tool => {
  yargs.command(
    tool.command,
    tool.description,
    // Build arguments from JSON Schema
    (yargs) => buildYargsOptions(yargs, tool.inputSchema),
    // Execute tool and render result
    async (argv) => {
      const result = await tool.handler(argv);
      renderResult(result);
    }
  );
});
```

#### MCP Mode (`src/mcp/index.ts`)
- Sets `process.env.ELEMENTS_ENV = 'mcp'`
- Creates MCP server instance with stdio transport
- **Tool registration** - Registers all tools with MCP server using Zod schemas
- **Prompt registration** - Registers 6 built-in prompts (about, doctor, search, playground, new-project, migrate)
- **Structured output** - Returns results with status, message, and structured content

Example MCP tool registration:
```typescript
// Convert JSON Schema to Zod and register with MCP
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(tool => ({
    name: tool.toolName,
    description: tool.description,
    inputSchema: zodToJsonSchema(jsonSchemaToZod(tool.inputSchema))
  }))
}));
```

## Data Flow

```
Components Build → custom-elements.json
                ↓
          Metadata Pipeline
                ↓
         Static JSON Files
                ↓
      @internals/tools (services)
                ↓
         @nvidia-elements/cli
                ↓
        ┌───────┴────────┐
        ↓                ↓
    CLI Mode         MCP Mode
  (Interactive)   (AI Integration)
```
