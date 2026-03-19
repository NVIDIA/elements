# Metadata

The **@internals/metadata** project is the metadata aggregation and generation system for the Elements monorepo. It serves as the central metadata hub that powers documentation, analytics, and development tools throughout the project.

## Purpose

This project extracts, aggregates, and indexes comprehensive metadata about all packages, components, tests, and build artifacts in the monorepo. It provides:

- **Searchable APIs** for component information using MiniSearch indexing
- **Services** for consuming metadata across the monorepo (ApiService, ExamplesService, ProjectsService, etc.)
- **Static JSON files** generated from the codebase or sourced from Git LFS for expensive computations
- **Type-safe TypeScript interfaces** for all metadata structures

## Architecture

The project organizes into three main functional layers:

### 1. Task Generators (`src/tasks/`)

Node.js scripts that parse the monorepo and generate static JSON metadata files:

- **`api.ts`** - Generates `static/api.json` by collecting custom element manifests, attributes, and design tokens from all projects
- **`examples.ts`** - Generates `static/examples.json` from all `*.examples.json` files across components
- **`projects.ts`** - Generates `static/projects.json` with package metadata (name, version, README, changelog)
- **`tests.ts`** - Aggregates test coverage and results from all test suites
- **`lighthouse.ts`** - Collects performance metrics (bundled via Git LFS)
- **`wireit.ts`** - Generates build dependency graph visualization data
- **`releases.ts`** - Parses git history to extract package release information

### 2. Services (`src/services/`)

Runtime services that provide cached access to generated metadata with fallback mechanisms:

- **`ApiService`** - Loads and searches element/attribute metadata with MiniSearch indexing
- **`ExamplesService`** - Provides searchable access to component examples
- **`ProjectsService`** - Returns project metadata (names, versions, descriptions)
- **`TestsService`** - Exposes test coverage and results
- **`ReleasesService`** - Returns release history
- **`WireitService`** - Exposes build graph data

Services use a **dual-loading pattern**: first attempting to load from local `static/*.json` files, then falling back to fetching from public CDN if unavailable.

### 3. Search Indexes (`src/indexes/`)

Provides full-text search capabilities:

- **`api.ts`** - Creates MiniSearch index for elements and attributes with custom tokenization (handles kebab-case and camelCase)
- **`examples.ts`** - Indexes example templates for full-text search
- **`utils.ts`** - Common indexing utilities

## Relationship to Other Projects

**Consumers of this package:**

- **`projects/site`** - Documentation site uses ApiService, TestsService, ReleasesService to display metrics pages, API reference, and usage analytics
- **`projects/cli`** - CLI uses metadata services to power interactive commands and MCP tools
- **`projects/internals/tools`** - Tools package wraps metadata services with higher-level utilities for playground creation, validation, and project management
- **`projects/lint`** - ESLint rules use ApiService for metadata-driven validations

## Data Flow

```
Component Source (.ts files)
    ↓
Build Output (custom-elements.json, examples.json)
    ↓
Metadata Generation Tasks (this package)
    ↓
Static JSON Files (static/*.json)
    ↓
Services (ApiService, ExamplesService, etc.)
    ↓
Documentation Site / CLI / Tools
```

The metadata scripts generate common metadata about projects in the repo. This information is then consumed in a variety of ways such as displaying information on the [documentation](https://NVIDIA.github.io/elements/docs/metrics/) site or reporting to [GitHub](https://github.com/NVIDIA/elements/-/graphs/main/charts).

## Generate Report Commands

## Tasks that run with each build
- `pnpm run generate:metadata`: runs metadata script gathering stability and API details of the packages.
- `pnpm run generate:tests`: runs the test metadata script gathering all the test results of the repo.
- `pnpm run generate:examples`: runs the examples metadata script gathering all the source examples from the packages.
- `pnpm run generate:wireit`: runs the wireit script that gathers all metadata details about the CI build and wireit dependencies.

