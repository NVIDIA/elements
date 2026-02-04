# Tools

The **@nve-internals/tools** project is a shared utility library that provides standardized tools, utilities, and services for the Elements Design System ecosystem. It serves as the infrastructure layer that enables automation, documentation generation, and programmatic access to Elements metadata.

## Purpose

This package provides:

- **Unified services** for exposing component APIs and documentation
- **Playground creation** and validation utilities
- **Project management** tools for scaffolding and health checks
- **Example template** management and search
- **Changelog and version** information services
- **Design token** access and formatting

The package is **private** (not published to npm) and serves as shared infrastructure for `@nvidia-elements/cli`, the documentation site (`projects/site`), and starter templates.

## Architecture

The project uses a **decorator-based service architecture** that enables dynamic tool discovery and registration.

### Service Modules

Seven main service modules organized by functionality:

```
projects/internals/tools/src/
├── api/              # Component API documentation service
├── examples/         # Example templates and patterns service
├── playground/       # Playground creation and validation service
├── project/          # Project creation, update, and health checks
├── changelogs/       # Release notes and changelog service
├── tokens/           # Design tokens/CSS variables service
├── internal/         # Core infrastructure and utilities
└── index.ts          # Main entry point exporting all tools
```

### Core Services

#### **ApiService** (`/api/service.ts`)
- `list()` - Get all available component APIs and attributes
- `search()` - Search for specific APIs by query
- `version()` - Get latest published versions of all Elements packages
- Returns markdown or JSON format

#### **ExamplesService** (`/examples/service.ts`)
- `list()` - Get list of available example templates/patterns
- `search()` - Search example templates by name or description
- Pulls from `@nve-internals/metadata`

#### **PlaygroundService** (`/playground/service.ts`)
- `validate()` - Lint and validate HTML templates for playground compliance
- `create()` - Generate shareable playground URLs with framework support
- Supports vanilla HTML, React, Preact, Angular, and Lit templates
- Creates complete file structures with import maps and styling

#### **ProjectService** (`/project/service.ts`)
- `create()` - Generate new starter projects (React, Angular, Vue, Lit, etc.)
- `update()` - Update project dependencies to latest @nve versions
- `health()` - Audit project for best practices and configuration issues

#### **ChangelogsService** (`/changelogs/service.ts`)
- `list()` - Get changelogs for all @nve packages
- `search()` - Find changelogs for specific packages using fuzzy matching

#### **TokensService** (`/tokens/service.ts`)
- `list()` - Get available semantic CSS variables and design tokens
- Returns tokens in markdown or JSON format

### Tool System Architecture

The package implements a **decorator-based tool system**:

#### **@service() Decorator**
Marks a class as a service and auto-generates its name:
```typescript
@service()
export class ApiService { ... }
```

#### **@tool() Decorator**
Marks methods as tools with JSON Schema validation:
```typescript
@tool({
  description: 'Get list of all available APIs',
  inputSchema: { type: 'object', properties: { ... } },
  outputSchema: { type: 'object', properties: { ... } }
})
static async list(options): Promise<ToolOutput<T>> { ... }
```

#### **loadTools() Function**
Dynamically loads decorated methods and wraps them to provide:
- Consistent error handling
- Metadata generation
- Tool naming conventions (snake_case with service prefix)
- Automatic tool discovery

All tools return a standardized output:
```typescript
interface ToolOutput<T> {
  status: 'complete' | 'error';
  message?: string;
  result: T;
}
```

##***REMOVED*** Utilities

The `/internal` directory provides core infrastructure:

- **`tools.ts`** - Decorator implementations and tool loading logic
- **`types.ts`** - TypeScript interfaces for ToolMetadata, Schema, and ToolOutput
- **`validate.ts`** - HTML template sanitization and validation using `sanitize-html`
- **`utils.ts`** - Utility functions (element imports, text wrapping, available tags)
- **`search.ts`** - Fuzzy matching and search algorithms
- **`prompts.ts`** - MCP prompts for AI agents (about, search, playground, new-project)

## Package Exports

The package provides modular entry points for tree-shaking:

```json
{
  ".": "./dist/index.js",                    // All tools
  "./api": "./dist/api/index.js",           // API service only
  "./examples": "./dist/examples/index.js", // Examples service only
  "./playground": "./dist/playground/index.js",
  "./project": "./dist/project/index.js",
  "./changelogs": "./dist/changelogs/index.js",
  "./tokens": "./dist/tokens/index.js"
}
```

Users can import specific services:
```typescript
import { ApiService } from '@nve-internals/tools/api';
import { PlaygroundService } from '@nve-internals/tools/playground';
```

## Relationship to Other Projects

### **@nve-internals/metadata**
Tools depends on metadata services to access:
- Component API information (ApiService)
- Published package information (ProjectsService)
- Example templates (ExamplesService)
- Design token definitions

Tools enhance this metadata by:
- Formatting for different output types (markdown, JSON)
- Searching and filtering data
- Validating user input against available options
- Creating URLs and file structures for playgrounds

### **@nvidia-elements/cli**
The CLI dynamically imports all tools from this package:
- Registers tools as CLI commands using Yargs
- Uses decorator metadata to generate argument parsers
- Exposes tools via Model Context Protocol (MCP) for AI assistants
- Converts JSON Schemas to Zod for runtime validation

### **projects/site**
The documentation site uses tools during build:
- **Eleventy shortcodes** use `PlaygroundService.create()` for embedded playgrounds
- **Build-time** imports `ExamplesService`, `ApiService` for static generation
- **Canvas editable** provides interactive playground creation in browser
- **Version rendering** uses `ApiService.version()` for latest package versions

### **Starter Projects**
Starter templates use tools for:
- `ExamplesService.getAll()` to populate example galleries
- `archiveStarter()` to package project templates

## Data Flow

```
@nve-internals/metadata (raw data)
    ↓
@nve-internals/tools (services + utilities)
    ↓
    ├─→ @nvidia-elements/cli (commands + MCP tools)
    ├─→ projects/site (11ty shortcodes + build)
    └─→ projects/starters (example galleries)
```
