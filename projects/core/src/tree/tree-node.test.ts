// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture } from '@internals/testing';
import { Tree, TreeNode } from '@nvidia-elements/core/tree';
import '@nvidia-elements/core/tree/define.js';

/* eslint-disable @nvidia-elements/lint/no-missing-slotted-elements */

describe('nve-tree-node - invoker commands', () => {
  let fixture: HTMLElement;
  let node: TreeNode;
  let target: HTMLElement;
  let handler = vi.fn<(event: Event) => void>();

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tree behavior-expand behavior-select selectable="single">
        <nve-tree-node command="--activate" commandfor="command-target" expanded>
          <span>Parent</span>
          <nve-tree-node command="--child" commandfor="command-target">Child</nve-tree-node>
        </nve-tree-node>
      </nve-tree>
      <div id="command-target"></div>
      <div id="other-target"></div>
    `);
    node = fixture.querySelector<TreeNode>('nve-tree-node')!;
    target = fixture.querySelector<HTMLElement>('#command-target')!;
    handler = vi.fn();
    target.addEventListener('command', handler);
    await elementIsStable(node);
  });

  afterEach(() => removeFixture(fixture));

  it('should invoke once on a title click while preserving selection', async () => {
    await emulateClick(node.querySelector('span')!);
    await elementIsStable(node);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ command: '--activate', source: node }));
    expect(node.selected).toBe(true);
  });

  it('should prefer a direct target and resolve the attribute again when cleared', async () => {
    const other = fixture.querySelector<HTMLElement>('#other-target')!;
    const otherHandler = vi.fn();
    other.addEventListener('command', otherHandler);
    node.commandForElement = other;
    await elementIsStable(node);
    await emulateClick(node.querySelector('span')!);
    expect(otherHandler).toHaveBeenCalledOnce();
    expect(handler).not.toHaveBeenCalled();

    node.commandForElement = null;
    await elementIsStable(node);
    await emulateClick(node.querySelector('span')!);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('should resolve a target set through the commandfor property', async () => {
    node.removeAttribute('commandfor');
    node.commandfor = 'command-target';
    await elementIsStable(node);
    await emulateClick(node.querySelector('span')!);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('should invoke once on Enter from the header', async () => {
    const header = node.shadowRoot!.querySelector<HTMLElement>('[part="_node-header"]')!;
    header.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true, composed: true }));
    header.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true, composed: true }));
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ source: node }));
  });

  it('should preserve Space selection and arrow expansion without invoking', async () => {
    const header = node.shadowRoot!.querySelector<HTMLElement>('[part="_node-header"]')!;
    for (const code of ['Space', 'ArrowLeft']) {
      header.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true, composed: true }));
    }
    await elementIsStable(node);
    expect(node.selected).toBe(true);
    expect(node.expanded).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should invoke only the child command on child activation', async () => {
    const child = node.querySelector<TreeNode>('nve-tree-node')!;
    await elementIsStable(child);
    const title = child.shadowRoot!.querySelector<HTMLElement>('.node-title')!;
    await emulateClick(title);
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ source: child }));

    handler.mockClear();
    const header = child.shadowRoot!.querySelector<HTMLElement>('[part="_node-header"]')!;
    header.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true, composed: true }));
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ source: child }));
  });

  it.each(['prefix', 'suffix', 'content', ''])('should not invoke from an embedded button in slot "%s"', async slot => {
    const button = document.createElement('button');
    button.slot = slot;
    button.textContent = 'Action';
    node.append(button);
    await elementIsStable(node);
    await emulateClick(button);
    button.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true, composed: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it.each(['prefix', 'suffix'])(
    'should invoke from title text beside a %s button but not from that button',
    async slot => {
      const button = document.createElement('button');
      button.slot = slot;
      const buttonLabel = document.createElement('span');
      buttonLabel.textContent = 'Action';
      button.append(buttonLabel);
      node.append(button);
      await elementIsStable(node);

      node.querySelector('span')!.click();
      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ command: '--activate', source: node }));

      handler.mockClear();
      buttonLabel.click();
      expect(handler).not.toHaveBeenCalled();
    }
  );

  it('should not invoke from the disclosure control or checkbox', async () => {
    const tree = fixture.querySelector<Tree>('nve-tree')!;
    tree.selectable = 'multi';
    await elementIsStable(tree);
    await elementIsStable(node);
    await emulateClick(node.shadowRoot!.querySelector<HTMLElement>('nve-icon-button')!);
    await emulateClick(node.shadowRoot!.querySelector<HTMLInputElement>('input')!);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should respect canceled title clicks and Enter events', async () => {
    const label = node.querySelector('span')!;
    label.addEventListener('click', event => event.preventDefault());
    label.click();
    const header = node.shadowRoot!.querySelector<HTMLElement>('[part="_node-header"]')!;
    header.addEventListener('keyup', event => event.preventDefault());
    header.dispatchEvent(
      new KeyboardEvent('keyup', {
        code: 'Enter',
        bubbles: true,
        composed: true,
        cancelable: true
      })
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('should not invoke without a command', async () => {
    node.command = '';
    await elementIsStable(node);
    await emulateClick(node.querySelector('span')!);
    expect(handler).not.toHaveBeenCalled();
  });
});

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

  it('should align leaf root nodes with expandable root nodes', async () => {
    const leafHeader = element.shadowRoot!.querySelector<HTMLElement>('[part="_node-header"]')!;
    const expandableHeader = nestedNodeElement.shadowRoot!.querySelector<HTMLElement>('[part="_node-header"]')!;

    expect(leafHeader.getBoundingClientRect().x).toBe(expandableHeader.getBoundingClientRect().x);
  });

  it('should align multi-select leaf root nodes with expandable root nodes', async () => {
    tree.selectable = 'multi';
    await Promise.all([elementIsStable(tree), elementIsStable(element), elementIsStable(nestedNodeElement)]);

    const leafHeader = element.shadowRoot!.querySelector<HTMLElement>('[part="_node-header"]')!;
    const expandableHeader = nestedNodeElement.shadowRoot!.querySelector<HTMLElement>('[part="_node-header"]')!;

    expect(leafHeader.getBoundingClientRect().x).toBe(expandableHeader.getBoundingClientRect().x);
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

  it('should focus the node header when its label is clicked', () => {
    const nodeHeader = element.shadowRoot!.querySelector<HTMLElement>('[part="_node-header"]')!;
    const nodeTitle = element.shadowRoot!.querySelector<HTMLElement>('.node-title')!;

    expect(nodeTitle.tabIndex).toBe(-1);

    nodeTitle.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true }));

    expect(nodeHeader.matches(':focus')).toBe(true);
  });

  it('should preserve focus on an interactive node label descendant', async () => {
    const anchor = document.createElement('a');
    anchor.href = '#';
    element.appendChild(anchor);
    await elementIsStable(element);

    const nodeHeader = element.shadowRoot!.querySelector<HTMLElement>('[part="_node-header"]')!;
    anchor.focus();
    anchor.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true }));

    expect(anchor.matches(':focus')).toBe(true);
    expect(nodeHeader.matches(':focus')).toBe(false);
  });

  it('should prevent Space from scrolling while toggling tree selection', async () => {
    element.selectable = 'single';
    element.behaviorSelect = true;
    await elementIsStable(element);

    const nodeHeader = element.shadowRoot!.querySelector<HTMLElement>('[part="_node-header"]')!;
    const keydown = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, code: 'Space', composed: true });
    const keydownHandler = vi.fn();
    tree.addEventListener('keydown', keydownHandler);

    nodeHeader.dispatchEvent(keydown);
    nodeHeader.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, code: 'Space', composed: true }));
    await elementIsStable(element);

    expect(keydown.defaultPrevented).toBe(true);
    expect(keydownHandler).toHaveBeenCalledOnce();
    expect(element.selected).toBe(true);
  });

  it('should prevent expansion arrow keys from scrolling with application-managed expansion', async () => {
    element.expandable = true;
    await elementIsStable(element);

    const nodeHeader = element.shadowRoot!.querySelector<HTMLElement>('[part="_node-header"]')!;
    const keydownHandler = vi.fn();
    const openHandler = vi.fn();
    const closeHandler = vi.fn();
    tree.addEventListener('keydown', keydownHandler);
    element.addEventListener('open', openHandler);
    element.addEventListener('close', closeHandler);

    for (const code of ['ArrowLeft', 'ArrowRight']) {
      const keydown = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, code, composed: true });
      nodeHeader.dispatchEvent(keydown);
      nodeHeader.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, code, composed: true }));

      expect(keydown.defaultPrevented).toBe(true);
    }

    expect(keydownHandler).toHaveBeenCalledTimes(2);
    expect(closeHandler).toHaveBeenCalledOnce();
    expect(openHandler).toHaveBeenCalledOnce();
    expect(element.expanded).toBe(false);
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

  it('should select node when clicking non-interactive prefix and suffix content', async () => {
    tree.selectable = 'single';
    tree.behaviorSelect = true;
    await elementIsStable(tree);

    const selectHandler = vi.fn();
    element.addEventListener('select', selectHandler);

    for (const slot of ['prefix', 'suffix']) {
      const content = document.createElement('span');
      content.slot = slot;
      content.textContent = slot;
      element.appendChild(content);
      await elementIsStable(element);

      emulateClick(content);
      await elementIsStable(element);
    }

    expect(selectHandler).toHaveBeenCalledTimes(2);
  });

  it('should not select or expand node when clicking a prefix or suffix button', async () => {
    tree.selectable = 'single';
    tree.behaviorSelect = true;
    tree.behaviorExpand = true;
    await elementIsStable(tree);

    const selectHandler = vi.fn();
    const openHandler = vi.fn();
    nestedNodeElement.addEventListener('select', selectHandler);
    nestedNodeElement.addEventListener('open', openHandler);

    for (const slot of ['prefix', 'suffix']) {
      const button = document.createElement('button');
      button.slot = slot;
      button.textContent = slot;
      nestedNodeElement.appendChild(button);
      await elementIsStable(nestedNodeElement);

      emulateClick(button);
      await elementIsStable(nestedNodeElement);
    }

    expect(nestedNodeElement.selected).toBe(false);
    expect(nestedNodeElement.expanded).toBe(false);
    expect(selectHandler).not.toHaveBeenCalled();
    expect(openHandler).not.toHaveBeenCalled();
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
