import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture } from '@elements/elements/test';
import { getChildren, getFlatDOMTree } from '@elements/elements/internal';

@customElement('test-element')
class TestComponent extends LitElement {
  render() {
    return html`
      <slot name="one">one</slot>
      <button>two</button>
      <p>three</p>
      <slot>four</slot>
      <button>five</button>
    `;
  }
}

describe('getChildren', () => {
  let fixture: HTMLElement;
  let element: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <test-element>
        <button>two</button>
        <button slot="one">one</button>
      </test-element>
    `);

    element = fixture.querySelector('test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should get children in light DOM', () => {
    const children = getChildren(fixture);
    expect(children.length).toBe(1);
  });

  it('should get children in shadow DOM', () => {
    const children = getChildren(element);
    expect(children.length).toBe(5);
  });
});

describe('getFlatDOMTree', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <test-element>
        <button>four</button>
        <button slot="one">slot one</button>
      </test-element>
    `);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('gets all children in document', () => {
    const children = getFlatDOMTree(document);
    expect(children.length).toBe(12);
  });

  it('gets all children in light and shadow DOM a flattened DOM tree', () => {
    const children = getFlatDOMTree(fixture);
    expect(children[0].tagName.toLowerCase()).toBe('test-element');
    expect(children[1].textContent).toBe('one');
    expect(children[2].textContent).toBe('slot one');
    expect(children[3].textContent).toBe('two');
    expect(children[4].textContent).toBe('three');
    expect(children[5].textContent).toBe('four');
    expect(children[6].textContent).toBe('four');
  });
});
