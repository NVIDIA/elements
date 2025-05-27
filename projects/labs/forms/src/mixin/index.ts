import type { FormControl, FormControlMetadata, FormControlValue, Validator } from '../internal/types.js';
import { FormControlError } from '../internal/errors.js';
import { parseValueSchema, valueSchemaValidator } from '../internal/schema.js';
import { isObjectLiteral } from '../internal/utils.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = (new (...args: any[]) => HTMLElement & {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  attributeChangedCallback?(name: string, oldValue: string | null, newValue: string | null): void;
  requestUpdate?(name?: string, oldValue?: unknown): void;
}) & {
  observedAttributes?: string[];
};

/**
 * @description A mixin that adds form control functionality to a component.
 * @event input - Emitted when the value of the component changes as a result of a user action.
 * @event change - Emitted when the user modifies and commits the element's value.
 * @event reset - Emitted when the control state was reset to its initial value.
 * @event invalid - Emitted when the control is invalid.
 */
export function FormControlMixin<TBase extends Constructor, T extends FormControlValue>(Base: TBase) {
  return class FormControlBase extends Base {
    static formAssociated = true;

    static metadata: FormControlMetadata;

    /** determine if component is in readonly/non-editable state */
    get readonly() {
      return this.getAttribute('readonly') !== null;
    }

    set readonly(value: boolean) {
      this.toggleAttribute('readonly', value);
      this.#requestUpdate();
    }

    /** determine if component is in disabled state */
    get disabled() {
      return this.getAttribute('disabled') !== null;
    }

    set disabled(value: boolean) {
      this.toggleAttribute('disabled', value);
      this.#requestUpdate();
    }

    /** name associated to parent form */
    get name() {
      return this.getAttribute('name') ?? '';
    }

    set name(value: string) {
      this.setAttribute('name', value);
      this.#requestUpdate();
    }

    /** determine if component is in no validation state */
    get noValidate() {
      return this.getAttribute('novalidate') !== null || this.#internals.form?.noValidate === true;
    }

    set noValidate(value: boolean) {
      this.toggleAttribute('novalidate', value);
      this.#requestUpdate();
    }

    #value: T | undefined;

    /** value state of the component */
    set value(value: T) {
      this.updateValue(value);
      this.#requestUpdate();
    }

    get value(): T | undefined {
      return this.#value;
    }

    /** @protected */
    updateValue(value: T) {
      const previousValue = this.#value;
      this.#value = structuredClone(value);
      const valid = this.checkValidity();

      if (!valid && this.#metadata.strict) {
        this.#value = previousValue;
        console.error('FormControlError: (strict mode)', this.validationMessage);
      }

      this.#updateFormState();
    }

    /** associated parent form */
    get form() {
      return this.#internals.form;
    }

    /** determine if component will validate */
    get willValidate() {
      return this.#internals.willValidate;
    }

    /** validity state of the component */
    get validity() {
      return this.#internals.validity;
    }

    /** validation message of the component */
    get validationMessage() {
      return this.#internals.validationMessage;
    }

    /** stringified value of the component */
    get valueAsString() {
      return JSON.stringify(this.value);
    }

    /** parsed number value of the component */
    get valueAsNumber(): number {
      return Number(this.valueAsString);
    }

    set valueAsNumber(value: number) {
      if (typeof this.#value === 'number' && typeof value === 'number') {
        this.value = value as T;
      } else {
        throw new FormControlError(this.localName, 'cannot set number value on non-number type');
      }
    }

    get type() {
      return this.localName;
    }

    get #metadata() {
      return (this.constructor as FormControl).metadata;
    }

    #internals = this.attachInternals();
    #initialValue: T | undefined;

    get #validators() {
      const validators: Validator[] = [];

      if (this.#metadata.valueSchema.validate !== false) {
        validators.push(valueSchemaValidator);
      }

      if (Array.isArray(this.#metadata.validators)) {
        validators.push(...this.#metadata.validators);
      }

      return validators;
    }

    /** @protected */
    get _internals() {
      return this.#internals;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.#initialValue = this.value;
    }

    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }

      this.tabIndex = 0;
      this.#updateFormState();
      // 'input' event is composed but not 'change' https://github.com/whatwg/html/issues/5453
      this.shadowRoot?.addEventListener('input', e => e.stopPropagation());
      this.shadowRoot?.addEventListener('change', e => e.stopPropagation());
    }

    static get observedAttributes() {
      const attrs = super.observedAttributes ?? [];
      return attrs.concat(['value', 'readonly', 'name', 'novalidate', 'disabled']);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      if (super.attributeChangedCallback) {
        super.attributeChangedCallback(name, oldValue, newValue);
      }

      if (name === 'value' && newValue !== oldValue) {
        this.value = parseValueSchema<T>(this.localName, newValue, this.#metadata.valueSchema);

        if (this.#initialValue === undefined) {
          this.#initialValue = this.value;
        }
      }

      if (name === 'readonly' && newValue !== oldValue) {
        this.readonly = newValue !== null;
      }

      if (name === 'disabled' && newValue !== oldValue) {
        this.disabled = newValue !== null;
      }

      if (name === 'name' && newValue !== oldValue) {
        this.name = newValue;
      }
    }

    /** @protected */
    formResetCallback() {
      this.value = this.#initialValue;
      this.checkValidity();
    }

    /** @protected https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/*/
    formStateRestoreCallback(state: T, _reason: string) {
      this.value = state;
      this.checkValidity();
    }

    /** report validity of the component */
    reportValidity() {
      return this.#internals.reportValidity();
    }

    /** check validity of the component */
    checkValidity() {
      for (const validator of this.#validators) {
        const result = validator(this.value, this as unknown as FormControl);
        if (!result.validity.valid) {
          this.#internals.setValidity(
            result.validity,
            result.message,
            (this.shadowRoot?.activeElement as HTMLElement) ?? undefined
          );
          break;
        } else {
          this.#internals.setValidity({});
        }
      }

      return this.#internals.checkValidity();
    }

    /** @protected */
    setValidity(validity: Partial<ValidityState>, message?: string) {
      this.#internals.setValidity(validity, message);
    }

    /** @protected */
    dispatchInputEvent() {
      this.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: this.valueAsString }));
    }

    /** @protected */
    dispatchChangeEvent() {
      this.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }

    /** @protected */
    dispatchUpdateEvent(type: 'input' | 'change') {
      if (type === 'input') {
        this.dispatchInputEvent();
      } else if (type === 'change') {
        this.dispatchChangeEvent();
      }
    }

    #updateFormState() {
      if (this.name) {
        if (typeof this.value === 'number') {
          this.#internals?.setFormValue(`${this.value}`);
        } else if (isObjectLiteral(this.value)) {
          const formData = new FormData();
          Object.entries(this.value)
            .filter(([key]) => key !== 'value')
            .forEach(([key, value]) => {
              formData.set(`${this.name}-${key}`, `${value}`);
            });
          this.#internals?.setFormValue(formData);
        } else if (Array.isArray(this.value)) {
          const formData = new FormData();
          this.value.forEach(i => formData.append(`${this.name}`, i));
          this.#internals?.setFormValue(formData);
        } else {
          this.#internals?.setFormValue(this.value as null | string | File);
        }
      }
    }

    #requestUpdate() {
      if (this.requestUpdate) {
        this.requestUpdate();
      }
    }
  };
}
