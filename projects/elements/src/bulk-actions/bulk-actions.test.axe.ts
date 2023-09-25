import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { BulkActions } from '@elements/elements/bulk-actions';
import '@elements/elements/bulk-actions/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/button/define.js';

describe('nve-bulk-actions', () => {
  let fixture: HTMLElement;
  let element: BulkActions;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-bulk-actions closable status="accent">
        123 selected
        <nve-button interaction="flat-destructive">delete</nve-button>
        <nve-icon-button interaction="flat" icon-name="more-actions" aria-label="more actions"></nve-icon-button>
      </nve-bulk-actions>
      <nve-bulk-actions closable>
        123 selected
        <nve-button interaction="flat-destructive">delete</nve-button>
        <nve-icon-button interaction="flat" icon-name="more-actions" aria-label="more actions"></nve-icon-button>
      </nve-bulk-actions>
    `);
    element = fixture.querySelector('nve-bulk-actions');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-bulk-actions']);
    expect(results.violations.length).toBe(0);
  });
});
