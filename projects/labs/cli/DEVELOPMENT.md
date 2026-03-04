# Development

| Command                  | Description                                |
| ------------------------ | ------------------------------------------ |
| `pnpm run build`         | Build the library                          |
| `pnpm run dev`           | Launch the MCP inspector for local testing |
| `pnpm run lint`          | Lint source files                          |
| `pnpm run test`          | Run unit tests                             |
| `pnpm run test:watch`    | Run unit tests in watch mode               |
| `pnpm run test:coverage` | Run unit tests with coverage               |
| `pnpm run ci`            | Run the full CI pipeline                   |

## Architecture

### Entry Points

The package has three entry points:

- **`./dist/index.js`** (`nve` command) - Interactive CLI using Yargs with Inquirer for prompts
- **`./dist/mcp/index.js`** (`nve-mcp` command) - MCP server using @modelcontextprotocol/sdk
- **`./dist/setup-mcp/index.js`** (`nve-setup` command) - Quick setup wrapper that spawns `nve project.setup`

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
