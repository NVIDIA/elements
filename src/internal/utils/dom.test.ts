import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { getChildren, getFlatDOMTree, getAttributeChanges, getAttributeListChanges, appendRootNodeStyle } from '@elements/elements/internal';

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

describe('getAttributeChanges', () => {
  it('should get attribute changes', async () => {
    const element = document.createElement('div');
    let foo = null;

    expect(foo).toBe(null);

    getAttributeChanges(element, 'foo', value => foo = value);
    element.setAttribute('foo', 'bar');

    expect(foo).toBe('bar');
  });
});

describe('getAttributeListChanges', () => {
  it('should get attribute changes from a list of chosen attributes', async () => {
    const element = document.createElement('div');
    const values = [];

    expect(values).toEqual([]);

    getAttributeListChanges(element, ['foo', 'bar'], value => values.push(value.attributeName));
    element.setAttribute('foo', '');
    element.setAttribute('bar', '');

    expect(values).toEqual(['foo', 'bar']);
  });
});

describe('appendRootNodeStyle', () => {
  @customElement('test-one')
  class TestOne extends LitElement {
    render() {
      return html`
        <span>one</span>
        <test-two></test-two>
      `;
    }

    connectedCallback(): void {
      super.connectedCallback();
      appendRootNodeStyle(this, 'test-one { color: blue }')
    }
  }

  @customElement('test-two')
  class TestTwo extends LitElement {
    render() {
      return html`
        <span>two</span>
      `;
    }

    connectedCallback(): void {
      super.connectedCallback();
      appendRootNodeStyle(this, 'test-two { color: red }')
    }
  }

  let fixture: HTMLElement;
  let testOne: HTMLElement;
  let testTwo: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <test-one></test-one>
    `);

    testOne = fixture.querySelector('test-one');
    testTwo = testOne.shadowRoot.querySelector('test-two');
    await elementIsStable(testTwo);
    await elementIsStable(testOne);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('test-one')).toBeDefined();
    expect(customElements.get('test-two')).toBeDefined();
  });

  it('should append stylesheet to document if element is in root light dom', async () => {
    const cssRules = Array.from((document as any).adoptedStyleSheets[0].cssRules) as any;
    expect(cssRules[0].selectorText).toBe('test-one');
  });

  // should be 1, the inner element should append tot he adoptedStyleSheets of the outer element but happy-dom does not emulate this correctly
  // it('should append stylesheet to shadow root if element is rendered in a shadow root', async () => {
  //   await elementIsStable(testTwo);
  //   await elementIsStable(testOne);
  //   expect((testOne as any).shadowRoot.adoptedStyleSheets.length).toBe(1);
  // });
});