import { html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { scope } from '@elements/elements/internal';
import { Input } from '@elements/elements/input';
import { Checkbox } from '@elements/elements/checkbox';
import { Password } from '@elements/elements/password';
import { ControlMessage } from '@elements/elements/forms';
import styles from './login.css?inline';

export class DomainLogin extends ScopedRegistryHost(LitElement) {
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

  static elementDefinitions = {
    'mlv-input': scope(Input, ScopedRegistryHost),
    'mlv-password': scope(Password, ScopedRegistryHost),
    'mlv-checkbox': scope(Checkbox, ScopedRegistryHost),
    'mlv-control-message': scope(ControlMessage, ScopedRegistryHost)
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

  render() {
    return html`
      <form>
        <mlv-input>
          <label>Email</label>
          <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" @input=${this.#input} .value=${this.#value.email} />
          <mlv-control-message error="valueMissing">required</mlv-control-message>
          <mlv-control-message error="patternMismatch">invalid NVIDIA email</mlv-control-message>
        </mlv-input>

        <mlv-password>
          <label>Password</label>
          <input type="password" name="password" required @input=${this.#input} .value=${this.#value.password} />
          <mlv-control-message error="valueMissing">required</mlv-control-message>
        </mlv-password>

        <mlv-checkbox>
          <label>remember me</label>
          <input type="checkbox" name="remember" value="on" @change=${this.#change} @input=${this.#input} ?checked=${this.#value.remember} />
        </mlv-checkbox>
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
