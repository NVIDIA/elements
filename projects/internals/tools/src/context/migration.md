# Elements Migration Guide

Instructions for migrating a project from deprecated Elements APIs to the latest versions. This workflow uses the `@nvidia-elements/lint` ESLint package for static analysis and MCP tools for project health.

## Core Rules

- The public npm registry hosts the public packages under the `@nvidia-elements` scope.
- Internal NVIDIA teams should keep using Artifactory. Artifactory proxies the public npm registry.
- Component APIs, `nve-*` tag names, and the theming system remain the same unless a rule below says to change them.
- The new packages reset version numbers to `0.x`. Use the latest available public package versions instead of copying old internal versions.
- The `0.x` public packages contain the same non-deprecated components as the latest internal releases. Deprecated or removed APIs need explicit migration.
- Prefer lint-driven changes. Install `@nvidia-elements/lint`, run ESLint, build a work list from the findings, and fix one category at a time.

## Recommended Agent Workflow

1. Check project health.
   - Use `project_validate` for setup, configuration, and dependency issues.
   - Use `packages_list` to compare installed Elements packages with latest published versions.
2. Update packages.
   - Use `project_setup` when available to set up or update Elements packages.
   - Otherwise update `package.json` manually using the package map below.
3. Configure migration linting.
   - Install `@nvidia-elements/lint` as a dev dependency.
   - Add the recommended Elements ESLint config.
   - Run ESLint and convert findings into a migration task list.
4. Apply migration rules.
   - Start with package names and import paths.
   - Then fix removed APIs.
   - Then fix deprecated APIs.
   - Use `api_list` and `api_get` before inventing replacements for component APIs.
5. Verify.
   - Re-run ESLint until it reports no deprecation violations.
   - Use `api_template_validate` on migrated HTML templates.
   - Run `project_validate` again after package and source changes.

## Tool Reference

- `project_validate`: Check setup, configuration, dependencies, and project health.
- `project_setup`: Set up or update a project to use latest Elements packages.
- `packages_list`: List current and latest package versions.
- `packages_changelogs_get`: Read migration-relevant package changelogs.
- `api_template_validate`: Check HTML templates against current Elements APIs.
- `api_list`: List available Elements APIs.
- `api_get`: Get documentation for a specific component API.

## ESLint Setup

Install:

```bash
npm install -D @nvidia-elements/lint
```

or:

```bash
pnpm add -D @nvidia-elements/lint
```

Configure `eslint.config.js`:

```javascript
import { elementsRecommended } from '@nvidia-elements/lint/eslint';

export default [...elementsRecommended];
```

Run:

```bash
npx eslint .
```

or:

```bash
pnpm eslint .
```

## Package Scope Migration

Replace internal package names with public package names.

| Before               | After                       |
| -------------------- | --------------------------- |
| `@nve/elements`      | `@nvidia-elements/core`     |
| `@nve/styles`        | `@nvidia-elements/styles`   |
| `@nve/themes`        | `@nvidia-elements/themes`   |
| `@nve/monaco`        | `@nvidia-elements/monaco`   |
| `@nve-labs/forms`    | `@nvidia-elements/forms`    |
| `@nve-labs/cli`      | `@nvidia-elements/cli`      |
| `@nve-labs/code`     | `@nvidia-elements/code`     |
| `@nve-labs/create`   | `@nvidia-elements/create`   |
| `@nve-labs/markdown` | `@nvidia-elements/markdown` |
| `@nve-labs/media`    | `@nvidia-elements/media`    |
| `@nve-labs/lint`     | `@nvidia-elements/lint`     |

If the project uses the older `@maglev/elements` package, split it into the public packages that match the APIs the project uses:

```text
@maglev/elements -> @nvidia-elements/core + @nvidia-elements/themes + @nvidia-elements/styles
```

## Dependency Examples

Before:

```json
{
  "dependencies": {
    "@nve/elements": "^1.67.0",
    "@nve/themes": "^1.12.0",
    "@nve/styles": "^1.14.0"
  }
}
```

After:

```json
{
  "dependencies": {
    "@nvidia-elements/core": "0.x",
    "@nvidia-elements/themes": "0.x",
    "@nvidia-elements/styles": "0.x"
  }
}
```

## Source Import Migration

Replace package scopes in import paths. Keep component paths the same unless another rule below says otherwise.

Before:

```javascript
import { Button } from '@nve/elements/button';
import '@nve/elements/button/define.js';
import '@nve/themes/dist/index.css';
```

After:

```javascript
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/themes/dist/index.css';
```

## Removed APIs

### Logo Content

`nve-logo` no longer includes the NVIDIA SVG logo. Consumers must provide their own SVG or image in the default slot.

Before:

```html
<nve-logo aria-label="NVIDIA"></nve-logo>
```

After:

```html
<nve-logo>
  <img src="./logo.svg" alt="NVIDIA" />
</nve-logo>
```

### `@nve/testing`

The custom `@nve/testing` utilities are not supported in the public scope. Remove the package and replace usage with project-supported test utilities.

### Scoped Tags

Do not use `@nve/elements/scoped`. Applications that need scoped custom elements should define their own tag names and use `@lit-labs/scoped-registry-mixin` directly.

## Deprecated APIs

### Popover Behavior Triggers

Remove `behaviorTrigger` or `behavior-trigger` from stateful popovers. Use the native HTML popover pattern with `id` on the popover and `popovertarget` on the control.

Before:

```html
<nve-tooltip trigger="tooltip-btn" behavior-trigger position="top" hidden>hello there</nve-tooltip>
<nve-button id="tooltip-btn">tooltip</nve-button>
```

After:

```html
<nve-tooltip id="my-tooltip" position="top">hello there</nve-tooltip>
<nve-button popovertarget="my-tooltip">tooltip</nve-button>
```

### Layout `grow`

Use `full` instead of `grow` in `nve-layout`.

Before:

```html
<div nve-layout="grow"></div>
```

After:

```html
<div nve-layout="full"></div>
```

### Typography `eyebrow`

Use `label sm` instead of `eyebrow` in `nve-text`.

Before:

```html
<div nve-text="eyebrow"></div>
```

After:

```html
<div nve-text="label sm"></div>
```

## Maglev CSS Migration

Replace Maglev CSS entrypoints with public theme and style entrypoints.

Before:

```css
@import '@maglev/elements/index.css';
@import '@maglev/elements/inter.css';
```

After:

```css
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
@import '@nvidia-elements/themes/high-contrast.css';
@import '@nvidia-elements/themes/reduced-motion.css';
@import '@nvidia-elements/themes/compact.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/themes/debug.css';
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';
@import '@nvidia-elements/styles/view-transitions.css';
```

Replace Maglev CSS custom property prefixes:

```css
/* before */
.selector {
  color: var(--mlv-ref-color-brand-green-200);
}

/* after */
.selector {
  color: var(--nve-ref-color-brand-green-200);
}
```

## Maglev HTML Migration

Replace Maglev utility attributes with `nve-*` attributes.

| Before       | After        |
| ------------ | ------------ |
| `mlv-theme`  | `nve-theme`  |
| `mlv-layout` | `nve-layout` |
| `mlv-text`   | `nve-text`   |

Replace `mlv-*` element tag prefixes with `nve-*` where the corresponding `nve-*` element exists. Check uncertain tags with `api_list` and `api_get`.

Before:

```html
<mlv-button>...</mlv-button>
```

After:

```html
<nve-button>...</nve-button>
```

## Maglev Component Replacements

### App Header

Replace the early Maglev `mlv-app-header` element with `nve-page-header`.

Before:

```html
<mlv-app-header>
  ...
</mlv-app-header>
```

After:

```html
<nve-page-header>
  <nve-logo slot="prefix" size="sm">NV</nve-logo>
  <h2 slot="prefix" nve-text="heading sm">Infrastructure</h2>
  <nve-button selected container="flat"><a href="#">Link 1</a></nve-button>
  <nve-button container="flat"><a href="#">Link 2</a></nve-button>
  <nve-icon-button slot="suffix" interaction="emphasis" size="sm">EL</nve-icon-button>
</nve-page-header>
```

### Alert Banner

Replace `nve-alert-banner` with `nve-alert-group` using `prominence="emphasis"` and `container="full"`.

Before:

```html
<nve-alert-banner>
  <nve-alert closable>
    <span slot="prefix">Standard</span> banner message
  </nve-alert>
</nve-alert-banner>
```

After:

```html
<nve-alert-group prominence="emphasis" container="full">
  <nve-alert closable>
    <span slot="prefix">Standard</span> banner message
  </nve-alert>
</nve-alert-group>
```

### JSON Viewer

The JSON viewer is an internal API. Avoid using it even if public exports expose it. Use `nve-codeblock` or `nve-monaco-input` for JSON content rendering.

## Icon Migration

Rename old icon names to current icon names.

| Before               | After                       |
| -------------------- | --------------------------- |
| `chevron-right`      | `chevron`                   |
| `chevron-down`       | `chevron`                   |
| `chevron-left`       | `chevron`                   |
| `additional-actions` | `more-actions`              |
| `analytics`          | `pie-chart`                 |
| `annotation`         | `transparent-box`           |
| `app-switcher`       | `switch-apps`               |
| `assist`             | `chat-bubble`               |
| `checkmark`          | `check`                     |
| `date`               | `calendar`                  |
| `docs`               | `book`                      |
| `expand-full-screen` | `maximize`                  |
| `expand-panel`       | `arrow-stop`                |
| `collapse-panel`     | `arrow-stop`                |
| `failed`             | `x-circle`                  |
| `favorite-filled`    | `star`                      |
| `favorite-outline`   | `star-stroke`               |
| `information`        | `information-circle-stroke` |
| `maintenance`        | `wrench`                    |
| `navigate-to`        | `arrow`                     |
| `open-external-link` | `arrow-angle`               |
| `location`           | `map-pin`                   |
| `pinned-1`           | `pin`                       |
| `project`            | `folder`                    |
| `settings`           | `gear`                      |
| `user`               | `person`                    |
| `video-pause`        | `pause`                     |
| `video-play`         | `play`                      |
| `video-stop`         | `stop`                      |
| `visible`            | `eye`                       |
| `warning`            | `exclamation-triangle`      |

For directional icons, add an explicit `direction` attribute.

| Before                                             | After                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| `<nve-icon name="chevron-left"></nve-icon>`        | `<nve-icon name="chevron" direction="left"></nve-icon>`              |
| `<nve-icon name="beginning"></nve-icon>`           | `<nve-icon name="beginning" direction="left"></nve-icon>`            |
| `<nve-icon name="beginning-left"></nve-icon>`      | `<nve-icon name="arrow-stop" direction="left"></nve-icon>`           |
| `<nve-icon name="collapse-panel"></nve-icon>`      | `<nve-icon name="arrow-stop" direction="left"></nve-icon>`           |
| `<nve-icon name="navigate-back"></nve-icon>`       | `<nve-icon name="navigate-back" direction="left"></nve-icon>`        |
| `<nve-icon name="chevron-right"></nve-icon>`       | `<nve-icon name="chevron" direction="right"></nve-icon>`             |
| `<nve-icon name="end"></nve-icon>`                 | `<nve-icon name="end" direction="right"></nve-icon>`                 |
| `<nve-icon name="expand-panel"></nve-icon>`        | `<nve-icon name="arrow-stop" direction="right"></nve-icon>`          |
| `<nve-icon name="navigate-to"></nve-icon>`         | `<nve-icon name="arrow" direction="right"></nve-icon>`               |
| `<nve-icon name="carousel-horizontal"></nve-icon>` | `<nve-icon name="carousel-horizontal" direction="right"></nve-icon>` |
| `<nve-icon name="chevron-down"></nve-icon>`        | `<nve-icon name="chevron" direction="down"></nve-icon>`              |
| `<nve-icon name="thumbs-down"></nve-icon>`         | `<nve-icon name="thumb" direction="down"></nve-icon>`                |

## Final Verification Checklist

- `package.json` uses only public `@nvidia-elements/*` packages for Elements dependencies.
- Source imports use public package scopes.
- CSS imports use public theme and style entrypoints.
- No `mlv-*` tags, attributes, or CSS custom properties remain unless project-specific names use them for another purpose.
- Removed components and APIs have replacements or no longer appear.
- Migrate deprecated `nve-layout`, `nve-text`, popover trigger, logo, and icon patterns.
- ESLint reports no Elements deprecation violations.
- `api_template_validate` passes for migrated templates.
- `project_validate` reports a healthy project state.
