# Elements

### The Design Language for AI/ML Factories Building at the Speed of Light

- [Documentation](https://NVIDIA.github.io/elements/)
- [Slack Support](https://nvidia.slack.com/archives/C03BDL2UCGK)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [Gitlab Repo](https://github.com/NVIDIA/elements)
- [Package Artifactory URM](https://registry.npmjs.org
- [Package Artifactory Maglev](ui/packages/npm:%2F%2F@nvidia-elements%2Fcore)

## Getting Started

```bash
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

# install core dependencies
npm install @nvidia-elements/themes @nvidia-elements/core
```

```css
/* import the global CSS into your project */
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
@import '@nvidia-elements/themes/dark.css';
```

```javascript
// Load via JavaScript imports to make available in HTML templates
import '@nvidia-elements/core/button/define.js';
```

```html
<nve-button>hello there</nve-button>
```

## Framework Integrations

- [Angular](https://NVIDIA.github.io/elements/docs/integrations/angular/)
- [Lit](https://NVIDIA.github.io/elements/docs/integrations/lit/)
- [Preact](https://NVIDIA.github.io/elements/docs/integrations/preact/)
- [React](https://NVIDIA.github.io/elements/docs/integrations/react/)
- [TypeScript](https://NVIDIA.github.io/elements/docs/integrations/typescript/)
- [Vue](https://NVIDIA.github.io/elements/docs/integrations/vue/)

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
