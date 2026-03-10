import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { CodeBlock } from '@nvidia-elements/code/codeblock';
import '@nvidia-elements/code/codeblock/define.js';

describe(CodeBlock.metadata.tag, () => {
  it('should pass axe check for status', async () => {
    const fixture = await createFixture(html`
      <nve-codeblock language="shell">
        pnpm install
      </nve-codeblock>
    `);

    await elementIsStable(fixture.querySelector(CodeBlock.metadata.tag)!);
    const results = (await runAxe([CodeBlock.metadata.tag])) as { violations: { length: number }[] };
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
