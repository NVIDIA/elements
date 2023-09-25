import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Dialog } from '@elements/elements/dialog';
import '@elements/elements/dialog/define.js';

describe('mlv-dialog axe', () => {
  let fixture: HTMLElement;
  let element: Dialog;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-dialog closable modal>
        <mlv-dialog-header>
          <h3>header</h3>
        </mlv-dialog-header>
        <p>content</p>
        <mlv-dialog-footer>
          <p>footer</p>
        </mlv-dialog-footer>
      </mlv-dialog>
    `);
    element = fixture.querySelector('mlv-dialog');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-dialog']);
    expect(results.violations.length).toBe(0);
  });
});
