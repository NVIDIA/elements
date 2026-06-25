# AGENTS.md

This file provides guidance to AI Agents when working with code in this repository.

## Instruction Precedence for Agents

When instructions conflict, follow this order (highest to lowest):

1. Runtime or platform constraints from the agent host
2. Repository agent rules in `AGENTS.md`
3. Task-specific skill instructions in `.claude/skills/*/SKILL.md`
4. Documents explicitly required by a selected skill (for example, docs in `projects/site/src/docs/internal/guidelines/`)
5. General project documentation such as `README.md`

Notes:

- `README.md` is primarily for orientation and setup; it does not override agent policy.
- If a skill says you MUST review a referenced guideline, treat that guideline as required for that task.
- If two same-level sources conflict, prefer the more specific and recently maintained source, and note the assumption in your response.

## Repository Overview

Elements is a design language for AI/ML factories built as a monorepo containing framework agnostic Web Components (Lit), themes, styles, testing utilities, and starter templates. The repository uses pnpm workspaces with Wireit for build orchestration and Semantic Release for automated versioning/publishing.

## Environment Requirements

- **mise**: Toolchain manager for local development and CI (`mise.toml`)
- **Node.js**: 26.4.0 (managed via mise and validated against `.nvmrc` and `package.json` engines)
- **pnpm**: 11.9.0 (managed via mise and validated against `package.json`)
- **Go**: 1.26.4 (managed via mise for the Go starter)
- **Git LFS**: Required for visual test screenshots and videos (`.gitattributes` defines tracked files)
- **Playwright**: Browser-based testing uses Chromium (installed via prepare script)
- **Vale**: Prose linter for documentation and JSDoc (managed via mise)

## Common Commands

### Repository Setup

```shell
# Install required tools and run CI
curl https://mise.run | sh
# If mise is not on PATH yet, use ~/.local/bin/mise for the setup commands.
mise trust
mise run setup
```

### Building and Testing

```shell
# Run full CI pipeline locally (lint, build, test)
pnpm run ci

# Run all tests and lighthouse tests
pnpm run ci:all

# Clean and reset repository
pnpm run ci:reset

# Format code
pnpm run format
pnpm run format:fix

# Prose lint (documentation and JSDoc)
pnpm run lint:vale
```

### Individual Project Commands

Each project has a `DEVELOPMENT.md` file with the authoritative list of available pnpm scripts for that project. Consult `projects/<name>/DEVELOPMENT.md` before running commands. The common commands below are a quick reference. Run them from within the specific project directory (for example, `cd projects/core`):

```shell
# Development watch mode
mise exec -- pnpm run dev

# Build project
mise exec -- pnpm run build

# Run unit tests
mise exec -- pnpm run test

# Run single test suite
mise exec -- pnpm run test -- src/badge/badge.test.ts

# Run accessibility tests
mise exec -- pnpm run test:axe

# Run lighthouse performance tests
mise exec -- pnpm run test:lighthouse

# Run visual regression tests
mise exec -- pnpm run test:visual

# Run SSR tests
mise exec -- pnpm run test:ssr

# Lint project
mise exec -- pnpm run lint
mise exec -- pnpm run lint:fix
```

## Architecture

### Monorepo Structure

The repository contains a top-level workspace with individual project directories:

- `/projects/core` - Core Elements Web Components library (Lit-based)
- `/projects/forms` - Form control utilities, mixins, and schema validation
- `/projects/themes` - Theme tokens and CSS custom properties
- `/projects/styles` - CSS utilities for layout and typography
- `/projects/starters` - Starter templates for supported frameworks, including React, Angular, Vue, and Svelte
- `/projects/cli` - Command-line tooling for Elements development and project scaffolding
- `/projects/create` - `npm create @nvidia-elements` wrapper around CLI project creation
- `/projects/code` - Code authoring components, including syntax-highlighted code blocks
- `/projects/markdown` - Markdown components and utilities
- `/projects/media` - Media playback UI components
- `/projects/lint` - Elements lint configurations and custom rules
- `/projects/monaco` - Monaco editor integration
- `/projects/pages` - GitHub Pages deployment project
- `/projects/site` - Documentation site (11ty)
- `/projects/internals` - Internal tooling (vite configs, eslint, patterns, metadata)

### Component Architecture

Each component in `/projects/core/src/` follows this structure:

```
component-name/
├── component-name.ts                 # Main component class (extends LitElement or applies a forms mixin)
├── component-name.css                # Component styles
├── component-name.examples.ts        # Example templates for documentation
├── component-name.test.ts            # Unit tests
├── component-name.test.axe.ts        # Accessibility tests
├── component-name.test.lighthouse.ts # Performance tests
├── component-name.test.visual.ts     # Visual regression tests
├── component-name.test.ssr.ts        # SSR tests
├── index.ts                          # Exports component class (no side effects)
└── define.ts                         # Registers component to customElementsRegistry
```

Components typically extend Lit's `LitElement` directly. Import forms mixins from `@nvidia-elements/forms/mixins`; reactive controllers and utilities remain under `@nvidia-elements/core/internal` for shared behavior such as keynav, state management, and i18n. Components use Lit decorators for properties, CSS custom properties for theming, and follow ARIA Authoring Practices Guide patterns.

When adding a new core component, also add its `define.js` import and `export *` to `projects/core/src/bundle.ts` (alphabetical order). This file is the entry point for the core CDN bundle. The `no-missing-bundle-registration` lint rule validates completeness in CI.

### Component Definition

Components export both the class and auto-define:

```typescript
// component-name.ts
export class ComponentName extends LitElement {
  static styles = useStyles([styles]);
  static readonly metadata = { tag: 'nve-component-name', version: '0.0.0' };

  @property({ type: String, reflect: true }) status?: 'success' | 'error';

  render() {
    return html`<div internal-host><slot></slot></div>`;
  }
}

// define.ts
import { define } from '@nvidia-elements/core/internal';
import { ComponentName } from '@nvidia-elements/core/component-name';

define(ComponentName);

declare global {
  interface HTMLElementTagNameMap {
    'nve-component-name': ComponentName;
  }
}
```

### Build System

- **pnpm** - Package manager with workspaces
- **Wireit** - Build orchestration with caching and dependency management
- **Vite** - Build tool for compiling TypeScript and bundling
- **Semantic Release** - Automated versioning and publishing based on conventional commits

Wireit configurations in each `package.json` define dependencies between projects. The build system intelligently rebuilds only what changed.

### Release Process

Releases are fully automated:

1. Commits follow conventional commit format: `type(scope): message`
2. Types: `fix` (patch), `feat` (minor), `chore` (no release)
3. Scopes map to project names: `core`, `themes`, `forms`, `cli`, `code`, etc.
4. Semantic Release analyzes commits and publishes packages
5. Changelogs are auto-generated from commit messages
6. More than one package can release in a single merge with dependency ordering

Releases happen automatically after CI passes on merge to `main`. No manual version bumping.

## Development Guidelines

### Branch Naming

Branches must use `topic/` prefix for merge requests:

```shell
git checkout -b topic/fix-button-accessibility
```

### Commit Messages

Follow conventional commit format with **lowercase subjects** (enforced by commitlint):

```shell
git commit -m "fix(core): resolve keyboard navigation in dropdown"
git commit -m "feat(themes): add dark mode color tokens"
git commit -m "chore(docs): update component examples"
```

**Important:** the subject line (first line after `type(scope):`) must be entirely lowercase. Avoid starting with proper nouns or using uppercase letters. For example, use "add feature," not "Add feature," and "update api," not "Update API."

**Commit types:**

- `fix` - Bug fixes, performance fixes (triggers patch release)
- `feat` - New features, components, APIs (triggers minor release)
- `chore` - Non-production code modifications, build tooling, documentation (no release)

**Common scopes:**

- `docs` - 11ty docs site and landing page (`/projects/site`)
- `core` - Core Elements library (`/projects/core`)
- `themes` - Theme tokens (`/projects/themes`)
- `styles` - CSS utilities (`/projects/styles`)
- `starters` - Starter templates (`/projects/starters`)
- `cli` - Command-line tooling (`/projects/cli`)
- `code` - Code authoring components (`/projects/code`)
- `create` - `npm create @nvidia-elements` wrapper (`/projects/create`)
- `forms` - Form control utilities (`/projects/forms`)
- `lint` - Lint configurations and custom rules (`/projects/lint`)
- `markdown` - Markdown components and utilities (`/projects/markdown`)
- `media` - Media playback UI components (`/projects/media`)
- `monaco` - Monaco editor integration (`/projects/monaco`)
- `pages` - GitHub Pages deployment project (`/projects/pages`)
- `ci` - Build/CI tooling (`/projects/internals`)

### Prose Linting (Vale)

Vale enforces consistent technical writing across documentation (`*.md`) and JSDoc comments (`*.ts`). It uses the Google developer documentation style guide and write-good rules with project-specific customizations.

Key files:

- `.vale.ini`: Root configuration defining style guides, disabled rules, and file-type settings
- `config/vale/styles/Elements/`: Custom rules (branding, terminology)
- `config/vale/styles/config/vocabularies/Elements/accept.txt`: Accepted vocabulary (project terms, component names, tech jargon)
- `mise.toml`: Toolchain versions for Vale, Node.js, pnpm, Go, and Git LFS

When adding new technical terms, component names, or abbreviations that Vale flags as misspelled, add them to `accept.txt`. Run `pnpm run lint:vale` to verify changes pass. Vale also runs as a pre-commit hook on markdown files via lint-staged.

## Documentation References

**Read before making changes:**

- `/projects/site/src/docs/internal/guidelines/testing.md` - When writing or modifying any test files; provides overview of testing strategy and test types
- `/projects/site/src/docs/internal/guidelines/testing-unit.md` - When writing `.test.ts` files; covers createFixture, elementIsStable patterns
- `/projects/site/src/docs/internal/guidelines/testing-accessibility.md` - When writing `.test.axe.ts` files; covers axe-core usage and WCAG compliance testing
- `/projects/site/src/docs/internal/guidelines/testing-visual.md` - When writing `.test.visual.ts` files; covers Playwright screenshot patterns and theme testing
- `/projects/site/src/docs/internal/guidelines/testing-ssr.md` - When writing `.test.ssr.ts` files; covers server-side rendering compatibility patterns
- `/projects/site/src/docs/internal/guidelines/testing-lighthouse.md` - When writing `.test.lighthouse.ts` files; covers performance, accessibility, and best practices scoring
- `/projects/site/src/docs/internal/guidelines/typescript.md` - When working with TypeScript code; covers type safety, type guards, discriminated unions, exhaustive checking
- `/projects/site/src/docs/internal/guidelines/examples.md` - When creating or modifying `*.examples.ts` files; covers naming conventions, summary guidelines, and example structure
- `/projects/site/src/docs/internal/guidelines/documentation.md` - When modifying the documentation site or working with Eleventy shortcodes
- `/projects/site/src/docs/api-design/packaging.md` - When working with package exports, entrypoints, or registration patterns; covers dependencies, build output, side effects
- `/projects/site/src/docs/api-design/properties-attributes.md` - When adding or modifying component properties/attributes; covers @property decorator, reflect option, impossible states
- `/projects/site/src/docs/api-design/styles.md` - When working with component styles or CSS custom properties; covers theming strategies and custom property patterns
- `/projects/site/src/docs/api-design/registration.md` - When naming components or working with tag registration; covers tag prefixes and naming conventions
- `projects/*/DEVELOPMENT.md` - When working within a specific project; lists all available pnpm scripts for that project
- `/projects/internals/BUILD.md` - When modifying build configuration, Wireit scripts, or CI/CD pipeline
- `/projects/internals/RELEASE.md` - When creating new projects or modifying release process; covers semantic release setup, CI artifacts, commit scopes, initial tags
