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
| `nve api.get [name] [format]`                                     | Get the documentation of a known Elements component or API by its name.                            |
| `nve api.template.validate [template]`                            | Validates HTML templates using Elements APIs and components. Checks for invalid API usage.         |
| `nve api.changelogs [name]`                                       | Get the changelog details for a specific component or API.                                         |
| `nve packages.versions.list`                                      | Get latest published versions of all Elements packages.                                            |
| `nve packages.changelogs.list [format]`                           | Get changelog details for all @nve packages.                                                       |
| `nve packages.changelogs.search [name] [format]`                  | Search for and retrieve changelog details by package name (supports fuzzy matching).               |
| `nve examples.list [format]`                                      | Get a summary list of available component/pattern usage examples.                                  |
| `nve examples.search [query] [format]`                            | Search Elements pattern usage examples by name, element type, or keywords.                         |
| `nve playground.validate [template]`                              | Validates HTML templates for playground examples. Enforces additional constraints for demos.       |
| `nve playground.create [template] [type] [name] [author] [start]` | Create a shareable playground URL from an HTML template.                                           |
| `nve project.create [type] [cwd] [start]`                         | Create a new starter project.                                                                      |
| `nve project.update [cwd]`                                        | Update a project to the latest versions of Elements packages.                                      |
| `nve project.validate [type] [cwd]`                               | Validate project setup and check for configuration issues, outdated dependencies.                  |
| `nve tokens.list [format]`                                        | Get available semantic CSS variables / design tokens for theming.                                  |

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
| `/doctor` | Verify Elements setup and MCP configuration | `/doctor` |
| `/playground` | Context for creating playground prototypes | `/playground` Create an example login form |
| `/search` | Context for searching Elements APIs | `/search` What could I use for notifying user of a long running process? |
| `/new-project` | Context for creating a new Elements project. | `/new-project` Create an Angular todo app |

### Tools

| Tool | Description |
| ---- | ----------- |
| `api_list` | Get list of all available Elements (nve-*) APIs and components. |
| `api_search` | Search and retrieve a list of Elements (nve-*) components and APIs using keywords. |
| `api_get` | Get the documentation of a known Elements component or API by its name. |
| `api_template_validate` | Validates HTML templates using Elements APIs and components (nve-*). |
| `api_changelogs` | Get the changelog details for a specific component or API. |
| `packages_versions_list` | Get latest published versions of all Elements packages. |
| `packages_changelogs_list` | Get changelog details for all @nve packages. |
| `packages_changelogs_search` | Search for and retrieve changelog details by package name (supports fuzzy matching). |
| `examples_list` | Get a summary list of available component/pattern usage examples. |
| `examples_search` | Search Elements pattern usage examples by name, element type, or keywords. |
| `playground_validate` | Validates HTML templates for playground examples. |
| `playground_create` | Create a shareable playground URL from an HTML template. |
| `project_create` | Create a new starter project. |
| `project_update` | Update a project to the latest versions of Elements packages. |
| `project_validate` | Validate project setup and check for configuration issues, outdated dependencies. |
| `tokens_list` | Get available semantic CSS variables / design tokens for theming. |

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
