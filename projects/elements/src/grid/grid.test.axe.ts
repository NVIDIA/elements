import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Grid } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/grid/define.js';

describe('mlv-grid axe', () => {
  let fixture: HTMLElement;
  let element: Grid;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-grid>
        <mlv-grid-header>
          <mlv-grid-column>column 1</mlv-grid-column>
          <mlv-grid-column>column 2</mlv-grid-column>
          <mlv-grid-column>column 3</mlv-grid-column>
          <mlv-grid-column>column 4</mlv-grid-column>
        </mlv-grid-header>
        <mlv-grid-row>
          <mlv-grid-cell>cell 1-1</mlv-grid-cell>
          <mlv-grid-cell>cell 1-2</mlv-grid-cell>
          <mlv-grid-cell>cell 1-3</mlv-grid-cell>
          <mlv-grid-cell>cell 1-4</mlv-grid-cell>
        </mlv-grid-row>
      </mlv-grid>
    `);
    element = fixture.querySelector('mlv-grid');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-grid'], {
      rules: {
        // axe does not support ElementInternals AOM yet https://github.com/dequelabs/axe-core/issues/4259
        'aria-required-parent': { enabled: false },
        'aria-required-children': { enabled: false },
        'aria-allowed-attr': { enabled: false }
      }
    });
    expect(results.violations.length).toBe(0);
  });
});
