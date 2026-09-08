---
{
  title: 'Skills',
  description: 'Install the NVIDIA Elements skill to give AI agents persistent project context and UI authoring guidance.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

<h2 nve-text="heading sm muted">The Elements skill gives AI agents durable UI authoring guidance and task-specific references</h2>

Elements provides one `elements` skill. Its main `SKILL.md` defines the default Elements authoring workflow, while its `references/` directory contains focused guidance for artifacts, setup checks, project integration, and migration.

The skill complements the CLI and MCP server. It provides stable workflow and project guidance, while CLI commands and MCP tools provide current API data, examples, imports, validation, package versions, and starter setup.

## Install From the Hosted Endpoint

Install it with the open [skills](https://www.skills.sh/nvidia/elements/elements) CLI:

```shell
npx skills add https://github.com/nvidia/elements --skill elements
```

You can also install from the NVIDIA Elements documentation Agent Skills well-known endpoint.

```shell
npx skills add https://nvidia.github.io/elements
```

The hosted route installs skill files only. It does not install the Elements CLI, configure the MCP server, add editor data, or add package dependencies.

{% install-cli %}

## Add the Skill to an Existing Project

Install only the skill from the project root:

```shell
nve skills.install
```

Install the skill for the current user instead:

```shell
nve skills.install --global
```

The global command writes `~/.agents/skills/elements/`. It does not change the current project.

## Complete Project Setup

Use the project setup command when you also want Elements packages, editor data, and MCP configuration:

```shell
nve project.setup
```

The setup command:

- Adds Elements MCP configuration for Claude Code, Cursor, and Codex.
- Writes the full Elements skill directory to `.agents/skills/elements/` and `.claude/skills/elements/`.
- Adds VS Code custom data paths for `nve-*` tag and attribute authoring.
- Adds or updates core Elements package dependencies.

New starter projects created with `nve project.create` receive the same agent setup.

## Prompts and References

The MCP server maps four prompts directly to files in the skill's `references/` directory.

<nve-grid>
  <nve-grid-header>
    <nve-grid-column width="190px">Prompt</nve-grid-column>
    <nve-grid-column width="270px">Reference</nve-grid-column>
    <nve-grid-column>Description</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">/artifact</code></nve-grid-cell>
    <nve-grid-cell><code nve-text="code">references/artifact.md</code></nve-grid-cell>
    <nve-grid-cell>Create standalone Elements UI artifacts and prototypes.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">/doctor</code></nve-grid-cell>
    <nve-grid-cell><code nve-text="code">references/doctor.md</code></nve-grid-cell>
    <nve-grid-cell>Check an Elements installation and agent configuration.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">/create-project</code></nve-grid-cell>
    <nve-grid-cell><code nve-text="code">references/integration.md</code></nve-grid-cell>
    <nve-grid-cell>Create or integrate an Elements starter project.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">/migrate</code></nve-grid-cell>
    <nve-grid-cell><code nve-text="code">references/migration.md</code></nve-grid-cell>
    <nve-grid-cell>Migrate a project from deprecated Elements APIs.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>

The MCP server does not expose skill listing or retrieval tools. Install the skill through the CLI, then use MCP tools for live project and API operations.

## Dynamic Context Lookup

Elements publishes context files for agents that can fetch URLs at runtime:

- [`llms.txt`](https://nvidia.github.io/elements/llms.txt) is the small context index.
- [`llms-full.txt`](https://nvidia.github.io/elements/llms-full.txt) is the large single-file archive.

Use `llms.txt` when an agent can fetch links during a task. It points to focused CLI, lint, API, examples, skill, icon, and design-token context. Use `llms-full.txt` for offline context or local retrieval-augmented generation.

For most projects, install the local `elements` skill, configure `nve mcp`, and use CLI or MCP tools for current API lookup and validation.

## References

- [Elements CLI](/docs/cli/)
- [Elements MCP](/docs/mcp/)
- [MCP Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [MCP Prompts](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts)
