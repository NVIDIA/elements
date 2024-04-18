import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Dialog } from '@nvidia-elements/core/dialog';
import '@nvidia-elements/core/dialog/define.js';

describe(Dialog.metadata.tag, () => {
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
    element = fixture.querySelector(Dialog.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Dialog.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
