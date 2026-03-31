---
{
  title: 'Migration Guide',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Why nve?

Elements has been gradually transitioning its libraries to use the `@nvidia-elements/*` package scope and namespace. This change began in early 2024 with Elements, which already employed the `nve` namespace internally. The shift to `@nvidia-elements/*` aims to establish a clear ownership boundary and signal of support for the Elements libraries.

## Migration Steps Pre 0.x (elements)

Update to the latest 0.x release before migration to a 1.x release. To migrate from a 0.x release to 1.x follow the following steps:

### 1. Update Packages

```shell
pnpm remove @elements/elements
```

```shell
pnpm install @nvidia-elements/themes @nvidia-elements/styles @nvidia-elements/core
```

### 2. Update CSS and JavaScript Imports

```css
/* before */
@import '@elements/elements/index.css';

/* after */
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';
```

```typescript
// before
import '@elements/elements/button/define.js';

// after
import '@nvidia-elements/core/button/define.js';
```

## Deprecations (optional)

<nve-alert-group status="accent">
  <nve-alert>
    <p nve-text="body lg medium">The "mlv" API prefix <strong>continues to work</strong> throughout 1.0 and its <a nve-text="link mkd" href="docs/about/support/#versioning">deprecation cycle</a>.</p>
  </nve-alert>
</nve-alert-group>

With the release of 1.0 the scope and namespace for Element APIs now use the `nve` prefix. All prior `mlv` prefixes have entered deprecation. These steps are not required to initially migrate and use 1.0. To incrementally migrate to the new prefix follow the following steps:

### 1. Update CSS Imports

The CSS bundle is now divided into smaller independent bundles. This allows you to choose only the utilities and themes your application needs, improving application performance.

```css
/* before */
@import '@elements/elements/index.css';
@import '@elements/elements/inter.css';

/* after */
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

### 2. Update any CSS Custom property usage

```css
.selector {
  /* before */
  color: var(--nve-ref-color-brand-green-200);

  /* after */
  color: var(--nve-ref-color-brand-green-200);
}
```

### 3. Update style utility attributes

```html
<!-- before -->
<html nve-theme="...">
<div nve-layout="...">
<p nve-text="...">

<!-- after -->
<html nve-theme="...">
<div nve-layout="...">
<p nve-text="...">
```

### 4. Update HTML elements

```html
<!-- before -->
<nve-button>...</nve-button>

<!-- after -->
<nve-button>...</nve-button>
```
