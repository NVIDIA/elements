# MagLev Elements

### The Design Language for AI/ML Factories Building at the Speed of Light

- [Documentation](https://elements.nvidia.com/ui/storybook/elements?path=/docs/about-getting-started--docs)
- [Slack Support](https://nvidia.slack.com/archives/C03BDL2UCGK)
- [Changelog](https://elements.nvidia.com/ui/storybook/elements?path=/docs/about-changelog--docs)
- [Package Maglev](ui/packages/npm:%2F%2F@elements%2Felements)

## Getting Started

```bash
# add internal registry to local .npmrc file (optional)
@elements/elements:registry=https://artifactory.build.nvidia.com/artifactory/api/npm/elements-npm/

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
<nve-button>button</nve-button>
```

## Framework Integrations
- [Angular](https://elements.nvidia.com/ui/storybook/elements?path=/docs/integrations-angular--docs)
- [Lit](https://elements.nvidia.com/ui/storybook/elements?path=/docs/integrations-lit--docs)
- [Preact](https://elements.nvidia.com/ui/storybook/elements?path=/docs/integrations-preact--docs)
- [React](https://elements.nvidia.com/ui/storybook/elements?path=/docs/integrations-react--docs)
- [TypeScript](https://elements.nvidia.com/ui/storybook/elements?path=/docs/integrations-typescript--docs)
- [Vue](https://elements.nvidia.com/ui/storybook/elements?path=/docs/integrations-Vue--docs)


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
