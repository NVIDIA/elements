---
{
  title: 'Vue',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'vue' %}

{% installation %}

## Integration

Once installation is complete Elements can be imported and used within [Vue](https://vuejs.org/) SFC files.

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
