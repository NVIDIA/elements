---
{
  title: 'Vue',
  description: 'Use NVIDIA Elements with Vue: register components, bind native form controls with v-model, and handle custom events with v-on.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'vue' %}

{% installation 'vue' %}

Once installed import and use Elements within [Vue](https://vuejs.org/) SFC files.

```typescript
import '@nvidia-elements/core/alert/define.js';
```

Properties and events then work via the standard Vue template syntax.

## Form controls

Place `v-model` on the nested native `<input>`, not on the `nve-input`, `nve-range`, or `nve-switch` wrapper. The native control owns the value or checked state that Vue updates.

```typescript
import { ref } from 'vue';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/switch/define.js';

const name = ref('');
const volume = ref(50);
const notifications = ref(false);
```

```html
<nve-input>
  <label>Name</label>
  <input v-model="name" type="text" />
</nve-input>

<nve-range>
  <label>Volume</label>
  <input v-model.number="volume" type="range" min="0" max="100" />
</nve-range>

<nve-switch>
  <label>Notifications</label>
  <input v-model="notifications" type="checkbox" />
</nve-switch>
```

## TypeScript types

To get type checking and autocomplete for Elements in Vue templates (and to have invalid props like `size="invalid"` reported by the IDE and build), add a reference to the custom-elements Vue types.

Create or update `env.d.ts` in your project root:

```typescript
/// <reference types="vite/client" />
/// <reference path="./node_modules/@nvidia-elements/core/dist/custom-elements-vue.d.ts" />
```

Ensure your app tsconfig includes this file (for example, `tsconfig.app.json` with `"include": ["env.d.ts", "src/**/*", "src/**/*.vue"]`). The path reference loads the types that augment Vue’s `GlobalComponents`, so tags such as `<nve-page-panel size="sm">` have type checking and the IDE reports invalid values.

If your build does not already run the type checker, run `vue-tsc` before the build (for example: `vue-tsc --noEmit && vite build`) so type errors fail the build.

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
