// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { FormControlValue, ValidatorResult } from '../internal/types.js';
import { toggleState } from '../internal/utils.js';
import { FormControlMixin, type FormControlMixinInstance } from './index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = (new (...args: any[]) => HTMLElement & {
  connectedCallback?(): void;
  attributeChangedCallback?(name: string, oldValue: string | null, newValue: string | null): void;
  requestUpdate?(name?: string, oldValue?: unknown): void;
}) & {
  observedAttributes?: string[];
};

export type SliderFormControlValue = Extract<FormControlValue, number>;

export interface SliderFormControlMixinInstance extends FormControlMixinInstance<SliderFormControlValue> {
  /**
   * Defines the maximum slider value.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#max
   * @attr max
   * @reflect
   */
  max: number;

  /**
   * Defines the minimum slider value.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#min
   * @attr min
   * @reflect
   */
  min: number;

  /**
   * Defines the slider value granularity.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#step
   * @attr step
   * @reflect
   */
  step: number;

  /**
   * The current slider value.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#value
   * @attr value
   * @reflect
   */
  value: number;

  /**
   * The current slider value as a number.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/valueAsNumber
   */
  valueAsNumber: number;

  updateSliderState(): void;
}

export interface SliderFormControlDefaults {
  max?: number;
  min?: number;
  step?: number;
  value?: number;
}

export type SliderFormControlMixinReturn<TBase extends Constructor> = (new (
  ...args: ConstructorParameters<TBase>
) => InstanceType<TBase> & SliderFormControlMixinInstance) & {
  formAssociated: boolean;
  observedAttributes: string[];
  sliderDefaults: SliderFormControlDefaults;
} & Omit<TBase, 'prototype'>;

interface SliderBaseInstance extends HTMLElement, FormControlMixinInstance<SliderFormControlValue> {
  connectedCallback(): void;
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
  requestUpdate?(name?: string, oldValue?: unknown): void;
}

type SliderBaseConstructor<TBase extends Constructor> = (new (
  ...args: ConstructorParameters<TBase>
) => SliderBaseInstance) & {
  formAssociated: boolean;
  observedAttributes: string[];
};

const maxValues = new WeakMap<object, number>();
const minValues = new WeakMap<object, number>();
const sliderValues = new WeakMap<object, number>();
const stepValues = new WeakMap<object, number>();

/**
 * @description A mixin that adds native range input-style form control behavior.
 */
export function SliderFormControlMixin<TBase extends Constructor>(
  SuperClass: TBase
): SliderFormControlMixinReturn<TBase> {
  const Base = FormControlMixin<TBase, SliderFormControlValue>(SuperClass) as SliderBaseConstructor<TBase>;

  return class SliderFormControlBase extends Base {
    #customValidityMessage = '';

    #initialValue: number | undefined;

    static readonly sliderDefaults: SliderFormControlDefaults = {};

    static get observedAttributes() {
      return super.observedAttributes;
    }

    override get max(): number {
      return maxValues.get(this) ?? getSliderDefaults(this).max ?? 100;
    }

    override set max(value: number | null) {
      this.#setMax(value, true);
    }

    override get min(): number {
      return minValues.get(this) ?? getSliderDefaults(this).min ?? 0;
    }

    override set min(value: number | null) {
      this.#setMin(value, true);
    }

    override get step(): number {
      return stepValues.get(this) ?? getSliderDefaults(this).step ?? 1;
    }

    override set step(value: number | null) {
      this.#setStep(value, true);
    }

    override get type(): string {
      return 'range';
    }

    override set type(_value: string) {}

    override get value(): number {
      return sliderValues.get(this) ?? getSliderDefaults(this).value ?? 0;
    }

    override set value(value: number | string) {
      this.#setValue(getNumberValue(value, this.#defaultValue));
      this.setAttribute('value', `${this.value}`);
    }

    override get valueAsNumber(): number {
      return this.value;
    }

    override set valueAsNumber(value: number) {
      this.#setValue(value);
      if (Number.isFinite(value)) {
        this.setAttribute('value', `${this.value}`);
      }
    }

    override connectedCallback() {
      super.connectedCallback();
      this.#initialValue ??= this.value;
      this.updateSliderState();
    }

    override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
      if (oldValue === newValue) {
        return;
      }

      if (this.#handleSliderAttributeChange(name, newValue)) {
        return;
      }

      super.attributeChangedCallback?.(name, oldValue, newValue);
    }

    override formResetCallback() {
      this.valueAsNumber = this.#initialValue ?? this.min;
      this.updateSliderState();
    }

    override formStateRestoreCallback(state: number | string | null, _reason?: string) {
      this.valueAsNumber = state === null ? (this.#initialValue ?? this.min) : getNumberValue(state, this.min);
      this.updateSliderState();
    }

    override reportValidity() {
      this.updateSliderState();
      return this._internals.reportValidity();
    }

    override checkValidity() {
      this.updateSliderState();
      return this._internals.checkValidity();
    }

    override setCustomValidity(message: string) {
      this.#customValidityMessage = message;
      this.updateSliderState();
    }

    override _updateFormState() {
      this.updateSliderState();
    }

    updateSliderState() {
      this._internals.setFormValue(!this.disabled && Number.isFinite(this.value) ? `${this.value}` : null);
      this._internals.ariaValueMax = `${this.max}`;
      this._internals.ariaValueMin = `${this.min}`;
      this._internals.ariaValueNow = Number.isFinite(this.value) ? `${this.value}` : null;
      toggleState(this._internals, 'max', true);
      toggleState(this._internals, 'min', true);
      toggleState(this._internals, 'step', true);
      this.#updateValidity();
    }

    #handleSliderAttributeChange(name: string, newValue: string | null) {
      if (name === 'value') {
        this.#setValue(getNumberValue(newValue, this.#defaultValue));
        return true;
      }

      if (name === 'min') {
        this.#setMin(newValue, false);
        return true;
      }

      if (name === 'max') {
        this.#setMax(newValue, false);
        return true;
      }

      if (name === 'step') {
        this.#setStep(newValue, false);
        return true;
      }

      return false;
    }

    #setValue(value: number) {
      const previousValue = this.value;
      if (Object.is(previousValue, value)) {
        return;
      }

      sliderValues.set(this, value);
      this.updateSliderState();
      this.requestUpdate?.('value', previousValue);
    }

    #setMin(value: number | string | null, reflect: boolean) {
      const previousValue = this.min;
      const nextValue = getNumberValue(value, this.#defaultMin);
      if (Object.is(previousValue, nextValue)) {
        return;
      }

      minValues.set(this, nextValue);
      this.#reflectNumberAttribute({ name: 'min', nextValue, reflect, value });
      this.updateSliderState();
      this.requestUpdate?.('min', previousValue);
    }

    #setMax(value: number | string | null, reflect: boolean) {
      const previousValue = this.max;
      const nextValue = getNumberValue(value, this.#defaultMax);
      if (Object.is(previousValue, nextValue)) {
        return;
      }

      maxValues.set(this, nextValue);
      this.#reflectNumberAttribute({ name: 'max', nextValue, reflect, value });
      this.updateSliderState();
      this.requestUpdate?.('max', previousValue);
    }

    #setStep(value: number | string | null, reflect: boolean) {
      const previousValue = this.step;
      const nextValue = getNumberValue(value, this.#defaultStep);
      if (Object.is(previousValue, nextValue)) {
        return;
      }

      stepValues.set(this, nextValue);
      this.#reflectNumberAttribute({ name: 'step', nextValue, reflect, value });
      this.updateSliderState();
      this.requestUpdate?.('step', previousValue);
    }

    #reflectNumberAttribute({ name, nextValue, reflect, value }: ReflectNumberAttributeOptions) {
      if (!reflect) {
        return;
      }

      if (value === null) {
        this.removeAttribute(name);
      } else {
        this.setAttribute(name, `${nextValue}`);
      }
    }

    get #defaultMax() {
      return getSliderDefaults(this).max ?? 100;
    }

    get #defaultMin() {
      return getSliderDefaults(this).min ?? 0;
    }

    get #defaultStep() {
      return getSliderDefaults(this).step ?? 1;
    }

    get #defaultValue() {
      return getSliderDefaults(this).value ?? 0;
    }

    #updateValidity() {
      if (this.noValidate) {
        this.setValidity({});
        return;
      }

      if (this.#customValidityMessage) {
        this.setValidity({ customError: true }, this.#customValidityMessage);
        return;
      }

      const result = getSliderValidity({
        max: this.max,
        min: this.min,
        step: this.step,
        value: this.value
      });
      this.setValidity(result.validity, result.message);
    }
  } as unknown as SliderFormControlMixinReturn<TBase>;
}

interface SliderValidityOptions {
  max: number;
  min: number;
  step: number;
  value: number;
}

interface ReflectNumberAttributeOptions {
  name: string;
  nextValue: number;
  reflect: boolean;
  value: number | string | null;
}

function getSliderValidity({ max, min, step, value }: SliderValidityOptions): ValidatorResult {
  if (!Number.isFinite(value)) {
    return invalid({ valueMissing: true }, 'Enter a value.');
  }

  if (value < min) {
    return invalid({ rangeUnderflow: true }, `Value must be greater than or equal to ${min}.`);
  }

  if (value > max) {
    return invalid({ rangeOverflow: true }, `Value must be less than or equal to ${max}.`);
  }

  if (hasStepMismatch(value, min, step)) {
    return invalid({ stepMismatch: true }, `Value must match the step ${step}.`);
  }

  return { validity: {}, message: '' };
}

function getNumberValue(value: number | string | null, fallback: number) {
  const parsedValue = typeof value === 'number' ? value : Number(value ?? fallback);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
}

function getSliderDefaults(element: object): SliderFormControlDefaults {
  return (element.constructor as { sliderDefaults?: SliderFormControlDefaults }).sliderDefaults ?? {};
}

function hasStepMismatch(value: number, min: number, step: number) {
  if (!Number.isFinite(step) || step <= 0 || !Number.isFinite(value)) {
    return false;
  }

  const steps = (value - min) / step;
  return Math.abs(steps - Math.round(steps)) > Number.EPSILON * 100;
}

function invalid(validity: Partial<ValidityState>, message: string): ValidatorResult {
  return { validity: { ...validity, valid: false }, message };
}
