// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { FormControl, FormControlMetadata, FormControlValue } from '../internal/types.js';
import { FormControlError } from '../internal/errors.js';
import { parseValueSchema } from '../internal/schema.js';
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
 * @event input - Dispatched when the value of the component changes as a result of a user action.
 * @event change - Dispatched when the user modifies and commits the element's value.
 * @event reset - Dispatched when the control state was reset to its initial value.
 * @event invalid - Dispatched when the control is invalid.
 */
export function FormControlMixin<TBase extends Constructor, T extends FormControlValue>(SuperClass: TBase) {
  return class FormControlBase extends SuperClass {
    static formAssociated = true;

    static metadata: FormControlMetadata;

    /** determine if component is in readonly/non-editable state */
    get readOnly(): boolean {
      return this.getAttribute('readonly') !== null;
    }

    set readOnly(value: boolean | unknown) {
      this.toggleAttribute('readonly', value as boolean);
      this._requestUpdate();
    }

    /** determine if component is in disabled state */
    get disabled(): boolean {
      return this.getAttribute('disabled') !== null;
    }

    // unknown forces generation of get/set in type defs see https://github.com/microsoft/TypeScript/issues/58790
    set disabled(value: boolean | unknown) {
      this.toggleAttribute('disabled', value as boolean);
      this._requestUpdate();
    }

    /** determine if the component value requires input */
    get required(): boolean {
      return this.getAttribute('required') !== null;
    }

    set required(value: T | unknown) {
      this.toggleAttribute('required', value as boolean);
      this._requestUpdate();
    }

    /** name associated to parent form */
    get name() {
      return this.getAttribute('name') ?? '';
    }

    set name(value: string) {
      this.setAttribute('name', value);
      this._requestUpdate();
    }

    /** get determine if component is in no validation state */
    get noValidate(): boolean {
      return this.getAttribute('novalidate') !== null || this._formInternals.form?.noValidate === true;
    }

    /** set determine if component is in no validation state */
    set noValidate(value: boolean | unknown) {
      this.toggleAttribute('novalidate', value as boolean);
      this._requestUpdate();
    }

    /** @internal */
    _value: T | undefined;

    /** value state of the component */
    set value(value: T | unknown) {
      this.updateValue(value as T);
      this._requestUpdate();
    }

    get value(): T | undefined {
      return this._value;
    }

    /** @protected */
    updateValue(value: T) {
      const previousValue = this._value;
      this._value = structuredClone(value);
      const valid = this.checkValidity();

      if (!valid && this._metadata.strict) {
        this._value = previousValue;
        console.error('FormControlError: (strict mode)', this.validationMessage);
      }

      this._updateFormState();
    }

    /** associated parent form */
    get form() {
      return this._formInternals.form;
    }

    /** determine if the component is a candidate for constraint checking */
    get willValidate() {
      return this._formInternals.willValidate;
    }

    /** validity state of the component */
    get validity() {
      return this._formInternals.validity;
    }

    /** validation message of the component */
    get validationMessage() {
      return this._formInternals.validationMessage;
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
      if (typeof this._value === 'number' && typeof value === 'number') {
        this.value = value as T;
      } else {
        throw new FormControlError(this.localName, 'cannot set number value on non-number type');
      }
    }

    get type() {
      return this.localName;
    }

    /** @internal */
    get _metadata() {
      return (this.constructor as FormControl).metadata;
    }

    /** @internal */
    _formInternals = this.attachInternals();
    /** @internal */
    _initialValue: T | undefined;

    /** @internal */
    get _validators() {
      return this._metadata.validators ?? [];
    }

    /** @protected */
    get _internals() {
      return this._formInternals;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this._initialValue = this.value;
    }

    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }

      this.tabIndex = 0;
      this._updateFormState();
      // 'input' event composes but 'change' does not https://github.com/whatwg/html/issues/5453
      this.shadowRoot?.addEventListener('input', e => e.stopPropagation());
      this.shadowRoot?.addEventListener('change', e => e.stopPropagation());
    }

    static get observedAttributes() {
      const attrs = super.observedAttributes ?? [];
      return attrs.concat(['value', 'readonly', 'required', 'name', 'novalidate', 'disabled']);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      if (super.attributeChangedCallback) {
        super.attributeChangedCallback(name, oldValue, newValue);
      }

      if (newValue === oldValue) {
        return;
      }

      this._handleAttributeChange(name, newValue);
    }

    /** @internal */
    _handleAttributeChange(name: string, newValue: string) {
      switch (name) {
        case 'value':
          this.value = parseValueSchema<T>(this.localName, newValue, this._metadata.valueSchema);
          if (this._initialValue === undefined) {
            this._initialValue = this.value;
          }
          break;
        case 'readonly':
          this.readOnly = newValue !== null;
          break;
        case 'disabled':
          this.disabled = newValue !== null;
          break;
        case 'required':
          this.required = newValue !== null;
          break;
        case 'name':
          this.name = newValue;
          break;
      }
    }

    /** @protected */
    formResetCallback() {
      this.value = this._initialValue;
      this.checkValidity();
    }

    /** @protected https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/*/
    formStateRestoreCallback(state: T, _reason: string) {
      this.value = state;
      this.checkValidity();
    }

    /** report validity of the component */
    reportValidity() {
      return this._formInternals.reportValidity();
    }

    /** check validity of the component */
    checkValidity() {
      if (this.noValidate) {
        this._formInternals.setValidity({});
      } else {
        for (const validator of this._validators) {
          const result = validator(this.value, this as unknown as FormControl);
          if (!result.validity.valid) {
            this._formInternals.setValidity(
              result.validity,
              result.message,
              (this.shadowRoot?.activeElement as HTMLElement) ?? undefined
            );
            break;
          } else {
            this._formInternals.setValidity({});
          }
        }
      }

      return this._formInternals.checkValidity();
    }

    /** @protected */
    setValidity(validity: Partial<ValidityState>, message?: string) {
      this._formInternals.setValidity(validity, message);
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

    /** @internal */
    _updateFormState() {
      if (this.name) {
        if (typeof this.value === 'number') {
          this._formInternals?.setFormValue(`${this.value}`);
        } else if (isObjectLiteral(this.value)) {
          const formData = new FormData();
          Object.entries(this.value as Record<string, unknown>)
            .filter(([key]) => key !== 'value')
            .forEach(([key, value]) => {
              formData.set(`${this.name}-${key}`, `${value}`);
            });
          this._formInternals?.setFormValue(formData);
        } else if (Array.isArray(this.value)) {
          const formData = new FormData();
          this.value.forEach(i => formData.append(`${this.name}`, i));
          this._formInternals?.setFormValue(formData);
        } else {
          this._formInternals?.setFormValue(this.value as null | string | File);
        }
      }
    }

    /** @internal */
    _requestUpdate() {
      if (this.requestUpdate) {
        this.requestUpdate();
      }
    }
  };
}
