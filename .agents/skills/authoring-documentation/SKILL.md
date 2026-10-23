---
name: authoring-documentation
description: Guidelines for writing documentation files including 11ty templates, Eleventy shortcodes, JSDoc annotations, and markdown content. Use this skill whenever the user works with documentation markdown files, Vale prose linting errors, Eleventy shortcodes (dodont, example), frontmatter, JSDoc annotations that must pass Vale, or the documentation site. Also trigger when the user mentions Vale errors, adding terms to the vocabulary, suppressing Vale rules, or writing and fixing prose in .md or .ts files.
---

# Documentation (`*.md`)

You MUST review @projects/site/src/docs/internal/guidelines/documentation.md before making any documentation changes.

## When to Use This Skill

- Creating or updating markdown documentation files
- Working with 11ty templates in the documentation site
- Using or creating Eleventy shortcodes
- Writing API documentation or component guides
- Updating internal guidelines or developer documentation
- Fixing Vale prose-linting errors in markdown or JSDoc

## Key Principles

1. **Frontmatter Required**: All documentation files must include proper frontmatter with title and layout
2. **Source-Owned API Documentation**: Write component guidance in source JSDoc and render it with Eleventy shortcodes so the site, CLI, and MCP share the same documentation.
3. **Clear Structure**: Use proper heading hierarchy and table of contents for long documents
4. **Code Examples**: Include working code examples with proper syntax highlighting
5. **Cross-References**: Link to related documentation and guidelines using proper paths

## Single Source of Truth for Component Documentation

Component JSDoc feeds the generated Custom Elements Manifest (CEM). The API catalog used by the CLI and Model Context Protocol (MCP) tools consumes that metadata. The documentation site renders the same descriptions through shortcodes. Example JSDoc feeds the separate example catalog used by the site, CLI, and MCP.

Guidance written only in a component's Markdown page does not automatically enter the CEM or those catalogs. A page can look complete while tools still lack the information needed to use the component correctly.

### Where Information Belongs

- Put component purpose and shared behavior in the class description. Document properties, attributes, slots, methods, and events on their source declarations or supported JSDoc tags. Include relevant defaults, constraints, accessibility behavior, units, and application responsibilities.
- Put an example's purpose, usage context, and benefits in its `@summary`. Use `@description` for additional explanation, mappings, or source references. These annotations travel with the example metadata.
- Keep component Markdown pages focused on frontmatter, headings, and `install`, `api`, and `example` shortcodes. Select the source description or property that owns the information instead of repeating its prose in Markdown.
- Keep conceptual guides and tutorials in Markdown when their content is not a component or example API contract. This convention does not require moving general documentation into code.

### Author and Verify at the Source

When adding or correcting component guidance, update the owning JSDoc first, then add or adjust the shortcode that presents it. Do not compensate for missing source annotations with a page-only explanation.

For example, render an annotated property and example with:

```liquid
{% api 'nve-joystick', 'property', 'i18n' %}
{% example '@nvidia-elements/core/joystick/joystick.examples.json' 'AccessibleFeedback' %}
```

For metadata changes, use the affected project's documented build or analyzer tasks and regenerate downstream metadata as needed. Inspect the relevant generated CEM description or member, and the API or example catalog consumed by the tools. Verify the site renders the content through its shortcodes. A successful site build alone does not prove that CLI and MCP consumers receive the guidance.

## Prose Linting (Vale)

### How Vale Runs

- **Pre-commit** (via lint-staged): automatically lints staged non-test `*.ts` and `*.md` files
- **CI**:runs as part of `pnpm run ci`
- **Manual**:`pnpm run lint:vale` from the repo root (pass specific files as args to narrow scope)

### Rule Sets by File Type

- `*.md`:Vale, Google, write-good, Elements (full rule set)
- `*.ts`:Vale, write-good, Elements (no Google rules or spelling checks to reduce noise on code identifiers)
- `*.examples.ts`:same as `*.ts` plus three summary rules: `SummaryStyle`, `SummaryActionable`, `SummaryGerund`

### Common Errors and Fixes

| Rule                    | Trigger                                       | Fix                                                                          |
| ----------------------- | --------------------------------------------- | ---------------------------------------------------------------------------- |
| `Google.Latin`          | `e.g.`, `i.e.`                                | Use "for example," "that is"                                                 |
| `Google.Passive`        | Passive voice                                 | Rewrite in active voice                                                      |
| `Google.Quotes`         | Punctuation outside quotes                    | Move commas/periods inside quotation marks                                   |
| `Elements.Branding`     | `nvidia`, `Nvidia`                            | Always use `NVIDIA`                                                          |
| `Elements.Terminology`  | `web component`                               | Use `Web Component` / `Web Components`                                       |
| `Vale.Spelling`         | Unknown term                                  | Add the term to `config/vale/styles/config/vocabularies/Elements/accept.txt` |
| `Elements.SummaryStyle` | Weak openers like "This example demonstrates" | Lead with what the example does or when to use it                            |

### Suppressing Rules

Use sparingly, and re-enable immediately after the affected content:

```markdown
<!-- vale Google.Quotes = NO -->
content here
<!-- vale Google.Quotes = YES -->
```

### Key Files

- `.vale.ini`:root config (rule toggles, file-type scopes, token ignores)
- `config/vale/styles/Elements/`:custom rules (Branding, Terminology, Summary\*)
- `config/vale/styles/config/vocabularies/Elements/accept.txt`:approved vocabulary

## References

- [Documentation Guidelines](/projects/site/src/docs/internal/guidelines/documentation.md)
- [Examples Guidelines](/projects/site/src/docs/internal/guidelines/examples.md)
- [Vale Config](/.vale.ini)
- [Custom Vale Rules](/config/vale/styles/Elements/)
