---
{
  title: 'Vue Integration',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

<div nve-layout="row gap:xs">
  <nve-button>
    <a href="https://NVIDIA.github.io/elements/starters/vue/" target="_blank"><svg width="18" height="18"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vue-svg"></use></svg> Demo</a>
  </nve-button>

  <nve-button>
    <nve-icon name="download" size="sm"></nve-icon>
    <a href="https://NVIDIA.github.io/elements/starters/download/vue.zip" target="_blank">Download</a>
  </nve-button>

  <nve-button>
    <nve-icon name="code"></nve-icon>
    <a href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/vue" target="_blank">Source</a>
  </nve-button>
</div>

To use Elements in Vue follow the [installation getting started](./api/?path=/docs/about-installation--docs) steps. Once complete
elements can be imported and used within Vue SFC files.

```typescript
import '@nvidia-elements/core/alert-group/define.js';
```

Once added, properties and events can be used via the standard Vue template syntax.

```typescript
// - status - HTML attribute
// - :closable - can update via attributes or JavaScript property binding
// - @close - event listener binding for 'close' custom event
```

```html
<nve-alert-group status="success">
  <nve-alert :closable="true" @close="closeAlert">hello there!</nve-alert>
</nve-alert-group>
```
