---
{
  title: 'Preact',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'preact' %}

{% installation %}

## Integration

Once installation is complete elements can be imported and used within [Preact](https://preactjs.com/) jsx and tsx files.

```typescript
import '@nvidia-elements/core/alert/define.js';
```

Once added, properties and events can be used via the standard Preact template syntax.

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

To add TypeScript types to your TSX files add the elements interface to the [IntrinsicElements](https://preactjs.com/guide/v10/typescript/#extending-intrinsicelements) interface.

```typescript
// global.d.ts
import type { CustomElements } from '@nvidia-elements/core/custom-elements-jsx';

declare global {
  namespace preact.JSX {
    interface IntrinsicElements extends CustomElements { }
  }
}

export {}
```
