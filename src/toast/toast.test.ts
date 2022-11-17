import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Toast } from '@elements/elements/toast';
import '@elements/elements/toast/define.js';

describe('nve-toast', () => {
  let fixture: HTMLElement;
  let element: Toast;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toast>hello</nve-toast>
    `);
    element = fixture.querySelector('nve-toast');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-toast')).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button').tagName).toBe('MLV-ICON-BUTTON');
  });

  // https://open-ui.org/components/popup.research.explainer#api-shape
  it('should default to manual behavior', async () => {
    await elementIsStable(element);
    expect(element.popoverType).toBe('manual');
  });

  it('should default to positioning on the top of an anchor', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('top');
  });

  it('should initialize role of type alert', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('alert');
  });
});
