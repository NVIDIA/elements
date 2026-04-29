---
{
  title: 'View Transitions',
  description: 'Page and view transitions in NVIDIA Elements: enabling the View Transitions API and cross-fading content updates.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

The [View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) provides a way to allow CSS animations and transitions to run during page navigation. This creates a smooth navigation experience like SPA (single page app) style routers but for MPA (multi-page apps), or simply links between static HTML pages.

## Installation

To enable view transitions for you application import the following CSS:

```css
@import '@nvidia-elements/styles/view-transitions.css';
```

Apply the following attribute to the root HTML element:

```html
<html nve-transition="auto">
```

Use the [nve-page](./docs/elements/page/) element to enable the transition animations for page content.

```javascript
import '@nvidia-elements/core/page/define.js';
```

```html
<body>
  <nve-page>
    ...
  </nve-page>
</body>
```

This enables the View Transition API and provides a basic [speculation ruleset](https://developer.chrome.com/docs/web-platform/prerender-pages#speculation-rules-api) that pre-renders and enables smooth page transitions via user navigation. To see how view transitions work in action
browse the [starter demo apps](./starters/mpa/) and note the smooth animation transition between UI frameworks.
