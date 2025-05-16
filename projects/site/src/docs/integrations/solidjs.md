---
{
  title: 'SolidJS Integration',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% svg-logos 'solidjs' %}

<div nve-layout="row gap:xs">
  <nve-button>
    <a href="https://NVIDIA.github.io/elements/starters/solidjs/" target="_blank"><svg width="18" height="18"><use href="#solidjs-svg"></use></svg> Demo</a>
  </nve-button>

  <nve-button>
    <nve-icon name="download" size="sm"></nve-icon>
    <a href="https://NVIDIA.github.io/elements/starters/download/solidjs.zip" target="_blank">Download</a>
  </nve-button>

  <nve-button>
    <nve-icon name="code"></nve-icon>
    <a href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/solidjs" target="_blank">Source</a>
  </nve-button>
</div>

To use Elements in [SolidJS](https://www.solidjs.com/) follow the [installation getting started](./docs/about/getting-started/) steps. Once complete
elements can be imported and used within SolidJS jsx and tsx files.

```typescript
import '@nvidia-elements/core/alert-group/define.js';
```

Once added, properties and events can be used via the standard template syntax.

```typescript
// - status - HTML attribute
// - closable - can update via attributes or JavaScript property binding
// - onclose - event listener binding for 'close' custom event
```

```html
<nve-alert-group status="success">
  <nve-alert closable={isClosable} onclose={(e) => closeAlert()}>hello there!</nve-alert>
</nve-alert-group>
```

To add TypeScript types to your TSX files add the elements interface to the [IntrinsicElements](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#the-jsx-namespace-in-typescript) interface.

```typescript
// global.d.ts
import type { CustomElements } from '@nvidia-elements/core/custom-elements-jsx';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements { }
  }
}
```
