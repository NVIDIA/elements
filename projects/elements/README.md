# MagLev Elements

### Web Components for MagLev UI Apps and framework agnostic UI Development

- [Documentation](https://elements-stage.nvidia.com/ui/storybook/elements)
- [Slack Support](https://nvidia.slack.com/archives/C03BDL2UCGK)
- [Changelog](https://elements-stage.nvidia.com/ui/storybook/elements?path=/story/about-changelog--page)
- [Package](ui/packages/npm:%2F%2F@elements%2Felements)

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
<mlv-button>button</mlv-button>
```

## Framework Integrations
- [Angular](https://elements-stage.nvidia.com/ui/storybook/elements?path=/story/integrations-angular--page)
- [Lit](https://elements-stage.nvidia.com/ui/storybook/elements?path=/story/integrations-lit--page)
- [Preact](https://elements-stage.nvidia.com/ui/storybook/elements?path=/story/integrations-preact--page)
- [React](https://elements-stage.nvidia.com/ui/storybook/elements?path=/story/integrations-react--page)
- [TypeScript](https://elements-stage.nvidia.com/ui/storybook/elements?path=/story/integrations-typescript--page)
- [Vue](https://elements-stage.nvidia.com/ui/storybook/elements?path=/story/integrations-vue--page)


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


## Deploying

Bump the `version` field in `package.json` following semantic versioning conventions and ideally adhering to our release cadence.
We currently aim for one minor version release at the end of each month and additional patch versions for bug fixes.

```json
{
  "name": "@elements/elements",
  "version": "0.5.0",
  ...
}
```

First validate a proper build and verify expected component APIs and demos by running local Storybook:

```bash
pnpm i
pnpm dev
```

Test storybook make sure everything looks good, then run a local build:

```bash
pnpm ci
```

Validate expected artifacts in `/dist` folder, then run a dry publish and validate contents and package size that will be uploaded to artifactory:

```bash
pnpm publish --dry-run
```

Finally, run that actual deploy of the new version and verify contents on <a href="https://artifactory.build.nvidia.com/ui/repos/tree/General/elements-ui-npm/@elements/elements/-/@elements">artifactory</a>:


```bash
pnpm publish
```

#### Duplicate the CSS assets
Note! It is also required that we manually clone `dist/index.css` and duplicate this over to the IDE as a `apps/home/src/elements.css` file. This deploy step should not be needed in the future when a `package.json` is added to the `home` app (it will then be automatically be pulled from the node_modules of specified install version in the IDE home app).

_Copy build artifact:_ `src/ui/platform/design-system/elements/dist/index.css`
_Paste and rename as:_ `src/ui/platform/apps/home/src/elements.css`