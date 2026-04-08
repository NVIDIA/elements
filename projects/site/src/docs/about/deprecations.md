---
{
  title: 'Deprecations',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

The following are the active deprecations. The next major release removes these deprecations. Read more about the <a nve-text="link mkd" href="docs/about/support/#versioning">versioning and deprecation cycle policy</a>.

## MLV/NVE Scope <nve-badge status="warning">deprecated</nve-badge>

These steps are not required to initially migrate and use 1.0. If migrating from 0.x to 1.x please see the [migration guide](docs/about/migration/).

With the release of 1.0 the scope and namespace for Element APIs now use the nve prefix. All prior mlv prefixes no longer apply. The CSS bundle now divides into smaller independent bundles. This allows you to choose only the utilities and themes your application needs, improving application performance.

```css
/* before */
@import '@elements/elements/index.css';
@import '@elements/elements/inter.css';
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

## Alert Banner <nve-badge status="warning">deprecated</nve-badge>

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

## Popover Behavior Triggers <nve-badge status="warning">deprecated</nve-badge>

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

## JSON Viewer <nve-badge status="warning">deprecated</nve-badge>

The JSON viewer element is an internal API. You can access this API via the public exports but should avoid using it. Use `nve-codeblock` or `nve-monaco-input` for JSON content rendering.

## Layout Full <nve-badge status="warning">deprecated</nve-badge>

The `grow` property now uses `full` instead to avoid confusion with flexbox grow behavior.

<nve-alert status="danger">Before:</nve-alert>

```html
<div nve-layout="grow"></div>
```

<nve-alert status="success">After:</nve-alert>

```html
<div nve-layout="full"></div>
```

## Typography "eyebrow" <nve-badge status="warning">deprecated</nve-badge>

The typography `eyebrow` utility no longer exists, to align with the standardized semantic names and size options available.

<nve-alert status="danger">Before:</nve-alert>

```html
<div nve-text="eyebrow"></div>
```

<nve-alert status="success">After:</nve-alert>

```html
<div nve-text="label sm"></div>
```

## Icon Names <nve-badge status="warning">deprecated</nve-badge>

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

## Icon Button Name Directions <nve-badge status="warning">deprecated</nve-badge>

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

## Testing <nve-badge status="warning">deprecated</nve-badge>

The exported test utilities from `@elements/elements/test` are now supported in a dedicated testing package `@nvidia-elements/testing`.

<nve-alert status="danger">Before:</nve-alert>

```typescript
import { createFixture, removeFixture, elementIsStable, emulateClick, untilEvent } from '@elements/elements/test';
```

<nve-alert status="success">After:</nve-alert>

```typescript
import { createFixture, removeFixture, elementIsStable, emulateClick, untilEvent } from '@nvidia-elements/testing';
```

## Scoped Tags <nve-badge status="warning">deprecated</nve-badge>

The `defineScopedElement` helper no longer exists. Instead, consuming applications define their own tag name. This allows the consuming application to have more control of the `@lit-labs/scoped-registry-mixin` package version.

<nve-alert status="danger">Before:</nve-alert>

```typescript
import { defineScopedElement } from '@nvidia-elements/core/scoped';

defineScopedElement('suffix', Element);
```

<nve-alert status="success">After:</nve-alert>

```typescript
import { scope } from '@nvidia-elements/core/scoped';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';

customElements.define(`suffix-element`, scope(Element, ScopedRegistryHost));
```
