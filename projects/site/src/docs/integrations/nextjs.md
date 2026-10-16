---
{
  title: 'NextJS',
  description: 'Use NVIDIA Elements in a Next.js app: client and server component patterns, SSR-safe registration, and React event handling.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'nextjs' %}

{% installation 'nextjs' %}

Once installed import and use Elements within [NextJS](https://nextjs.org/) jsx and tsx files.

```typescript
import '@nvidia-elements/core/alert/define.js';
```

Properties and events then work via the standard JSX syntax.

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

[@lit-labs/nextjs](https://github.com/lit/lit/tree/main/packages/labs/nextjs) is an experimental package for rendering Elements during NextJS server rendering. The experimental label applies to this Lit integration. It does not change the [browser support policy](/docs/about/support/#browsers), and it does not make every Elements server-rendering path experimental. Component SSR tests check that a component can produce server markup. Read [SSR testing](/docs/internal/guidelines/testing-ssr/) for that check.

```typescript
import withLitSSR from '@lit-labs/nextjs'; // https://github.com/lit/lit/tree/main/packages/labs/nextjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withLitSSR({})(nextConfig);
```
