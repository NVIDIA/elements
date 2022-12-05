import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Tooltip } from '@elements/elements/tooltip';
import '@elements/elements/tooltip/define.js';

describe('mlv-tooltip', () => {
  let fixture: HTMLElement;
  let element: Tooltip;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-tooltip>hello</mlv-tooltip>
    `);
    element = fixture.querySelector('mlv-tooltip');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-tooltip')).toBeDefined();
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
});
