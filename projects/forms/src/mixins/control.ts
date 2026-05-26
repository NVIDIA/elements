// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { FormControl, FormControlMetadata, FormControlValue, ValidatorResult } from '../internal/types.js';
import { FormControlError } from '../internal/errors.js';
import { parseValueSchema } from '../internal/schema.js';
import { attachInternals, isObjectLiteral, toggleState } from '../internal/utils.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = (new (...args: any[]) => HTMLElement & {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  attributeChangedCallback?(name: string, oldValue: string | null, newValue: string | null): void;
  requestUpdate?(name?: string, oldValue?: unknown): void;
}) & {
  observedAttributes?: string[];
};

export interface FormControlMixinInstance<T extends FormControlValue> {
  /**
   * The initial value used when the parent form resets.
   */
  defaultValue: string;

  /**
   * Prevents the user from changing the control value.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly
   * @attr readonly
   * @reflect
   */
  readOnly: boolean;

  /**
   * Prevents the user from interacting with the control.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
   * @attr disabled
   * @reflect
   */
  disabled: boolean;

  /**
   * Requires a value before the parent form can submit.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/required
   * @attr required
   * @reflect
   */
  required: boolean;

  /**
   * Defines the pattern that text values must match.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern
   * @attr pattern
   * @reflect
   */
  pattern: string;

  /**
   * Defines the minimum numeric value.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/min
   * @attr min
   * @reflect
   */
  min: number | null;

  /**
   * Defines the maximum numeric value.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/max
   * @attr max
   * @reflect
   */
  max: number | null;

  /**
   * Defines the value granularity for numeric inputs.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/step
   * @attr step
   * @reflect
   */
  step: number | null;

  /**
   * Defines the minimum text length.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/minlength
   * @attr minlength
   * @reflect
   */
  minLength: number;

  /**
   * Defines the maximum text length.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/maxlength
   * @attr maxlength
   * @reflect
   */
  maxLength: number;

  /**
   * The name submitted with the control value as part of the form data.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/name
   * @attr name
   * @reflect
   */
  name: string;

  /**
   * Disables constraint validation for this control.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/novalidate
   * @attr novalidate
   * @reflect
   */
  noValidate: boolean;

  /**
   * The current form control value.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/value
   * @attr value
   * @reflect
   */
  value: T | undefined;

  /**
   * The form associated with the control.
   * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/form
   */
  form: HTMLFormElement | null;

  /**
   * Indicates whether the control participates in constraint validation.
   * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/willValidate
   */
  willValidate: boolean;

  /**
   * The control validity state.
   * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/validity
   */
  validity: ValidityState;

  /**
   * The validation message shown when the control is invalid.
   * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/validationMessage
   */
  validationMessage: string;

  /**
   * The current value serialized as a string.
   */
  valueAsString: string;

  /**
   * The current value parsed as a number.
   */
  valueAsNumber: number;

  /**
   * The control type.
   */
  type: string;

  /**
   * Labels associated with the control.
   * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/labels
   */
  labels: NodeList;

  /**
   * Text content from labels associated with the control.
   */
  composedLabel: string;

  _metadata: FormControlMetadata;
  _initialValue: T | undefined;
  _validators: NonNullable<FormControlMetadata['validators']>;
  _internals: ElementInternals;
  updateValue(value: T): void;
  _stopInternalPropagation(event: Event): void;
  _handleAttributeChange(name: string, newValue: string | null): void;
  formResetCallback(): void;
  formDisabledCallback(disabled: boolean): void;
  formStateRestoreCallback(state: T, reason: string): void;

  /**
   * Reports whether the control satisfies its constraints.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/reportValidity
   */
  reportValidity(): boolean;

  /**
   * Checks whether the control satisfies its constraints.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checkValidity
   */
  checkValidity(): boolean;
  setValidity(validity: Partial<ValidityState>, message?: string): void;

  /**
   * Sets a custom validation message.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setCustomValidity
   */
  setCustomValidity(message: string): void;

  /**
   * Resets the control value to its initial value.
   */
  reset(): void;
  dispatchInputEvent(): void;
  dispatchChangeEvent(): void;
  dispatchUpdateEvent(type: 'input' | 'change'): void;
  _updateFormState(): void;
  _requestUpdate(): void;
}

export type FormControlMixinReturn<TBase extends Constructor, T extends FormControlValue> = (new (
  ...args: ConstructorParameters<TBase>
) => InstanceType<TBase> & FormControlMixinInstance<T>) & {
  formAssociated: boolean;
  metadata: FormControlMetadata;
  observedAttributes: string[];
} & Omit<TBase, 'prototype'>;

/**
 * @description A mixin that adds form control functionality to a component.
 * @event input - Dispatched when the value of the component changes as a result of a user action.
 * @event change - Dispatched when the user modifies and commits the element's value.
 * @event reset - Dispatched when the control state was reset to its initial value.
 * @event invalid - Dispatched when the control is invalid.
 */
export function FormControlMixin<TBase extends Constructor, T extends FormControlValue>(
  SuperClass: TBase
): FormControlMixinReturn<TBase, T> {
  return class FormControlBase extends SuperClass {
    static formAssociated = true;

    static metadata: FormControlMetadata;

    #customValidityMessage = '';

    #hasInitialValue = false;

    get defaultValue(): string {
      return this.getAttribute('value') ?? '';
    }

    set defaultValue(value: string) {
      this.setAttribute('value', value);
    }

    /** determine if component is in readonly/non-editable state */
    get readOnly(): boolean {
      return this.getAttribute('readonly') !== null;
    }

    set readOnly(value: boolean | unknown) {
      attachInternals(this);
      this.toggleAttribute('readonly', value as boolean);
      toggleState(this._internals, 'readonly', Boolean(value));
      this._requestUpdate();
    }

    /** determine if component is in disabled state */
    get disabled(): boolean {
      return this.getAttribute('disabled') !== null;
    }

    // unknown forces generation of get/set in type defs see https://github.com/microsoft/TypeScript/issues/58790
    set disabled(value: boolean | unknown) {
      attachInternals(this);
      this.toggleAttribute('disabled', value as boolean);
      this._internals.ariaDisabled = value ? 'true' : 'false';
      toggleState(this._internals, 'disabled', Boolean(value));
      this._requestUpdate();
    }

    /** determine if the component value requires input */
    get required(): boolean {
      return this.getAttribute('required') !== null;
    }

    set required(value: boolean | unknown) {
      this.toggleAttribute('required', value as boolean);
      toggleState(this._internals, 'required', Boolean(value));
      this.checkValidity();
      this._requestUpdate();
    }

    get pattern() {
      return this.getAttribute('pattern') ?? '';
    }

    set pattern(value: string) {
      value ? this.setAttribute('pattern', value) : this.removeAttribute('pattern');
      toggleState(this._internals, 'pattern', Boolean(value));
      this.checkValidity();
      this._requestUpdate();
    }

    get min(): number | null {
      return getNumberAttribute(this, 'min');
    }

    set min(value: number | null) {
      setNumberAttribute(this, 'min', value);
      toggleState(this._internals, 'min', value !== null);
      this._internals.ariaValueMin = value !== null ? `${value}` : null;
      this.checkValidity();
      this._requestUpdate();
    }

    get max(): number | null {
      return getNumberAttribute(this, 'max');
    }

    set max(value: number | null) {
      setNumberAttribute(this, 'max', value);
      toggleState(this._internals, 'max', value !== null);
      this._internals.ariaValueMax = value !== null ? `${value}` : null;
      this.checkValidity();
      this._requestUpdate();
    }

    get step(): number | null {
      return getNumberAttribute(this, 'step');
    }

    set step(value: number | null) {
      setNumberAttribute(this, 'step', value);
      toggleState(this._internals, 'step', value !== null);
      this.checkValidity();
      this._requestUpdate();
    }

    get minLength(): number {
      return this.hasAttribute('minlength') ? Number(this.getAttribute('minlength')) : -1;
    }

    set minLength(value: number) {
      setLengthAttribute(this, 'minlength', value);
      toggleState(this._internals, 'minlength', this.minLength !== -1);
      this.checkValidity();
      this._requestUpdate();
    }

    get maxLength(): number {
      return this.hasAttribute('maxlength') ? Number(this.getAttribute('maxlength')) : -1;
    }

    set maxLength(value: number) {
      setLengthAttribute(this, 'maxlength', value);
      toggleState(this._internals, 'maxlength', this.maxLength !== -1);
      this.checkValidity();
      this._requestUpdate();
    }

    /** name associated to parent form */
    get name() {
      return this.getAttribute('name') ?? '';
    }

    set name(value: string) {
      value ? this.setAttribute('name', value) : this.removeAttribute('name');
      this._updateFormState();
      this._requestUpdate();
    }

    /** get determine if component is in no validation state */
    get noValidate(): boolean {
      return this.getAttribute('novalidate') !== null || this._internals.form?.noValidate === true;
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

      if (!this.#hasInitialValue && !this.isConnected) {
        this._initialValue = structuredClone(this._value);
        this.#hasInitialValue = true;
      }

      this._updateFormState();
    }

    /** associated parent form */
    get form() {
      return this._internals.form;
    }

    /** determine if the component is a candidate for constraint checking */
    get willValidate() {
      return this._internals.willValidate;
    }

    /** validity state of the component */
    get validity() {
      return this._internals.validity;
    }

    /** validation message of the component */
    get validationMessage() {
      return this._internals.validationMessage;
    }

    /** stringified value of the component */
    get valueAsString() {
      return getValueAsString(this.value);
    }

    /** parsed number value of the component */
    get valueAsNumber(): number {
      return Number(this.value);
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

    get labels() {
      return this._internals.labels;
    }

    get composedLabel() {
      return Array.from(this.labels)
        .map(label => label.textContent)
        .join(' ')
        .trim();
    }

    /** @internal */
    get _metadata() {
      return (this.constructor as FormControl).metadata;
    }

    /** @internal */
    _internals = attachInternals(this);

    /** @internal */
    _initialValue: T | undefined;

    /** @internal */
    get _validators() {
      return this._metadata.validators ?? [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this._initialValue = this.value;
    }

    connectedCallback() {
      attachInternals(this);
      if (super.connectedCallback) {
        super.connectedCallback();
      }

      this.tabIndex = 0;
      this.#syncFormControlStates();
      this._updateFormState();
      this.checkValidity();
      this.shadowRoot?.addEventListener('input', this._stopInternalPropagation);
      this.shadowRoot?.addEventListener('change', this._stopInternalPropagation);
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }

      this.shadowRoot?.removeEventListener('input', this._stopInternalPropagation);
      this.shadowRoot?.removeEventListener('change', this._stopInternalPropagation);
    }

    /**
     * @internal
     * Stop events that originated inside this component's own shadow tree so the
     * mixin can re-dispatch them semantically. Slotted light-DOM events traverse the
     * host's shadow root via slots and must continue bubbling.
     */
    _stopInternalPropagation = (event: Event) => {
      const origin = event.composedPath()[0];
      if (origin instanceof Node && this.shadowRoot?.contains(origin)) {
        event.stopPropagation();
      }
    };

    static get observedAttributes() {
      const attrs = super.observedAttributes ?? [];
      return attrs.concat([
        'value',
        'readonly',
        'required',
        'name',
        'novalidate',
        'disabled',
        'pattern',
        'min',
        'max',
        'step',
        'minlength',
        'maxlength'
      ]);
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
      if (super.attributeChangedCallback) {
        super.attributeChangedCallback(name, oldValue, newValue);
      }

      if (newValue === oldValue) {
        return;
      }

      this._handleAttributeChange(name, newValue);
    }

    /** @internal */
    _handleAttributeChange(name: string, newValue: string | null) {
      if (name === 'value') {
        this.#handleValueAttributeChange(newValue);
        return;
      }

      if (this.#handleBooleanAttributeChange(name, newValue)) {
        return;
      }

      if (this.#handleStringAttributeChange(name, newValue)) {
        return;
      }

      this.#handleNumberAttributeChange(name, newValue);
    }

    /** @protected */
    formResetCallback() {
      this.reset();
    }

    formDisabledCallback(disabled: boolean) {
      this.disabled = disabled;
    }

    /** @protected https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/*/
    formStateRestoreCallback(state: T, _reason: string) {
      this.value = state;
      this.checkValidity();
    }

    /** report validity of the component */
    reportValidity() {
      this.#updateValidity();
      return this._internals.reportValidity();
    }

    /** check validity of the component */
    checkValidity() {
      this.#updateValidity();
      return this._internals.checkValidity();
    }

    /** @protected */
    setValidity(validity: Partial<ValidityState>, message?: string) {
      this._internals.setValidity(validity, message);
      this.#syncValidityStates();
    }

    setCustomValidity(message: string) {
      this.#customValidityMessage = message;
      this.#updateValidity();
    }

    reset() {
      this.value = this.hasAttribute('value')
        ? parseValueSchema<T>(this.localName, this.defaultValue, this._metadata.valueSchema)
        : structuredClone(this._initialValue);
      this.#resetValidityStates();
      this.checkValidity();
      this.dispatchEvent(new Event('reset', { bubbles: true, cancelable: true, composed: true }));
    }

    #updateValidity() {
      if (this.noValidate) {
        this._internals.setValidity({});
      } else {
        this.#applyValidityResult(this.#getValidityResult());
      }

      this.#syncValidityStates();
    }

    #getValidityResult(): ValidatorResult {
      if (this.#customValidityMessage) {
        return invalid({ customError: true }, this.#customValidityMessage);
      }

      const nativeResult = this.#getNativeValidityResult();
      if (!nativeResult.validity.valid) {
        return nativeResult;
      }

      for (const validator of this._validators) {
        const result = validator(this.value, this as unknown as FormControl);
        if (!result.validity.valid) {
          return result;
        }
      }

      return { validity: { valid: true }, message: '' };
    }

    #getNativeValidityResult(): ValidatorResult {
      if (this.required && isEmptyValue(this.value)) {
        return invalid({ valueMissing: true }, 'This field is required');
      }

      if (typeof this.value === 'string') {
        return getStringValidity({
          maxLength: this.maxLength,
          minLength: this.minLength,
          pattern: this.pattern,
          value: this.value
        });
      }

      if (typeof this.value === 'number') {
        return getNumberValidity({
          max: this.max,
          min: this.min,
          step: this.step,
          value: this.value
        });
      }

      return { validity: { valid: true }, message: '' };
    }

    #applyValidityResult(result: ValidatorResult) {
      if (result.validity.valid) {
        this._internals.setValidity({});
        return;
      }

      this._internals.setValidity(
        result.validity,
        result.message,
        (this.shadowRoot?.activeElement as HTMLElement) ?? undefined
      );
    }

    #syncFormControlStates() {
      toggleState(this._internals, 'disabled', this.disabled);
      toggleState(this._internals, 'readonly', this.readOnly);
      toggleState(this._internals, 'required', this.required);
      toggleState(this._internals, 'pattern', Boolean(this.pattern));
      toggleState(this._internals, 'min', this.min !== null);
      toggleState(this._internals, 'max', this.max !== null);
      toggleState(this._internals, 'step', this.step !== null);
      toggleState(this._internals, 'minlength', this.minLength !== -1);
      toggleState(this._internals, 'maxlength', this.maxLength !== -1);
    }

    #syncValidityStates() {
      toggleState(this._internals, 'valid', this.validity.valid);
      toggleState(this._internals, 'invalid', !this.validity.valid);
    }

    #resetValidityStates() {
      this._internals.states.delete('valid');
      this._internals.states.delete('invalid');
    }

    #handleValueAttributeChange(newValue: string | null) {
      this.value =
        newValue === null
          ? (undefined as unknown as T)
          : parseValueSchema<T>(this.localName, newValue, this._metadata.valueSchema);
      this._initialValue = structuredClone(this.value);
      this.#hasInitialValue = true;
    }

    #handleBooleanAttributeChange(name: string, newValue: string | null) {
      if (name === 'readonly') {
        this.readOnly = newValue !== null;
        return true;
      }

      if (name === 'disabled') {
        this.disabled = newValue !== null;
        return true;
      }

      if (name === 'required') {
        this.required = newValue !== null;
        return true;
      }

      if (name === 'novalidate') {
        this.noValidate = newValue !== null;
        this.checkValidity();
        return true;
      }

      return false;
    }

    #handleStringAttributeChange(name: string, newValue: string | null) {
      if (name === 'name') {
        this.name = newValue ?? '';
        return true;
      }

      if (name === 'pattern') {
        this.pattern = newValue ?? '';
        return true;
      }

      return false;
    }

    #handleNumberAttributeChange(name: string, newValue: string | null) {
      if (name === 'min') {
        this.min = getNumberValue(newValue);
      } else if (name === 'max') {
        this.max = getNumberValue(newValue);
      } else if (name === 'step') {
        this.step = getNumberValue(newValue);
      } else if (name === 'minlength') {
        this.minLength = getLengthValue(newValue);
      } else if (name === 'maxlength') {
        this.maxLength = getLengthValue(newValue);
      }
    }

    /** @protected */
    dispatchInputEvent() {
      this.dispatchEvent(
        new InputEvent('input', { bubbles: true, cancelable: true, composed: true, data: this.valueAsString })
      );
    }

    /** @protected */
    dispatchChangeEvent() {
      this.dispatchEvent(new Event('change', { bubbles: true, cancelable: true, composed: true }));
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
      if (!this.name) {
        this._internals.setFormValue(null);
      } else if (typeof this.value === 'number' || typeof this.value === 'boolean') {
        this._internals.setFormValue(`${this.value}`);
      } else if (isObjectLiteral(this.value)) {
        const formData = new FormData();
        Object.entries(this.value as Record<string, unknown>)
          .filter(([key]) => key !== 'value')
          .forEach(([key, value]) => {
            formData.set(`${this.name}-${key}`, `${value}`);
          });
        this._internals.setFormValue(formData);
      } else if (Array.isArray(this.value)) {
        const formData = new FormData();
        this.value.forEach(i => formData.append(`${this.name}`, i));
        this._internals.setFormValue(formData);
      } else {
        this._internals.setFormValue(this.value as null | string | File | FormData);
      }
    }

    /** @internal */
    _requestUpdate() {
      if (this.requestUpdate) {
        this.requestUpdate();
      }
    }
  } as unknown as FormControlMixinReturn<TBase, T>;
}

function getValueAsString(value: FormControlValue | undefined) {
  if (value === undefined || value === null) {
    return '';
  }

  if (isStringifiablePrimitive(value)) {
    return `${value}`;
  }

  if (isFileValue(value)) {
    return value.name;
  }

  if (Array.isArray(value) || isObjectLiteral(value)) {
    return JSON.stringify(value);
  }

  return JSON.stringify(value) ?? '';
}

function isStringifiablePrimitive(value: FormControlValue): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function isFileValue(value: FormControlValue): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function getNumberAttribute(element: HTMLElement, name: string) {
  return getNumberValue(element.getAttribute(name));
}

function getNumberValue(value: string | null) {
  if (value === null || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function setNumberAttribute(element: HTMLElement, name: string, value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, `${value}`);
  }
}

function getLengthValue(value: string | null) {
  const length = getNumberValue(value);
  return length === null || length < 0 ? -1 : length;
}

function setLengthAttribute(element: HTMLElement, name: string, value: number) {
  if (value < 0 || !Number.isFinite(value)) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, `${value}`);
  }
}

function isEmptyValue(value: FormControlValue | undefined) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

interface StringValidityOptions {
  value: string;
  pattern: string;
  minLength: number;
  maxLength: number;
}

function getStringValidity({ value, pattern, minLength, maxLength }: StringValidityOptions): ValidatorResult {
  if (pattern && !matchesPattern(value, pattern)) {
    return invalid({ patternMismatch: true }, 'pattern mismatch');
  }

  if (minLength !== -1 && value.length < minLength) {
    return invalid({ tooShort: true }, 'value too short');
  }

  if (maxLength !== -1 && value.length > maxLength) {
    return invalid({ tooLong: true }, 'value too long');
  }

  return { validity: { valid: true }, message: '' };
}

interface NumberValidityOptions {
  value: number;
  min: number | null;
  max: number | null;
  step: number | null;
}

function getNumberValidity({ value, min, max, step }: NumberValidityOptions): ValidatorResult {
  if (Number.isNaN(value)) {
    return invalid({ badInput: true }, 'bad input');
  }

  if (min !== null && value < min) {
    return invalid({ rangeUnderflow: true }, 'value too low');
  }

  if (max !== null && value > max) {
    return invalid({ rangeOverflow: true }, 'value too high');
  }

  if (step !== null && step > 0 && hasStepMismatch(value, min ?? 0, step)) {
    return invalid({ stepMismatch: true }, 'step mismatch');
  }

  return { validity: { valid: true }, message: '' };
}

function matchesPattern(value: string, pattern: string) {
  try {
    return new RegExp(`^(?:${pattern})$`).test(value);
  } catch {
    // Pattern attributes are consumer-provided regular expressions.
    return true;
  }
}

function hasStepMismatch(value: number, base: number, step: number) {
  const quotient = (value - base) / step;
  return Math.abs(Math.round(quotient) - quotient) > Number.EPSILON;
}

function invalid(validity: Partial<ValidityState>, message: string): ValidatorResult {
  return { validity: { ...validity, valid: false }, message };
}
