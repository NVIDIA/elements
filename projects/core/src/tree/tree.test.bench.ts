// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import type { BenchFnOptions, BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { TreeNode } from '@nvidia-elements/core/tree';
import { Tree } from '@nvidia-elements/core/tree';
import '@nvidia-elements/core/tree/define.js';

const rootCount = 100;
const childrenPerRoot = 9;

function createChildTemplate(rootIndex: number, childIndex: number) {
  return html`<nve-tree-node>Node ${rootIndex}-${childIndex}</nve-tree-node>`;
}

function createRootTemplate(rootIndex: number) {
  const children = Array.from({ length: childrenPerRoot }, (_, childIndex) =>
    createChildTemplate(rootIndex, childIndex)
  );
  return html`<nve-tree-node expanded>Root ${rootIndex}${children}</nve-tree-node>`;
}

const rootTemplates = Array.from({ length: rootCount }, (_, rootIndex) => createRootTemplate(rootIndex));
const runOptions = {
  iterations: 10,
  throws: true,
  time: 500,
  warmupIterations: 5,
  warmupTime: 100
} satisfies BenchRunOptions;

describe(Tree.metadata.tag, () => {
  let element: Tree;
  let fixture: HTMLElement;
  let selectedNode: TreeNode;

  const options: BenchFnOptions = {
    async beforeAll() {
      fixture = await createFixture(html`
        <nve-tree behavior-expand behavior-select selectable="multi">
          ${rootTemplates}
        </nve-tree>
      `);
      element = fixture.querySelector<Tree>(Tree.metadata.tag)!;
      await elementIsStable(element);
      await Promise.all(element.nodes.map(node => elementIsStable(node)));
      selectedNode = element.nodes[element.nodes.length - 1]!;
    },
    afterAll() {
      removeFixture(fixture);
    }
  };

  describe('behavior synchronization', () => {
    test('synchronizes behavior across 1,000 nodes', async ({ bench }) => {
      await bench('synchronizes behavior across 1,000 nodes', options, async () => {
        element.behaviorExpand = !element.behaviorExpand;
        await elementIsStable(element);
        await Promise.all(element.nodes.map(node => elementIsStable(node)));
      }).run(runOptions);
    });
  });

  describe('selection synchronization', () => {
    test('synchronizes selection across 1,000 nodes', async ({ bench }) => {
      await bench('synchronizes selection across 1,000 nodes', options, async () => {
        selectedNode.selected = !selectedNode.selected;
        element.requestUpdate();
        await elementIsStable(element);
        await Promise.all(element.nodes.map(node => elementIsStable(node)));
      }).run(runOptions);
    });
  });
});
