---
{
  title: 'NextJS',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'nextjs' %}

{% installation %}

## Integration

Once installation is complete Elements can be imported and used within [NextJS](https://nextjs.org/) jsx and tsx files.

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

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements { }
  }
}
```

## SSR

An experimental [@lit-labs/nextjs](https://github.com/lit/lit/tree/main/packages/labs/nextjs) package exists for rendering Elements with NextJS SSR.

```typescript
import withLitSSR from '@lit-labs/nextjs'; // https://github.com/lit/lit/tree/main/packages/labs/nextjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withLitSSR({})(nextConfig);
```
