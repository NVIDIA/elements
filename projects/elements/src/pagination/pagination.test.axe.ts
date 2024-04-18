import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Pagination } from '@nvidia-elements/core/pagination';
import '@nvidia-elements/core/pagination/define.js';

describe(Pagination.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Pagination;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <mlv-pagination name="page" .value=${1} .step=${10} .items=${100}></mlv-pagination>
      </form>
    `);
    element = fixture.querySelector(Pagination.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Pagination.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
