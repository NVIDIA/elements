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

describe('nve-toolbar', () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toolbar>
        <div slot="prefix">prefix</div>
        <div>content</div>
        <div slot="suffix">suffix</div>
      </nve-toolbar>
    `);
    element = fixture.querySelector('nve-toolbar');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-toolbar')).toBeDefined();
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

describe('nve-toolbar scrollbar state', () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toolbar style="width: 200px">
        <div slot="prefix">prefix</div>
        <div>content content content content content content</div>
        <div slot="suffix">suffix</div>
      </nve-toolbar>
    `);
    element = fixture.querySelector('nve-toolbar');
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

describe('nve-toolbar orientation', () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toolbar orientation="vertical">
        <nve-button-group>
          <nve-icon-button pressed icon-name="bars-3-bottom-left"></nve-icon-button>
          <nve-icon-button icon-name="bars-3-bottom-right"></nve-icon-button>
          <nve-icon-button icon-name="bars-4"></nve-icon-button>
        </nve-button-group>

        <nve-divider></nve-divider>

        <nve-button-group>
          <nve-icon-button icon-name="bold" size="sm"></nve-icon-button>
          <nve-icon-button icon-name="italic" size="sm"></nve-icon-button>
          <nve-icon-button icon-name="strikethrough"></nve-icon-button>
        </nve-button-group>
      </nve-toolbar>
    `);
    element = fixture.querySelector('nve-toolbar');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should sync orientation of slotted elements', async () => {
    await elementIsStable(element);
    expect(fixture.querySelector('nve-button-group').orientation).toBe('vertical');
    expect(fixture.querySelector('nve-divider').orientation).toBe('horizontal');

    element.orientation = 'horizontal';
    await elementIsStable(element);
    expect(fixture.querySelector('nve-button-group').orientation).toBe('horizontal');
    expect(fixture.querySelector('nve-divider').orientation).toBe('vertical');
  });
});

describe('nve-toolbar container', () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toolbar container="flat">
        <nve-select>
          <select aria-label="element type">
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="p">Paragraph</option>
          </select>
        </nve-select>

        <nve-button-group>
          <nve-icon-button pressed icon-name="bars-3-bottom-left"></nve-icon-button>
          <nve-icon-button icon-name="bars-3-bottom-right"></nve-icon-button>
          <nve-icon-button icon-name="bars-4"></nve-icon-button>
        </nve-button-group>

        <nve-button><nve-icon name="delete"></nve-icon> delete</nve-button>
        <nve-icon-button icon-name="gear" slot="suffix" aria-label="settings"></nve-icon-button>
      </nve-toolbar>
    `);
    element = fixture.querySelector('nve-toolbar');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should sync container of slotted elements', async () => {
    await elementIsStable(element);
    expect(fixture.querySelector('nve-select').container).toBe(undefined);
    expect(fixture.querySelector('nve-button-group').container).toBe(undefined);
    expect(fixture.querySelector('nve-icon-button').interaction).toBe(undefined);
    expect(fixture.querySelector('nve-button').interaction).toBe(undefined);

    element.container = undefined;
    await elementIsStable(element);
    expect(fixture.querySelector('nve-select').container).toBe('flat');
    expect(fixture.querySelector('nve-button-group').container).toBe('flat');
    expect(fixture.querySelector('nve-icon-button').interaction).toBe('flat');
    expect(fixture.querySelector('nve-button').interaction).toBe('flat');
  });
});
