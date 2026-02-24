---
{
  title: 'Svelte',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'svelte' %}

{% installation 'svelte' %}

Once installed import and use Elements within [Svelte](https://svelte.dev/) `.svelte` template files.

```typescript
import '@nvidia-elements/core/alert/define.js';
```

Properties and events then work via the standard template syntax.

```typescript
// - status - HTML attribute
// - closable - can update via attributes or JavaScript property binding
// - onclose - event listener binding for 'close' custom event
```

```html
<nve-alert-group status="success">
  <nve-alert bind:closable={isClosable} on:close={(e: Event) => closeAlert(e)}>hello there!</nve-alert>
</nve-alert-group>
```
