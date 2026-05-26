// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { FormControlValue } from '../internal/types.js';
import { toggleState } from '../internal/utils.js';
import { FormControlMixin, type FormControlMixinInstance } from './index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = (new (...args: any[]) => HTMLElement & {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  attributeChangedCallback?(name: string, oldValue: string | null, newValue: string | null): void;
  requestUpdate?(name?: string, oldValue?: unknown): void;
}) & {
  observedAttributes?: string[];
};

export type CheckboxFormControlValue = Extract<FormControlValue, string>;

export interface CheckboxFormControlMixinInstance extends FormControlMixinInstance<CheckboxFormControlValue> {
  /**
   * Shows whether the checkbox currently has a checked value.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#checked
   * @attr checked
   * @reflect
   */
  checked: boolean;

  /**
   * Indicates whether the checkbox is visually indeterminate.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/indeterminate
   * @attr indeterminate
   * @reflect
   */
  indeterminate: boolean;

  updateCheckedState(): void;

  /**
   * Toggles the checked state.
   */
  toggle(): void;
}

export type CheckboxFormControlMixinReturn<TBase extends Constructor> = (new (
  ...args: ConstructorParameters<TBase>
) => InstanceType<TBase> & CheckboxFormControlMixinInstance) & {
  formAssociated: boolean;
  observedAttributes: string[];
} & Omit<TBase, 'prototype'>;

interface CheckboxBaseInstance extends HTMLElement, FormControlMixinInstance<CheckboxFormControlValue> {
  connectedCallback(): void;
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
  requestUpdate?(name?: string, oldValue?: unknown): void;
}

type CheckboxBaseConstructor<TBase extends Constructor> = (new (
  ...args: ConstructorParameters<TBase>
) => CheckboxBaseInstance) & {
  formAssociated: boolean;
  observedAttributes: string[];
};

const checkboxValues = new WeakMap<object, string>();
const constructedCheckboxes = new WeakSet();

/**
 * @description A mixin that adds native checkbox-style form control behavior.
 */
export function CheckboxFormControlMixin<TBase extends Constructor>(
  SuperClass: TBase
): CheckboxFormControlMixinReturn<TBase> {
  const Base = FormControlMixin<TBase, CheckboxFormControlValue>(SuperClass) as CheckboxBaseConstructor<TBase>;

  return class CheckboxFormControlBase extends Base {
    #checked = false;

    #customValidityMessage = '';

    #indeterminate = false;

    #initialChecked: boolean | undefined;

    #reflectingChecked = false;

    constructor(...args: ConstructorParameters<TBase>) {
      super(...args);
      constructedCheckboxes.add(this);
    }

    static get observedAttributes() {
      return super.observedAttributes.concat(['checked', 'indeterminate']);
    }

    get checked(): boolean {
      return this.#checked;
    }

    set checked(value: boolean) {
      this.#setChecked(Boolean(value));
      this.#reflectingChecked = true;
      this.toggleAttribute('checked', this.#checked);
      this.#reflectingChecked = false;
    }

    override get disabled(): boolean {
      return super.disabled;
    }

    override set disabled(value: boolean) {
      super.disabled = Boolean(value);
      if (constructedCheckboxes.has(this)) {
        this.updateCheckedState();
      }
    }

    get indeterminate(): boolean {
      return this.#indeterminate;
    }

    set indeterminate(value: boolean) {
      this.#setIndeterminate(Boolean(value));
      this.toggleAttribute('indeterminate', this.#indeterminate);
    }

    override get type(): string {
      return 'checkbox';
    }

    override set type(_value: string) {}

    override get value(): CheckboxFormControlValue {
      return checkboxValues.get(this) ?? 'on';
    }

    override set value(value: CheckboxFormControlValue | number | boolean) {
      this.#setValue(getCheckboxValue(value));
      this.setAttribute('value', this.value);
    }

    override connectedCallback() {
      super.connectedCallback();
      this.#initialChecked ??= this.checked;
      this.updateCheckedState();
    }

    override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
      if (oldValue === newValue) {
        return;
      }

      if (this.#handleCheckboxAttributeChange(name, newValue)) {
        if (name === 'checked' && !this.#reflectingChecked) {
          this.#initialChecked = this.checked;
        }
        return;
      }

      super.attributeChangedCallback?.(name, oldValue, newValue);
    }

    override formResetCallback() {
      this.checked = this.#initialChecked ?? false;
      this.indeterminate = false;
      this.updateCheckedState();
    }

    override formStateRestoreCallback(state: string | null, _reason?: string) {
      this.checked = state !== null;
      this.updateCheckedState();
    }

    override reportValidity() {
      this.#checkCheckboxValidity();
      return this._internals.reportValidity();
    }

    override checkValidity() {
      return this.#checkCheckboxValidity();
    }

    override setCustomValidity(message: string) {
      this.#customValidityMessage = message;
      this.checkValidity();
    }

    override _updateFormState() {
      this.updateCheckedState();
    }

    updateCheckedState() {
      this._internals.setFormValue(this.name && this.checked && !this.disabled ? this.value : null);
      toggleState(this._internals, 'checked', this.checked);
      toggleState(this._internals, 'indeterminate', this.indeterminate);
      this.checkValidity();
    }

    toggle() {
      if (this.disabled || this.readOnly) {
        return;
      }

      this.checked = !this.checked;
      this.indeterminate = false;
      this.dispatchInputEvent();
      this.dispatchChangeEvent();
    }

    #checkCheckboxValidity() {
      if (this.noValidate) {
        this.setValidity({});
        return true;
      }

      if (this.#customValidityMessage) {
        this.setValidity({ customError: true }, this.#customValidityMessage);
        return false;
      }

      if (this.required && !this.checked) {
        this.setValidity({ valueMissing: true }, 'Select this option');
        return false;
      }

      return super.checkValidity();
    }

    #handleCheckboxAttributeChange(name: string, newValue: string | null) {
      if (name === 'checked') {
        this.#setChecked(newValue !== null);
        return true;
      }

      if (name === 'indeterminate') {
        this.#setIndeterminate(newValue !== null);
        return true;
      }

      if (name === 'value') {
        this.#setValue(newValue ?? 'on');
        return true;
      }

      return false;
    }

    #setChecked(checked: boolean) {
      const previousValue = this.#checked;
      this.#checked = checked;
      this.updateCheckedState();
      this.requestUpdate?.('checked', previousValue);
    }

    #setIndeterminate(indeterminate: boolean) {
      const previousValue = this.#indeterminate;
      this.#indeterminate = indeterminate;
      toggleState(this._internals, 'indeterminate', indeterminate);
      this.requestUpdate?.('indeterminate', previousValue);
    }

    #setValue(value: string) {
      const previousValue = this.value;
      checkboxValues.set(this, value);
      this.updateCheckedState();
      this.requestUpdate?.('value', previousValue);
    }
  } as unknown as CheckboxFormControlMixinReturn<TBase>;
}

function getCheckboxValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return `${value}`;
  }

  return 'on';
}
