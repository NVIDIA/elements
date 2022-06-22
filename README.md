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
// import and use individual element
import '@elements/elements/button/use.js';

// import specific element references
import { Button } from '@elements/elements';

// import and use all elements
import '@elements/elements';
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
