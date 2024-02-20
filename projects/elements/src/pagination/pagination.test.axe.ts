import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Pagination } from '@elements/elements/pagination';
import '@elements/elements/pagination/define.js';

describe('mlv-pagination', () => {
  let fixture: HTMLElement;
  let element: Pagination;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <mlv-pagination name="page" .value=${1} .step=${10} .items=${100}></mlv-pagination>
      </form>
    `);
    element = fixture.querySelector('mlv-pagination');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-pagination']);
    expect(results.violations.length).toBe(0);
  });
});
