// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { SelectFormControlMixin } from './select.js';

class SelectTestElement extends SelectFormControlMixin<typeof HTMLElement>(HTMLElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-select-test-element',
    valueSchema: {
      type: 'string' as const
    }
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.append(globalThis.document.createElement('select'));
    this.optionValues = ['slow', 'normal', 'fast'];
  }

  set optionValues(values: string[]) {
    const select: HTMLSelectElement = (this.shadowRoot as ShadowRoot).querySelector<HTMLSelectElement>('select')!;
    select.replaceChildren(
      ...values.map(value => {
        const option = globalThis.document.createElement('option');
        option.value = value;
        option.textContent = value;
        return option;
      })
    );
    this.updateSelectState();
  }

  requestUpdate() {}
}

customElements.define('ui-select-test-element', SelectTestElement);

class BareSelectTestElement extends SelectFormControlMixin<typeof HTMLElement>(HTMLElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-bare-select-test-element',
    valueSchema: {
      type: 'string' as const
    }
  };

  requestUpdate() {}
}

customElements.define('ui-bare-select-test-element', BareSelectTestElement);

class OptionOnlySelectTestElement extends SelectFormControlMixin<typeof HTMLElement>(HTMLElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-option-only-select-test-element',
    valueSchema: {
      type: 'string' as const
    }
  };

  get options() {
    return ['slow', 'normal', 'fast'].map((value, index) => {
      const option = globalThis.document.createElement('option');
      option.value = value;
      option.selected = index === 1;
      return option;
    });
  }

  requestUpdate() {}
}

customElements.define('ui-option-only-select-test-element', OptionOnlySelectTestElement);

describe('SelectFormControlMixin', () => {
  let fixture: HTMLElement;
  let element: SelectTestElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <ui-select-test-element name="speed" value="normal"></ui-select-test-element>
      </form>
    `);
    element = fixture.querySelector<SelectTestElement>('ui-select-test-element')!;
    form = fixture.querySelector<HTMLFormElement>('form')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should use native select-one APIs', () => {
    expect(element.type).toBe('select-one');
    element.type = 'select-multiple';
    expect(element.type).toBe('select-one');
    expect(element.length).toBe(3);
    expect(element.options.map(option => option.value)).toEqual(['slow', 'normal', 'fast']);
    expect(element.value).toBe('normal');
    expect(element.valueAsString).toBe('normal');
    expect(element.selectedIndex).toBe(1);
    expect(element.selectedOptions.map(option => option.value)).toEqual(['normal']);
  });

  it('should submit selected form data', () => {
    element.value = 'fast';

    expect(element.getAttribute('value')).toBe('fast');
    expect(new FormData(form).get('speed')).toBe('fast');
  });

  it('should exclude unmatched values from form data', () => {
    element.value = 'missing';

    expect(element.value).toBe('');
    expect(element.selectedIndex).toBe(-1);
    expect(new FormData(form).get('speed')).toBe(null);
  });

  it('should submit selected empty-string values', () => {
    element.optionValues = ['', 'normal'];
    element.value = '';

    expect(element.selectedIndex).toBe(0);
    expect(new FormData(form).get('speed')).toBe('');
  });

  it('should set value by selected index', () => {
    element.selectedIndex = 0;
    expect(element.value).toBe('slow');

    element.selectedIndex = 10;
    expect(element.value).toBe('');
  });

  it('should reset and restore form state', () => {
    element.value = 'fast';
    element.formStateRestoreCallback('slow');
    expect(element.value).toBe('slow');

    element.formStateRestoreCallback(null);
    expect(element.value).toBe('normal');

    element.value = 'fast';
    element.formResetCallback();
    expect(element.value).toBe('normal');
  });

  it('should validate required values', () => {
    element.required = true;
    element.value = 'missing';

    expect(element.value).toBe('');
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.valueMissing).toBe(true);
  });

  it('should support custom validity and noValidate', () => {
    element.setCustomValidity('invalid select');
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.customError).toBe(true);
    expect(element.validationMessage).toBe('invalid select');

    element.noValidate = true;
    expect(element.checkValidity()).toBe(true);
  });

  it('should exclude disabled values from form data but keep readonly values', () => {
    element.disabled = true;
    expect(new FormData(form).get('speed')).toBe(null);

    element.disabled = false;
    element.readOnly = true;
    expect(new FormData(form).get('speed')).toBe('normal');
  });

  it('should request updates for value changes', () => {
    vi.spyOn(element, 'requestUpdate');

    element.value = 'fast';

    expect(element.requestUpdate).toHaveBeenCalledWith('value', 'normal');
  });

  it('should support fallback select APIs without a native select element', async () => {
    const bareFixture = await createFixture(html`
      <form>
        <ui-bare-select-test-element name="speed"></ui-bare-select-test-element>
      </form>
    `);
    const bareElement = bareFixture.querySelector<BareSelectTestElement>('ui-bare-select-test-element')!;
    const bareForm = bareFixture.querySelector<HTMLFormElement>('form')!;

    bareElement.value = '2';
    expect(bareElement.value).toBe('2');
    expect(bareElement.options).toEqual([]);
    expect(bareElement.length).toBe(0);
    expect(bareElement.selectedIndex).toBe(-1);
    expect(bareElement.selectedOptions).toEqual([]);
    expect(new FormData(bareForm).get('speed')).toBe(null);

    bareElement.value = true as unknown as string;
    expect(bareElement.value).toBe('true');

    bareElement.value = null as unknown as string;
    expect(bareElement.value).toBe('');

    removeFixture(bareFixture);
  });

  it('should support option-only selected APIs without a native select element', async () => {
    const optionFixture = await createFixture(html`
      <ui-option-only-select-test-element></ui-option-only-select-test-element>
    `);
    const optionElement = optionFixture.querySelector<OptionOnlySelectTestElement>(
      'ui-option-only-select-test-element'
    )!;

    expect(optionElement.selectedIndex).toBe(1);
    expect(optionElement.selectedOptions.map(option => option.value)).toEqual(['normal']);

    removeFixture(optionFixture);
  });
});
