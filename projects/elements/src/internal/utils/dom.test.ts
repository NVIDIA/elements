import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import {
  getChildren,
  getFlatDOMTree,
  getAttributeChanges,
  getAttributeListChanges,
  appendRootNodeStyle,
  getElementUpdate,
  clickOutsideElementBounds,
  parseTokenNumber,
  isContextMenuClick,
  getFlattenedFocusableItems,
  getFlattenedDOMTree,
  validKeyNavigationCode,
  KeynavCode,
  define,
  removeEmptyTextNode,
  scrollBarWidth,
  hasScrollBar,
  endOfScrollBox,
  getThemeTokens,
  removeEmptySlotWhitespace,
  hasHorizontalScrollBar,
  getDisplayValue,
  matchesElementName,
  createGhostElement,
  sameRenderRoot
} from '@nvidia-elements/core/internal';

@customElement('dom-test-element')
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
      <dom-test-element>
        <button>two</button>
        <button slot="one">one</button>
      </dom-test-element>
    `);

    element = fixture.querySelector('dom-test-element');
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
      <dom-test-element>
        <button>four</button>
        <button slot="one">slot one</button>
      </dom-test-element>
    `);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('gets all children in document', () => {
    const children = getFlatDOMTree(document);
    expect(children.length > 0).toBe(true);
  });

  // it('gets all children in light and shadow DOM a flattened DOM tree', () => {
  //   const children = getFlatDOMTree(fixture);
  //   expect(children[0].tagName.toLowerCase()).toBe('test-element');
  //   expect(children[1].textContent).toBe('one');
  //   expect(children[2].textContent).toBe('slot one');
  //   expect(children[3].textContent).toBe('two');
  //   expect(children[4].textContent).toBe('three');
  //   expect(children[5].textContent).toBe('four');
  //   expect(children[6].textContent).toBe('four');
  // });
});

describe('getAttributeChanges', () => {
  it('should get attribute changes', async () => {
    const element = document.createElement('div');
    let foo = null;

    expect(foo).toBe(null);

    getAttributeChanges(element, 'foo', value => (foo = value));
    element.setAttribute('foo', 'bar');
    await new Promise(r => r(''));
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

    await new Promise(r => r(''));
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
      appendRootNodeStyle(this, 'test-one { color: blue }');
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
      appendRootNodeStyle(this, 'test-two { color: red }');
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

  // it('should append stylesheet to document if element is in root light dom', async () => {
  //   const cssRules = Array.from((document as any).adoptedStyleSheets[0].cssRules) as any;
  //   expect(cssRules[0].selectorText).toBe('test-one');
  // });

  it('should append stylesheet to shadow root if element is rendered in a shadow root', async () => {
    await elementIsStable(testTwo);
    await elementIsStable(testOne);
    expect((testOne as any).shadowRoot.adoptedStyleSheets.length).toBe(1);
  });
});

describe('getElementUpdate', () => {
  it('should trigger updates for attribute changes', async () => {
    const element = document.createElement('div') as unknown as HTMLElement & { foo: string };

    const update = new Promise(r => {
      getElementUpdate(element, 'foo', value => {
        if (value) {
          r(value);
        }
      });
    });

    element.setAttribute('foo', 'bar');
    expect(await update).toBe('bar');
  });

  it('should trigger updates for property changes', async () => {
    const element = document.createElement('div') as unknown as HTMLElement & { foo: string };

    const update = new Promise(r => {
      getElementUpdate(element, 'id', value => {
        if (value) {
          r(value);
        }
      });
    });

    element.id = 'foo';
    expect(await update).toBe('foo');
  });
});

describe('clickOutsideElementBounds', () => {
  it('should detect when a pointer event is within bounds of target element', async () => {
    const element = { getBoundingClientRect: () => ({ left: 100, top: 100 }) } as HTMLElement;
    const result = clickOutsideElementBounds(new PointerEvent('pointerdown', { clientX: 150, clientY: 150 }), element);
    expect(result).toBe(false);
  });

  it('should detect when a pointer event is outside bounds of target element', async () => {
    const element = { getBoundingClientRect: () => ({ left: 100, top: 100 }) } as HTMLElement;
    const result = clickOutsideElementBounds(new PointerEvent('pointerdown', { clientX: 99, clientY: 99 }), element);
    expect(result).toBe(true);
  });
});

describe('parseTokenNumber', () => {
  it('should parse and get number from basic calc string generated by design tokens', async () => {
    // pre-computed with getComputedStyle()
    expect(parseTokenNumber('calc(1 * 10)')).toBe(10);
    expect(parseTokenNumber('calc(1 * -10)')).toBe(-10);
    expect(parseTokenNumber('calc(1 * 1)')).toBe(1);
    expect(parseTokenNumber('calc(1 * 0)')).toBe(0);
    expect(parseTokenNumber('calc(1 * 10px)')).toBe(10);
    expect(parseTokenNumber('calc(1 * -10px)')).toBe(-10);
    expect(parseTokenNumber('calc(1 * 1px)')).toBe(1);
    expect(parseTokenNumber('calc(1 * 0px)')).toBe(0);

    // raw custom property value
    expect(parseTokenNumber('calc(var(--nve-ref-scale-size) * 10px)')).toBe(10);
    expect(parseTokenNumber('calc(var(--nve-ref-scale-size) * -10px)')).toBe(-10);
    expect(parseTokenNumber('calc(var(--nve-ref-scale-size) * 1px)')).toBe(1);
    expect(parseTokenNumber('calc(var(--nve-ref-scale-size) * 0px)')).toBe(0);
    expect(parseTokenNumber('calc(var(--nve-ref-scale-size) * 0)')).toBe(0);
  });
});

describe('defineElement', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    define(class TestElement extends LitElement {
      static metadata = { tag: 'define-test-element', version: '0.0.0' };
    });
    fixture = await createFixture(html`
      <define-test-element></define-test-element>
    `);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('define-test-element')).toBeDefined();
  });

  it('should add element to global service registry', () => {
    expect(window.NVE_ELEMENTS.state.elementRegistry['define-test-element'].length > 0).toBe(true);
  });
});

describe('isContextMenuClick', () => {
  it('should determine if click was a context menu', async () => {
    expect(isContextMenuClick(new MouseEvent('mouseup'))).toBe(false);
    expect(isContextMenuClick(new MouseEvent('mouseup', { buttons: 2, ctrlKey: false }))).toBe(true);
    expect(isContextMenuClick(new MouseEvent('mouseup', { buttons: 1, ctrlKey: true }))).toBe(true);
  });
});

@customElement('traversal-test-element')
class TraversalTest extends LitElement {
  buttonId = 'shady-btn';

  render() {
    return html`
      <slot name="slot-two">slot 2</slot>
      <button>shadow dom 1</button>
      <p>shadow dom</p>
      <slot>slot</slot>
      <button>shadow dom 2</button>
    `;
  }
}

describe('getFlattenedFocusableItems', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <traversal-test-element>
        <button>light dom 2</button>
        <p>light dom</p>
        <button slot="slot-two">light dom 1</button>
      </traversal-test-element>
    `);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should find all focusable DOM elements in light and shadow DOM from flattened DOM tree', () => {
    const children = getFlattenedFocusableItems(fixture);
    expect(children.length).toBe(4);
    expect(children[0].textContent).toBe('light dom 1');
    expect(children[1].textContent).toBe('shadow dom 1');
    expect(children[2].textContent).toBe('light dom 2');
    expect(children[3].textContent).toBe('shadow dom 2');
  });
});

describe('getFlattenedDOMTree', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <traversal-test-element>
        <button>light dom 2</button>
        <button slot="slot-two">light dom 1</button>
      </traversal-test-element>
    `);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should find all DOM elements in light and shadow DOM from flattened DOM tree preserving slotted element order', () => {
    const children = getFlattenedDOMTree(fixture);
    expect(children.length).toBe(8);
    expect(children[0].tagName.toLowerCase()).toBe('traversal-test-element');
    expect(children[1].textContent).toBe('slot 2');
    expect(children[2].textContent).toBe('light dom 1');
    expect(children[3].textContent).toBe('shadow dom 1');
    expect(children[4].textContent).toBe('shadow dom');
    expect(children[5].textContent).toBe('slot');
    expect(children[6].textContent).toBe('light dom 2');
    expect(children[7].textContent).toBe('shadow dom 2');
  });
});

describe('validKeyNavigationCode(): ', () => {
  it('should determine if keycode is a valid code for key navigation', () => {
    expect(validKeyNavigationCode({ code: 'nope' } as KeyboardEvent)).toBe(false);
    expect(validKeyNavigationCode({ code: KeynavCode.End } as KeyboardEvent)).toBe(true);
    expect(validKeyNavigationCode({ code: KeynavCode.Home } as KeyboardEvent)).toBe(true);
    expect(validKeyNavigationCode({ code: KeynavCode.PageUp } as KeyboardEvent)).toBe(true);
    expect(validKeyNavigationCode({ code: KeynavCode.PageDown } as KeyboardEvent)).toBe(true);
    expect(validKeyNavigationCode({ code: KeynavCode.ArrowUp } as KeyboardEvent)).toBe(true);
    expect(validKeyNavigationCode({ code: KeynavCode.ArrowDown } as KeyboardEvent)).toBe(true);
    expect(validKeyNavigationCode({ code: KeynavCode.ArrowLeft } as KeyboardEvent)).toBe(true);
    expect(validKeyNavigationCode({ code: KeynavCode.ArrowRight } as KeyboardEvent)).toBe(true);
  });
});

describe('removeEmptyTextNode', () => {
  it('should remove text node if empty', async () => {
    const element = document.createElement('div');
    element.innerHTML = ' ';
    expect(element.childNodes.length).toEqual(1);

    element.childNodes.forEach(node => removeEmptyTextNode(node));
    expect(element.childNodes.length).toEqual(0);
  });
});

describe('scrollBarWidth(): ', () => {
  it('should compute the current scroll bar width', () => {
    expect(typeof scrollBarWidth()).toBe('number');
  });
});

describe('hasScrollBar(): ', () => {
  it('should compute the current scroll bar width', () => {
    const div = document.createElement('div');
    const innerDiv = document.createElement('div');
    div.style.width = '500px';
    div.style.height = '500px';
    div.style.overflow = 'auto';
    div.style.display = 'block';
    innerDiv.style.width = '1000px';
    innerDiv.style.height = '1000px';
    innerDiv.style.display = 'block';
    div.appendChild(innerDiv);
    document.body.appendChild(div);

    expect(hasScrollBar(div)).toBe(true);
    div.remove();
  });
});

describe('endOfScrollBox(): ', () => {
  it('should determine if the scroll position is at the end of the scroll box', () => {
    const div = document.createElement('div');
    const innerDiv = document.createElement('div');
    div.style.width = '500px';
    div.style.height = '500px';
    div.style.overflow = 'auto';
    innerDiv.style.width = '1000px';
    innerDiv.style.height = '1000px';
    div.appendChild(innerDiv);
    document.body.appendChild(div);
    div.scrollTop = 1000;
    expect(endOfScrollBox(div)).toBe(true);
    div.remove();
  });
});

describe('getThemeTokens', () => {
  it('should compute and return the current design tokens', async () => {
    const style = document.createElement('style');
    document.head.appendChild(style);
    style.textContent = ':root { --nve-test-token: test; --invalid-test-token: test; }';

    const tokens = getThemeTokens();
    expect(tokens['--nve-test-token']).toBe('test');
    expect(tokens['--invalid-test-token']).toBe(undefined);
  });
});

@customElement('empty-slot-test-element')
class EmptySlotTestElement extends LitElement {
  render() {
    return html`
      <slot @slotchange=${e => removeEmptySlotWhitespace(e.target)}></slot>
    `;
  }
}

describe('removeEmptySlotWhitespace', () => {
  let fixture: HTMLElement;
  let element: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <empty-slot-test-element> </empty-slot-test-element>
    `);

    element = fixture.querySelector<HTMLElement>('empty-slot-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should remove any empty white space from slot to prevent default slot overrides', async () => {
    await elementIsStable(element);
    expect(element.innerHTML).toBe('');
  });
});

describe('hasHorizontalScrollBar', () => {
  let fixture: HTMLElement;
  let element: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <div style="overflow: auto; width: 100px; height: 100px;">
        <div style="width: 200px; height: 200px;"></div>
      </div>
    `);

    element = fixture.querySelector('div');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should determine if element has a horizontal scroll bar', () => {
    expect(hasHorizontalScrollBar(element)).toBe(true);
  });
});

describe('getDisplayValue', () => {
  it('should return the label value if provided', () => {
    expect(getDisplayValue({ label: 'label', value: '' })).toBe('label');
    expect(getDisplayValue({ label: 'label', value: 'value' })).toBe('label');
    expect(getDisplayValue({ label: 'label', value: null })).toBe('label');
    expect(getDisplayValue({ label: 'label', value: undefined })).toBe('label');
  });

  it('should return the value if no label is provided', () => {
    expect(getDisplayValue({ value: 'value', label: '' })).toBe('value');
    expect(getDisplayValue({ value: 'value', label: null })).toBe('value');
    expect(getDisplayValue({ value: 'value', label: undefined })).toBe('value');
  });

  it('should return empty string if no option was provided', () => {
    expect(getDisplayValue(undefined)).toBe('');
  });
});

describe('matchesElementName', () => {
  it('should determine if provided element name matches provided component', () => {
    expect(matchesElementName({ localName: 'mlv-test' }, { metadata: { tag: 'mlv-test' } })).toBe(true);
    expect(matchesElementName({ localName: 'mlv-test' }, { metadata: { tag: 'nve-test' } })).toBe(true);

    expect(matchesElementName({ localName: 'nve-test' }, { metadata: { tag: 'nve-test' } })).toBe(true);
    expect(matchesElementName({ localName: 'nve-test' }, { metadata: { tag: 'mlv-test' } })).toBe(true);

    expect(matchesElementName({ localName: 'x-test' }, { metadata: { tag: 'mlv-test' } })).toBe(false);
    expect(matchesElementName({ localName: 'x-test' }, { metadata: { tag: 'nve-test' } })).toBe(false);
  });
});

describe('createGhostElement', () => {
  it('should create placeholder ghost element for layout shift prevention', () => {
    const element = document.createElement('div');
    element.style.width = '500px';
    element.style.height = '400px';
    document.body.appendChild(element);

    const ghost = createGhostElement(element);
    expect(ghost.hasAttribute('nve-ghost')).toBe(true);
    expect(ghost.style.minWidth).toBe('500px');
    expect(ghost.style.maxWidth).toBe('500px');
    expect(ghost.style.height).toBe('1px');
    element.remove();
  });
});

@customElement('render-root-test-element')
class RenderRootTest extends LitElement {
  render() {
    return html`
      <button id="btn-shadow-root-1">btn</button>
      <button id="btn-shadow-root-2">btn</button>
    `;
  }
}

describe('sameRenderRoot', () => {
  let fixture: HTMLElement;
  let element: HTMLElement;
  let btnShadowRoot1: HTMLButtonElement;
  let btnShadowRoot2: HTMLButtonElement;
  let btnRoot: HTMLButtonElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <render-root-test-element></render-root-test-element>
      <button id="btn-root" aria-label="root button"></button>
    `);

    element = fixture.querySelector('render-root-test-element');
    btnShadowRoot1 = element.shadowRoot.querySelector('#btn-shadow-root-1');
    btnShadowRoot2 = element.shadowRoot.querySelector('#btn-shadow-root-2');
    btnRoot = fixture.querySelector('#btn-root');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should determine if pair of elements are rendered within same render root target', () => {
    expect(sameRenderRoot(btnShadowRoot1, btnShadowRoot2)).toBe(true);
    expect(sameRenderRoot(btnShadowRoot1, btnRoot)).toBe(false);
  });
});
