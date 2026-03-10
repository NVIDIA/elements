import { html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Input } from '@nvidia-elements/core/input';
import { Checkbox } from '@nvidia-elements/core/checkbox';
import { Password } from '@nvidia-elements/core/password';
import { ControlMessage } from '@nvidia-elements/core/forms';
import styles from './login.css?inline';

const libraryRegistry =
  globalThis.CustomElementRegistry && 'initialize' in CustomElementRegistry.prototype
    ? new CustomElementRegistry()
    : customElements;

export class DomainLogin extends LitElement {
  @property({ type: String }) value = `{ "email": "", "password": "" }`;

  get form() {
    return this.#internals.form;
  }

  get name() {
    return this.getAttribute('name');
  }

  get type() {
    return this.localName;
  }

  get validity() {
    return this.#internals.validity;
  }

  get validationMessage() {
    return this.#internals.validationMessage;
  }

  get willValidate() {
    return this.#internals.willValidate;
  }

  static styles = [unsafeCSS(styles)];

  static formAssociated = true;

  get #value() {
    return JSON.parse(this.value);
  }

  get #form() {
    return this.shadowRoot?.querySelector<HTMLFormElement>('form') as HTMLFormElement;
  }

  #internals = this.attachInternals();

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    customElementRegistry: libraryRegistry
  };

  constructor() {
    super();
    libraryRegistry.get('domain-login') || libraryRegistry.define('domain-login', DomainLogin);
    libraryRegistry.get('nve-input') || libraryRegistry.define('nve-input', Input);
    libraryRegistry.get('nve-checkbox') || libraryRegistry.define('nve-checkbox', Checkbox);
    libraryRegistry.get('nve-password') || libraryRegistry.define('nve-password', Password);
    libraryRegistry.get('nve-control-message') || libraryRegistry.define('nve-control-message', ControlMessage);
  }

  render() {
    return html`
      <form>
        <nve-input>
          <label>Email</label>
          <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" @input=${this.#input} .value=${this.#value.email} />
          <nve-control-message error="valueMissing">required</nve-control-message>
          <nve-control-message error="patternMismatch">invalid NVIDIA email</nve-control-message>
        </nve-input>

        <nve-password>
          <label>Password</label>
          <input type="password" name="password" required @input=${this.#input} .value=${this.#value.password} />
          <nve-control-message error="valueMissing">required</nve-control-message>
        </nve-password>

        <nve-checkbox>
          <label>remember me</label>
          <input type="checkbox" name="remember" value="on" @change=${this.#change} @input=${this.#input} ?checked=${this.#value.remember} />
        </nve-checkbox>
      </form>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();
    this.tabIndex = 0;
    this.#internals.setFormValue(this.value);
    await this.updateComplete;
    this.checkValidity();
  }

  checkValidity() {
    const validation = Array.from(this.#form.elements)
      .flatMap((e: any) => e.validity)
      .reduce((p, validity) => {
        const keys = p;
        for (const key in validity) {
          if (validity[key]) {
            keys[key] = true;
          }
        }
        return keys;
      }, {});
    this.#internals.setValidity(validation, 'invalid login');
    this.#internals.checkValidity();
  }

  reportValidity() {
    this.#internals.reportValidity();
  }

  #input(e: Event) {
    this.#update(e);
    this.dispatchEvent(new Event('input', { bubbles: true }));
  }

  #change(e: Event) {
    this.#update(e);
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  #update(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const values = Object.fromEntries(new FormData(this.#form) as any);
    this.value = JSON.stringify(values);
    this.#internals.setFormValue(this.value);
    this.checkValidity();
  }
}
