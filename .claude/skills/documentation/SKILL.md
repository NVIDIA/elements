---
name: repo-documentation
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
2. **Eleventy Shortcodes**: Use built-in shortcodes for common patterns (code examples, callouts, etc.)
3. **Clear Structure**: Use proper heading hierarchy and table of contents for long documents
4. **Code Examples**: Include working code examples with proper syntax highlighting
5. **Cross-References**: Link to related documentation and guidelines using proper paths

## Prose Linting (Vale)

### How Vale Runs

- **Pre-commit** (via lint-staged):automatically lints staged `*.ts` and `*.md` files
- **CI**:runs as part of `pnpm run ci`
- **Manual**:`pnpm run lint:vale` from the repo root (pass specific files as args to narrow scope)

### Rule Sets by File Type

- `*.md`:Vale, Google, write-good, Elements (full rule set)
- `*.ts`:Vale, write-good, Elements (no Google rules; spelling disabled to reduce noise on code identifiers)
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
