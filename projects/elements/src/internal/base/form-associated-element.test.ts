import { html } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BaseFormAssociatedElement } from '@nvidia-elements/core/internal';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';

@customElement('base-form-associated-element-test-element')
class BaseFormAssociatedElementTestElement extends BaseFormAssociatedElement<string> {
  constructor() {
    super();
    this.value = 'default';
  }
}

describe('base form associated element', () => {
  let element: BaseFormAssociatedElementTestElement;
  let fixture: HTMLElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <form>
      <base-form-associated-element-test-element name="test"></base-form-associated-element-test-element>
    </form>`);

    element = fixture.querySelector<BaseFormAssociatedElementTestElement>('base-form-associated-element-test-element');
    form = fixture.querySelector('form');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should preserve default value', async () => {
    expect(element.value).toBe('default');
  });

  it('should set form data on initialization', async () => {
    expect(element.value).toBe('default');
    expect(new FormData(form).get('test')).toBe('default');
  });

  it('should set form data on input', async () => {
    element.value = 'updated';
    await elementIsStable(element);
    expect(new FormData(form).get('test')).toBe('updated');
  });

  it('should report willValidate', async () => {
    expect(element.willValidate).toBe(true);
  });

  it('should report validity', async () => {
    expect(element.validity instanceof ValidityState).toBe(true);
  });

  it('should report validationMessage', async () => {
    expect(element.validationMessage).toBe('');
  });

  it('should report form', async () => {
    expect(element.form).toBe(form);
  });

  it('should report type', async () => {
    expect(element.type).toBe('base-form-associated-element-test-element');
  });

  it('should dispatch input event on input', async () => {
    element.value = 'updated';
    const event = untilEvent<InputEvent>(element, 'input');
    (element as unknown as { dispatchInputEvent: () => void }).dispatchInputEvent();
    expect((await event).data).toBe('updated');
  });

  it('should dispatch change event on change', async () => {
    element.value = 'updated';
    const event = untilEvent<Event>(element, 'change');
    (element as unknown as { dispatchChangeEvent: () => void }).dispatchChangeEvent();
    await event;
    expect(element.value).toBe('updated');
  });

  it('should throw error when getting non-number value', () => {
    expect(element.value).toBe('default');
    expect(typeof element.value).toBe('string');
    expect(() => element.valueAsNumber).toThrow();
  });
});

@customElement('base-form-associated-element-test-element-number')
class BaseFormAssociatedElementTestElementNumber extends BaseFormAssociatedElement<number> {
  constructor() {
    super();
    this.value = 0;
  }
}

describe('base form associated element - number', () => {
  let element: BaseFormAssociatedElementTestElementNumber;
  let fixture: HTMLElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <form>
      <base-form-associated-element-test-element-number name="test"></base-form-associated-element-test-element-number>
    </form>`);

    element = fixture.querySelector<BaseFormAssociatedElementTestElementNumber>(
      'base-form-associated-element-test-element-number'
    );
    form = fixture.querySelector('form');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should preserve default value', async () => {
    expect(element.value).toBe(0);
  });

  it('should set form data on initialization', async () => {
    expect(element.value).toBe(0);
    expect(new FormData(form).get('test')).toBe('0');
  });

  it('should set form data on input', async () => {
    element.value = 1;
    await elementIsStable(element);
    expect(new FormData(form).get('test')).toBe('1');
  });

  it('should dispatch input event on input', async () => {
    element.value = 1;
    const event = untilEvent<InputEvent>(element, 'input');
    (element as unknown as { dispatchInputEvent: () => void }).dispatchInputEvent();
    expect((await event).data).toBe('1');
  });

  it('should throw error when setting non-number value', () => {
    expect(element.valueAsNumber).toBe(0);
    expect(typeof element.value).toBe('number');
    expect(() => (element.valueAsNumber = 'not a number' as unknown as number)).toThrow();
  });
});

@customElement('base-form-associated-element-test-element-object')
class BaseFormAssociatedElementTestElementObject extends BaseFormAssociatedElement<{ color: string }> {
  constructor() {
    super();
    this.value = { color: 'red' };
  }
}

describe('base form associated element - object', () => {
  let element: BaseFormAssociatedElementTestElementObject;
  let fixture: HTMLElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <form>
      <base-form-associated-element-test-element-object name="test"></base-form-associated-element-test-element-object>
    </form>`);

    element = fixture.querySelector<BaseFormAssociatedElementTestElementObject>(
      'base-form-associated-element-test-element-object'
    );
    form = fixture.querySelector('form');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should preserve default value', async () => {
    expect(element.value).toEqual({ color: 'red' });
  });

  it('should set form data on initialization with flat form data value', async () => {
    expect(element.value).toEqual({ color: 'red' });
    expect(new FormData(form).get('test-color')).toBe('red');
  });

  it('should set form data on input with flat form data value', async () => {
    element.value = { color: 'blue' };
    await elementIsStable(element);
    expect(element.value).toEqual({ color: 'blue' });
    expect(new FormData(form).get('test-color')).toBe('blue');
  });

  it('should dispatch input event on input with flat form data value', async () => {
    element.value = { color: 'green' };
    const event = untilEvent<InputEvent>(element, 'input');
    (element as unknown as { dispatchInputEvent: () => void }).dispatchInputEvent();
    expect((await event).data).toBe('{"color":"green"}');
    expect(element.value).toEqual({ color: 'green' });
    expect(new FormData(form).get('test-color')).toBe('green');
  });
});

@customElement('base-form-associated-element-test-element-file')
class BaseFormAssociatedElementTestElementFile extends BaseFormAssociatedElement<File> {
  constructor() {
    super();
    this.value = new File([''], 'test.txt', { type: 'text/plain' });
  }
}

describe('base form associated element - file', () => {
  let element: BaseFormAssociatedElementTestElementFile;
  let fixture: HTMLElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <form>
      <base-form-associated-element-test-element-file name="test"></base-form-associated-element-test-element-file>
    </form>`);

    element = fixture.querySelector<BaseFormAssociatedElementTestElementFile>(
      'base-form-associated-element-test-element-file'
    );
    form = fixture.querySelector('form');
    await elementIsStable(element);
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
    await elementIsStable(element);
    expect(element.value).toEqual(new File([''], 'update.txt', { type: 'text/plain' }));
    expect((new FormData(form).get('test') as File).name).toBe('update.txt');
  });
});

@customElement('base-form-associated-element-test-element-multiple-files')
class BaseFormAssociatedElementTestElementMultipleFiles extends BaseFormAssociatedElement<File[]> {
  constructor() {
    super();
    this.value = [
      new File([''], 'test1.txt', { type: 'text/plain' }),
      new File([''], 'test2.txt', { type: 'text/plain' })
    ];
  }
}

describe('base form associated element - multiple files', () => {
  let element: BaseFormAssociatedElementTestElementMultipleFiles;
  let fixture: HTMLElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <form>
      <base-form-associated-element-test-element-multiple-files name="file-input"></base-form-associated-element-test-element-multiple-files>
    </form>`);

    element = fixture.querySelector<BaseFormAssociatedElementTestElementMultipleFiles>(
      'base-form-associated-element-test-element-multiple-files'
    );
    form = fixture.querySelector('form');
    await elementIsStable(element);
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
    await elementIsStable(element);
    expect(element.value).toEqual([new File([''], 'update.txt', { type: 'text/plain' })]);
    expect((new FormData(form).get('file-input') as File).name).toBe('update.txt');
  });
});
