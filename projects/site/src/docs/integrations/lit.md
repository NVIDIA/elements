---
{
  title: 'Lit Integration',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

To use Elements in Lit follow the [installation](./api/?path=/docs/about-installation--docs) steps. Once complete
elements can be imported and used within Lit components.

```typescript
import '@nvidia-elements/core/alert-group/define.js';
```

Once added, properties and events can be used via the standard lit template syntax.

```typescript
// - ?hidden - HTML Boolean attribute
// - status - HTML attribute
// - .closable - can update via attributes or JavaScript property binding
// - @close - event listener binding for 'close' custom event
```

```html
  <nve-alert-group status="success" ?hidden=${!showAlert}>
    <nve-alert .closable=${true} @close=${() => showAlert = false}">hello there!</nve-alert>
  </nve-alert-group>
```

## CSS Utilities

Elements provides [layout](/api/?path=/docs/foundations-layout-documentation--docs) and [typography](/api/?path=/docs/foundations-typography-documentation--docs) utilities to make it easy to style your UI.
These utilities are global CSS attributes that can be applied to any element. To
use these utilities within a Lit element, you need to import the styles, so they
are available in your elements Shadow DOM.

<nve-alert status="accent">
  Import the needed style files via CSS or Typescript:
</nve-alert>

```typescript
/* Import CSS attributes via Typescript */
import { html, unsafeCSS, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';

// https://github.com/tc39/proposal-import-attributes
import typography from '@nvidia-elements/styles/dist/typography.css' with { type: 'css' };
import layout from '@nvidia-elements/styles/dist/layout.css' with { type: 'css' };

@customElement('my-element')
class MyElement extends LitElement {

  static styles = [typography, layout];

  render() {
    return html`
      <div nve-layout="column gap:lg">
        <p nve-text="display">display</p>
        <p nve-text="heading">heading</p>
        <p nve-text="body">body</p>
        <p nve-text="label">label</p>
        <p nve-text="eyebrow">eyebrow</p>
      </div>
    `;
  }
}
```

```css
/* Import CSS attributes via CSS */
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';
```

## Forms

When using Elements in forms with Lit components you can leverage the [HTML FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData) to
manage form state and validation.

<app-login></app-login>

Events can be attached to the form element to capture `submit` and `input` events.
Using `FormData` the `name` of the input is referenced as the key for our form values.

```typescript
@customElement('app-login')
export class AppLogin extends LitElement {
  @query('form') form: HTMLFormElement;

  @state() formValues = { email: '', password: '', remember: false };

  render() {
    return html`
    <form @submit=${e => this.#submit(e)} @input=${this.#input}>
      <nve-input>
        <label>Email</label>
        <input .value=${this.formValues.email} type="email" name="email" autocomplete="off" pattern=".+@nvidia.com" required autocomplete="off" />
        <nve-control-message error="valueMissing">required</nve-control-message>
        <nve-control-message error="patternMismatch">invalid NVIDIA email</nve-control-message>
      </nve-input>

      <nve-password>
        <label>Password</label>
        <input .value=${this.formValues.password} type="password" name="password" minlength="6" required />
        <nve-control-message error="valueMissing">required</nve-control-message>
        <nve-control-message error="tooShort">minimum length is 6 characters</nve-control-message>
      </nve-password>

      <nve-checkbox>
        <label>Remember me</label>
        <input ?checked=${this.formValues.remember} type="checkbox" name="remember" />
      </nve-checkbox>

      <nve-button interaction="emphasis">Login</nve-button>
    </form>
    `;
  }

  #input() {
    this.formValues = Object.fromEntries(new FormData(this.form)) as any;
  }

  #submit(e) {
    e.preventDefault();
    if (this.form.reportValidity()) {
      console.log(this.formValues)
    }
  }
}
```
