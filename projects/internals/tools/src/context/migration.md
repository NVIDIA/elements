# Elements Migration Guide

Instructions for migrating a project from deprecated Elements APIs to the latest versions. This workflow uses the `@nvidia-elements/lint` ESLint package for static analysis and MCP tools for project health.

## Step 1: Project Health Check

Assess the current state of the project before making changes.

### Tools to use

- `project_validate`: check project setup, configuration issues, and outdated dependencies
- `packages_list`: check current vs latest versions of all Elements packages

## Step 2: Update Packages

Update to the latest versions of all Elements packages.

### Tools to use

- `project_setup`: setup or update a project to use Elements, including updating packages to the latest versions

### Package Scope Migration

If the project uses the legacy `@maglev/elements` package, replace it with the new scoped packages:

```
@maglev/elements → @nvidia-elements/core + @nvidia-elements/themes + @nvidia-elements/styles
```

## Step 3: Install & Run Lint for Deprecation Detection

Install and configure the `@nvidia-elements/lint` ESLint package to detect all deprecated API usage.

### Install

```bash
npm install -D @nvidia-elements/lint # or pnpm add -D @nvidia-elements/lint
```

### Configure ESLint

Create or update `eslint.config.js`:

```javascript
import { elementsRecommended } from '@nvidia-elements/lint/eslint';
export default [...elementsRecommended];
```

### Run ESLint

```bash
npx eslint . # or pnpm eslint .
```

Parse the lint output to create a migration work list of all deprecated API usage.

## Step 4: Deprecation Reference & Fixes

Apply fixes based on the following before→after mappings for each deprecation category.

### CSS Imports

```css
/* before */
@import '@maglev/elements/index.css';
/* or */ @import '@nvidia-elements/core/index.css';

/* after */
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';
```

| Before                                       | After                                                      |
| -------------------------------------------- | ---------------------------------------------------------- |
| `@maglev/elements/index.css`                 | Split into `@nvidia-elements/themes/*` + `@nvidia-elements/styles/*` imports above |
| `@maglev/elements/css/module.layout.css`     | `@nvidia-elements/styles/layout.css`                                   |
| `@maglev/elements/css/module.typography.css` | `@nvidia-elements/styles/typography.css`                               |
| `@nvidia-elements/core/index.css`                    | Split into `@nvidia-elements/themes/*` + `@nvidia-elements/styles/*` imports above |
| `@nvidia-elements/core/css/module.layout.css`        | `@nvidia-elements/styles/layout.css`                                   |
| `@nvidia-elements/core/css/module.typography.css`    | `@nvidia-elements/styles/typography.css`                               |

### CSS Variables

Replace all `--mlv-*` CSS custom properties with `--nve-*`:

```css
/* before */ color: var(--mlv-ref-color-brand-green-200);
/* after  */ color: var(--nve-ref-color-brand-green-200);
```

### Global Attributes

| Before       | After        |
| ------------ | ------------ |
| `mlv-theme`  | `nve-theme`  |
| `mlv-layout` | `nve-layout` |
| `mlv-text`   | `nve-text`   |

### HTML Tags

Replace all `mlv-*` tag prefixes with `nve-*`, verify the tag is valid by using the `api_list` and `api_get` tools:

```html
<!-- before --> <mlv-button>...</mlv-button>
<!-- after  --> <nve-button>...</nve-button>
```

**Deprecated nve-\* tags:**

| Before             | After                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| `nve-alert-banner` | `nve-alert-group` with `prominence="emphasis"` and `container="full"` |
| `nve-app-header`   | Deprecated (no direct replacement)                                    |

### Icon Names

| Before               | After                                  |
| -------------------- | -------------------------------------- |
| `chevron-right`      | `chevron` (add `direction="right"`)    |
| `chevron-down`       | `chevron` (add `direction="down"`)     |
| `chevron-left`       | `chevron` (add `direction="left"`)     |
| `additional-actions` | `more-actions`                         |
| `analytics`          | `pie-chart`                            |
| `annotation`         | `transparent-box`                      |
| `app-switcher`       | `switch-apps`                          |
| `assist`             | `chat-bubble`                          |
| `checkmark`          | `check`                                |
| `date`               | `calendar`                             |
| `docs`               | `book`                                 |
| `expand-full-screen` | `maximize`                             |
| `expand-panel`       | `arrow-stop` (add `direction="right"`) |
| `collapse-panel`     | `arrow-stop` (add `direction="left"`)  |
| `failed`             | `x-circle`                             |
| `favorite-filled`    | `star`                                 |
| `favorite-outline`   | `star-stroke`                          |
| `information`        | `information-circle-stroke`            |
| `maintenance`        | `wrench`                               |
| `navigate-to`        | `arrow` (add `direction="right"`)      |
| `open-external-link` | `arrow-angle`                          |
| `location`           | `map-pin`                              |
| `pinned-1`           | `pin`                                  |
| `project`            | `folder`                               |
| `settings`           | `gear`                                 |
| `user`               | `person`                               |
| `video-pause`        | `pause`                                |
| `video-play`         | `play`                                 |
| `video-stop`         | `stop`                                 |
| `visible`            | `eye`                                  |
| `warning`            | `exclamation-triangle`                 |

### Popover Attributes

Replace the deprecated `trigger` and `behavior-trigger` attributes on `nve-dialog`, `nve-tooltip`, `nve-toast`, `nve-drawer`, `nve-dropdown`, and `nve-notification` with the native HTML Popover API:

```html
<!-- before -->
<nve-tooltip trigger="tooltip-btn" behavior-trigger position="top" hidden>hello there</nve-tooltip>
<nve-button id="tooltip-btn">tooltip</nve-button>

<!-- after -->
<nve-tooltip id="my-tooltip" position="top">hello there</nve-tooltip>
<nve-button popovertarget="my-tooltip">tooltip</nve-button>
```

### Deprecated Slots

| Component              | Deprecated Slots                     |
| ---------------------- | ------------------------------------ |
| `nve-accordion-header` | `title`, `subtitle`, `actions`       |
| `nve-card-header`      | `title`, `subtitle`, `header-action` |

Use the `api_get` tool to look up the current slot API for these components.

### Typography

```html
<!-- before --> <div nve-text="eyebrow"></div>
<!-- after  --> <div nve-text="label sm"></div>
```

### Layout

```html
<!-- before --> <div nve-layout="grow"></div>
<!-- after  --> <div nve-layout="full"></div>
```

### Testing Utilities

```typescript
// before
import { createFixture, removeFixture, elementIsStable, emulateClick, untilEvent } from '@maglev/elements/test';

// after
import { createFixture, removeFixture, elementIsStable, emulateClick, untilEvent } from '@nvidia-elements/testing';
```

## Step 5: Verification

After applying all fixes:

1. Re-run ESLint to confirm zero deprecation violations
2. Use the `api_template_validate` tool on any HTML templates to check for correct API usage
3. Use the `project_validate` tool to confirm a healthy project state

## Available MCP Tools

- `project_validate`: check project setup and find issues
- `project_setup`: setup or update to latest Elements package versions
- `packages_list`: check latest published versions
- `packages_changelogs_get`: get changelogs for migration-relevant changes
- `api_template_validate`: check HTML templates for correct API usage
- `api_list`: list all available Elements APIs
- `api_get`: get documentation for a specific component
