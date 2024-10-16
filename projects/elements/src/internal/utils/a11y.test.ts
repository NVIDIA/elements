import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@nvidia-elements/testing';
import {
  associateLabel,
  attachInternals,
  associateAriaLabel,
  associateAriaDescribedBy,
  associateDataList,
  associateControlGroup
} from '@nvidia-elements/core/internal';

@customElement('element-internals-test-element')
class ElementInternalsTestElement extends LitElement {
  declare _internals: ElementInternals;

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
  }
}

describe('attachInternals', () => {
  let element: ElementInternalsTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<element-internals-test-element></element-internals-test-element>`);
    element = fixture.querySelector('element-internals-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should attach an instance of element internals to a custom element', async () => {
    expect(element._internals).toBeDefined();
  });

  it('should prevent a element internals from being called multiple times', async () => {
    attachInternals(element); // should not throw if called multiple times
    expect(element._internals).toBeDefined();
  });
});

describe('associateLabel', () => {
  it('should associate a given label and input type via IDREF', async () => {
    const input = document.createElement('input');
    const label = document.createElement('label');

    expect(label.htmlFor).toBe('');
    expect(input.id).toBe('');

    associateLabel(label, input);

    expect(input.id.length).toBeGreaterThan(0);
    expect(label.htmlFor).toBe(input.id);
  });

  it('should use existing id for IDREF if already provided', async () => {
    const input = document.createElement('input');
    const label = document.createElement('label');
    input.id = 'test-id';

    expect(label.htmlFor).toBe('');
    expect(input.id).toBe('test-id');

    associateLabel(label, input);

    expect(input.id).toBe('test-id');
    expect(label.htmlFor).toBe('test-id');
  });
});

describe('associateAriaLabel', () => {
  it('should label a given element via aria-labelledby', async () => {
    const paragraph = document.createElement('p');
    const span = document.createElement('span');

    expect(span.id).toBe('');
    expect(paragraph.hasAttribute('aria-labelledby')).toBe(false);

    associateAriaLabel(span, paragraph);

    expect(span.id.length).toBeGreaterThan(0);
    expect(paragraph.getAttribute('aria-labelledby')).toBe(span.id);
  });

  it('should use existing id for aria-labelledby if already provided', async () => {
    const paragraph = document.createElement('p');
    const label = document.createElement('span');
    label.id = 'test-id';

    expect(label.id).toBe('test-id');
    expect(paragraph.hasAttribute('aria-labelledby')).toBe(false);

    associateAriaLabel(label, paragraph);

    expect(label.id).toBe('test-id');
    expect(paragraph.getAttribute('aria-labelledby')).toBe('test-id');
  });
});

describe('associateAriaDescribedBy', () => {
  it('should describe an element via aria-describedby', async () => {
    const paragraph = document.createElement('p');
    const description = document.createElement('div');

    expect(description.id).toBe('');
    expect(paragraph.hasAttribute('aria-describedby')).toBe(false);

    associateAriaDescribedBy([description], paragraph);

    expect(description.id.length).toBeGreaterThan(0);
    expect(paragraph.getAttribute('aria-describedby')).toBe(description.id);
  });

  it('should describe an element via aria-describedby with multiple descriptive elements', async () => {
    const paragraph = document.createElement('p');
    const description = document.createElement('div');
    const descriptionTwo = document.createElement('div');

    expect(description.id).toBe('');
    expect(descriptionTwo.id).toBe('');
    expect(paragraph.hasAttribute('aria-describedby')).toBe(false);

    associateAriaDescribedBy([description, descriptionTwo], paragraph);

    expect(description.id.length).toBeGreaterThan(0);
    expect(descriptionTwo.id.length).toBeGreaterThan(0);
    expect(paragraph.getAttribute('aria-describedby')).toBe(`${description.id} ${descriptionTwo.id}`);
  });
});

describe('associateDataList', () => {
  it('should associate a datalist element to a give input element', async () => {
    const input = document.createElement('input');
    const datalist = document.createElement('datalist');

    expect(datalist.id).toBe('');
    expect(input.hasAttribute('list')).toBe(false);

    associateDataList(datalist, input);

    expect(datalist.id.length).toBeGreaterThan(0);
    expect(input.getAttribute('list')).toBe(datalist.id);
  });

  it('should associate a datalist element using provided id', async () => {
    const input = document.createElement('input');
    const datalist = document.createElement('datalist');
    datalist.id = 'test-id';

    expect(datalist.id).toBe('test-id');
    expect(input.hasAttribute('list')).toBe(false);

    associateDataList(datalist, input);

    expect(datalist.id).toBe('test-id');
    expect(input.getAttribute('list')).toBe('test-id');
  });
});

describe('associateControlGroup', () => {
  it('should associate list of form controls to a single "name" if no name was provided', async () => {
    const inputOne = document.createElement('input');
    const inputTwo = document.createElement('input');
    const inputThree = document.createElement('input');

    expect(inputOne.name).toBe('');
    expect(inputTwo.name).toBe('');
    expect(inputThree.name).toBe('');

    associateControlGroup([inputOne, inputTwo, inputThree]);

    expect(inputOne.name.length).toBeGreaterThan(0);
    expect(inputTwo.name).toBe(inputOne.name);
    expect(inputThree.name).toBe(inputOne.name);
  });

  it('should NOT associate list of form controls if any provided a "name"', async () => {
    const inputOne = document.createElement('input');
    const inputTwo = document.createElement('input');
    const inputThree = document.createElement('input');
    inputOne.name = 'group';

    expect(inputOne.name).toBe('group');
    expect(inputTwo.name).toBe('');
    expect(inputThree.name).toBe('');

    associateControlGroup([inputOne, inputTwo, inputThree]);

    expect(inputOne.name).toBe('group');
    expect(inputTwo.name).toBe('');
    expect(inputThree.name).toBe('');
  });
});
