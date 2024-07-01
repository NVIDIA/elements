import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Tree } from '@nvidia-elements/core/tree';
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

  it('should udpate node selections if behavior-select is active', async () => {
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
