import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { Tree } from '@nvidia-elements/core/tree';
import { TreeNode } from '@nvidia-elements/core/tree';
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
    await elementIsStable(node0);
    await elementIsStable(node1);
    await elementIsStable(node2);
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

    const event = untilEvent(node0.shadowRoot, 'slotchange');
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

    const event = untilEvent(node0.shadowRoot, 'slotchange');
    node1.remove();
    node2.remove();
    await event;
    await elementIsStable(element);
    await elementIsStable(node0);

    expect(node0.shadowRoot.querySelector('nve-icon-button')).toBeFalsy();
  });
});

describe(`${Tree.metadata.tag} - collapsed nodes`, () => {
  let fixture: HTMLElement;
  let element: Tree;
  let nodes: HTMLElement[];

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tree>
        <nve-tree-node>node 0</nve-tree-node>
        <nve-tree-node>node 1</nve-tree-node>
        <nve-tree-node expanded>
          node 2
          <nve-tree-node>node 3</nve-tree-node>
        </nve-tree-node>
        <nve-tree-node>
          node 4
          <nve-tree-node>node 5</nve-tree-node>
          <nve-tree-node></nve-tree-node>
        </nve-tree-node>
        <nve-tree-node expanded>
          node 7
          <nve-tree-node expanded>
            node 8
            <nve-tree-node>node 9</nve-tree-node>
          </nve-tree-node>
          <nve-tree-node>
            node 10
            <nve-tree-node>node 11</nve-tree-node>
          </nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    `);
    element = fixture.querySelector(Tree.metadata.tag);
    nodes = Array.from(fixture.querySelectorAll(TreeNode.metadata.tag)).map(node =>
      node.shadowRoot.querySelector('[part="node-header"]')
    );
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should keynav to single level node to another single level node', async () => {
    await elementIsStable(element);
    nodes[0].focus();
    expect(nodes[0].matches(':focus')).toBe(true);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);

    nodes[0].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(true);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);
  });

  it('should keynav from a single level node to a expanded multi level node', async () => {
    await elementIsStable(element);
    nodes[1].focus();
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(true);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);

    nodes[1].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(true);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);
  });

  it('should keynav from a expanded parent node to a child node', async () => {
    await elementIsStable(element);
    nodes[2].focus();
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(true);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);

    nodes[2].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(true);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);
  });

  it('should keynav from the last nested child of an expanded parent node to the sibling node of the parent', async () => {
    await elementIsStable(element);
    nodes[3].focus();
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(true);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);

    nodes[3].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(true);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);
  });

  it('should keynav to collapsed level node to another collapsed node', async () => {
    await elementIsStable(element);
    nodes[4].focus();
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(true);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);

    nodes[4].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(true);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);
  });

  it('should keynav to nested and expanded child', async () => {
    await elementIsStable(element);
    nodes[7].focus();
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(true);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);

    nodes[7].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(true);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);
  });

  it('should keynav from the last multi layer nested child node to next sibling node of the parent', async () => {
    await elementIsStable(element);
    nodes[9].focus();
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(true);
    expect(nodes[10].matches(':focus')).toBe(false);
    expect(nodes[11].matches(':focus')).toBe(false);

    nodes[9].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(true);
    expect(nodes[11].matches(':focus')).toBe(false);
  });

  it('should NOT keynav to nested child node if node is not expanded', async () => {
    await elementIsStable(element);
    nodes[10].focus();
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(true);
    expect(nodes[11].matches(':focus')).toBe(false);

    nodes[10].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, composed: true }));
    await elementIsStable(element);
    expect(nodes[0].matches(':focus')).toBe(false);
    expect(nodes[1].matches(':focus')).toBe(false);
    expect(nodes[2].matches(':focus')).toBe(false);
    expect(nodes[3].matches(':focus')).toBe(false);
    expect(nodes[4].matches(':focus')).toBe(false);
    expect(nodes[5].matches(':focus')).toBe(false);
    expect(nodes[6].matches(':focus')).toBe(false);
    expect(nodes[7].matches(':focus')).toBe(false);
    expect(nodes[8].matches(':focus')).toBe(false);
    expect(nodes[9].matches(':focus')).toBe(false);
    expect(nodes[10].matches(':focus')).toBe(true);
    expect(nodes[11].matches(':focus')).toBe(false);
  });
});
