// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { FormControlValue } from '../internal/types.js';
import { FormControlMixin, type FormControlMixinInstance } from './index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = (new (...args: any[]) => HTMLElement & {
  connectedCallback?(): void;
  attributeChangedCallback?(name: string, oldValue: string | null, newValue: string | null): void;
  requestUpdate?(name?: string, oldValue?: unknown): void;
}) & {
  observedAttributes?: string[];
};

export type SelectFormControlValue = Extract<FormControlValue, string>;

export interface SelectFormControlMixinInstance extends FormControlMixinInstance<SelectFormControlValue> {
  /**
   * The number of options available in the select.
   */
  length: number;

  /**
   * The options available in the select.
   */
  options: HTMLOptionElement[];

  /**
   * The index of the selected option.
   */
  selectedIndex: number;

  /**
   * The selected options.
   */
  selectedOptions: HTMLOptionElement[];

  /**
   * The select control type.
   */
  type: 'select-one';

  /**
   * The selected value.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#value
   * @attr value
   * @reflect
   */
  value: SelectFormControlValue;

  updateSelectState(): void;
}

export type SelectFormControlMixinReturn<TBase extends Constructor> = (new (
  ...args: ConstructorParameters<TBase>
) => InstanceType<TBase> & SelectFormControlMixinInstance) & {
  formAssociated: boolean;
  observedAttributes: string[];
} & Omit<TBase, 'prototype'>;

interface SelectBaseInstance extends HTMLElement, FormControlMixinInstance<SelectFormControlValue> {
  connectedCallback(): void;
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
  requestUpdate?(name?: string, oldValue?: unknown): void;
}

type SelectBaseConstructor<TBase extends Constructor> = (new (
  ...args: ConstructorParameters<TBase>
) => SelectBaseInstance) & {
  formAssociated: boolean;
  observedAttributes: string[];
};

const selectValues = new WeakMap<object, SelectFormControlValue>();

/**
 * @description A mixin that adds native single-select form control behavior.
 */
export function SelectFormControlMixin<TBase extends Constructor>(
  SuperClass: TBase
): SelectFormControlMixinReturn<TBase> {
  const Base = FormControlMixin<TBase, SelectFormControlValue>(SuperClass) as SelectBaseConstructor<TBase>;

  return class SelectFormControlBase extends Base {
    #initialValue: SelectFormControlValue | undefined;

    override get disabled(): boolean {
      return super.disabled;
    }

    override set disabled(value: boolean) {
      super.disabled = Boolean(value);
      this.updateSelectState();
    }

    get length() {
      return this.options.length;
    }

    get options(): HTMLOptionElement[] {
      return Array.from(this.#selectElement?.options ?? []);
    }

    get selectedIndex() {
      return this.#selectElement?.selectedIndex ?? this.options.findIndex(option => option.selected);
    }

    set selectedIndex(value: number) {
      const option = this.options[value];
      this.value = option?.value ?? '';
    }

    get selectedOptions(): HTMLOptionElement[] {
      return Array.from(this.#selectElement?.selectedOptions ?? this.options.filter(option => option.selected));
    }

    override get type(): 'select-one' {
      return 'select-one';
    }

    override set type(_value: string) {}

    override get value(): SelectFormControlValue {
      return selectValues.get(this) ?? '';
    }

    override set value(value: FormControlValue | undefined) {
      this.#setValue(getSelectValue(value), true);
    }

    override connectedCallback() {
      super.connectedCallback();
      this.#initialValue ??= this.value;
      this.updateSelectState();
    }

    override formResetCallback() {
      this.value = this.#initialValue ?? this.#getDefaultValue();
      this.updateSelectState();
    }

    override formStateRestoreCallback(state: SelectFormControlValue | null, _reason?: string) {
      this.value = state ?? this.#initialValue ?? this.#getDefaultValue();
      this.updateSelectState();
    }

    override _updateFormState() {
      this.updateSelectState();
    }

    updateSelectState() {
      const value = this.#getSelectValue(this.value);
      if (!Object.is(this.value, value)) {
        selectValues.set(this, value);
      }
      this.#syncNativeSelect(value);
      this._internals.setFormValue(!this.disabled && this.name && this.selectedIndex >= 0 ? value : null);
    }

    #setValue(value: SelectFormControlValue, reflect: boolean) {
      const previousValue = this.value;
      if (Object.is(previousValue, value)) {
        return;
      }

      selectValues.set(this, value);
      if (reflect) {
        this.setAttribute('value', value);
      }
      this.updateSelectState();
      this.checkValidity();
      this.requestUpdate?.('value', previousValue);
    }

    #getSelectValue(value: SelectFormControlValue) {
      return this.options.length > 0 && !this.options.some(option => option.value === value) ? '' : value;
    }

    #getDefaultValue() {
      return this.options[0]?.value ?? '';
    }

    #syncNativeSelect(value: SelectFormControlValue) {
      if (this.#selectElement && this.#selectElement.value !== value) {
        this.#selectElement.value = value;
      }
    }

    get #selectElement() {
      return this.shadowRoot?.querySelector('select') ?? null;
    }
  } as unknown as SelectFormControlMixinReturn<TBase>;
}

function getSelectValue(value: FormControlValue | undefined) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return `${value}`;
  }

  return '';
}
