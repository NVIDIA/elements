# MagLev Elements
### Web Components for MagLev IDE 2.0 and framework agnostic UI Development
<br /><br />

## Getting Started
```bash
npm i --save @elements/elements
```
<br />

## Usage

```ts
// import specific elements
import { Button } from '@elements/elements'

// import all elements
import * as mlvElements from '@elements/elements'

// Angular Startup
@NgModule({
  // ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class MyModule {}

// *.html
<mlv-button [label]="My Button">
```
<br />

## Documentation

Preview these elements and their documentation in Storybook:

```bash
npm run storybook
```

View the API Docs on the static index.html:

```bash
npm run dev
```