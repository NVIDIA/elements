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

| Command                                                           | Description                                                          |
| ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| `nve api.list [format] [format]`                                  | Get list of all available APIs and components.                       |
| `nve api.search [query] [format]`                                 | Get API information for specific APIs and components.                |
| `nve api.version`                                                 | Get latest versions of elements/@nve packages.                       |
| `nve changelogs.list [format]`                                    | Get changelog details for all @nve packages.                         |
| `nve changelogs.search [name] [format]`                           | Get changelog details for specific @nve package.                     |
| `nve examples.list [format]`                                      | Get list of available example templates/patterns.                    |
| `nve examples.search [query] [format]`                            | Search for example templates/patterns by name or description.        |
| `nve playground.validate [template]`                              | Get validated HTML string for an example template/playground.        |
| `nve playground.create [template] [type] [name] [author] [start]` | Creates a playground url/link generated from a html template string. |
| `nve project.create [type] [cwd] [start]`                         | Create a new starter project.                                        |
| `nve project.update [cwd]`                                        | Update a project to the latest versions of Elements packages.        |
| `nve project.health [type] [cwd]`                                 | Check the health of a project using Elements packages.               |
| `nve tokens.list [format] [format]`                               | Get available semantic CSS variables / design tokens for theming.    |

## MCP

### Claude Code

Install to Claude Code by adding the configuration to your `.mcp.json` file. Add the following configuration to your `.mcp.json` file (typically located at `~/.config/claude-code/.mcp.json` or `%APPDATA%\claude-code\.mcp.json` on Windows):

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

After adding the configuration, restart Claude Code for the changes to take effect. The Elements MCP tools will be available for use in your conversations.

### Cursor

Install to Cursor with the MCP configuration below.

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

### Prompts

| Prompt | Description | Example Prompt |
| ------ | ----------- | -------------- |
| `/about` | A brief introduction to Elements | `/about` |
| `/playground` | Context for creating playground prototypes | `/playground` Create an example login form |
| `/search` | Context for searching Elements APIs | `/search` What could I use for notifying user of a long running process? |
| `/new-project` | Context for creating a new Elements project. | `/new-project` Create a Angular todo app |

### Tools

| Tool | Description |
| ---- | ----------- |
| `api_list [format] [format]` | Get list of all available APIs and components. |
| `api_search [query] [format]` | Get API information for specific APIs and components. |
| `api_version` | Get latest versions of elements/@nve packages. |
| `changelogs_list [format]` | Get changelog details for all @nve packages. |
| `changelogs_search [name] [format]` | Get changelog details for specific @nve package. |
| `examples_list [format]` | Get list of available example templates/patterns. |
| `examples_search [query] [format]` | Search for example templates/patterns by name or description.` |
| `playground_validate [template]` | Get validated HTML string for an example template/playground. |
| `playground_create [template] [type] [name] [author] [start]` | Creates a playground url/link generated from a html template string. |
| `project_create [type] [cwd] [start]` | Create a new starter project. (`angular`, `bundles`, `eleventy`, `extensions`, `go`, `importmaps`, `lit-library`, `lit`, `nextjs`, `nuxt`, `preact`, `react`, `solidjs`, `svelte`, `typescript`, `vue`) |
| `project_update [cwd]` | Update a project to the latest versions of Elements packages. |
| `project_health [type] [cwd]` | Check the health of a project using Elements packages. |
| `tokens_list [format] [format]` | Get available semantic CSS variables / design tokens for theming. |

## Architecture

### Dual Entry Points

The package has two main entry points:

- **`./dist/index.js`** (`nve` command) - Interactive CLI using Yargs with Inquirer for prompts
- **`./dist/mcp/index.js`** (`nve-mcp` command) - MCP server using @modelcontextprotocol/sdk

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
- **Prompt registration** - Registers 4 built-in prompts (about, search, playground, new-project)
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
