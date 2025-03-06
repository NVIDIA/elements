import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { attachInternals } from '../utils/a11y.js';
import { I18nController } from '../controllers/i18n.controller.js';
import { isObjectLiteral } from '../utils/objects.js';

export type FormControlValue = string | number | File | File[] | null | {};

export class BaseFormAssociatedElement<T extends FormControlValue> extends LitElement {
  static formAssociated = true;

  #value: T;

  @property({ type: Object })
  get value(): T {
    return this.#value;
  }

  set value(value: T) {
    this.#value = value;
    this.setFormValue();
  }

  set valueAsNumber(value: number) {
    if (typeof this.#value === 'number' && typeof value === 'number') {
      this.#value = value as T;
      this.setFormValue();
    } else {
      throw new Error('Cannot set number value on non-number type');
    }
  }

  get valueAsNumber(): number {
    if (typeof this.#value === 'number') {
      return this.#value;
    } else {
      throw new Error(`value is not a parseable number type`);
    }
  }

  protected setFormValue() {
    if (typeof this.value === 'number') {
      this._internals?.setFormValue(`${this.value}`);
    } else if (isObjectLiteral(this.value)) {
      const formData = new FormData();
      Object.entries(this.value)
        .filter(([key]) => key !== 'value')
        .forEach(([key, value]) => {
          formData.set(`${this.name}-${key}`, `${value}`);
        });
      this._internals?.setFormValue(formData);
    } else if (Array.isArray(this.value)) {
      const formData = new FormData();
      this.value.forEach(i => {
        formData.append(`${this.name}-${i.name}`, i);
      });
      this._internals?.setFormValue(formData);
    } else {
      this._internals?.setFormValue(this.value as null | string | File);
    }
  }

  /**
   * Determines the form associated name.
   */
  @property({ type: String, reflect: true }) name = '';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /** @private */
  declare _internals: ElementInternals;

  get willValidate() {
    return this._internals.willValidate;
  }

  get validity() {
    return this._internals.validity;
  }

  get validationMessage() {
    return this._internals.validationMessage;
  }

  get form() {
    return this._internals.form;
  }

  get type() {
    return this.localName;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this.setFormValue();
  }

  firstUpdated(props: PropertyValues) {
    super.firstUpdated(props);
    // 'input' event is composed but not 'change' https://github.com/whatwg/html/issues/5453
    this.shadowRoot?.addEventListener('input', e => e.stopPropagation());
    this.shadowRoot?.addEventListener('change', e => e.stopPropagation());
  }

  checkValidity() {
    return this._internals.checkValidity();
  }

  reportValidity() {
    return this._internals.reportValidity();
  }

  protected dispatchInputEvent() {
    const data = typeof this.#value === 'string' ? this.#value : JSON.stringify(this.#value);
    this.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data }));
  }

  protected dispatchChangeEvent() {
    this.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  }
}
