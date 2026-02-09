import { html } from 'lit';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { FormControlMixin } from './index.js';
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
    element = fixture.querySelector('ui-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
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
  });

  it('should implement disabled', () => {
    expect(element.disabled).toBe(false);
    expect(element.hasAttribute('disabled')).toBe(false);

    element.disabled = true;
    expect(element.disabled).toBe(true);
    expect(element.hasAttribute('disabled')).toBe(true);
  });

  it('should implement required', () => {
    expect(element.required).toBe(false);
    expect(element.hasAttribute('required')).toBe(false);

    element.required = true;
    expect(element.required).toBe(true);
    expect(element.hasAttribute('required')).toBe(true);
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
    expect(element.form.elements['test'].value).toBe('test');
  });

  it('should throw an error if value is set to a non-string value', () => {
    expect(() => {
      element.valueAsNumber = 10;
    }).toThrowError('(ui-test-element): cannot set number value on non-number type');
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

    element = fixture.querySelector('ui-validator-test-element');
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
    element = fixture.querySelector('ui-complex-value');
    form = fixture.querySelector('form');
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
    expect(Object.fromEntries(new FormData(element.form))).toEqual({ 'test-name': 'Jane', 'test-age': '31' });
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
    element = fixture.querySelector('ui-number-value');
    form = fixture.querySelector('form');
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
    expect(Object.fromEntries(new FormData(element.form))).toEqual({ test: '10' });
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

    element = fixture.querySelector<FileValueTestElement>('ui-file-value');
    form = fixture.querySelector('form');
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

describe('mixin - multiple files', () => {
  let element: MultipleFileValueTestElement;
  let fixture: HTMLElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <form>
      <ui-multiple-file-value name="file-input"></ui-multiple-file-value>
    </form>`);

    element = fixture.querySelector<MultipleFileValueTestElement>('ui-multiple-file-value');
    form = fixture.querySelector('form');
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
    expect(element.value[0]).toEqual(new File([''], 'test1.txt', { type: 'text/plain' }));
    expect(element.value[1]).toEqual(new File([''], 'test2.txt', { type: 'text/plain' }));
    expect((new FormData(form).getAll('file-input')[0] as File).name).toBe('test1.txt');
    expect((new FormData(form).getAll('file-input')[1] as File).name).toBe('test2.txt');
  });

  it('should set form data on input', async () => {
    element.value = [new File([''], 'update.txt', { type: 'text/plain' })];
    expect(element.value).toEqual([new File([''], 'update.txt', { type: 'text/plain' })]);
    expect((new FormData(form).get('file-input') as File).name).toBe('update.txt');
  });
});
