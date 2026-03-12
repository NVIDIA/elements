---
name: repo-examples
description: Guidelines for writing example template files (*.examples.ts) including naming conventions, @summary JSDoc comments, and stateless HTML patterns. Use this skill whenever the user creates, modifies, or reviews *.examples.ts files, asks about example naming rules (PascalCase, 3-word max, no component prefix), needs to write or improve @summary JSDoc comments, encounters example-naming ESLint errors, or wants to add stateless or interactive examples to a component's example file.
---

# Examples (`*.examples.ts`)

You MUST review @projects/site/src/docs/internal/guidelines/examples.md before making any changes to example files.

## When to Use This Skill

- Creating new `*.examples.ts` files for components
- Adding or updating example templates within existing example files
- Reviewing example naming conventions and structure
- Writing or updating `@summary` JSDoc comments for examples

## Key Principles

1. **PascalCase Naming**: Use PascalCase for example names (e.g., `Default`, `StatusFlat`, `FormSubmit`)
2. **Concise Names**: Keep example names to 1-3 words maximum, describing **what** the example shows
3. **Required @summary**: Every example must include a `@summary` JSDoc comment explaining what, why, when, and how
4. **Stateless Templates**: Examples should be stateless HTML templates demonstrating UI patterns

## Naming Patterns

- Single words: `Default`, `Status`, `Size`, `Color`, `Disabled`
- Compound names: `StatusFlat`, `StatusIcon`, `FormSubmit`, `VerticalTabs`
- Special prefixes: `Legacy*`, `Invalid*`, `Valid*`

## References

- [Examples Guidelines](/projects/site/src/docs/internal/guidelines/examples.md)
- [Documentation Guidelines](/projects/site/src/docs/internal/guidelines/documentation.md)
