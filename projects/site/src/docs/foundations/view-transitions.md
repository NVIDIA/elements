---
{
  title: 'View Transitions',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

The [View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) provides a way to allow CSS animations and transitions to run between page navigations. This creates a smooth navigation experience similar to SPA (single page app) style routers but for MPA (mult-page apps), or simply links between static HTML pages.

## Installation

To enable view transitions for you application import the following CSS:

```css
@import '@nvidia-elements/styles/view-transitions.css';
```

Apply the following attribute to the root HTML element:

```html
<html nve-transition="auto">
```

Use the [nve-page](./?path=/docs/elements-page-documentation--docs) element to enable the transition animations for page content.

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

This will enable the View Transition API and provide a basic [speculation ruleset](https://developer.chrome.com/docs/web-platform/prerender-pages#speculation-rules-api) for smooth prerendering of the page to be navigated to by the user. To view how view transitions work in action
browse our [starter demo apps](https://NVIDIA.github.io/elements/starters/mpa/) and note the smooth animation transition between various UI frameworks.
