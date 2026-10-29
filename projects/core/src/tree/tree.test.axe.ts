// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Tree } from '@nvidia-elements/core/tree';
import '@nvidia-elements/core/tree/define.js';

const axeOptions = {
  rules: {
    // Keep the disclosure presentational; the treeitem owns expansion semantics.
    // Accept this presentation/focusability conflict only in the tree fixtures.
    'presentation-role-conflict': { enabled: false }
  }
};

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
    const results = await runAxe([Tree.metadata.tag], axeOptions);
    expect(results.violations.length).toBe(0);
  });

  it('should pass axe check with command invokers', async () => {
    const node = element.querySelector('nve-tree-node')!;
    node.command = '--open';
    node.commandForElement = element.querySelectorAll('nve-tree-node')[1]!;
    await elementIsStable(node);
    const results = await runAxe([Tree.metadata.tag], axeOptions);
    expect(results.violations.length).toBe(0);
  });
});
