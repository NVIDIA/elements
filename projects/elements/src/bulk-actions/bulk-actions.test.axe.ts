import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { BulkActions } from '@elements/elements/bulk-actions';
import '@elements/elements/bulk-actions/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/button/define.js';

describe('mlv-bulk-actions', () => {
  let fixture: HTMLElement;
  let element: BulkActions;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-bulk-actions closable status="accent">
        123 selected
        <mlv-button interaction="flat-destructive">delete</mlv-button>
        <mlv-icon-button interaction="flat" icon-name="more-actions" aria-label="more actions"></mlv-icon-button>
      </mlv-bulk-actions>
      <mlv-bulk-actions closable>
        123 selected
        <mlv-button interaction="flat-destructive">delete</mlv-button>
        <mlv-icon-button interaction="flat" icon-name="more-actions" aria-label="more actions"></mlv-icon-button>
      </mlv-bulk-actions>
    `);
    element = fixture.querySelector('mlv-bulk-actions');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-bulk-actions']);
    expect(results.violations.length).toBe(0);
  });
});
