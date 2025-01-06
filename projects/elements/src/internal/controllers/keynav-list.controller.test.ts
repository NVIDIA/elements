import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { elementIsStable, createFixture, removeFixture, emulateClick } from '@nvidia-elements/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { keyNavigationList } from '@nvidia-elements/core/internal';

@customElement('keynav-list-test-element')
@keyNavigationList<KeynavListControllerTestElement>()
class KeynavListControllerTestElement extends LitElement {
  @property({ type: String }) layout: 'horizontal' | 'vertical' = 'horizontal';

  @property({ type: Boolean }) loop = false;

  get keynavListConfig() {
    return {
      layout: this.layout,
      loop: this.loop,
      items: this.shadowRoot.querySelectorAll<HTMLElement>('button'),
      dir: this.dir
    };
  }

  render() {
    return html`
      <section>
        <div><button>0</button></div>
        <div><button>1</button></div>
        <div><button>2</button></div>
        <div><button>3</button></div>
        <div><button>4</button></div>
        <div><button>5</button></div>
      </section>
    `;
  }
}

describe('keynav-list.controller', () => {
  let fixture: HTMLElement;
  let element: KeynavListControllerTestElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<keynav-list-test-element></keynav-list-test-element>`);
    element = fixture.querySelector<KeynavListControllerTestElement>('keynav-list-test-element');
    await elementIsStable(element);
    element.keynavListConfig.items[0].focus();
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize first item if focus management is enabled', async () => {
    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(0);
    expect(element.keynavListConfig.items[1].tabIndex).toBe(-1);
  });

  it('should set activate a item on click', async () => {
    await elementIsStable(element);
    element.keynavListConfig.items[2].dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, composed: true, buttons: 1 })
    );
    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[1].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[2].tabIndex).toBe(0);
  });

  it('should support horizontal arrow key navigation', async () => {
    await elementIsStable(element);
    element.keynavListConfig.items[0].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true })
    );
    element.keynavListConfig.items[1].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true })
    );

    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[1].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[2].tabIndex).toBe(0);

    element.keynavListConfig.items[2].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true, composed: true })
    );
    element.keynavListConfig.items[1].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true, composed: true })
    );
    await elementIsStable(element);

    expect(element.keynavListConfig.items[0].tabIndex).toBe(0);
    expect(element.keynavListConfig.items[1].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[2].tabIndex).toBe(-1);
  });

  it('should support horizontal arrow key navigation with RTL', async () => {
    element.dir = 'rtl';

    await elementIsStable(element);
    element.keynavListConfig.items[0].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true })
    );
    element.keynavListConfig.items[1].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true })
    );

    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(0);
    expect(element.keynavListConfig.items[1].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[2].tabIndex).toBe(-1);

    element.keynavListConfig.items[2].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true, composed: true })
    );
    element.keynavListConfig.items[1].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true, composed: true })
    );
    await elementIsStable(element);

    expect(element.keynavListConfig.items[0].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[1].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[2].tabIndex).toBe(0);
  });

  it('should support vertical arrow key navigation', async () => {
    element.layout = 'vertical';
    await elementIsStable(element);
    element.keynavListConfig.items[0].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true })
    );
    element.keynavListConfig.items[1].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true })
    );

    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[1].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[2].tabIndex).toBe(0);

    element.keynavListConfig.items[2].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowUp', bubbles: true, composed: true })
    );
    element.keynavListConfig.items[1].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowUp', bubbles: true, composed: true })
    );
    await elementIsStable(element);

    expect(element.keynavListConfig.items[0].tabIndex).toBe(0);
    expect(element.keynavListConfig.items[1].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[2].tabIndex).toBe(-1);
  });

  it('should support vertical End shortcut', async () => {
    element.layout = 'vertical';
    await elementIsStable(element);
    element.keynavListConfig.items[0].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'End', bubbles: true, composed: true })
    );

    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[1].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[5].tabIndex).toBe(0);
  });

  it('should support vertical Home shortcut', async () => {
    element.layout = 'vertical';
    await elementIsStable(element);
    element.keynavListConfig.items[0].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Home', bubbles: true, composed: true })
    );

    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(0);
    expect(element.keynavListConfig.items[1].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[5].tabIndex).toBe(-1);
  });

  it('should support PageDown shortcut', async () => {
    element.layout = 'vertical';
    await elementIsStable(element);
    element.keynavListConfig.items[0].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'PageDown', bubbles: true, composed: true })
    );

    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[4].tabIndex).toBe(0);
  });

  it('should support PageUp shortcut', async () => {
    element.layout = 'vertical';
    await elementIsStable(element);
    element.keynavListConfig.items[0].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'PageDown', bubbles: true, composed: true })
    );

    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[4].tabIndex).toBe(0);

    element.keynavListConfig.items[4].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'PageUp', bubbles: true, composed: true })
    );
    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(0);
    expect(element.keynavListConfig.items[4].tabIndex).toBe(-1);
  });

  it('should support vertical loops', async () => {
    element.layout = 'vertical';
    element.loop = true;
    await elementIsStable(element);
    element.keynavListConfig.items[0].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowUp', bubbles: true, composed: true })
    );

    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[5].tabIndex).toBe(0);

    element.keynavListConfig.items[5].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true })
    );
    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(0);
    expect(element.keynavListConfig.items[5].tabIndex).toBe(-1);
  });

  it('should disable key nav if host has nve-keynav-disabled attribute', async () => {
    element.setAttribute('nve-keynav-disabled', '');

    await elementIsStable(element);
    element.keynavListConfig.items[0].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true })
    );
    element.keynavListConfig.items[1].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true })
    );

    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(0);
    expect(element.keynavListConfig.items[1].tabIndex).toBe(-1);
    expect(element.keynavListConfig.items[2].tabIndex).toBe(-1);
  });
});

@customElement('skip-keynav-list-test-element')
@keyNavigationList<KeynavListControllerTestElement>()
class SkipKeynavListControllerTestElement extends LitElement {
  @property({ type: String }) layout: 'horizontal' | 'vertical' = 'horizontal';

  @property({ type: Boolean }) loop = false;

  get keynavListConfig() {
    return {
      layout: this.layout,
      loop: this.loop,
      items: this.shadowRoot.querySelectorAll<HTMLElement>('button'),
      dir: this.dir
    };
  }

  render() {
    return html`
      <section>
        <div><button>0</button></div>
        <div>
          <button>1</button>
          <button>2</button>
        </div>
      </section>
    `;
  }
}

describe('skip behaviors keynav-list.controller', () => {
  let fixture: HTMLElement;
  let element: SkipKeynavListControllerTestElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<skip-keynav-list-test-element></skip-keynav-list-test-element>`);
    element = fixture.querySelector<SkipKeynavListControllerTestElement>('skip-keynav-list-test-element');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize first item if focus management is enabled', async () => {
    await elementIsStable(element);
    expect(element.keynavListConfig.items[0].tabIndex).toBe(0);
    expect(element.keynavListConfig.items[1].tabIndex).toBe(-1);
  });

  it('should not autofocus to first focusable element if a item was clicked has sibling focusable items in the same parent node', async () => {
    const buttons = element.shadowRoot.querySelectorAll('button');
    emulateClick(buttons[2]);
    await elementIsStable(element);
    expect(buttons[0].matches(':focus')).toBe(false);
  });
});

@customElement('disabled-keynav-list-test-element')
@keyNavigationList<KeynavListControllerTestElement>()
class DisabledKeynavListControllerTestElement extends LitElement {
  @property({ type: String }) layout: 'horizontal' | 'vertical' = 'horizontal';

  @property({ type: Boolean }) loop = false;

  get keynavListConfig() {
    return {
      layout: this.layout,
      loop: this.loop,
      items: this.shadowRoot.querySelectorAll<HTMLElement>('button'),
      dir: this.dir
    };
  }

  render() {
    return html`
      <section>
        <div><button>0</button></div>
        <div><button disabled>1</button></div>
        <div><button>2</button></div>
      </section>
    `;
  }
}

describe('disabled behaviors keynav-list.controller', () => {
  let fixture: HTMLElement;
  let element: DisabledKeynavListControllerTestElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<disabled-keynav-list-test-element></disabled-keynav-list-test-element>`);
    element = fixture.querySelector<DisabledKeynavListControllerTestElement>('disabled-keynav-list-test-element');
    await elementIsStable(element);
    element.keynavListConfig.items[0].focus();
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should skip disabled items', async () => {
    await elementIsStable(element);
    element.keynavListConfig.items[0].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true })
    );

    await elementIsStable(element);
    expect(element.keynavListConfig.items[2].tabIndex).toBe(0);
  });
});
