---
{
  title: 'Vue',
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
