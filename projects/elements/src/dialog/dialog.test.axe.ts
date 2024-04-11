import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Dialog } from '@nvidia-elements/core/dialog';
import '@nvidia-elements/core/dialog/define.js';

describe('nve-dialog axe', () => {
  let fixture: HTMLElement;
  let element: Dialog;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dialog closable modal>
        <nve-dialog-header>
          <h3>header</h3>
        </nve-dialog-header>
        <p>content</p>
        <nve-dialog-footer>
          <p>footer</p>
        </nve-dialog-footer>
      </nve-dialog>
    `);
    element = fixture.querySelector('nve-dialog');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-dialog']);
    expect(results.violations.length).toBe(0);
  });
});
