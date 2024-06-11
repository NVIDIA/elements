import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, emulateMouseEnter, emulateMouseLeave } from '@nvidia-elements/testing';
import { Tooltip } from '@nvidia-elements/core/tooltip';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/button/define.js';

describe(Tooltip.metadata.tag, () => {
  let fixture: HTMLElement;
  let tooltip: Tooltip;
  let tooltip2: Tooltip;
  let trigger: Button;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tooltip id="tooltip-1">hello</nve-tooltip>
      
      <nve-tooltip behavior-trigger id="tooltip-2" anchor="trigger" trigger="trigger" open-delay="500" hidden>delayed tooltip</nve-tooltip>
      <nve-button id="trigger">button</nve-button>
    `);
    tooltip = fixture.querySelector('#tooltip-1');
    tooltip2 = fixture.querySelector('#tooltip-2');
    trigger = fixture.querySelector(Button.metadata.tag);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Tooltip.metadata.tag)).toBeDefined();
  });

  it('should render arrow by default', async () => {
    await elementIsStable(tooltip);
    expect(tooltip.shadowRoot.querySelector('.arrow').tagName).toBe('DIV');
  });

  // https://open-ui.org/components/popup.research.explainer#api-shape
  it('should default to hint behavior', async () => {
    await elementIsStable(tooltip);
    expect(tooltip.popoverType).toBe('hint');
  });

  it('should default to positioning on the top of an anchor', async () => {
    await elementIsStable(tooltip);
    expect(tooltip.position).toBe('top');
  });

  it('should initialize role type of tooltip', async () => {
    await elementIsStable(tooltip);
    expect(tooltip._internals.role).toBe('tooltip');
  });

  it('should default with an open delay set to 0', async () => {
    await elementIsStable(tooltip);
    expect(tooltip.openDelay).toBe(0);
  });

  it('should default with an open delay set to 0', async () => {
    await elementIsStable(tooltip);
    expect(tooltip.openDelay).toBe(0);
  });

  it('if open-delay attrute set, should set openDelay property', async () => {
    await elementIsStable(tooltip2);
    expect(tooltip2.openDelay).toBe(500);
  });

  it('if open-delay and behavior-trigger set, should display tooltip after waiting for delayed time', async () => {
    await elementIsStable(tooltip2);
    await elementIsStable(trigger);

    expect(tooltip2.hidden).toBe(true);

    emulateMouseEnter(trigger);
    await elementIsStable(tooltip2);
    await elementIsStable(trigger);

    expect(tooltip2.hidden).toBe(true);

    await new Promise(r => setTimeout(() => r(null), 1000));
    await elementIsStable(tooltip2);

    expect(tooltip2.hidden).toBe(false);

    emulateMouseLeave(trigger);
    await elementIsStable(tooltip2);
    await elementIsStable(trigger);

    expect(tooltip2.hidden).toBe(true);
  });
});
