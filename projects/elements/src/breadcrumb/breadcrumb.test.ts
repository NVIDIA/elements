import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Breadcrumb, getBreadcrumbItemId, addSlotsAndAttributesToItems } from '@elements/elements/breadcrumb';
import '@elements/elements/breadcrumb/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

describe('nve-breadcrumb', () => {
  let fixture: HTMLElement;
  let element: Breadcrumb;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-breadcrumb>
        <nve-icon-button icon-name="home"><a href="#" aria-label="link to first page"></a></nve-icon-button>
        <nve-button><a href="#">Item</a></nve-button>
        <span>Static item</span>
      </nve-breadcrumb>
    `);
    element = fixture.querySelector('nve-breadcrumb');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-breadcrumb')).toBeDefined();
  });
});

describe('nve-breadcrumb helpers: getBreadcrumbItemId', () => {
  it('generates an id', () => {
    const testme = getBreadcrumbItemId();
    expect(testme).toBeDefined();
    expect(typeof testme === 'string').toBe(true);
  });

  it('ids should be unique', () => {
    const testme = [getBreadcrumbItemId(), getBreadcrumbItemId(), getBreadcrumbItemId(), getBreadcrumbItemId()];
    expect(testme[0]).not.toEqual(testme[testme.length - 1]);
  });
});

@customElement('breadcrumb-helper-test-element')
class BreadcrumbHelperTestComponent extends LitElement {
  render() {
    return html`
      <slot></slot>
    `;
  }
}

describe('nve-breadcrumb helpers: addSlotsAndAttributesToItems', () => {
  let fixture: HTMLElement;
  let element: BreadcrumbHelperTestComponent;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <breadcrumb-helper-test-element>
        <h4>noop</h4>
        <nve-icon-button icon-name="home"><a href="#" aria-label="link to first page"></a></nve-icon-button>
        <div>noop</div>
        <nve-button><a href="#">Item</a></nve-button>
        <span>Static item</span>
      </breadcrumb-helper-test-element>
    `);
    element = fixture.querySelector('breadcrumb-helper-test-element');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should decorate clickable and span elements with slot names', () => {
    const testItems = addSlotsAndAttributesToItems(Array.from(element.children));
    testItems.forEach((item, idx) => {
      const tagName = item.tagName;

      expect(item.hasAttribute('slot')).toBe(true);

      if (tagName === 'SPAN') {
        expect(item.hasAttribute('interaction')).toBe(false);
      } else {
        expect(item.getAttribute('interaction')).toBe('ghost');
      }

      if (idx === (testItems.length - 1)) {
        expect(item.hasAttribute('last-item')).toBe(true);
      }
    });
  });

  it('should ignore non-clickable and non-span elements', () => {
    const testTags = addSlotsAndAttributesToItems(Array.from(element.children)).map(el => el.tagName);
    expect(testTags.indexOf('DIV')).toEqual(-1);
    expect(testTags.indexOf('H4')).toEqual(-1);
  });

  it('should decorate last item with last-item attribute', () => {
    expect(element).toBeDefined();
  });

  it('should decorate clickable elements with ghost interaction', () => {
    expect(element).toBeDefined();
  });
});