// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { SliderFormControlMixin } from './slider.js';

class SliderTestElement extends SliderFormControlMixin<typeof HTMLElement>(HTMLElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-slider-test-element',
    valueSchema: {
      type: 'number' as const
    }
  };

  requestUpdate() {}
}

customElements.define('ui-slider-test-element', SliderTestElement);

describe('SliderFormControlMixin', () => {
  let fixture: HTMLElement;
  let element: SliderTestElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <ui-slider-test-element name="level"></ui-slider-test-element>
      </form>
    `);
    element = fixture.querySelector<SliderTestElement>('ui-slider-test-element')!;
    form = fixture.querySelector<HTMLFormElement>('form')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should use range type and native range defaults', () => {
    expect(element.type).toBe('range');
    element.type = 'number';
    expect(element.type).toBe('range');
    expect(element.value).toBe(0);
    expect(element.valueAsNumber).toBe(0);
    expect(element.min).toBe(0);
    expect(element.max).toBe(100);
    expect(element.step).toBe(1);
  });

  it('should submit numeric form data', () => {
    element.value = 10;

    expect(element.getAttribute('value')).toBe('10');
    expect(new FormData(form).get('level')).toBe('10');
  });

  it('should support numeric attributes', () => {
    element.setAttribute('value', '25');
    element.setAttribute('min', '10');
    element.setAttribute('max', '50');
    element.setAttribute('step', '5');

    expect(element.value).toBe(25);
    expect(element.min).toBe(10);
    expect(element.max).toBe(50);
    expect(element.step).toBe(5);
    expect(getInternals(element).ariaValueNow).toBe('25');
    expect(getInternals(element).ariaValueMin).toBe('10');
    expect(getInternals(element).ariaValueMax).toBe('50');
  });

  it('should fall back for invalid and removed numeric values', () => {
    element.min = 10;
    element.max = 20;
    element.step = 2;

    element.min = null;
    element.max = null;
    element.step = null;
    element.setAttribute('value', 'invalid');

    expect(element.min).toBe(0);
    expect(element.max).toBe(100);
    expect(element.step).toBe(1);
    expect(element.value).toBe(0);
    expect(element.hasAttribute('min')).toBe(false);
    expect(element.hasAttribute('max')).toBe(false);
    expect(element.hasAttribute('step')).toBe(false);
  });

  it('should validate numeric bounds and step', () => {
    element.min = 0;
    element.max = 1;
    element.step = 0.25;

    element.valueAsNumber = -1;
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.rangeUnderflow).toBe(true);

    element.valueAsNumber = 2;
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.rangeOverflow).toBe(true);

    element.valueAsNumber = 0.3;
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.stepMismatch).toBe(true);

    element.valueAsNumber = 0.5;
    expect(element.checkValidity()).toBe(true);
  });

  it('should validate required missing numeric state', () => {
    element.required = true;
    element.valueAsNumber = Number.NaN;

    expect(element.checkValidity()).toBe(false);
    expect(element.validity.valueMissing).toBe(true);
    expect(new FormData(form).get('level')).toBe(null);
  });

  it('should support custom validity and noValidate', () => {
    element.setCustomValidity('invalid range');
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.customError).toBe(true);
    expect(element.validationMessage).toBe('invalid range');

    element.noValidate = true;
    expect(element.checkValidity()).toBe(true);
  });

  it('should report validity through element internals', () => {
    expect(element.reportValidity()).toBe(true);
  });

  it('should restore and reset form state', async () => {
    const resetFixture = await createFixture(html`
      <form>
        <ui-slider-test-element name="level" value="25"></ui-slider-test-element>
      </form>
    `);
    const resetElement = resetFixture.querySelector<SliderTestElement>('ui-slider-test-element')!;

    resetElement.valueAsNumber = 50;
    resetElement.formStateRestoreCallback('75');
    expect(resetElement.valueAsNumber).toBe(75);

    resetElement.formStateRestoreCallback(null);
    expect(resetElement.valueAsNumber).toBe(25);

    resetElement.valueAsNumber = 50;
    resetElement.formResetCallback();
    expect(resetElement.valueAsNumber).toBe(25);

    removeFixture(resetFixture);
  });

  it('should reset unconnected slider state to min fallback', () => {
    const slider = new SliderTestElement();
    slider.min = 5;
    slider.valueAsNumber = 10;

    slider.formResetCallback();

    expect(slider.valueAsNumber).toBe(5);
  });

  it('should allow non-finite step validation', () => {
    element.step = 0;
    element.valueAsNumber = 1;

    expect(element.checkValidity()).toBe(true);
  });

  it('should exclude disabled values from form data but keep readonly values', () => {
    element.valueAsNumber = 10;

    element.disabled = true;
    expect(new FormData(form).get('level')).toBe(null);

    element.disabled = false;
    element.readOnly = true;
    expect(new FormData(form).get('level')).toBe('10');
  });

  it('should request updates for slider state changes', () => {
    vi.spyOn(element, 'requestUpdate');

    element.valueAsNumber = 10;
    element.min = 1;
    element.max = 20;
    element.step = 2;

    expect(element.requestUpdate).toHaveBeenCalledWith('value', 0);
    expect(element.requestUpdate).toHaveBeenCalledWith('min', 0);
    expect(element.requestUpdate).toHaveBeenCalledWith('max', 100);
    expect(element.requestUpdate).toHaveBeenCalledWith('step', 1);
  });
});

function getInternals(element: HTMLElement) {
  return (element as HTMLElement & { _internals: ElementInternals })._internals;
}
