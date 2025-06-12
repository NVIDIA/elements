---
{
  title: 'Angular Integration',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% svg-logos 'angular' %}

<div nve-layout="row gap:xs">
  <nve-button>
    <svg width="18" height="18"><use href="#angular-svg"></use></svg>
    <a target="_blank" href="{{ playground.angularPlaygroundURL }}">Playground</a>
  </nve-button>

  <nve-button>
    <nve-icon name="browser"></nve-icon>
    <a target="_blank" href="https://NVIDIA.github.io/elements/starters/angular/"> Demo</a>
  </nve-button>

  <nve-button>
    <nve-icon name="download" size="sm"></nve-icon>
    <a target="_blank" href="https://NVIDIA.github.io/elements/starters/download/angular.zip">Download</a>
  </nve-button>

  <nve-button>
    <nve-icon name="code"></nve-icon>
    <a target="_blank" href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/angular">Source</a>
  </nve-button>
</div>

To use Elements in [Angular](https://angular.dev/) follow the [installation getting started](./docs/about/getting-started/) steps.

Next import the element your Angular component and add `CUSTOM_ELEMENTS_SCHEMA` to the schemas to allow web components to be used within your template.

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import '@nvidia-elements/core/alert/define.js';

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent { }
```

Once added, properties and events can be used via the standard Angular template syntax.

```html
<!--
  - [attr.hidden] - HTML Boolean attribute
  - status - HTML attribute
  - [closable] - can update via attributes or JavaScript property binding
  - (close) - event listener binding for 'close' custom event
-->

<nve-alert-group status="success" [attr.hidden]="!showAlert">
  <nve-alert [closable]="true" (close)="showAlert = false">hello there!</nve-alert>
</nve-alert-group>
```

## Forms

Elements provides a suite of form components that leverage standard HTML input types. This enables frameworks to take advantage of built in framework features like [Angular Reactive Forms](https://angular.io/guide/reactive-forms) for managing form validation and state.

<nve-alert>To integrate custom form control types into Elements checkout our <a nve-text="link" href="./docs/foundations/forms/controls/#custom-controls" onClick="location.reload()">custom control</a> documentation.</nve-alert>

```html
<form [formGroup]="form" (ngSubmit)="submit()">
  <nve-input>
    <label>first name</label>
    <input type="text" formControlName="firstName" />
    <nve-control-message *ngIf="form.controls.firstName.invalid && (form.controls.firstName.dirty || form.controls.firstName.touched)">required</nve-control-message>
  </nve-input>
  <button>submit</button>
</form>
```

```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required]
    });
  }

  submit() {
    this.form.controls.custom.markAsTouched();
    console.log(this.form.value);
  }
}
```

## Legacy Installations

### Angular 12

<nve-alert-group status="danger">
  <nve-alert>Angular 12 is past its support lifecycle and will not receive security updates. Applications should migrate as soon as possible to the <a nve-text="link" href="https://angular.dev/update">latest release</a>.</nve-alert>
</nve-alert-group>

Angular 12 is not officially supported due to its older dependencies (ESBuild, Webpack) not supporting browser standard JavaScript (es2020) and CSS features.
To use elements in Angular 12 when upgrading is not possible, the [static import bundles](https://github.com/NVIDIA/elements/-/tree/main/projects/starters/static?ref_type=heads) can be copied into the Angular CLI assets and referenced.

<nve-alert status="warning">Static bundles are strongly discouraged as it will include all component code and not support any performance optimizations
such as tree-shaking.</nve-alert>

```json
"assets": [
  "@nvidia-elements/core/bundles/elements.0.30.0.bundle.css",
  "@nvidia-elements/core/bundles/elements.0.30.0.bundle.js"
]
```

```html
<!doctype html>
<html lang="en" nve-theme="dark">
  <head>
    <link rel="stylesheet" href="assets/elements.0.30.0.bundle.css" />
  </head>
  <body nve-layout="column gap:md pad:lg">
    <nve-alert>hello there</nve-alert>
    <script type="module" src="/assets/elements.0.30.0.bundle.js"></script>
  </body>
</html>
```

### Styles

If you don't have a global `styles.scss` add one to your app's `angular.json` config.

```json
/*
 * ./angular.json
 * projects.appName.architect.build.options.styles:
 */
"styles": [
  "./src/styles.scss"
],
```

```css
/* ./styles.css */
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/styles/layout.css';
@import '@nvidia-elements/styles/typography.css';
```

### TypeScript

If you are not on typescript >= version `4.5.x` you will need to add this type declaration to use isolated element imports:

```typescript
/* ./src/declarations.d.ts */

interface ElementInternals {
  any: any;
}
```

If you are using [tsconfig path mapping](https://www.typescriptlang.org/tsconfig#paths) likely you will need to enable the [skipLibCheck](https://www.typescriptlang.org/tsconfig#skipLibCheck) to avoid type definition collisions within the monorepo. Alternatively, to avoid `skipLibCheck` use `npm` workspaces instead of tsconfig path mapping.

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

## Advanced - Import CSS Source

[Lit](https://lit.dev) as a standard TypeScript based library works mostly out of the box when imported and used within an Angular application source code.
This enables Lit based Web Components to be authored directly within your Angular application but not require a standalone library/project.
If you are authoring Lit based components and would like to import external CSS files (similar to [Vite Inlined Imports](https://vitejs.dev/guide/features.html#disabling-css-injection-into-the-page)) additonal Angular CLI configuration is needed.

<nve-alert status="accent">Imports like Webpack !raw-loader and Vite ?inline are not Web standard and likely to be migrated in the future to <a nve-text="link" href="https://web.dev/css-module-scripts/">Import Assertions</a></nve-alert>

### 1. Install

```shell
npm install raw-loader
```

### 2. Update tsconfig.json

```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
  }
}
```

### 3. Update Types

```typescript
// declarations.d.ts
declare module 'raw-loader!*.css' {
  const content: string;
  export = content;
}
```

### 4. Import Styles

```typescript
import { unsafeCSS } from 'lit';
import typography from 'raw-loader!node_modules/@nvidia-elements/core/css/module.typography.css';
import layout from 'raw-loader!node_modules/@nvidia-elements/core/css/module.layout.css';

// Lit Component
static override styles = [
  css`${unsafeCSS(typography)}`,
  css`${unsafeCSS(layout)}`
];
```
