---
{
  title: 'React Integration',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% svg-logos 'react' %}

<div nve-layout="row gap:xs">
  <nve-button>
    <a href="https://NVIDIA.github.io/elements/starters/react/" target="_blank"><svg width="18" height="18"><use href="#react-svg"></use></svg> Demo</a>
  </nve-button>

  <nve-button>
    <nve-icon name="code"></nve-icon>
    <a href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/react" target="_blank">Source</a>
  </nve-button>
</div>

To use Elements in [React (v19)](https://https://react.dev/) follow the [installation getting started](./docs/about/getting-started/) steps. Once complete
elements can be imported and used within React jsx and tsx files.

```typescript
import '@nvidia-elements/core/alert/define.js';
```

Once added, properties and events can be used via the standard JSX syntax.

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

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements { }
  }
}
```

### React SSR

An experimental [@lit-labs/ssr-react](https://github.com/lit/lit/tree/main/packages/labs/ssr-react) package exists for rendering elements with SSR.

```typescript
// app/root.tsx, import before any other elements import statements
import '@lit-labs/ssr-react/enable-lit-ssr.js';

// the rest of your app
```

## React 18

To use Elements in [React v18](https://legacy.reactjs.org/versions/) follow the [installation getting started](./docs/about/getting-started/) steps. Once complete
elements can be imported and used within React jsx and tsx files via the `@nvidia-elements/core-react` package. This package must be used to enable React 18 compatibility with Custom Elements.
This package will wrap the custom elements into a React component, mapping the standard events and properties in a way that React can understand.

<nve-alert status="warning">The `@nvidia-elements/core-react` package is no longer needed as of React version 19. Using Elements directly improves compatibility and performance.</nve-alert>

```typescript
import { NveDialog } from '@nvidia-elements/core-react/dialog';
```

```typescript
// - closable - HTML attribute
// - hidden - can update via attributes or JavaScript property binding
// - onclose - event listener binding for 'close' custom event
```

```html
<NveDialog closable modal hidden={!showDialog} onclose={() => setShowDialog(false)}>
  ...
</NveDialog>
```

Documented events are prefixed with `on` in the `elements-react` package. Example, the event `close` will map to `onclose`. Imports also map 1:1 with the core library.

```typescript
// Standard Web Component
import { Dialog } from '@nvidia-elements/core/dialog';

// React Component
import { NveDialog } from '@nvidia-elements/core-react/dialog';
```

To learn more about the `@lit/react` package, please visit the [documentation](https://github.com/lit/lit/blob/main/packages/react/README.md).
