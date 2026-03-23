import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Tree } from '@nvidia-elements/core/tree';
import '@nvidia-elements/core/tree/define.js';

describe(Tree.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Tree;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tree>
        <nve-tree-node expanded>
          node 1
          <nve-tree-node>node 1-1</nve-tree-node>
          <nve-tree-node>node 1-2</nve-tree-node>
        </nve-tree-node>
        <nve-tree-node>
          node 2
          <nve-tree-node>node 2-1</nve-tree-node>
          <nve-tree-node>node 2-2</nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    `);
    element = fixture.querySelector(Tree.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Tree.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
