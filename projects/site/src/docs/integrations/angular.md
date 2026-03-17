---
{
  title: 'Angular',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'angular' %}

{% installation 'angular' %}

To use Elements in your [Angular](https://angular.dev/) components, add `CUSTOM_ELEMENTS_SCHEMA` to the schemas to allow Web Components within your template.

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

Properties and events then work via the standard Angular template syntax.

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

<nve-alert>To integrate custom form control types into Elements checkout the <a nve-text="link" href="./docs/elements/forms/controls/#custom-controls" onClick="location.reload()">custom control</a> documentation.</nve-alert>

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

## Advanced - Import CSS Source

[Lit](https://lit.dev) as a standard TypeScript based library works out of the box when imported and used within an Angular application source code.
This enables you to author Lit based Web Components directly within your Angular application without requiring a standalone library/project.
If you are authoring Lit based components and would like to import external CSS files (like [Vite Inlined Imports](https://vitejs.dev/guide/features.html#disabling-css-injection-into-the-page)) you need extra Angular CLI configuration.

<nve-alert status="accent">Imports like Webpack !raw-loader and Vite ?inline are not Web standard and are likely to migrate in the future to <a nve-text="link" href="https://web.dev/css-module-scripts/">Import Assertions</a></nve-alert>

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
