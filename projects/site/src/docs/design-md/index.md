---
{
  title: 'NVIDIA DESIGN.md for AI Agents',
  description: 'Download the official NVIDIA Elements DESIGN.md for AI agents, with verified design tokens, typography, spacing, components, accessibility, and UI guidance.',
  alternateMarkdown: '/DESIGN.md',
  layout: 'docs.11ty.js'
}
---

<h1 nve-text="display sm">NVIDIA Elements DESIGN.md</h1>

The official design system file for AI coding agents building NVIDIA Elements interfaces. It combines exact, machine-readable design tokens with human-readable guidance for typography, layout, component selection, accessibility, and operational UI patterns.

<div nve-layout="column gap:lg">
  <nve-alert status="accent">
    This file describes the NVIDIA Elements UI Design System. It does not represent a specification of NVIDIA marketing sites or NVIDIA corporate brand.
  </nve-alert>
  <div nve-layout="row gap:sm align:wrap">
    <nve-button>
      <a href="/DESIGN.md" download><nve-icon name="download"></nve-icon> Download</a>
    </nve-button>
    <nve-button>
      <a href="https://github.com/NVIDIA/elements/blob/main/DESIGN.md" target="_blank" rel="noopener"><nve-icon name="fork"></nve-icon> View on GitHub</a>
    </nve-button>
  </div>
</div>

## What is `DESIGN.md`?

`DESIGN.md` is a portable format for describing a visual identity to coding agents. The file does not depend on a specific framework or agent. The [open DESIGN.md specification](https://github.com/google-labs-code/design.md) combines YAML front matter for exact design tokens with Markdown prose explaining how and why to apply them.

The NVIDIA Elements file gives agents a compact contract for:

- Semantic colors for canvas, surfaces, text, links, interaction, and status
- Interface typography using Inter and `Roboto Mono`
- Spacing and border-radius scales
- Representative visual contracts for buttons, fields, cards, popovers, and status UI
- Layout, elevation, component composition, accessibility, and do-and-don't guidance
- Canonical links to maintained Elements components, tokens, CLI, and MCP tools

## Download and use

Place the file at the root of a project where an AI coding agent can read it:

```shell
curl -fsSL https://nvidia.github.io/elements/DESIGN.md -o DESIGN.md
```

Then give the agent a direct instruction:

```shell
Read DESIGN.md before changing the interface. Use NVIDIA Elements components and
semantic tokens, and verify uncertain APIs with the Elements MCP server or `nve` CLI.
```

The file works as portable context on its own. For exact component APIs, examples, icon names, and project validation, combine it with the [Elements MCP server](/docs/mcp/), [CLI](/docs/cli/), and [agent skills](/docs/skills/).

## Why use the official file?

Public `DESIGN.md` catalogs often infer a company's visual style from a marketing website. That can be useful for inspiration, but it does not represent the maintained component contracts, theme semantics, accessibility behavior, framework integrations, or operational UI patterns.

The official file stays connected to the implementation. When an Elements source token changes, the generated values change with it; when component guidance changes, the Elements team reviews this page and the repository artifact together.

## Related NVIDIA Elements resources

- [Design tokens](/docs/foundations/themes/tokens/) for the complete CSS custom-property inventory
- [Typography](/docs/foundations/typography/) and [layout](/docs/foundations/layout/) foundations
- [Component catalog](/docs/elements/) with APIs, examples, and accessibility behavior
- [MCP server](/docs/mcp/) for live agent access to Elements metadata
- [CLI](/docs/cli/) for discovery, setup, scaffolding, and validation
- [llms.txt](/llms.txt) for the broader NVIDIA Elements agent-context index
