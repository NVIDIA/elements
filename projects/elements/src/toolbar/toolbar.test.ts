import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Toolbar } from '@elements/elements/toolbar';
import '@elements/elements/toolbar/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/button-group/define.js';
import '@elements/elements/divider/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/icon-button/define.js';

describe('mlv-toolbar', () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-toolbar>
        <div slot="prefix">prefix</div>
        <div>content</div>
        <div slot="suffix">suffix</div>
      </mlv-toolbar>
    `);
    element = fixture.querySelector('mlv-toolbar');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-toolbar')).toBeDefined();
  });

  it('should initialize role toolbar', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('toolbar');
  });

  it('should reflect a container attribute', async () => {
    expect(element.container).toBe(undefined);
    expect(element.hasAttribute('container')).toBe(false);

    element.container = 'flat';
    await elementIsStable(element);
    expect(element.getAttribute('container')).toBe('flat');
  });

  it('should reflect a content attribute', async () => {
    expect(element.content).toBe('scroll');
    expect(element.getAttribute('content')).toBe('scroll');

    element.content = 'wrap';
    await elementIsStable(element);
    expect(element.getAttribute('content')).toBe('wrap');
  });

  it('should reflect a orientation attribute', async () => {
    expect(element.orientation).toBe('horizontal');
    expect(element.getAttribute('orientation')).toBe('horizontal');

    element.orientation = 'vertical';
    await elementIsStable(element);
    expect(element.getAttribute('orientation')).toBe('vertical');
  });

  it('should reflect a status attribute', async () => {
    expect(element.status).toBe(undefined);
    expect(element.hasAttribute('status')).toBe(false);

    element.status = 'accent';
    await elementIsStable(element);
    expect(element.getAttribute('status')).toBe('accent');
  });

  it('should not apply --scrollbar state when there is no center content overflow', async () => {
    await elementIsStable(element);
    expect(element.matches(':--scrollbar')).toBe(false);
  });
});

describe('mlv-toolbar scrollbar state', () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-toolbar style="width: 200px">
        <div slot="prefix">prefix</div>
        <div>content content content content content content</div>
        <div slot="suffix">suffix</div>
      </mlv-toolbar>
    `);
    element = fixture.querySelector('mlv-toolbar');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should apply --scrollbar state when there is center content overflow', async () => {
    await elementIsStable(element);
    expect(element.matches(':--scrollbar')).toBe(true);
  });

  it('should remove --scrollbar state when there is no center content overflow', async () => {
    element.querySelector('div:not([slot])').remove();
    await elementIsStable(element);
    expect(element.matches(':--scrollbar')).toBe(false);
  });
});

describe('mlv-toolbar orientation', () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-toolbar orientation="vertical">
        <mlv-button-group>
          <mlv-icon-button pressed icon-name="bars-3-bottom-left"></mlv-icon-button>
          <mlv-icon-button icon-name="bars-3-bottom-right"></mlv-icon-button>
          <mlv-icon-button icon-name="bars-4"></mlv-icon-button>
        </mlv-button-group>

        <mlv-divider></mlv-divider>

        <mlv-button-group>
          <mlv-icon-button icon-name="bold" size="sm"></mlv-icon-button>
          <mlv-icon-button icon-name="italic" size="sm"></mlv-icon-button>
          <mlv-icon-button icon-name="strikethrough"></mlv-icon-button>
        </mlv-button-group>
      </mlv-toolbar>
    `);
    element = fixture.querySelector('mlv-toolbar');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should sync orientation of slotted elements', async () => {
    await elementIsStable(element);
    expect(fixture.querySelector('mlv-button-group').orientation).toBe('vertical');
    expect(fixture.querySelector('mlv-divider').orientation).toBe('horizontal');

    element.orientation = 'horizontal';
    await elementIsStable(element);
    expect(fixture.querySelector('mlv-button-group').orientation).toBe('horizontal');
    expect(fixture.querySelector('mlv-divider').orientation).toBe('vertical');
  });
});

describe('mlv-toolbar container', () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-toolbar container="flat">
        <mlv-select>
          <select aria-label="element type">
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="p">Paragraph</option>
          </select>
        </mlv-select>

        <mlv-button-group>
          <mlv-icon-button pressed icon-name="bars-3-bottom-left"></mlv-icon-button>
          <mlv-icon-button icon-name="bars-3-bottom-right"></mlv-icon-button>
          <mlv-icon-button icon-name="bars-4"></mlv-icon-button>
        </mlv-button-group>

        <mlv-button><mlv-icon name="delete"></mlv-icon> delete</mlv-button>
        <mlv-icon-button icon-name="gear" slot="suffix" aria-label="settings"></mlv-icon-button>
      </mlv-toolbar>
    `);
    element = fixture.querySelector('mlv-toolbar');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should sync container of slotted elements', async () => {
    await elementIsStable(element);
    expect(fixture.querySelector('mlv-select').container).toBe(undefined);
    expect(fixture.querySelector('mlv-button-group').container).toBe(undefined);
    expect(fixture.querySelector('mlv-icon-button').interaction).toBe(undefined);
    expect(fixture.querySelector('mlv-button').interaction).toBe(undefined);

    element.container = undefined;
    await elementIsStable(element);
    expect(fixture.querySelector('mlv-select').container).toBe('flat');
    expect(fixture.querySelector('mlv-button-group').container).toBe('flat');
    expect(fixture.querySelector('mlv-icon-button').interaction).toBe('flat');
    expect(fixture.querySelector('mlv-button').interaction).toBe('flat');
  });
});
