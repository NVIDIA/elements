// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { userEvent } from 'vitest/browser';
import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Tabs, TabsItem, TabsItemGroup } from '@nvidia-elements/core/tabs';
import type { IconButton } from '@nvidia-elements/core/icon-button';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe(TabsItemGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let tabs: Tabs;
  let group: TabsItemGroup;
  let item: TabsItem;
  let action: IconButton;
  let first: TabsItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tabs behavior-select>
        <nve-tabs-item selected>Overview</nve-tabs-item>
        <nve-tabs-item-group>
          <nve-tabs-item>Experiment</nve-tabs-item>
          <nve-icon-button slot="suffix" icon-name="cancel" size="sm" aria-label="Close experiment" tabindex="-1"></nve-icon-button>
        </nve-tabs-item-group>
      </nve-tabs>
    `);
    tabs = fixture.querySelector(Tabs.metadata.tag);
    group = fixture.querySelector(TabsItemGroup.metadata.tag);
    item = group.querySelector(TabsItem.metadata.tag);
    action = group.querySelector('nve-icon-button');
    first = tabs.querySelector(TabsItem.metadata.tag);
    await Promise.all([elementIsStable(tabs), elementIsStable(group), elementIsStable(item), elementIsStable(action)]);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define the group element', () => {
    expect(customElements.get(TabsItemGroup.metadata.tag)).toBeDefined();
  });

  it('should keep the group outside the focus order and the tab role on its item', () => {
    expect(group.tabIndex).toBe(-1);
    expect(group.getAttribute('role')).not.toBe('tab');
    expect(item._internals.role).toBe('tab');
    expect(action._internals.role).toBe('button');
  });

  it('should preserve supplied siblings and their author-provided attributes', () => {
    expect(item.parentElement).toBe(group);
    expect(action.parentElement).toBe(group);
    expect(group.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])').assignedElements()).toEqual([item]);
    expect(group.shadowRoot.querySelector<HTMLSlotElement>('slot[name="suffix"]').assignedElements()).toEqual([action]);
    expect(action.getAttribute('tabindex')).toBe('-1');
    expect(action.getAttribute('aria-label')).toBe('Close experiment');
  });

  it('should include accessories of the initially tabbable tab', async () => {
    fixture.innerHTML = `
      <nve-tabs>
        <nve-tabs-item>Overview</nve-tabs-item>
        <nve-tabs-item-group>
          <nve-tabs-item selected>Experiment</nve-tabs-item>
          <button slot="suffix">Close experiment</button>
        </nve-tabs-item-group>
      </nve-tabs>`;
    const list = fixture.querySelector('nve-tabs');
    const entry = fixture.querySelector('nve-tabs-item-group');
    const current = entry.querySelector('nve-tabs-item');
    const close = entry.querySelector('button');
    await Promise.all([elementIsStable(list), elementIsStable(entry), elementIsStable(current)]);
    current.focus();

    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(close);
  });

  it('should skip accessories when their tab is outside the tab order', async () => {
    const prefix = document.createElement('button');
    prefix.slot = 'prefix';
    prefix.textContent = 'Pin';
    group.prepend(prefix);
    action.tabIndex = 0;
    const wrapper = document.createElement('span');
    wrapper.slot = 'suffix';
    wrapper.innerHTML = '<button>More actions</button>';
    group.append(wrapper);
    const after = document.createElement('button');
    after.textContent = 'After tabs';
    fixture.append(after);
    await elementIsStable(group);
    first.focus();

    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(after);
    expect(prefix.hasAttribute('tabindex')).toBe(false);
    expect(action.getAttribute('tabindex')).toBe('0');
    expect(wrapper.querySelector('button').hasAttribute('tabindex')).toBe(false);
  });

  it('should keep link tab accessories tabbable after a property update', async () => {
    const link = document.createElement('a');
    link.href = '#experiment';
    link.textContent = 'Experiment';
    item.replaceChildren(link);
    action.tabIndex = 0;
    await elementIsStable(item);
    item.value = 'experiment';
    await Promise.all([elementIsStable(item), elementIsStable(group)]);
    expect(item.tabIndex).toBe(-1);
    link.focus();
    expect(document.activeElement).toBe(link);

    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(action);
  });

  it('should follow changes to the label link tabindex', async () => {
    const link = document.createElement('a');
    link.href = '#experiment';
    link.slot = '';
    link.textContent = 'Experiment';
    item.replaceChildren(link);
    action.tabIndex = 0;
    await Promise.all([elementIsStable(item), elementIsStable(group)]);
    link.focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(action);

    link.tabIndex = -1;
    await elementIsStable(group);
    const after = document.createElement('button');
    after.textContent = 'After tabs';
    fixture.append(after);
    first.focus();
    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(after);
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(action.getAttribute('tabindex')).toBe('0');
  });

  it('should include link accessories when the label gains an href', async () => {
    const link = document.createElement('a');
    link.textContent = 'Experiment';
    item.replaceChildren(link);
    action.tabIndex = 0;
    const after = document.createElement('button');
    after.textContent = 'After tabs';
    fixture.append(after);
    await Promise.all([elementIsStable(item), elementIsStable(group)]);
    first.focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(after);

    link.href = '#experiment';
    await elementIsStable(group);
    link.focus();
    expect(document.activeElement).toBe(link);
    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(action);
  });

  it('should follow tab navigation independently of selection', async () => {
    action.tabIndex = 0;
    const after = document.createElement('button');
    after.textContent = 'After tabs';
    fixture.append(after);
    first.focus();

    await userEvent.keyboard('{ArrowRight}');
    await elementIsStable(group);
    expect(document.activeElement).toBe(item);
    expect(first.selected).toBe(true);
    expect(item.selected).toBe(false);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(action);
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(item);
    await userEvent.keyboard('{ArrowLeft}');
    await elementIsStable(group);
    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(after);
    expect(action.getAttribute('tabindex')).toBe('0');
  });

  it('should include accessories after pointer navigation to their tab', async () => {
    action.tabIndex = 0;

    await userEvent.click(item);
    await elementIsStable(group);
    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(action);
  });

  it('should reach prefix accessories with Shift+Tab from their tab', async () => {
    const prefix = document.createElement('button');
    prefix.slot = 'prefix';
    prefix.textContent = 'Pin';
    group.prepend(prefix);
    await elementIsStable(group);
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    await elementIsStable(group);

    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

    expect(document.activeElement).toBe(prefix);
    expect(first.selected).toBe(true);
  });

  it('should preserve a negative accessory tabindex when its tab is tabbable', async () => {
    const after = document.createElement('button');
    after.textContent = 'After tabs';
    fixture.append(after);
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    await elementIsStable(group);

    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(after);
    expect(action.getAttribute('tabindex')).toBe('-1');
  });

  it('should follow changes to authored tab indices', async () => {
    action.tabIndex = 0;
    tabs.setAttribute('nve-keynav-disabled', '');
    item.tabIndex = 2;
    first.tabIndex = -1;
    await elementIsStable(group);
    item.focus();

    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(action);
    expect(action.getAttribute('tabindex')).toBe('0');
    expect(item.tabIndex).toBe(2);

    item.tabIndex = -1;
    await elementIsStable(group);
    const after = document.createElement('button');
    after.textContent = 'After tabs';
    fixture.append(after);
    first.focus();
    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(after);
  });

  it('should bubble accessory clicks without selecting or activating its sibling tab', async () => {
    const click = vi.fn();
    fixture.addEventListener('click', click);

    await userEvent.click(action);

    expect(click).toHaveBeenCalledTimes(1);
    expect(item.selected).toBe(false);
    expect(first.selected).toBe(true);
    expect(item.matches(':state(active)')).toBe(false);
  });

  it('should activate an accessory once with Enter while preserving bubbling keyboard events', async () => {
    const click = vi.fn();
    const keyup = vi.fn();
    fixture.addEventListener('click', click);
    fixture.addEventListener('keyup', keyup);
    action.focus();
    expect(document.activeElement).toBe(action);

    await userEvent.keyboard('{Enter>}');
    expect(item.matches(':state(active)')).toBe(false);
    await userEvent.keyboard('{/Enter}');

    expect(click).toHaveBeenCalledTimes(1);
    expect(keyup).toHaveBeenCalledTimes(1);
    expect(item.matches(':state(active)')).toBe(false);
    expect(item.selected).toBe(false);
    expect(first.selected).toBe(true);
  });

  it('should activate an accessory once with Space while preserving bubbling keyboard events', async () => {
    const click = vi.fn();
    const keyup = vi.fn();
    fixture.addEventListener('click', click);
    fixture.addEventListener('keyup', keyup);
    action.focus();
    expect(document.activeElement).toBe(action);

    await userEvent.keyboard('{Space>}');
    expect(item.matches(':state(active)')).toBe(false);
    await userEvent.keyboard('{/Space}');

    expect(click).toHaveBeenCalledTimes(1);
    expect(keyup).toHaveBeenCalledTimes(1);
    expect(item.matches(':state(active)')).toBe(false);
    expect(item.selected).toBe(false);
    expect(first.selected).toBe(true);
  });

  it('should leave arrow-key interaction with a prefix control to that control', async () => {
    const range = document.createElement('input');
    range.type = 'range';
    range.slot = 'prefix';
    range.min = '0';
    range.max = '10';
    range.value = '2';
    group.prepend(range);
    await elementIsStable(group);
    range.focus();
    expect(document.activeElement).toBe(range);

    await userEvent.keyboard('{ArrowRight}');

    expect(range.value).toBe('3');
    expect(document.activeElement).toBe(range);
    expect(first.tabIndex).toBe(0);
    expect(item.tabIndex).toBe(-1);
    expect(first.selected).toBe(true);
  });

  it('should navigate to a grouped tab with ArrowLeft in RTL', async () => {
    tabs.dir = 'rtl';
    first.focus();

    await userEvent.keyboard('{ArrowLeft}');

    expect(document.activeElement).toBe(item);
    expect(item.tabIndex).toBe(0);
    expect(action.getAttribute('tabindex')).toBe('-1');
  });

  it('should navigate to a grouped tab with ArrowDown in vertical tabs', async () => {
    tabs.vertical = true;
    await elementIsStable(tabs);
    first.focus();

    await userEvent.keyboard('{ArrowDown}');

    expect(document.activeElement).toBe(item);
    expect(item.tabIndex).toBe(0);
    expect(action.getAttribute('tabindex')).toBe('-1');
  });

  it('should retain application control of accessory disabled state', async () => {
    const click = vi.fn();
    action.addEventListener('click', click);
    item.disabled = true;
    await elementIsStable(item);

    await userEvent.click(action);

    expect(click).toHaveBeenCalledTimes(1);
    expect(action.disabled).toBe(false);
    expect(item.selected).toBe(false);
    expect(first.selected).toBe(true);

    action.disabled = true;
    await elementIsStable(action);
    action.click();

    expect(click).toHaveBeenCalledTimes(1);
    expect(action.disabled).toBe(true);
  });

  it('should navigate between direct and grouped tabs after replacing a grouped item', async () => {
    action.tabIndex = 0;
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(item);

    const replacement = document.createElement('nve-tabs-item');
    replacement.slot = '';
    replacement.textContent = 'Replacement';
    item.replaceWith(replacement);
    await Promise.all([elementIsStable(replacement), elementIsStable(group), elementIsStable(tabs)]);
    first.focus();

    await userEvent.keyboard('{ArrowRight}');

    expect(document.activeElement).toBe(replacement);
    expect(replacement.tabIndex).toBe(0);
    expect(first.tabIndex).toBe(-1);
    expect(group.tabIndex).toBe(-1);
    await elementIsStable(group);
    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(action);
    expect(action.getAttribute('tabindex')).toBe('0');
  });

  it('should preserve author tab order during grouped replacement when key navigation is disabled', async () => {
    fixture.innerHTML = `
      <nve-tabs nve-keynav-disabled>
        <nve-tabs-item tabindex="2">Overview</nve-tabs-item>
        <nve-tabs-item-group>
          <nve-tabs-item tabindex="4">Experiment</nve-tabs-item>
        </nve-tabs-item-group>
      </nve-tabs>`;
    const list = fixture.querySelector('nve-tabs');
    const direct = list.querySelector('nve-tabs-item');
    const entry = list.querySelector('nve-tabs-item-group');
    const grouped = entry.querySelector('nve-tabs-item');
    await Promise.all([elementIsStable(list), elementIsStable(direct), elementIsStable(grouped)]);
    expect(direct.tabIndex).toBe(2);
    expect(grouped.tabIndex).toBe(4);

    const replacement = document.createElement('nve-tabs-item');
    replacement.tabIndex = 7;
    replacement.textContent = 'Replacement';
    grouped.replaceWith(replacement);
    await Promise.all([elementIsStable(replacement), elementIsStable(entry), elementIsStable(list)]);

    expect(direct.tabIndex).toBe(2);
    expect(replacement.tabIndex).toBe(7);
  });

  it('should reconcile tab order when a grouped item enters the default slot', async () => {
    item.slot = 'suffix';
    await elementIsStable(tabs);
    item.tabIndex = 0;
    action.tabIndex = 0;

    item.slot = '';
    await Promise.all([elementIsStable(tabs), elementIsStable(group)]);

    expect(first.tabIndex).toBe(0);
    expect(item.tabIndex).toBe(-1);
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    await elementIsStable(group);
    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(action);
  });

  it('should restore the remaining tab stop when a grouped item leaves the default slot', async () => {
    action.tabIndex = 0;
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    await elementIsStable(group);
    expect(item.tabIndex).toBe(0);
    const after = document.createElement('button');
    after.textContent = 'After tabs';
    fixture.append(after);

    item.slot = 'suffix';
    await Promise.all([elementIsStable(tabs), elementIsStable(group)]);

    expect(first.tabIndex).toBe(0);
    first.focus();
    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(after);
  });

  it('should restore accessory tab order after reconnecting the tab strip', async () => {
    action.tabIndex = 0;
    tabs.remove();
    fixture.append(tabs);
    await Promise.all([elementIsStable(tabs), elementIsStable(group)]);
    expect(first.tabIndex).toBe(0);
    expect(item.tabIndex).toBe(-1);
    const after = document.createElement('button');
    after.textContent = 'After tabs';
    fixture.append(after);
    first.focus();

    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(after);
  });

  it('should restore accessory tab order after reconnecting a group', async () => {
    action.tabIndex = 0;
    group.remove();
    tabs.append(group);
    await Promise.all([elementIsStable(tabs), elementIsStable(group)]);
    const after = document.createElement('button');
    after.textContent = 'After tabs';
    fixture.append(after);
    first.focus();

    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(after);
  });

  it('should restore author tab order when a group leaves the tab strip', async () => {
    action.tabIndex = 0;
    fixture.append(group);
    await elementIsStable(group);
    item.focus();

    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(action);
    expect(action.getAttribute('tabindex')).toBe('0');
  });
});
