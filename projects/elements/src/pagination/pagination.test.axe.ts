import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Pagination } from '@elements/elements/pagination';
import '@elements/elements/pagination/define.js';

describe('nve-pagination', () => {
  let fixture: HTMLElement;
  let element: Pagination;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <nve-pagination name="page" .value=${1} .step=${10} .items=${100}></nve-pagination>
      </form>
    `);
    element = fixture.querySelector('nve-pagination');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-pagination']);
    expect(results.violations.length).toBe(0);
  });
});
