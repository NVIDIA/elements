import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { MonacoProblems } from '@nvidia-elements/monaco/problems';
import '@nvidia-elements/monaco/problems/define.js';

describe(MonacoProblems.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: MonacoProblems;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-problems></nve-monaco-problems>
    `);
    element = fixture.querySelector(MonacoProblems.metadata.tag);

    await untilEvent(element, 'ready');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([MonacoProblems.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
