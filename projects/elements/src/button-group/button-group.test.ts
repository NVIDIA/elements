import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture } from '@nvidia-elements/testing';
import type { ButtonGroup } from '@elements/elements/button-group';
import type { IconButton } from '@elements/elements/icon-button';
import '@elements/elements/button-group/define.js';
import '@elements/elements/icon-button/define.js';

describe('nve-button-group', () => {
  let fixture: HTMLElement;
  let element: ButtonGroup;
  let buttons: IconButton[];

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button-group>
        <nve-icon-button icon-name="copy"></nve-icon-button>
        <nve-icon-button icon-name="add-comment"></nve-icon-button>
        <nve-icon-button icon-name="download"></nve-icon-button>
      </nve-button-group>
    `);
    element = fixture.querySelector('nve-button-group');
    buttons = Array.from(fixture.querySelectorAll('nve-icon-button'));
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-button-group')).toBeDefined();
  });

  it('should initialize role group', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('group');
  });

  it('should sync split state if divider is provided', async () => {
    await elementIsStable(element);
    expect(element.matches(':--split')).toBe(false);

    const divider = document.createElement('nve-divider');
    element.appendChild(divider);

    await elementIsStable(element);
    expect(element.matches(':--split')).toBe(true);
  });

  it('should sync flat container styles', async () => {
    element.container = 'flat';
    await elementIsStable(element);
    expect(buttons[0].interaction).toBe('flat');
    expect(buttons[1].interaction).toBe('flat');
    expect(buttons[2].interaction).toBe('flat');
  });

  it('should sync interaction container styles', async () => {
    element.interaction = 'emphasize';
    await elementIsStable(element);
    expect(buttons[0].interaction).toBe('emphasize');
    expect(buttons[1].interaction).toBe('emphasize');
    expect(buttons[2].interaction).toBe('emphasize');
  });

  it('should sync interaction container styles', async () => {
    element.interaction = 'emphasize';
    await elementIsStable(element);
    expect(buttons[0].interaction).toBe('emphasize');
    expect(buttons[1].interaction).toBe('emphasize');
    expect(buttons[2].interaction).toBe('emphasize');
  });

  it('should be stateless by default', async () => {
    await elementIsStable(element);
    emulateClick(buttons[0]);
    expect(buttons[0].pressed).toBe(undefined);
    expect(buttons[1].pressed).toBe(undefined);
    expect(buttons[2].pressed).toBe(undefined);
  });

  it('should have an exclusive press when using behavior-select="single"', async () => {
    element.behaviorSelect = 'single';
    await elementIsStable(element);

    emulateClick(buttons[0]);
    await elementIsStable(element);

    expect(buttons[0].pressed).toBe(true);
    expect(buttons[1].pressed).toBe(false);
    expect(buttons[2].pressed).toBe(false);

    emulateClick(buttons[1]);
    await elementIsStable(element);

    expect(buttons[0].pressed).toBe(false);
    expect(buttons[1].pressed).toBe(true);
    expect(buttons[2].pressed).toBe(false);
  });

  it('should allow multiple buttons in pressed state when using behavior-select="multi"', async () => {
    element.behaviorSelect = 'multi';
    await elementIsStable(element);

    emulateClick(buttons[0]);
    await elementIsStable(element);

    expect(buttons[0].pressed).toBe(true);
    expect(buttons[1].pressed).toBe(undefined);
    expect(buttons[2].pressed).toBe(undefined);

    emulateClick(buttons[1]);
    await elementIsStable(element);

    expect(buttons[0].pressed).toBe(true);
    expect(buttons[1].pressed).toBe(true);
    expect(buttons[2].pressed).toBe(undefined);
  });
});
