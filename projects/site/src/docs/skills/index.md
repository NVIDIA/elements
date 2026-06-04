---
{
  title: 'Skills',
  description: 'Use NVIDIA Elements skills to give AI agents persistent project context, workflow guidance, and access to Elements UI authoring practices.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

<h2 nve-text="heading sm muted">Skills give AI agents durable Elements context for authoring, validating, and maintaining UI projects</h2>

Elements ships agent skills with the CLI and MCP server. Skills are not a replacement for deterministic tools. They provide workflow order, project policy, and authoring guidance while the CLI and MCP tools provide the current API data, examples, imports, validation, packages, and starter setup.

The Model Context Protocol standardizes tools, prompts, and resources. Elements maps that model directly: tools expose callable operations such as `api_get`, prompts provide user-invoked task flows, and skills provide reusable context that agents can keep loaded while working in a project.

{% install-cli %}

## Add Skills To A Project

The recommended path is the project setup command. Run it from the project root:

```shell
nve project.setup
```

The setup command configures Elements for common agent clients and editor tooling:

- Adds Elements MCP configuration for Claude Code, Cursor, and Codex.
- Writes the Elements skill to `.agents/skills/elements/SKILL.md`.
- Writes the Elements skill to `.claude/skills/elements/SKILL.md`.
- Adds VS Code custom data paths for `nve-*` tag and attribute authoring.
- Adds or updates core Elements package dependencies.

New starter projects created with `nve project.create` receive the same agent setup during project creation.

## Manual Skill Setup

Use the CLI when you need to inspect or install a skill by hand:

```shell
nve skills.list
nve skills.get elements
```

Place the selected skill content in the directory format supported by your agent. The generated Elements skill uses this file shape:

```html
---
name: elements
title: Elements Design System (nve)
description: Build UI with NVIDIA Elements (NVE). Use when creating, editing, or reviewing HTML templates that use nve-* components.
---

# Building UI with NVIDIA Elements

...
```

For Codex and Cursor-compatible agents, use:

```shell
.agents/skills/elements/SKILL.md
```

For Claude Code, use:

```shell
.claude/skills/elements/SKILL.md
```

## Available Skills

<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="170px">Skill</nve-grid-column>
    <nve-grid-column width="300px">Use</nve-grid-column>
    <nve-grid-column>Benefit</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">elements</code></nve-grid-cell>
    <nve-grid-cell>General Elements UI authoring, editing, and review.</nve-grid-cell>
    <nve-grid-cell>Gives the agent a broad Elements workflow, tool map, authoring rules, playground guidance, and project integration guidance.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">authoring</code></nve-grid-cell>
    <nve-grid-cell>Creating or changing HTML templates with <code nve-text="code">nve-*</code> APIs.</nve-grid-cell>
    <nve-grid-cell>Forces lookup-first authoring: search examples, inspect APIs, generate imports, then validate the template.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">search</code></nve-grid-cell>
    <nve-grid-cell>Finding components, examples, icons, and tokens.</nve-grid-cell>
    <nve-grid-cell>Points the agent at the right CLI and MCP lookup tools before it guesses component names or attributes.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">integration</code></nve-grid-cell>
    <nve-grid-cell>Creating starters or adding Elements to an existing project.</nve-grid-cell>
    <nve-grid-cell>Defines the setup sequence: create or update the project, install packages, configure MCP, import CSS, register components, and validate.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">doctor</code></nve-grid-cell>
    <nve-grid-cell>Checking project and MCP setup.</nve-grid-cell>
    <nve-grid-cell>Guides the agent toward `nve project.validate` and MCP configuration checks before changing source code.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">migration</code></nve-grid-cell>
    <nve-grid-cell>Migrating from deprecated Elements APIs or internal package names.</nve-grid-cell>
    <nve-grid-cell>Combines package mapping, lint setup, deprecated API replacement, and validation into one ordered workflow.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">about</code></nve-grid-cell>
    <nve-grid-cell>Explaining Elements to developers who are new to the system.</nve-grid-cell>
    <nve-grid-cell>Provides concise product context, benefits, getting started guidance, and resource links.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>

The `playground` skill is available when the CLI or MCP server has the Elements playground service enabled.

## Use Skills With MCP

Configure the MCP server once:

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

Then use skills as context and MCP tools as the live data plane:

- Use `skills_get` for workflow guidance.
- Use `api_get`, `api_list`, and `api_template_validate` for current component contracts.
- Use `examples_list` and `examples_get` for known UI patterns.
- Use `api_imports_get` to generate explicit `define.js` imports.
- Use `project_setup` and `project_validate` for project health.

## Dynamic Context Lookup

Elements publishes context files for agents that can fetch URLs at runtime if MCP or CLI are not available:

- [`llms.txt`](https://nvidia.github.io/elements/llms.txt) is the small context index.
- [`llms-full.txt`](https://nvidia.github.io/elements/llms-full.txt) is the large single-file archive.

Use `llms.txt` when an agent can fetch links during a task. It points to the CLI/MCP context, lint context, API index, examples index, skills index, icons, and design tokens. This keeps context small and lets the agent load only the specific page or API it needs.

Use `llms-full.txt` when you need offline context or local retrieval-augmented generation. Download it, split it into chunks, and generate embeddings for a local index. This works well for editors, internal assistants, and environments without outbound network access during inference.

<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="210px">Source</nve-grid-column>
    <nve-grid-column>Best For</nve-grid-column>
    <nve-grid-column>Tradeoff</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">llms.txt</code></nve-grid-cell>
    <nve-grid-cell>Dynamic lookup, web-enabled agents, focused task context.</nve-grid-cell>
    <nve-grid-cell>Requires URL access during the task, but avoids loading unnecessary documentation.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">llms-full.txt</code></nve-grid-cell>
    <nve-grid-cell>Local RAG, offline workflows, precomputed embeddings.</nve-grid-cell>
    <nve-grid-cell>Larger and easier to make stale. Rebuild or re-download the index when Elements releases new docs.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Local skill files</nve-grid-cell>
    <nve-grid-cell>Persistent repository policy and authoring behavior.</nve-grid-cell>
    <nve-grid-cell>Best for stable workflow guidance, not exhaustive API catalogs.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Elements MCP</nve-grid-cell>
    <nve-grid-cell>Live API lookup, validation, examples, package versions, and project setup.</nve-grid-cell>
    <nve-grid-cell>Requires an MCP-capable client and local CLI installation.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>

For most projects, use all four layers narrowly: install the local `elements` skill, configure `nve mcp`, let web-enabled agents start from `llms.txt`, and reserve `llms-full.txt` for local search indexes.

## References

- [Elements CLI](docs/cli/)
- [Elements MCP](docs/mcp/)
- [MCP Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [MCP Prompts](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts)
- [MCP Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)
