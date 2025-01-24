---
{
  title: 'Packaging',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Dependencies

Dependencies should be carefully considered as they impose the cost onto all consumers. Before dependencies are added the following should be considered,

- Could this be done with the Web Platform today?
- Could this be done with something that will be on the Web Platform + Polyfill?
- Is this dependency tree-shakable and has minimal performance impact?
- Does this dependency avoid polluting globals and prototypes?

Dependencies should be listed within the published package.json and not bundled with the library. Bundling dependencies is handled by the host application and enables the host application build pipeline to tree-shake and de-duplicate dependencies.

```json
{
  "dependencies": {
    "@floating-ui/dom": "^1.0.3",
    "lit": "^3.2.0",
    "lit-html": "^3.2.0"
  },
  "optionalDependencies": {
    "@lit-labs/scoped-registry-mixin": "^1.0.1",
    "@webcomponents/scoped-custom-element-registry": "^0.0.9",
    "construct-style-sheets-polyfill": "^3.1.0",
    "element-internals-polyfill": "^1.3.10"
  }
}
```

If a dependency is a feature or optional it should be listed under the optional dependencies.

## Build Output

Element libraries should not bundle elements or dependencies. This prevents the host application build from being able to tree-shake or construct an accurate representation of the dependency tree. However minification can still be applied to each module independently.

Build outputs should target the latest ES2020+. Build outputs should not compile to ES5 and only ship standard ESM modules. Host applications can always compile dependencies down to an older version of ES.

<nve-alert status="warning">Warning: Avoid alternate build targets as it increases complexity and is unnecessary with modern build tools and browsers.</nve-alert>

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn: <a href="https://justinfagnani.com/2019/11/01/how-to-publish-web-components-to-npm/">Publishing Web Components</a></nve-alert>

## Entrypoints

Each element should provide a standalone entrypoint for consumption. This enables consumers to choose which elements to load/import, improving performance and API stability.

```typescript
import  { Button } from '@nvidia-elements/core/button';
import  { Dialog } from '@nvidia-elements/core/dialog';
```

## Side Effects & Registration

Elements should not automatically register themselves to the customElementsRegistry.
Rather side effects like registration should be isolated to a single file.

```typescript
// example define.js
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/button/define.js';
import { Dialog } from './dialog.js';

customElements.get('nve-dialog') || customElements.define('nve-dialog', MlvDialog);
```

If an element depends on other elements then those elements should be included in the registration file as well to ensure a proper dependency tree is constructed.

```typescript
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dialog/define.js';
```

Isolated registration allows the consumer to control when an element should be loaded. This future proofs the API to allow scoped element registries.

<nve-alert status="warning">Warning: Isolated side-effects are critical for certain micro-frontend use cases.</nve-alert>

The `package.json` should have the `sideEffects` entry set to `false` and list any element registrations to the explicit sideEffects entry. This enables tools like Webpack and Rollup to properly define dependency graphs and tree-shake.

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn: <a href="./?path=/docs/about-extensions--docs&anchor=scoped-registry">Elements Documentation</a></nve-alert>

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn: <a href="https://github.com/webcomponents/polyfills/tree/master/packages/scoped-custom-element-registry">Scoped Element Registry</a></nve-alert>

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn: <a href="https://www.youtube.com/watch?v=QmDToR6mLhk">Case Study</a></nve-alert>
