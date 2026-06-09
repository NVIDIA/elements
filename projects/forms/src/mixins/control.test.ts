// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html } from 'lit';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, removeFixture, untilEvent } from '@internals/testing';
import { FormControlMixin } from './control.js';
import { requiredValidator } from '../validators/index.js';

export class TestElement extends FormControlMixin<typeof HTMLElement, string>(HTMLElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-test-element',
    valueSchema: {
      type: 'string' as const
    }
  };

  requestUpdate() {}
}

customElements.define('ui-test-element', TestElement);

describe('FormControlMixin', () => {
  let fixture: HTMLElement;
  let element: TestElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <ui-test-element></ui-test-element>
      </form>
    `);
    element = fixture.querySelector('ui-test-element')!;
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('should define element', () => {
    expect(customElements.get('ui-test-element')).toBeDefined();
  });

  it('should implement type', () => {
    expect(element.type).toBe('ui-test-element');
  });

  it('should implement readonly', () => {
    expect(element.readOnly).toBe(false);
    expect(element.hasAttribute('readonly')).toBe(false);

    element.readOnly = true;
    expect(element.readOnly).toBe(true);
    expect(element.hasAttribute('readonly')).toBe(true);
    expect(element._internals.states.has('readonly')).toBe(true);
  });

  it('should implement disabled', () => {
    expect(element.disabled).toBe(false);
    expect(element.hasAttribute('disabled')).toBe(false);

    element.disabled = true;
    expect(element.disabled).toBe(true);
    expect(element.hasAttribute('disabled')).toBe(true);
    expect(element._internals.ariaDisabled).toBe('true');
    expect(element._internals.states.has('disabled')).toBe(true);
  });

  it('should implement required', () => {
    expect(element.required).toBe(false);
    expect(element.hasAttribute('required')).toBe(false);

    element.required = true;
    expect(element.required).toBe(true);
    expect(element.hasAttribute('required')).toBe(true);
    expect(element._internals.states.has('required')).toBe(true);
  });

  it('should implement name', () => {
    expect(element.name).toBe('');
    expect(element.hasAttribute('name')).toBe(false);

    element.name = 'test';
    expect(element.name).toBe('test');
    expect(element.hasAttribute('name')).toBe(true);
  });

  it('should implement noValidate', () => {
    expect(element.noValidate).toBe(false);
    expect(element.hasAttribute('novalidate')).toBe(false);

    element.noValidate = true;
    expect(element.noValidate).toBe(true);
  });

  it('should clear validity when noValidate is set', () => {
    element.noValidate = true;
    element.checkValidity();
    expect(element.validity).toBeInstanceOf(ValidityState);
    expect(element.validity.valid).toBe(true);
  });

  it('should implement form', () => {
    element.name = 'test';
    expect(element.name).toBe('test');
    expect(element.form).toBe(fixture.querySelector('form'));
  });

  it('should implement value', () => {
    expect(element.value).toBe(undefined);
    element.value = 'test';
    expect(element.value).toBe('test');
  });

  it('should implement value attribute', () => {
    expect(element.value).toBe(undefined);
    element.setAttribute('value', 'test');
    expect(element.value).toBe('test');
  });

  it('should implement defaultValue', () => {
    expect(element.defaultValue).toBe('');

    element.defaultValue = 'test';
    expect(element.getAttribute('value')).toBe('test');
    expect(element.defaultValue).toBe('test');
  });

  it('should clear optional reflected attributes', () => {
    element.disabled = false;
    expect(element._internals.ariaDisabled).toBe('false');

    element.pattern = '\\d+';
    element.pattern = '';
    expect(element.hasAttribute('pattern')).toBe(false);

    element.min = 0;
    element.min = null;
    expect(element.hasAttribute('min')).toBe(false);
    expect(element._internals.ariaValueMin).toBe(null);

    element.max = 10;
    element.max = null;
    expect(element.hasAttribute('max')).toBe(false);
    expect(element._internals.ariaValueMax).toBe(null);

    element.minLength = 2;
    element.minLength = -1;
    expect(element.hasAttribute('minlength')).toBe(false);

    element.maxLength = 3;
    element.maxLength = -1;
    expect(element.hasAttribute('maxlength')).toBe(false);

    element.name = 'test';
    element.name = '';
    expect(element.hasAttribute('name')).toBe(false);

    element.defaultValue = 'test';
    element.removeAttribute('value');
    expect(element.value).toBe(undefined);
  });

  it('should normalize negative length constraints as unset', () => {
    element.setAttribute('minlength', '-2');
    expect(element.minLength).toBe(-1);
    expect(element.hasAttribute('minlength')).toBe(false);
    expect(element._internals.states.has('minlength')).toBe(false);

    element.setAttribute('maxlength', '-2');
    expect(element.maxLength).toBe(-1);
    expect(element.hasAttribute('maxlength')).toBe(false);
    expect(element._internals.states.has('maxlength')).toBe(false);

    element.minLength = -2;
    expect(element.hasAttribute('minlength')).toBe(false);
    expect(element._internals.states.has('minlength')).toBe(false);

    element.maxLength = -2;
    expect(element.hasAttribute('maxlength')).toBe(false);
    expect(element._internals.states.has('maxlength')).toBe(false);
  });

  it('should stringify primitive values without JSON quoting', () => {
    element.value = '10';
    expect(element.valueAsString).toBe('10');
    expect(element.valueAsNumber).toBe(10);
  });

  it('should call requestUpdate when value changes', () => {
    vi.spyOn(element, 'requestUpdate');
    element.value = 'test';
    expect(element.value).toBe('test');
    expect(element.requestUpdate).toHaveBeenCalled();
  });

  it('should expose a protected _internals', () => {
    expect(element._internals).toBeDefined();
  });

  it('should implement willValidate', () => {
    expect(element.willValidate).toBe(true);
  });

  it('should implement validity', () => {
    expect(element.validity).toBeInstanceOf(ValidityState);
  });

  it('should implement validationMessage', () => {
    expect(element.validationMessage).toBe('');
  });

  it('should implement protected setValidity', () => {
    vi.spyOn(element._internals, 'setValidity');
    element.setValidity({});
    expect(element._internals.setValidity).toHaveBeenCalled();
  });

  it('should implement protected setValidity with message', () => {
    vi.spyOn(element._internals, 'setValidity');
    element.setValidity({}, 'test');
    expect(element._internals.setValidity).toHaveBeenCalledWith({}, 'test');
  });

  it('should implement custom validity', () => {
    element.setCustomValidity('invalid value');
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.customError).toBe(true);
    expect(element.validationMessage).toBe('invalid value');
    expect(element._internals.states.has('invalid')).toBe(true);

    element.setCustomValidity('');
    expect(element.checkValidity()).toBe(true);
    expect(element._internals.states.has('valid')).toBe(true);
  });

  it('should implement protected checkValidity', () => {
    vi.spyOn(element._internals, 'checkValidity');
    element.checkValidity();
    expect(element._internals.checkValidity).toHaveBeenCalled();
  });

  it('should implement reportValidity', () => {
    vi.spyOn(element._internals, 'reportValidity');
    element.reportValidity();
    expect(element._internals.reportValidity).toHaveBeenCalled();
  });

  it('should set form value', () => {
    element.name = 'test';
    element.value = 'test';
    expect((element.form!.elements as unknown as Record<string, HTMLInputElement>)['test']!.value).toBe('test');
  });

  it('should warn and no-op when valueAsNumber is set on a non-number value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    element.value = 'test';
    element.valueAsNumber = 10;

    expect(element.value).toBe('test');
    expect(warn).toHaveBeenCalledWith('(ui-test-element): cannot set number value on non-number type');
  });

  it('should dispatch input event when value changes', async () => {
    const event = untilEvent<InputEvent>(element, 'input');
    element.dispatchInputEvent(); // protected API
    expect((await event)?.target).toBe(element);
  });

  it('should dispatch change event when value changes', async () => {
    const event = untilEvent<InputEvent>(element, 'change');
    element.dispatchChangeEvent(); // protected API
    expect((await event)?.target).toBe(element);
  });

  it('should dispatch input events via dispatchUpdateEvent', async () => {
    const event = untilEvent<InputEvent>(element, 'input');
    element.dispatchUpdateEvent('input'); // protected API
    expect((await event)?.target).toBe(element);
  });

  it('should dispatch change events via dispatchUpdateEvent', async () => {
    const event = untilEvent<InputEvent>(element, 'change');
    element.dispatchUpdateEvent('change'); // protected API
    expect((await event)?.target).toBe(element);
  });

  it('should implement formStateRestoreCallback', () => {
    expect(element.value).toBe(undefined);
    element.formStateRestoreCallback('test', 'autocomplete');
    expect(element.value).toBe('test');
  });

  it('should implement formResetCallback', () => {
    element.value = 'test';
    element.formResetCallback();
    expect(element.value).toBe(undefined);
  });

  it('should implement reset with defaultValue', async () => {
    element.defaultValue = 'default';
    element.value = 'changed';

    const event = untilEvent(element, 'reset');
    element.reset();

    expect(element.value).toBe('default');
    expect((await event).target).toBe(element);
  });

  it('should implement reset with empty defaultValue', async () => {
    element.defaultValue = '';
    element.value = 'changed';

    const event = untilEvent(element, 'reset');
    element.reset();

    expect(element.value).toBe('');
    expect((await event).target).toBe(element);
  });

  it('should implement formDisabledCallback', () => {
    element.formDisabledCallback(true);
    expect(element.disabled).toBe(true);
    expect(element.hasAttribute('disabled')).toBe(true);
    expect(element._internals.states.has('disabled')).toBe(true);
  });

  it('should implement labels and composedLabel', () => {
    element.id = 'labelled-control';
    const label = document.createElement('label');
    label.htmlFor = 'labelled-control';
    label.textContent = 'Labelled Control';
    element.before(label);

    expect(element.labels[0]).toBe(label);
    expect(element.composedLabel).toBe('Labelled Control');

    label.remove();
  });

  it('should validate string constraints', () => {
    element.pattern = '\\d+';
    element.value = 'abc';
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.patternMismatch).toBe(true);

    element.value = '123';
    expect(element.checkValidity()).toBe(true);

    element.minLength = 4;
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.tooShort).toBe(true);

    element.value = '1234';
    expect(element.checkValidity()).toBe(true);

    element.maxLength = 3;
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.tooLong).toBe(true);
  });

  it('should ignore invalid pattern expressions', () => {
    element.pattern = '[';
    element.value = 'abc';
    expect(element.checkValidity()).toBe(true);
  });
});

export class ValidatorTestElement extends FormControlMixin<typeof HTMLElement, string>(HTMLElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-validator-test-element',
    validators: [requiredValidator],
    valueSchema: {
      type: 'string' as const
    }
  };

  requestUpdate() {}
}

customElements.define('ui-validator-test-element', ValidatorTestElement);

describe('mixin - validators', () => {
  let fixture: HTMLElement;
  let element: ValidatorTestElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <ui-validator-test-element required></ui-validator-test-element>
      </form>
    `);

    element = fixture.querySelector('ui-validator-test-element')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should return valid when value is valid', () => {
    element.value = 'test';
    expect(element.checkValidity()).toBe(true);
    expect(element.validity.valid).toBe(true);
    expect(element.validity.valueMissing).toBe(false);
  });

  it('should return invalid when value is invalid', () => {
    element.value = '';
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.valid).toBe(false);
    expect(element.validity.valueMissing).toBe(true);
  });

  it('should return custom validator errors', () => {
    const previousValidators = ValidatorTestElement.metadata.validators;
    ValidatorTestElement.metadata.validators = [
      () => ({ validity: { customError: true, valid: false }, message: 'validator error' })
    ];

    try {
      element.required = false;
      element.value = 'valid';
      expect(element.checkValidity()).toBe(false);
      expect(element.validity.customError).toBe(true);
      expect(element.validationMessage).toBe('validator error');
    } finally {
      ValidatorTestElement.metadata.validators = previousValidators;
    }
  });
});

export class ComplexValueTestElement extends FormControlMixin<typeof HTMLElement, { name: string; age: number }>(
  HTMLElement
) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-complex-value',
    valueSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const },
        age: { type: 'number' as const }
      },
      required: ['name', 'age']
    }
  };

  constructor() {
    super();
    this.value = { name: 'John', age: 30 };
  }
}

customElements.define('ui-complex-value', ComplexValueTestElement);

describe('mixin - complex value', () => {
  let fixture: HTMLElement;
  let element: ComplexValueTestElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <ui-complex-value name="test"></ui-complex-value>
      </form>
    `);
    element = fixture.querySelector('ui-complex-value')!;
    form = fixture.querySelector('form')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should preserve default value', async () => {
    expect(element.value).toEqual({ name: 'John', age: 30 });
  });

  it('should set form data on initialization with flat form data value', async () => {
    expect(element.value).toEqual({ name: 'John', age: 30 });
    expect(new FormData(form).get('test-name')).toBe('John');
    expect(new FormData(form).get('test-age')).toBe('30');
  });

  it('should return a stringified value', () => {
    element.value = { name: 'John', age: 30 };
    expect(element.valueAsString).toBe('{"name":"John","age":30}');
  });

  it('should set form value', () => {
    element.value = { name: 'Jane', age: 31 };
    expect(Object.fromEntries(new FormData(element.form!))).toEqual({ 'test-name': 'Jane', 'test-age': '31' });
  });
});

export class NumberValueTestElement extends FormControlMixin<typeof HTMLElement, number>(HTMLElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-number-value',
    valueSchema: {
      type: 'number' as const
    }
  };
}

customElements.define('ui-number-value', NumberValueTestElement);

describe('mixin - number value', () => {
  let fixture: HTMLElement;
  let element: NumberValueTestElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <ui-number-value name="test" value="0"></ui-number-value>
      </form>
    `);
    element = fixture.querySelector('ui-number-value')!;
    form = fixture.querySelector('form')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should implement formResetCallback', () => {
    element.value = 10;
    element.formResetCallback();
    expect(element.value).toBe(0);
  });

  it('should set form value', () => {
    element.value = 10;
    expect(Object.fromEntries(new FormData(element.form!))).toEqual({ test: '10' });
  });

  it('should return a stringified value', () => {
    element.value = 10;
    expect(element.valueAsString).toBe('10');
  });

  it('should return a numeric value', () => {
    element.value = 10;
    expect(element.valueAsNumber).toBe(10);
  });

  it('should set numeric value', () => {
    element.value = 10;
    element.valueAsNumber = 20;
    expect(element.value).toBe(20);
  });

  it('should set form data on input', async () => {
    element.value = 1;
    expect(new FormData(form).get('test')).toBe('1');
  });

  it('should handle invalid number attributes', () => {
    element.setAttribute('min', 'bad');
    expect(element.min).toBe(null);
    expect(element.hasAttribute('min')).toBe(false);
  });

  it('should validate number bad input', () => {
    element.value = NaN;
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.badInput).toBe(true);
  });

  it('should validate step against the default base', () => {
    element.step = 2;
    element.value = 3;
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.stepMismatch).toBe(true);
  });

  it('should validate number constraints', () => {
    element.min = 0;
    element.max = 10;
    element.step = 2;

    element.value = 3;
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.stepMismatch).toBe(true);

    element.value = -1;
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.rangeUnderflow).toBe(true);

    element.value = 12;
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.rangeOverflow).toBe(true);

    element.value = 4;
    expect(element.checkValidity()).toBe(true);
  });
});

class FileValueTestElement extends FormControlMixin<typeof HTMLElement, File>(HTMLElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-file-value',
    valueSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const },
        type: { type: 'string' as const },
        size: { type: 'number' as const }
      },
      required: ['name', 'type', 'size']
    }
  };

  constructor() {
    super();
    this.value = new File([''], 'test.txt', { type: 'text/plain' });
  }
}

customElements.define('ui-file-value', FileValueTestElement);

describe('mixin - file value', () => {
  let element: FileValueTestElement;
  let fixture: HTMLElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <form>
      <ui-file-value name="test"></ui-file-value>
    </form>`);

    element = fixture.querySelector<FileValueTestElement>('ui-file-value')!;
    form = fixture.querySelector('form')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should preserve default value', async () => {
    expect(element.value).toEqual(new File([''], 'test.txt', { type: 'text/plain' }));
  });

  it('should set form data on initialization with flat form data value', async () => {
    expect(element.value).toEqual(new File([''], 'test.txt', { type: 'text/plain' }));
    expect((new FormData(form).get('test') as File).name).toBe('test.txt');
  });

  it('should set form data on input', async () => {
    element.value = new File([''], 'update.txt', { type: 'text/plain' });
    expect(element.value).toEqual(new File([''], 'update.txt', { type: 'text/plain' }));
    expect((new FormData(form).get('test') as File).name).toBe('update.txt');
  });

  it('should return file name as string value', () => {
    expect(element.valueAsString).toBe('test.txt');
  });
});

class MultipleFileValueTestElement extends FormControlMixin<typeof HTMLElement, File[]>(HTMLElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-multiple-file-value',
    valueSchema: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          name: { type: 'string' as const },
          type: { type: 'string' as const },
          size: { type: 'number' as const }
        },
        required: ['name', 'type', 'size']
      }
    }
  };

  constructor() {
    super();
    this.value = [
      new File([''], 'test1.txt', { type: 'text/plain' }),
      new File([''], 'test2.txt', { type: 'text/plain' })
    ];
  }
}

customElements.define('ui-multiple-file-value', MultipleFileValueTestElement);

class ShadowContainerElement extends FormControlMixin<typeof LitElement, Record<string, unknown>>(LitElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-shadow-container',
    valueSchema: {
      type: 'object' as const,
      properties: {},
      required: []
    }
  };

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('ui-shadow-container', ShadowContainerElement);

describe('mixin - slotted event propagation', () => {
  let fixture: HTMLElement;
  let container: ShadowContainerElement;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <ui-shadow-container>
        <input type="checkbox" name="slotted" />
      </ui-shadow-container>
    `);
    container = fixture.querySelector('ui-shadow-container')!;
    input = fixture.querySelector('input')!;
    await container.updateComplete;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should allow slotted light-DOM change events to reach the document', () => {
    const documentListener = vi.fn();
    document.addEventListener('change', documentListener);

    input.dispatchEvent(new Event('change', { bubbles: true }));

    document.removeEventListener('change', documentListener);
    expect(documentListener).toHaveBeenCalledOnce();
    expect((documentListener.mock.calls[0]![0] as Event).target).toBe(input);
  });

  it('should allow slotted light-DOM input events to reach the document', () => {
    const documentListener = vi.fn();
    document.addEventListener('input', documentListener);

    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    document.removeEventListener('input', documentListener);
    expect(documentListener).toHaveBeenCalledOnce();
  });
});

describe('mixin - multiple files', () => {
  let element: MultipleFileValueTestElement;
  let fixture: HTMLElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <form>
      <ui-multiple-file-value name="file-input"></ui-multiple-file-value>
    </form>`);

    element = fixture.querySelector<MultipleFileValueTestElement>('ui-multiple-file-value')!;
    form = fixture.querySelector('form')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should preserve default value', async () => {
    expect(element.value).toEqual([
      new File([''], 'test1.txt', { type: 'text/plain' }),
      new File([''], 'test2.txt', { type: 'text/plain' })
    ]);
  });

  it('should set form data on initialization with flat form data value', async () => {
    expect(element.value![0]).toEqual(new File([''], 'test1.txt', { type: 'text/plain' }));
    expect(element.value![1]).toEqual(new File([''], 'test2.txt', { type: 'text/plain' }));
    expect((new FormData(form).getAll('file-input')[0] as File).name).toBe('test1.txt');
    expect((new FormData(form).getAll('file-input')[1] as File).name).toBe('test2.txt');
  });

  it('should set form data on input', async () => {
    element.value = [new File([''], 'update.txt', { type: 'text/plain' })];
    expect(element.value).toEqual([new File([''], 'update.txt', { type: 'text/plain' })]);
    expect((new FormData(form).get('file-input') as File).name).toBe('update.txt');
  });

  it('should treat an empty array as a missing required value', () => {
    element.required = true;
    element.value = [];
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.valueMissing).toBe(true);
  });
});
