import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { Tree } from '@nvidia-elements/core/tree';
import type { TreeNode } from '@nvidia-elements/core/tree';
import '@nvidia-elements/core/tree/define.js';

describe(Tree.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Tree;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tree>
        <nve-tree-node>node 1</nve-tree-node>
        <nve-tree-node>node 2</nve-tree-node>
        <nve-tree-node>node 3</nve-tree-node>
        <nve-tree-node>
          node 4
          <nve-tree-node>node 4-1</nve-tree-node>
        </nve-tree-node>
        <nve-tree-node>
          node 5
          <nve-tree-node>node 5-1</nve-tree-node>
          <nve-tree-node>node 5-2</nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    `);
    element = fixture.querySelector(Tree.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Tree.metadata.tag)).toBeDefined();
  });

  it('should have a role of tree', () => {
    expect(element._internals.role).toBe('tree');
  });

  it('should reflect border property to attribute', async () => {
    expect(element.hasAttribute('border')).toBe(false);
    element.border = true;
    await elementIsStable(element);
    expect(element.hasAttribute('border')).toBe(true);
  });

  it('should sync selectable single state from tree to all child nodes', async () => {
    expect(element.nodes[0].selectable).toBe(undefined);
    expect(element.nodes[1].selectable).toBe(undefined);
    expect(element.nodes[2].selectable).toBe(undefined);

    element.selectable = 'single';
    await elementIsStable(element);

    expect(element.nodes[0].selectable).toBe('single');
    expect(element.nodes[1].selectable).toBe('single');
    expect(element.nodes[2].selectable).toBe('single');
  });

  it('should sync selectable multi state from tree to all child nodes', async () => {
    expect(element.nodes[0].selectable).toBe(undefined);
    expect(element.nodes[1].selectable).toBe(undefined);
    expect(element.nodes[2].selectable).toBe(undefined);

    element.selectable = 'multi';
    await elementIsStable(element);

    expect(element.nodes[0].selectable).toBe('multi');
    expect(element.nodes[1].selectable).toBe('multi');
    expect(element.nodes[2].selectable).toBe('multi');
  });

  it('should update node selections if behavior-select is active', async () => {
    expect(element.nodes[0].selected).toBe(false);
    expect(element.nodes[1].selected).toBe(false);
    expect(element.nodes[2].selected).toBe(false);
    expect(element.nodes[3].selected).toBe(false);
    expect(element.nodes[4].selected).toBe(false);

    element.nodes[4].selected = true;
    element.selectable = 'multi';
    element.behaviorSelect = true;
    await elementIsStable(element);

    expect(element.nodes[0].selected).toBe(false);
    expect(element.nodes[1].selected).toBe(false);
    expect(element.nodes[2].selected).toBe(false);
    expect(element.nodes[3].selected).toBe(true);
    expect(element.nodes[4].selected).toBe(true);
  });
});

describe(`${Tree.metadata.tag} slots`, () => {
  let fixture: HTMLElement;
  let element: Tree;
  let node0: TreeNode;
  let node1: TreeNode;
  let node2: TreeNode;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tree>
        <nve-tree-node id="node-0">
          node 0
          <nve-tree-node id="node-1">node 1</nve-tree-node>
          <nve-tree-node id="node-2">node 2</nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    `);
    element = fixture.querySelector(Tree.metadata.tag);
    node0 = fixture.querySelector('#node-0');
    node1 = fixture.querySelector('#node-1');
    node2 = fixture.querySelector('#node-2');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Tree.metadata.tag)).toBeDefined();
  });

  it('should update node selections if slotted content changes', async () => {
    expect(element.nodes[0].indeterminate).toBe(false);
    expect(element.nodes[0].selected).toBe(false);
    expect(element.nodes[1].selected).toBe(false);
    expect(element.nodes[2].selected).toBe(false);

    element.nodes[2].selected = true;
    element.selectable = 'multi';
    element.behaviorSelect = true;
    await elementIsStable(element);

    expect(node0.indeterminate).toBe(true);
    expect(node0.selected).toBe(false);
    expect(node1.selected).toBe(false);
    expect(node2.selected).toBe(true);

    const event = untilEvent(node0.shadowRoot as any, 'slotchange');
    node2.remove();
    await event;
    await elementIsStable(element);
    await elementIsStable(node0);

    expect(node0.indeterminate).toBe(false);
    expect(node0.selected).toBe(false);
    expect(node1.selected).toBe(false);
  });

  it('should update node expandable state if slotted content changes', async () => {
    expect(node0.shadowRoot.querySelector('nve-icon-button')).toBeTruthy();
    await elementIsStable(element);

    const event = untilEvent(node0.shadowRoot as any, 'slotchange');
    node1.remove();
    node2.remove();
    await event;
    await elementIsStable(element);
    await elementIsStable(node0);

    expect(node0.shadowRoot.querySelector('nve-icon-button')).toBeFalsy();
  });
});
