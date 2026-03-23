import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture } from '@internals/testing';
import { Tree, TreeNode } from '@nvidia-elements/core/tree';
import '@nvidia-elements/core/tree/define.js';

describe(TreeNode.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: TreeNode;
  let nestedNodeElement: TreeNode;
  let tree: Tree;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tree>
        <nve-tree-node></nve-tree-node>
        <nve-tree-node>
          <nve-tree-node></nve-tree-node>
          <nve-tree-node></nve-tree-node>
          <nve-tree-node></nve-tree-node>
        </nve-tree-node>
      </nve-tree>
    `);
    element = fixture.querySelectorAll<TreeNode>(TreeNode.metadata.tag)[0];
    nestedNodeElement = fixture.querySelectorAll<TreeNode>(TreeNode.metadata.tag)[1];
    tree = fixture.querySelector<Tree>(Tree.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(TreeNode.metadata.tag)).toBeDefined();
  });

  it('should have a role of treeitem', async () => {
    expect(element._internals.role).toBe('treeitem');
  });

  it('should provide default slot for content', async () => {
    expect(element.shadowRoot.querySelector('slot:not([name])')).toBeTruthy();
  });

  it('should update selectable style state', async () => {
    expect(element.matches(':state(selectable-single)')).toBeFalsy();

    element.selectable = 'single';
    await elementIsStable(element);
    expect(element.matches(':state(selectable-single)')).toBeTruthy();

    element.selectable = 'multi';
    await elementIsStable(element);
    expect(element.matches(':state(selectable-multi)')).toBeTruthy();
  });

  it('should update expandable style state', async () => {
    expect(element.matches(':state(expandable)')).toBeFalsy();

    element.expandable = true;
    await elementIsStable(element);
    expect(element.matches(':state(expandable)')).toBeTruthy();

    element.expandable = false;
    await elementIsStable(element);
    expect(element.matches(':state(expandable)')).toBeFalsy();
  });

  it('should update selected style state', async () => {
    expect(element.matches(':state(selected)')).toBeFalsy();

    element.selected = true;
    await elementIsStable(element);
    expect(element.matches(':state(selected)')).toBeTruthy();

    element.selected = false;
    await elementIsStable(element);
    expect(element.matches(':state(selected)')).toBeFalsy();
  });

  it('should update expanded style state', async () => {
    element.expandable = true;
    await elementIsStable(element);
    expect(element.matches(':state(expanded)')).toBeFalsy();

    element.expanded = true;
    await elementIsStable(element);
    expect(element.matches(':state(expanded)')).toBeTruthy();

    element.expanded = false;
    await elementIsStable(element);
    expect(element.matches(':state(expanded)')).toBeFalsy();
  });

  it('should update caret rotation on expand', async () => {
    element.expandable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon').direction).toBe('right');

    element.expanded = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon').direction).toBe('down');

    element.expanded = false;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon').direction).toBe('right');
  });

  it('should show node group slot if expanded', async () => {
    expect(getComputedStyle(nestedNodeElement.shadowRoot.querySelector<HTMLElement>('[part="_nodes"]')).height).toBe(
      '0px'
    );

    nestedNodeElement.expanded = true;
    await elementIsStable(nestedNodeElement);
    await new Promise(resolve => setTimeout(resolve, 250));
    expect(
      getComputedStyle(nestedNodeElement.shadowRoot.querySelector<HTMLElement>('[part="_nodes"]')).height
    ).not.toBe('0px');

    nestedNodeElement.expanded = false;
    await elementIsStable(nestedNodeElement);
    await new Promise(resolve => setTimeout(resolve, 250));
    expect(getComputedStyle(nestedNodeElement.shadowRoot.querySelector<HTMLElement>('[part="_nodes"]')).height).toBe(
      '0px'
    );
  });

  it('should show icon button if expandable', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBeFalsy();

    element.expandable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBeTruthy();
    expect(element.shadowRoot.querySelector('#no-expand')).toBeFalsy();
  });

  it('should expand node if icon button is clicked', async () => {
    element.expandable = true;
    element.behaviorExpand = true;
    await elementIsStable(element);
    expect(element.expanded).toBe(false);

    emulateClick(element.shadowRoot.querySelector('nve-icon-button'));
    await elementIsStable(element);
    expect(element.expanded).toBe(true);
  });

  it('should show icon button if child nodes are slotted', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBeFalsy();

    const node = document.createElement('nve-tree-node');
    element.appendChild(node);
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBeTruthy();
  });

  it('should show checkbox if multi selectable', async () => {
    expect(element.shadowRoot.querySelector('nve-checkbox')).toBeFalsy();

    element.selectable = 'multi';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-checkbox')).toBeTruthy();
  });

  it('should assign aria-label to checkbox if expandable', async () => {
    expect(element.shadowRoot.querySelector('nve-checkbox')).toBeFalsy();

    element.selectable = 'multi';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-checkbox')).toBeTruthy();
    expect(element.shadowRoot.querySelector('nve-checkbox input').ariaLabel).toBe('expand');
  });

  it('should show checkbox in indeterminate state', async () => {
    element.selectable = 'multi';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('input').indeterminate).toBe(false);

    element.indeterminate = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('input').indeterminate).toBe(true);
  });

  it('should expand node when open() is called', async () => {
    element.expandable = true;
    element.behaviorExpand = true;
    await elementIsStable(element);
    expect(element.matches(':state(expanded)')).toBeFalsy();

    element.open();
    await elementIsStable(element);
    expect(element.matches(':state(expanded)')).toBeTruthy();
  });

  it('should collapse node when close() is called', async () => {
    element.expandable = true;
    element.behaviorExpand = true;
    await elementIsStable(element);
    expect(element.matches(':state(expanded)')).toBeFalsy();

    element.open();
    await elementIsStable(element);
    expect(element.matches(':state(expanded)')).toBeTruthy();

    element.close();
    await elementIsStable(element);
    expect(element.matches(':state(expanded)')).toBeFalsy();
  });

  it('should close node if RightArrow key is pressed', async () => {
    element.expandable = true;
    element.behaviorExpand = true;
    await elementIsStable(element);
    expect(element.expanded).toBe(false);

    element.focus();
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight', bubbles: true }));

    await elementIsStable(element);
    expect(element.expanded).toBe(true);
  });

  it('should close node if LeftArrow key is pressed', async () => {
    element.expandable = true;
    element.behaviorExpand = true;
    element.expanded = true;

    await elementIsStable(element);
    expect(element.expanded).toBe(true);

    element.focus();
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft', bubbles: true }));

    await elementIsStable(element);
    expect(element.expanded).toBe(false);
  });

  it('should single select a node if Space key is pressed', async () => {
    element.selectable = 'single';
    element.behaviorSelect = true;
    await elementIsStable(element);
    expect(element.selected).toBe(false);

    element.focus();
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));

    await elementIsStable(element);
    expect(element.selected).toBe(true);
  });

  it('should multi select a node if Space key is pressed', async () => {
    nestedNodeElement.selectable = 'multi';
    nestedNodeElement.behaviorSelect = true;
    await elementIsStable(nestedNodeElement);
    expect(nestedNodeElement.selected).toBe(false);

    nestedNodeElement.focus();
    nestedNodeElement.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));

    await elementIsStable(nestedNodeElement);
    expect(nestedNodeElement.selected).toBe(true);
    expect(nestedNodeElement.nodes[0].selected).toBe(true);
  });

  it('should NOT multi select a node if behavior-select is NOT active', async () => {
    nestedNodeElement.selectable = 'multi';
    await elementIsStable(nestedNodeElement);
    expect(nestedNodeElement.selected).toBe(false);

    nestedNodeElement.focus();
    nestedNodeElement.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));

    await elementIsStable(nestedNodeElement);
    expect(nestedNodeElement.selected).toBe(false);
    expect(nestedNodeElement.nodes[0].selected).toBe(false);
  });

  it('should NOT single select a node if behavior-select is NOT active', async () => {
    element.selectable = 'single';
    await elementIsStable(element);
    expect(element.selected).toBe(false);

    element.focus();
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));

    await elementIsStable(element);
    expect(element.selected).toBe(false);
  });

  it('should expand node if node header is clicked with behavior-expand and no interactive elements', async () => {
    expect(nestedNodeElement.expanded).toBe(false);

    tree.behaviorExpand = true;
    await elementIsStable(tree);

    emulateClick(nestedNodeElement.shadowRoot.querySelector('.node-title'));
    await elementIsStable(nestedNodeElement);

    expect(nestedNodeElement.expanded).toBe(true);
  });

  it('should select node if node header is clicked with behavior-select and no interactive elements', async () => {
    expect(nestedNodeElement.selected).toBe(false);

    tree.selectable = 'single';
    tree.behaviorSelect = true;
    await elementIsStable(tree);

    emulateClick(nestedNodeElement.shadowRoot.querySelector('.node-title'));
    await elementIsStable(nestedNodeElement);

    expect(nestedNodeElement.selected).toBe(true);
  });

  it('should select node if node header is clicked with a slotted anchor element', async () => {
    const anchor = document.createElement('a');
    anchor.href = '#';
    element.appendChild(anchor);

    tree.selectable = 'single';
    tree.behaviorSelect = true;

    await elementIsStable(tree);
    await elementIsStable(element);
    emulateClick(anchor);
    await elementIsStable(element);

    expect(element.selected).toBe(true);
  });

  it('should NOT select node if node header is clicked with a slotted non-anchor focusable element', async () => {
    const button = document.createElement('button');
    element.appendChild(button);

    tree.selectable = 'single';
    tree.behaviorSelect = true;

    await elementIsStable(tree);
    await elementIsStable(element);
    emulateClick(button);
    await elementIsStable(element);

    expect(element.selected).toBe(false);
  });

  it('should NOT expand node if node header is clicked with any interactive elements', async () => {
    const anchor = document.createElement('a');
    anchor.href = '#';
    element.appendChild(anchor);

    tree.selectable = 'single';
    tree.behaviorSelect = true;

    await elementIsStable(tree);
    await elementIsStable(element);
    emulateClick(anchor);
    await elementIsStable(element);

    expect(element.expanded).toBe(false);
  });

  it('should dispatch select event when single selecting via Space key', async () => {
    element.selectable = 'single';
    element.behaviorSelect = true;
    await elementIsStable(element);

    const selectHandler = vi.fn();
    element.addEventListener('select', selectHandler);

    element.focus();
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));
    await elementIsStable(element);

    expect(selectHandler).toHaveBeenCalledTimes(1);
    expect(selectHandler.mock.calls[0][0].detail).toBe(element);
  });

  it('should dispatch select event when multi selecting via Space key', async () => {
    nestedNodeElement.selectable = 'multi';
    nestedNodeElement.behaviorSelect = true;
    await elementIsStable(nestedNodeElement);

    const selectHandler = vi.fn();
    nestedNodeElement.addEventListener('select', selectHandler);

    nestedNodeElement.focus();
    nestedNodeElement.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));
    await elementIsStable(nestedNodeElement);

    expect(selectHandler).toHaveBeenCalledTimes(1);
    expect(selectHandler.mock.calls[0][0].detail).toBe(nestedNodeElement);
  });

  it('should dispatch select event when clicking node header with single select', async () => {
    tree.selectable = 'single';
    tree.behaviorSelect = true;
    await elementIsStable(tree);

    const selectHandler = vi.fn();
    nestedNodeElement.addEventListener('select', selectHandler);

    emulateClick(nestedNodeElement.shadowRoot.querySelector('.node-title'));
    await elementIsStable(nestedNodeElement);

    expect(selectHandler).toHaveBeenCalledTimes(1);
    expect(selectHandler.mock.calls[0][0].detail).toBe(nestedNodeElement);
  });

  it('should dispatch select event when clicking checkbox with multi select', async () => {
    tree.selectable = 'multi';
    tree.behaviorSelect = true;
    await elementIsStable(tree);
    await elementIsStable(element);

    const selectHandler = vi.fn();
    element.addEventListener('select', selectHandler);

    const checkbox = element.shadowRoot.querySelector<HTMLInputElement>('nve-checkbox input');
    checkbox.click();
    await elementIsStable(element);

    expect(selectHandler).toHaveBeenCalledTimes(1);
    expect(selectHandler.mock.calls[0][0].detail).toBe(element);
  });

  it('should bubble select event to parent tree', async () => {
    tree.selectable = 'single';
    tree.behaviorSelect = true;
    await elementIsStable(tree);

    const selectHandler = vi.fn();
    tree.addEventListener('select', selectHandler);

    emulateClick(element.shadowRoot.querySelector('.node-title'));
    await elementIsStable(element);

    expect(selectHandler).toHaveBeenCalledTimes(1);
    expect(selectHandler.mock.calls[0][0].detail).toBe(element);
  });

  it('should dispatch select event even when behaviorSelect is false', async () => {
    element.selectable = 'single';
    element.behaviorSelect = false;
    await elementIsStable(element);

    const selectHandler = vi.fn();
    element.addEventListener('select', selectHandler);

    element.focus();
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));
    await elementIsStable(element);

    // Event should still fire even though selected state doesn't change
    expect(selectHandler).toHaveBeenCalledTimes(1);
    expect(element.selected).toBe(false);
  });
});
