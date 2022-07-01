# MagLev Elements

### Web Components for MagLev IDE 2.0 and framework agnostic UI Development

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
<mlv-button>button</mlv-button>
```

## Angular

```ts
@NgModule({
  // ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
class AppModule {}
```

## Documentation

Preview these elements and their documentation in Storybook:

```bash
pnpm run storybook
```

View the API Docs on the static index.html:

```bash
pnpm run dev
```
