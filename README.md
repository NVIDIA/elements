# MagLev Elements

### Web Components for MagLev UI Apps and framework agnostic UI Development

## View the docs on the deployed <a href="https://elements.nvidia.com/ui/storybook/elements">Storybook</a> page.

<br /><br />


## Getting Started

```bash
pnpm i --save @elements/elements
```

<br />


## Usage

```ts
// import and use individual elements (recommended)
import '@elements/elements/button/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/icon/define.js';

// import specific element type references
import { Button } from '@elements/elements';

// import all elements (not recommended)
import '@elements/elements';

// optional (polyfills for non-chromium browsers)
import '@elements/elements/polyfills';
```

```html
<nve-button>button</nve-button>
```

<br />

## Angular

```ts
@NgModule({
  // ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
class AppModule {}
```

<br />


## Development

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
pnpm build
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

_Copy build artifact:_ `src/ui/platform/libs/elements/dist/index.css`
_Paste and rename as:_ `src/ui/platform/apps/home/src/elements.css`