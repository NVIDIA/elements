import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Dialog } from '@elements/elements/dialog';
import '@elements/elements/dialog/define.js';

describe('nve-dialog', () => {
  let fixture: HTMLElement;
  let element: Dialog;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dialog>hello</nve-dialog>
    `);
    element = fixture.querySelector('nve-dialog');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-dialog')).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);

    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button').tagName).toBe('MLV-ICON-BUTTON');
  });

  it('should use manual behavior when non-modal', async () => {
    expect(element.modal).toBe(undefined);
    expect(element.popoverType).toBe('manual');
    await elementIsStable(element);

    element.modal = true;
    await elementIsStable(element);
    expect(element.popoverType).toBe('auto');
  });

  // https://open-ui.org/components/popup.research.explainer#api-shape
  it('should use auto behavior when modal', async () => {
    element.modal = true;
    await elementIsStable(element);
    expect(element.popoverType).toBe('auto');
  });

  it('should use default to center position', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('center');
  });

  it('should use default to default alignment', async () => {
    await elementIsStable(element);
    expect(element.alignment).toBe(undefined);
  });

  it('should use default to anchor as document.body', async () => {
    await elementIsStable(element);
    expect(element.anchor).toBe(document.body);
  });

  it('should apply an aria-label to the close button', async () => {
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button').ariaLabel).toBe('close');
  });
});
