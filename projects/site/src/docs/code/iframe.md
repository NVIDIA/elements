---
{
  title: 'Iframe',
  layout: 'docs.11ty.js',
  tag: 'nve-iframe'
}
---

## Installation

```typescript
import '@nvidia-elements/code/iframe/define.js';
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

{% example '@nvidia-elements/code/iframe/iframe.examples.json', 'Default' %}

## Dynamic Height

{% example '@nvidia-elements/code/iframe/iframe.examples.json', 'DynamicHeight' %}

## Fixed Size

{% example '@nvidia-elements/code/iframe/iframe.examples.json', 'FixedSize' %}
