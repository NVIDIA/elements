---
{
  title: 'Migration Guide',
  description: 'Migrate between NVIDIA Elements major versions: breaking changes, deprecation notices, and step-by-step upgrade notes for components, themes, and styles.',
  layout: 'docs.11ty.js'
}
---

<style scoped>
  h3[nve-text*='mkd'] {
    padding-block-start: var(--nve-ref-space-xl);
  }
</style>

# {{ title }}

This guide covers migrating from the internal `@nve/*` packages to the new open source `@nvidia-elements/*` packages.

## Overview

The Elements Design System is now hosted and developed in a public GitHub repository. Packages are now published to the public npm registry under the `@nvidia-elements` scope. The component APIs, tag names, and theming system remain the same. The primary changes are package names, import paths, and registry configuration.

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

## Deprecations & Removals

The following are the active deprecations. Each next major release removes the prior deprecations. Read more about the <a nve-text="link mkd" href="docs/about/support/#versioning">versioning and deprecation cycle policy</a>.

### Logo <nve-badge status="danger">removed</nve-badge>

The `nve-logo` component no longer includes the NVIDIA SVG logo; consumers must provide their own SVG as child content in the default slot.

{% before-after %}

```html
<nve-logo aria-label="NVIDIA"></nve-logo>
```

```html
<nve-logo>
  <img src="./logo.svg" alt="NVIDIA" />
</nve-logo>
```

{% endbefore-after %}

### Popover Behavior Triggers <nve-badge status="warning">deprecated</nve-badge>

Before native HTML popovers, popovers required `behaviorTrigger` or `behavior-trigger` for stateful popovers. The native [HTML popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) replaces this approach.

{% before-after %}

```html
<nve-tooltip trigger="tooltip-btn" behavior-trigger position="top" hidden>hello there</nve-tooltip>
<nve-button id="tooltip-btn">tooltip</nve-button>
```

```html
<nve-tooltip id="my-tooltip" position="top">hello there</nve-tooltip>
<nve-button popovertarget="my-tooltip">tooltip</nve-button>
```

{% endbefore-after %}

### Layout Full <nve-badge status="warning">deprecated</nve-badge>

The `grow` property now uses `full` instead to avoid confusion with flexbox grow behavior.

{% before-after %}

```html
<div nve-layout="grow"></div>
```

```html
<div nve-layout="full"></div>
```

{% endbefore-after %}

### Typography "eyebrow" <nve-badge status="warning">deprecated</nve-badge>

The typography `eyebrow` utility no longer exists, to align with the standardized semantic names and size options available.

{% before-after %}

```html
<div nve-text="eyebrow"></div>
```

```html
<div nve-text="label sm"></div>
```

{% endbefore-after %}

### @nve/testing <nve-badge status="danger">removed</nve-badge>

The custom test utilities are no longer supported in the public scope.

### Scoped Tags <nve-badge status="danger">removed</nve-badge>

Avoid `@nve/elements/scoped`. Instead, consuming applications define their own tag name and leverage the `@lit-labs/scoped-registry-mixin` package directly.

### Maglev - CSS Entrypoints <nve-badge status="danger">removed</nve-badge>

{% before-after %}

```css
/* before */
@import '@maglev/elements/index.css';
@import '@maglev/elements/inter.css';
```

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

{% endbefore-after %}

### Maglev - CSS Prefix <nve-badge status="danger">removed</nve-badge>

Update any CSS Custom property usage

{% before-after %}

```css
.selector {
  color: var(--mlv-ref-color-brand-green-200);
}
```

```css
.selector {
  color: var(--nve-ref-color-brand-green-200);
}
```

{% endbefore-after %}

### Maglev - Attribute Prefix <nve-badge status="danger">removed</nve-badge>

Update style utility attributes

{% before-after %}

```html
<html mlv-theme="...">
<div mlv-layout="...">
<p mlv-text="...">
```

```html
<html nve-theme="...">
<div nve-layout="...">
<p nve-text="...">
```

{% endbefore-after %}

### Maglev - HTML Prefix <nve-badge status="danger">removed</nve-badge>

Update HTML elements

{% before-after %}

```html
<mlv-button>...</mlv-button>
```

```html
<nve-button>...</nve-button>
```

{% endbefore-after %}

### Maglev - App Header <nve-badge status="danger">removed</nve-badge>

`nve-page-header` replaces the early Maglev scoped package `mlv-app-header`.

{% before-after %}

```html
<mlv-app-header>
  ...
</mlv-app-header>
```

```html
<nve-page-header>
  <nve-logo slot="prefix" size="sm">NV</nve-logo>
  <h2 slot="prefix" nve-text="heading sm">Infrastructure</h2>
  <nve-button selected container="flat"><a href="#">Link 1</a></nve-button>
  <nve-button container="flat"><a href="#">Link 2</a></nve-button>
  <nve-icon-button slot="suffix" interaction="emphasis" size="sm">EL</nve-icon-button>
</nve-page-header>
```

{% endbefore-after %}

### Maglev - Alert Banner <nve-badge status="danger">removed</nve-badge>

The alert banner component no longer exists. Use `nve-alert-group` with the `prominence="emphasis"` option.

{% before-after %}

```html
<nve-alert-banner>
  <nve-alert closable>
    <span slot="prefix">Standard</span> banner message
  </nve-alert>
</nve-alert-banner>
```

```html
<nve-alert-group prominence="emphasis" container="full">
  <nve-alert closable>
    <span slot="prefix">Standard</span> banner message
  </nve-alert>
</nve-alert-group>
```

{% endbefore-after %}

### Maglev - JSON Viewer <nve-badge status="danger">removed</nve-badge>

The JSON viewer element is an internal API. You can access this API via the public exports but should avoid using it. Use `nve-codeblock` or `nve-monaco-input` for JSON content rendering.

### Maglev - Icon Names <nve-badge status="danger">removed</nve-badge>

The following icons now use new names:

<!-- vale write-good.TooWordy = NO -->

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

### Maglev - Icon Button Name Directions <nve-badge status="danger">removed</nve-badge>

With the deprecation of directional icons the icon button now requires a explicit direction.

{% before-after %}

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

{% endbefore-after %}
