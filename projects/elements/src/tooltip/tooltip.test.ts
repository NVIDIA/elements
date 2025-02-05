import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, emulateMouseEnter, untilEvent } from '@nvidia-elements/testing';
import { Tooltip } from '@nvidia-elements/core/tooltip';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/button/define.js';

describe(Tooltip.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Tooltip;
  let trigger: Button;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tooltip id="tooltip">hello</nve-tooltip>
      <nve-button popovertarget="trigger">button</nve-button>
    `);
    element = fixture.querySelector('#tooltip');
    trigger = fixture.querySelector(Button.metadata.tag);
    element.hidePopover();
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Tooltip.metadata.tag)).toBeDefined();
  });

  it('should render arrow by default', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.arrow').tagName).toBe('DIV');
  });

  // https://open-ui.org/components/popup.research.explainer#api-shape
  it('should default to hint behavior', async () => {
    await elementIsStable(element);
    expect(element.popoverType).toBe('hint');
  });

  it('should default to positioning on the top of an anchor', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('top');
  });

  it('should initialize role type of tooltip', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('tooltip');
  });

  it('should default with an open delay set to 0', async () => {
    await elementIsStable(element);
    expect(element.openDelay).toBe(0);
  });

  it('if open-delay set, display tooltip after waiting for delayed time', async () => {
    element.openDelay = 500;
    element.trigger = trigger;
    await elementIsStable(element);
    await elementIsStable(trigger);
    expect(element.matches(':popover-open')).toBe(false);

    const open = untilEvent(element, 'open');
    emulateMouseEnter(trigger);
    expect(await open).toBeDefined();
    expect(element.matches(':popover-open')).toBe(true);
  });
});
