import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Editor } from '@nvidia-elements/monaco/editor';
import '@nvidia-elements/monaco/editor/define.js';

describe(Editor.metadata.tag, () => {
  it('should pass axe check for status', async () => {
    const fixture = await createFixture(html`
      <nve-monaco-editor></nve-monaco-editor>
    `);

    await elementIsStable(fixture.querySelector(Editor.metadata.tag));
    const results = await runAxe([Editor.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
