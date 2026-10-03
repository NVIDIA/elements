---
{
  title: 'Iframe',
  layout: 'docs.11ty.js',
  tag: 'nve-iframe'
}
---

## Installation

```typescript
import '@nvidia-elements/core/iframe/define.js';
```

```html
<nve-iframe aria-label="Elements iframe example">
  <template slot="head">
    <title>Elements iframe example</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/bundles/index.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/fonts/inter.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/styles/dist/bundles/index.css" />
    <script type="module" src="https://cdn.jsdelivr.net/npm/@nvidia-elements/core/dist/bundles/index.min.js"></script>
  </template>
  <template>
    <nve-alert status="success">isolated iframe content</nve-alert>
  </template>
</nve-iframe>
```

## Iframe

{% example '@nvidia-elements/core/iframe/iframe.examples.json', 'Default' %}

## Dynamic Height

The iframe grows and shrinks with its content. Browsers that support native responsive iframe sizing use `frame-sizing: content-height` and `window.requestResize()`. If native sizing is unavailable or the document cannot use it, the component uses resize messages. The component handles both paths without changes to your templates.

{% example '@nvidia-elements/core/iframe/iframe.examples.json', 'DynamicHeight' %}

## Fixed Size

Set `--width` and `--height` to keep a fixed viewport with either sizing path.

{% example '@nvidia-elements/core/iframe/iframe.examples.json', 'FixedSize' %}
