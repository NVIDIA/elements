# Elements

### The Design Language for AI/ML Factories Building at the Speed of Light

- [Documentation](https://NVIDIA.github.io/elements/api/?path=/docs/about-getting-started--docs)
- [Slack Support](https://nvidia.slack.com/archives/C03BDL2UCGK)
- [Changelog](https://NVIDIA.github.io/elements/api/?path=/docs/about-changelog--docs)
- [Gitlab Repo](https://github.com/NVIDIA/elements)
- [Package Artifactory URM](https://registry.npmjs.org
- [Package Artifactory Maglev](ui/packages/npm:%2F%2F@elements%2Felements)

## Getting Started

```bash
# add internal registry to local .npmrc file (optional)
@elements/elements:registry=https://registry.npmjs.org

# install from registry
pnpm install @elements/elements
```

```css
/* import the global CSS into your project */
@import '@elements/elements/dist/index.css';
@import '@elements/elements/dist/inter.css';
```

```ts
// import and use individual elements (recommended)
import '@elements/elements/button/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/icon/define.js';

// import specific element type references
import { Button } from '@elements/elements';

// optional (polyfills for non-chromium browsers)
import '@elements/elements/polyfills';
```

```html
<mlv-button>button</mlv-button>
```

## Framework Integrations

- [Angular](https://NVIDIA.github.io/elements/api/?path=/docs/integrations-angular--docs)
- [Lit](https://NVIDIA.github.io/elements/api/?path=/docs/integrations-lit--docs)
- [Preact](https://NVIDIA.github.io/elements/api/?path=/docs/integrations-preact--docs)
- [React](https://NVIDIA.github.io/elements/api/?path=/docs/integrations-react--docs)
- [TypeScript](https://NVIDIA.github.io/elements/api/?path=/docs/integrations-typescript--docs)
- [Vue](https://NVIDIA.github.io/elements/api/?path=/docs/integrations-Vue--docs)

## Development

- `ci`: run full build/lint/test as well as demo/storybook apps against final output
- `build`: run library build
- `dev`: run storybook and build in watch mode
- `test`: run unit tests
- `test:watch`: run unit tets in watch mode

All component development is currently done within a Storybook build:

```bash
pnpm dev
```

<br />

## Testing

Run unit tests with coverage report:

```bash
pnpm test
```

Develop unit tests with watcher enabled:

```bash
pnpm test:watch
```
