---
{
  title: 'Migration Guide',
  description: 'Migrate between NVIDIA Elements major versions: breaking changes, deprecation notices, and step-by-step upgrade notes for components, themes, and styles.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

This guide covers migrating from the internal `@nve/*` packages to the new open source `@nvidia-elements/*` packages.

## Overview

The Elements Design System is now hosted and developed in a public GitHub repository. Packages are now published to the public npm registry under the `@nvidia-elements` scope. The component APIs, tag names, and theming system remain the same. The primary changes are package names, import paths, and registry configuration.

## Package Name Changes

| Internal Package     | New Package                 |
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

Note: `@nve/elements` is now `@nvidia-elements/core`, not `@nvidia-elements/elements`.

## Migration Steps

### 1. Update Registry Configuration

The `@nvidia-elements` packages are on the public npm registry and require no special registry configuration. Internal teams should continue to use Artifactory regardless of which package scope. Artifactory proxies the public npm registry automatically.

### 2. Update Dependencies

In your `package.json`, replace the old scope names with the new ones:

```shell
  "dependencies": {
-   "@nve/elements": "^1.67.0",
-   "@nve/themes": "^1.12.0",
-   "@nve/styles": "^1.14.0"
+   "@nvidia-elements/core": "^0.0.3",
+   "@nvidia-elements/themes": "^0.0.4",
+   "@nvidia-elements/styles": "^0.0.3"
  }
```

The `0.x` versions of the new packages contain the same non-deprecated components as the latest internal releases. Version numbers reset as part of the migration to public npm. A stable 1.0 release follows later.

### 3. Update Source Imports

Replace import paths throughout your source code:

```shell
- import '@nve/elements/button/define.js';
- import { Button } from '@nve/elements/button';
+ import '@nvidia-elements/core/button/define.js';
+ import { Button } from '@nvidia-elements/core/button';
```

```shell
- import '@nve/themes/dist/index.css';
+ import '@nvidia-elements/themes/dist/index.css';
```

### 4. Install Updated Packages

```shell
# pnpm
pnpm install

# npm
npm install
```

### 5. Verify

Run your project's build and tests to confirm everything resolves correctly:

```shell
pnpm run build
pnpm run test
```

## API Changes

`@nvidia-elements/core` no longer includes the following internal-only or deprecated pre-1.0 Maglev APIs, and the public packages omit them:

| API                                | Change                                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `@nvidia-elements/core/app-header` | (pre-maglev) replaced by `@nvidia-elements/core/page-header`                                                                         |
| `@nvidia-elements/core/css/*`      | (pre-maglev) replaced by `@nvidia-elements/styles`                                                                                   |
| `@nvidia-elements/core/index.css`  | (pre-maglev) replaced by `@nvidia-elements/styles`                                                                                   |
| `@nvidia-elements/core/logo`       | The logo component no longer includes the NVIDIA SVG logo; consumers must provide their own SVG as child content in the default slot |

All prior Maglev based conventions and prefixes are now removed.

## What Stays the Same

- **Component tag prefix**: All components continue to use the `nve-` prefix (`<nve-button>`, `<nve-dialog>`, etc.)
- **CSS custom properties**: Theme tokens and component CSS custom properties keep the same names (`--nve-*`)
- **Component APIs**: Properties, attributes, events, slots, and CSS parts remain the same
- **Theme files**: Same theme names and token structure

## Deprecations

The following are the active deprecations. Each next major release removes the prior deprecations. Read more about the <a nve-text="link mkd" href="docs/about/support/#versioning">versioning and deprecation cycle policy</a>.

### @nvidia-elements 0.x

TBD

### @nve/testing <nve-badge status="warning">deprecated</nve-badge>

The custom test utilities are now deprecated.

### @nve/elements

#### Scoped Tags <nve-badge status="warning">deprecated</nve-badge>

Avoid `@nve/elements/scoped`. Instead, consuming applications define their own tag name and leverage the `@lit-labs/scoped-registry-mixin` package directly.

#### Popover Behavior Triggers <nve-badge status="warning">deprecated</nve-badge>

Before native HTML popovers, popovers required `behaviorTrigger` or `behavior-trigger` for stateful popovers. The native [HTML popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) replaces this approach.

<nve-alert status="danger">Before:</nve-alert>

```html
<nve-tooltip trigger="tooltip-btn" behavior-trigger position="top" hidden>hello there</nve-tooltip>
<nve-button id="tooltip-btn">tooltip</nve-button>
```

<nve-alert status="success">After:</nve-alert>

```html
<nve-tooltip id="my-tooltip" position="top">hello there</nve-tooltip>
<nve-button popovertarget="my-tooltip">tooltip</nve-button>
```

### @maglev/elements

#### Scope <nve-badge status="warning">deprecated</nve-badge>

```css
/* before */
@import '@maglev/elements/index.css';
@import '@maglev/elements/inter.css';
```

<nve-alert status="success">After:</nve-alert>

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

Update any CSS Custom property usage

<nve-alert status="danger">Before:</nve-alert>

```css
.selector {
  color: var(--mlv-ref-color-brand-green-200);
}
```

<nve-alert status="success">After:</nve-alert>

```css
.selector {
  color: var(--nve-ref-color-brand-green-200);
}
```

Update style utility attributes

<nve-alert status="danger">Before:</nve-alert>

````html
<html mlv-theme="...">
<div mlv-layout="...">
<p mlv-text="...">
```

<nve-alert status="success">After:</nve-alert>

```html
<html nve-theme="...">
<div nve-layout="...">
<p nve-text="...">
````

Update HTML elements

<nve-alert status="danger">Before:</nve-alert>

```html
<mlv-button>...</mlv-button>
```

<nve-alert status="success">After:</nve-alert>

```html
<nve-button>...</nve-button>
```

#### Alert Banner <nve-badge status="warning">deprecated</nve-badge>

The alert banner component no longer exists. Use `nve-alert-group` with the `prominence="emphasis"` option.

<nve-alert status="danger">Before:</nve-alert>

```html
<nve-alert-banner>
  <nve-alert closable>
    <span slot="prefix">Standard</span> banner message
  </nve-alert>
</nve-alert-banner>
```

<nve-alert status="success">After:</nve-alert>

```html
<nve-alert-group prominence="emphasis" container="full">
  <nve-alert closable>
    <span slot="prefix">Standard</span> banner message
  </nve-alert>
</nve-alert-group>
```

#### JSON Viewer <nve-badge status="warning">deprecated</nve-badge>

The JSON viewer element is an internal API. You can access this API via the public exports but should avoid using it. Use `nve-codeblock` or `nve-monaco-input` for JSON content rendering.

#### Layout Full <nve-badge status="warning">deprecated</nve-badge>

The `grow` property now uses `full` instead to avoid confusion with flexbox grow behavior.

<nve-alert status="danger">Before:</nve-alert>

```html
<div nve-layout="grow"></div>
```

<nve-alert status="success">After:</nve-alert>

```html
<div nve-layout="full"></div>
```

#### Typography "eyebrow" <nve-badge status="warning">deprecated</nve-badge>

The typography `eyebrow` utility no longer exists, to align with the standardized semantic names and size options available.

<nve-alert status="danger">Before:</nve-alert>

```html
<div nve-text="eyebrow"></div>
```

<nve-alert status="success">After:</nve-alert>

```html
<div nve-text="label sm"></div>
```

#### Icon Names <nve-badge status="warning">deprecated</nve-badge>

The following icons now use new names:

<!-- vale write-good.TooWordy = NO -->
<style>table { max-width: 400px }</style>

| before             | after                     |
| ------------------ | ------------------------- |
| chevron-right      | chevron                   |
| chevron-down       | chevron                   |
| chevron-left       | chevron                   |
| additional-actions | more-actions              |
| analytics          | pie-chart                 |
| annotation         | transparent-box           |
| app-switcher       | switch-apps               |
| assist             | chat-bubble               |
| checkmark          | check                     |
| date               | calendar                  |
| docs               | book                      |
| expand-full-screen | maximize                  |
| expand-panel       | arrow-stop                |
| collapse-panel     | arrow-stop                |
| failed             | x-circle                  |
| favorite-filled    | star                      |
| favorite-outline   | star-stroke               |
| information        | information-circle-stroke |
| maintenance        | wrench                    |
| navigate-to        | arrow                     |
| open-external-link | arrow-angle               |
| location           | map-pin                   |
| pinned-1           | pin                       |
| project            | folder                    |
| settings           | gear                      |
| user               | person                    |
| video-pause        | pause                     |
| video-play         | play                      |
| video-stop         | stop                      |
| visible            | eye                       |
| warning            | exclamation-triangle      |

<!-- vale write-good.TooWordy = YES -->

### Icon Button Name Directions <nve-badge status="warning">deprecated</nve-badge>

With the deprecation of directional icons the icon button now requires a explicit direction.

<nve-alert status="danger">Before:</nve-alert>

```html
<nve-icon name="chevron-left"></nve-icon>
<nve-icon name="beginning"></nve-icon>
<nve-icon name="beginning-left"></nve-icon>
<nve-icon name="collapse-panel"></nve-icon>
<nve-icon name="navigate-back"></nve-icon>
<nve-icon name="chevron-right"></nve-icon>
<nve-icon name="end"></nve-icon>
<nve-icon name="expand-panel"></nve-icon>
<nve-icon name="navigate-to"></nve-icon>
<nve-icon name="carousel-horizontal"></nve-icon>
<nve-icon name="chevron-down"></nve-icon>
<nve-icon name="thumbs-down"></nve-icon>
```

<nve-alert status="success">After:</nve-alert>

```html
<nve-icon name="chevron" direction="left"></nve-icon>
<nve-icon name="beginning" direction="left"></nve-icon>
<nve-icon name="arrow-stop" direction="left"></nve-icon>
<nve-icon name="navigate-back" direction="left"></nve-icon>
<nve-icon name="chevron" direction="right"></nve-icon>
<nve-icon name="end" direction="right"></nve-icon>
<nve-icon name="arrow-stop" direction="right"></nve-icon>
<nve-icon name="arrow" direction="right"></nve-icon>
<nve-icon name="carousel-horizontal" direction="right"></nve-icon>
<nve-icon name="chevron" direction="down"></nve-icon>
<nve-icon name="thumb" direction="down"></nve-icon>
```
