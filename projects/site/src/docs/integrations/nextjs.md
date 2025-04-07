---
{
  title: 'NextJS Integration',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

<div nve-layout="row gap:xs">
  <nve-button>
    <nve-icon name="code"></nve-icon>
    <a href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/nextjs" target="_blank">Source</a>
  </nve-button>

  <nve-button>
    <nve-icon name="download" size="sm"></nve-icon>
    <a href="https://NVIDIA.github.io/elements/starters/download/nextjs.zip" target="_blank">Download</a>
  </nve-button>
</div>

To use Elements in [NextJS](https://nextjs.org/) follow the [installation](./api/?path=/docs/integrations-react--docs) steps. Once complete
elements can be imported and used within React jsx and tsx files. An experimental [@lit-labs/nextjs](https://github.com/lit/lit/tree/main/packages/labs/nextjs) package exists for rendering
elements with NextJS SSR.

```typescript
import withLitSSR from '@lit-labs/nextjs'; // https://github.com/lit/lit/tree/main/packages/labs/nextjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withLitSSR({})(nextConfig);
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
