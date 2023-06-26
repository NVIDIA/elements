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

### Version

Bump the `version` field in `package.json` following semantic versioning conventions and ideally adhering to our release cadence.
We currently aim for one minor version release at the end of each month and additional patch versions for bug fixes.

```json
{
  "name": "@elements/elements",
  "version": "0.5.0",
  ...
}
```

Update the changelog in storybook to reflect the latest version and release notes. `docs/changelog.stories.mdx`

### Build

Validate a proper build and verify expected component APIs and demos by running local Storybook:

```bash
pnpm i
pnpm dev
```

Test storybook make sure everything looks good, then run a local build:

```bash
pnpm ci:nocache
```

### Publish

Validate expected artifacts in `/dist` folder, then run a dry publish and validate contents and package size that will be uploaded to artifactory:

```bash
pnpm publish --dry-run
```

Finally, run that actual deploy of the new version and verify contents on <a href="https://artifactory.build.nvidia.com/ui/repos/tree/General/elements-ui-npm/@elements/elements/-/@elements">artifactory</a>:


```bash
pnpm publish
```

### UI Platform Dependencies

After publishing the UI platform (IDE) dependencies can be updated.

```
src/ui/platform/apps/home/package.json
src/ui/platform/libs/feedback-elements/package.json
src/ui/platform/libs/components/package.json
src/ui/platform/libs/ide/package.json
src/ui/platform/libs/ide-shell/package.json
src/ui/platform/plugins/apps-and-services/package.json
src/ui/platform/shared/elements/package.json
```

Example Release Commit: https://git-av.nvidia.com/r/c/elements/+/120980