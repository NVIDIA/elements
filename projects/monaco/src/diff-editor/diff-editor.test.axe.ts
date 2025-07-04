import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { MonacoDiffEditor } from '@nvidia-elements/monaco/diff-editor';
import '@nvidia-elements/monaco/diff-editor/define.js';

describe(MonacoDiffEditor.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: MonacoDiffEditor;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-diff-editor></nve-monaco-diff-editor>
    `);
    element = fixture.querySelector(MonacoDiffEditor.metadata.tag);

    await untilEvent(element, 'ready');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check for status', async () => {
    const results = await runAxe([MonacoDiffEditor.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
