// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import type { BenchOptions } from 'vitest';
import { bench, describe } from 'vitest';
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

describe(Tree.metadata.tag, () => {
  let element: Tree;
  let fixture: HTMLElement;
  let selectedNode: TreeNode;

  const options: BenchOptions = {
    throws: true,
    async setup() {
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
    teardown() {
      removeFixture(fixture);
    }
  };

  describe('behavior synchronization', () => {
    bench(
      'synchronizes behavior across 1,000 nodes',
      async () => {
        element.behaviorExpand = !element.behaviorExpand;
        await elementIsStable(element);
        await Promise.all(element.nodes.map(node => elementIsStable(node)));
      },
      options
    );
  });

  describe('selection synchronization', () => {
    bench(
      'synchronizes selection across 1,000 nodes',
      async () => {
        selectedNode.selected = !selectedNode.selected;
        element.requestUpdate();
        await elementIsStable(element);
        await Promise.all(element.nodes.map(node => elementIsStable(node)));
      },
      options
    );
  });
});
