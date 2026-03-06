import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
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
  sameRenderRoot,
  generateId,
  styleSheetToString,
  hasInvalidDOMGrid,
  slotContainsOnlyWhitespace,
  tagSelector,
  getAnchorNames,
  removeAnchorName,
  appendAnchorName
} from '@nvidia-elements/core/internal';

@customElement('dom-test-element')
class TestComponent extends LitElement {
  render() {
    return html`
      <slot name="one">one</slot>
      <button>two</button>
      <p nve-text="body">three</p>
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

  it('should get children from Document', () => {
    const children = getChildren(document);
    expect(children.length).toBeGreaterThan(0);
    expect(children[0]).toBeInstanceOf(HTMLElement);
  });

  it('should get children from HTMLSlotElement with assigned elements', () => {
    const slot = element.shadowRoot.querySelector('slot[name="one"]') as HTMLSlotElement;
    const children = getChildren(slot);
    expect(children.length).toBe(1);
    expect(children[0].textContent).toBe('one');
  });

  it('should get children from HTMLSlotElement with fallback', () => {
    // Get the default slot (without name attribute)
    const slot = element.shadowRoot.querySelector('slot:not([name])') as HTMLSlotElement;
    const children = getChildren(slot);
    expect(children.length).toBe(1);
    // The slot gets content from light DOM, not fallback content
    expect(children[0].textContent).toBe('two');
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

  it('gets all children in light and shadow DOM a flattened DOM tree', () => {
    const children = getFlatDOMTree(fixture);
    expect(children[0].tagName.toLowerCase()).toBe('dom-test-element');
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

  it('should append stylesheet to shadow root if element is rendered in a shadow root', async () => {
    await elementIsStable(testTwo);
    await elementIsStable(testOne);
    expect(testOne.shadowRoot.adoptedStyleSheets.length).toBe(1);
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
    const element = { getBoundingClientRect: () => ({ left: 100, top: 100, right: 200, bottom: 200 }) } as HTMLElement;
    const result = clickOutsideElementBounds(new PointerEvent('pointerdown', { clientX: 150, clientY: 150 }), element);
    expect(result).toBe(false);
  });

  it('should detect when a pointer event is outside bounds of target element', async () => {
    const element = { getBoundingClientRect: () => ({ left: 100, top: 100, right: 200, bottom: 200 }) } as HTMLElement;
    const result = clickOutsideElementBounds(new PointerEvent('pointerdown', { clientX: 99, clientY: 99 }), element);
    expect(result).toBe(true);
  });

  it('should detect when a mouse event is outside bounds of target element', async () => {
    const element = { getBoundingClientRect: () => ({ left: 100, top: 100, right: 200, bottom: 200 }) } as HTMLElement;
    const result = clickOutsideElementBounds(new MouseEvent('mousedown', { clientX: 201, clientY: 201 }), element);
    expect(result).toBe(true);
  });

  it('should detect when a pointer event is outside bounds on the right side', async () => {
    const element = { getBoundingClientRect: () => ({ left: 100, top: 100, right: 200, bottom: 200 }) } as HTMLElement;
    const result = clickOutsideElementBounds(new PointerEvent('pointerdown', { clientX: 201, clientY: 150 }), element);
    expect(result).toBe(true);
  });

  it('should detect when a pointer event is outside bounds on the bottom side', async () => {
    const element = { getBoundingClientRect: () => ({ left: 100, top: 100, right: 200, bottom: 200 }) } as HTMLElement;
    const result = clickOutsideElementBounds(new PointerEvent('pointerdown', { clientX: 150, clientY: 201 }), element);
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

  it('should parse non-calc values', () => {
    expect(parseTokenNumber('10')).toBe(10);
    expect(parseTokenNumber('-10')).toBe(-10);
    expect(parseTokenNumber('0')).toBe(0);
    expect(parseTokenNumber('42')).toBe(42);
  });

  it('should return 0 for invalid values', () => {
    expect(parseTokenNumber('')).toBe(0);
    expect(parseTokenNumber('invalid')).toBe(0);
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
      <p nve-text="body">shadow dom</p>
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
        <p nve-text="body">light dom</p>
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
  it('should detect when element has a scroll bar', () => {
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

  it('should detect when element has no scroll bar', () => {
    const div = document.createElement('div');
    div.style.width = '500px';
    div.style.height = '500px';
    div.style.overflow = 'hidden';
    div.style.display = 'block';
    document.body.appendChild(div);

    expect(hasScrollBar(div)).toBe(false);
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

  it('should determine if the scroll position is not at the end of the scroll box', () => {
    const div = document.createElement('div');
    const innerDiv = document.createElement('div');
    div.style.width = '500px';
    div.style.height = '500px';
    div.style.overflow = 'auto';
    innerDiv.style.width = '1000px';
    innerDiv.style.height = '1000px';
    div.appendChild(innerDiv);
    document.body.appendChild(div);
    div.scrollTop = 400; // Scroll less to ensure we're not at the end
    expect(endOfScrollBox(div)).toBe(false);
    div.remove();
  });

  it('should respect offset parameter', () => {
    const div = document.createElement('div');
    const innerDiv = document.createElement('div');
    div.style.width = '500px';
    div.style.height = '500px';
    div.style.overflow = 'auto';
    innerDiv.style.width = '1000px';
    innerDiv.style.height = '1000px';
    div.appendChild(innerDiv);
    document.body.appendChild(div);
    div.scrollTop = 400; // Scroll to position 400
    // scrollTop (400) + offsetHeight (500) + offset (100) = 1000, which equals scrollHeight (1000)
    expect(endOfScrollBox(div, 100)).toBe(true);
    // scrollTop (400) + offsetHeight (500) + offset (99) = 999, which is less than scrollHeight (1000)
    expect(endOfScrollBox(div, 99)).toBe(false);
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

  it('should accept custom element parameter', async () => {
    const customElement = document.createElement('div');
    const tokens = getThemeTokens(customElement);
    expect(typeof tokens).toBe('object');
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
    expect(matchesElementName({ localName: 'nve-test' }, { metadata: { tag: 'nve-test' } })).toBe(true);
    expect(matchesElementName({ localName: 'nve-test' }, { metadata: { tag: 'nve-test' } })).toBe(true);

    expect(matchesElementName({ localName: 'nve-test' }, { metadata: { tag: 'nve-test' } })).toBe(true);
    expect(matchesElementName({ localName: 'nve-test' }, { metadata: { tag: 'nve-test' } })).toBe(true);

    expect(matchesElementName({ localName: 'x-test' }, { metadata: { tag: 'nve-test' } })).toBe(false);
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

describe('generateId', () => {
  it('should generate unique IDs with underscore prefix', () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).toMatch(/^_[a-f0-9]+$/);
    expect(id2).toMatch(/^_[a-f0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  it('should generate IDs from crypto random values', () => {
    // Test that the function generates IDs with the expected format
    const id = generateId();
    expect(id).toMatch(/^_[a-f0-9]+$/);
    expect(id.length).toBeGreaterThan(1);
  });
});

describe('styleSheetToString', () => {
  it('should convert CSSStyleSheet to string', () => {
    const stylesheet = new CSSStyleSheet();
    stylesheet.replaceSync('body { color: red; } p { margin: 10px; }');

    const result = styleSheetToString(stylesheet);
    expect(result).toContain('body { color: red; }');
    expect(result).toContain('p { margin: 10px; }');
  });

  it('should handle stylesheet without cssRules', () => {
    const stylesheet = {} as CSSStyleSheet;
    const result = styleSheetToString(stylesheet);
    expect(result).toBe('');
  });
});

describe('hasInvalidDOMGrid', () => {
  it('should return false when all rows have the same number of children', () => {
    const rows = [{ children: { length: 3 } }, { children: { length: 3 } }] as HTMLElement[];

    expect(hasInvalidDOMGrid(rows)).toBe(false);
  });

  it('should return false when all three rows have the same number of children', () => {
    const rows = [
      { children: { length: 3 } },
      { children: { length: 3 } },
      { children: { length: 3 } }
    ] as HTMLElement[];

    expect(hasInvalidDOMGrid(rows)).toBe(false);
  });

  it('should return true when rows have different number of children', () => {
    const rows = [
      { children: { length: 3 } },
      { children: { length: 4 } },
      { children: { length: 3 } }
    ] as HTMLElement[];

    expect(hasInvalidDOMGrid(rows)).toBe(true);
  });
});

describe('slotContainsOnlyWhitespace', () => {
  it('should detect slot with only whitespace text nodes', () => {
    const slot = document.createElement('slot') as HTMLSlotElement;
    const textNode1 = document.createTextNode(' ');
    const textNode2 = document.createTextNode('\n');
    const textNode3 = document.createTextNode('\t');

    slot.appendChild(textNode1);
    slot.appendChild(textNode2);
    slot.appendChild(textNode3);

    expect(slotContainsOnlyWhitespace(slot)).toBe(true);
  });

  it('should detect slot with non-whitespace text nodes', () => {
    const slot = document.createElement('slot') as HTMLSlotElement;
    const textNode = document.createTextNode('Hello');

    Object.defineProperty(slot, 'assignedNodes', {
      value: () => [textNode],
      writable: true,
      configurable: true
    });

    expect(slotContainsOnlyWhitespace(slot)).toBe(false);
  });

  it('should detect slot with element nodes', () => {
    const slot = document.createElement('slot') as HTMLSlotElement;
    const div = document.createElement('div');

    // Mock assignedNodes to return the element node
    Object.defineProperty(slot, 'assignedNodes', {
      value: () => [div],
      writable: true,
      configurable: true
    });

    expect(slotContainsOnlyWhitespace(slot)).toBe(false);
  });

  it('should detect slot with mixed content', () => {
    const slot = document.createElement('slot') as HTMLSlotElement;
    const textNode = document.createTextNode(' ');
    const div = document.createElement('div');

    Object.defineProperty(slot, 'assignedNodes', {
      value: () => [textNode, div],
      writable: true,
      configurable: true
    });

    expect(slotContainsOnlyWhitespace(slot)).toBe(false);
  });
});

describe('tagSelector', () => {
  it('should convert nve- prefix to nve- prefix', () => {
    const result = tagSelector('nve-button');
    expect(result).toBe('nve-button, nve-button');
  });

  it('should convert nve- prefix to nve- prefix', () => {
    const result = tagSelector('nve-button');
    expect(result).toBe('nve-button, nve-button');
  });

  it('should handle multiple replacements', () => {
    const result = tagSelector('nve-button nve-input');
    expect(result).toBe('nve-button nve-input, nve-button nve-input');
  });

  it('should handle no prefix', () => {
    const result = tagSelector('button');
    expect(result).toBe('button, button');
  });
});

describe('getAnchorNames', () => {
  it('should return array of anchor names from element', () => {
    const element = document.createElement('div');
    element.style.anchorName = '--anchor-1, --anchor-2, --anchor-3';
    document.body.appendChild(element);

    const names = getAnchorNames(element);
    expect(names).toEqual(['--anchor-1', '--anchor-2', '--anchor-3']);
    element.remove();
  });

  it('should return single anchor name', () => {
    const element = document.createElement('div');
    element.style.anchorName = '--my-anchor';
    document.body.appendChild(element);

    const names = getAnchorNames(element);
    expect(names).toEqual(['--my-anchor']);
    element.remove();
  });

  it('should return empty array when no anchor names are set', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const names = getAnchorNames(element);
    expect(names).toEqual([]);
    element.remove();
  });

  it('should return empty array when anchorNames is undefined or not supported', () => {
    const element = document.createElement('div');
    // anchorName may be undefined due to unsupported browser or fallback to floating-ui positioning
    element.style.anchorName = undefined;
    document.body.appendChild(element);

    const names = getAnchorNames(element);
    expect(names).toEqual([]);
    element.remove();
  });

  it('should filter out "none" value', () => {
    const element = document.createElement('div');
    element.style.anchorName = 'none'; // 'none' is returned by getComputedStyle for empty anchor name
    document.body.appendChild(element);

    const names = getAnchorNames(element);
    expect(names).toEqual([]);
    element.remove();
  });

  it('should trim whitespace from anchor names', () => {
    const element = document.createElement('div');
    element.style.anchorName = '  --anchor-1  ,  --anchor-2  ';
    document.body.appendChild(element);

    const names = getAnchorNames(element);
    expect(names).toEqual(['--anchor-1', '--anchor-2']);
    element.remove();
  });
});

describe('removeAnchorName', () => {
  it('should remove specific anchor name from list', () => {
    const element = document.createElement('div');
    element.style.anchorName = '--anchor-1, --anchor-2, --anchor-3';
    document.body.appendChild(element);

    removeAnchorName(element, '--anchor-2');
    const names = getAnchorNames(element);
    expect(names).toEqual(['--anchor-1', '--anchor-3']);
    element.remove();
  });

  it('should handle removing non-existent anchor name', () => {
    const element = document.createElement('div');
    element.style.anchorName = '--anchor-1, --anchor-2';
    document.body.appendChild(element);

    removeAnchorName(element, '--anchor-3');
    const names = getAnchorNames(element);
    expect(names).toEqual(['--anchor-1', '--anchor-2']);
    element.remove();
  });

  it('should handle removing the only anchor name', () => {
    const element = document.createElement('div');
    element.style.anchorName = '--my-anchor';
    document.body.appendChild(element);

    removeAnchorName(element, '--my-anchor');
    expect(element.style.anchorName).toBe('');
    element.remove();
  });

  it('should leave other anchor names intact', () => {
    const element = document.createElement('div');
    element.style.anchorName = '--keep-1, --remove, --keep-2';
    document.body.appendChild(element);

    removeAnchorName(element, '--remove');
    const names = getAnchorNames(element);
    expect(names).toEqual(['--keep-1', '--keep-2']);
    element.remove();
  });
});

describe('appendAnchorName', () => {
  it('should append new anchor name to existing list', () => {
    const element = document.createElement('div');
    element.style.anchorName = '--anchor-1, --anchor-2';
    document.body.appendChild(element);

    appendAnchorName(element, '--anchor-3');
    const names = getAnchorNames(element);
    expect(names).toEqual(['--anchor-1', '--anchor-2', '--anchor-3']);
    element.remove();
  });

  it('should not duplicate existing anchor names', () => {
    const element = document.createElement('div');
    element.style.anchorName = '--anchor-1, --anchor-2';
    document.body.appendChild(element);

    appendAnchorName(element, '--anchor-2');
    const names = getAnchorNames(element);
    expect(names).toEqual(['--anchor-1', '--anchor-2']);
    element.remove();
  });

  it('should handle appending to empty anchor name list', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    appendAnchorName(element, '--my-anchor');
    const names = getAnchorNames(element);
    expect(names).toEqual(['--my-anchor']);
    element.remove();
  });
});
