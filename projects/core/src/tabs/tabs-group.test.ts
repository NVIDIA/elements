// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { Tabs, TabsGroup, TabsItem } from '@nvidia-elements/core/tabs';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/button/define.js';

type TabsGroupSelectEvent = CustomEvent<{ value: string }>;

describe(TabsGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let group: TabsGroup;
  let tabs: Tabs;
  let tabItems: TabsItem[];
  let panels: HTMLElement[];

  function assignRefsFromFixture() {
    group = fixture.querySelector(TabsGroup.metadata.tag)!;
    tabs = fixture.querySelector(Tabs.metadata.tag)!;
    tabItems = Array.from(fixture.querySelectorAll(TabsItem.metadata.tag));
    panels = Array.from(group.querySelectorAll<HTMLElement>('[slot]'));
  }

  async function stabilizeTabsGroup() {
    await Promise.all([elementIsStable(group), elementIsStable(tabs), ...tabItems.map(item => elementIsStable(item))]);
  }

  async function remount(content: ReturnType<typeof html>) {
    removeFixture(fixture);
    fixture = await createFixture(content);
    assignRefsFromFixture();
    await stabilizeTabsGroup();
  }

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tabs-group id="tab-group">
        <nve-tabs>
          <nve-tabs-item id="overview-tab" selected command="--toggle" commandfor="tab-group" value="overview">Overview</nve-tabs-item>
          <nve-tabs-item id="details-tab" command="--toggle" commandfor="tab-group" value="details">Details</nve-tabs-item>
          <nve-tabs-item id="settings-tab" command="--toggle" commandfor="tab-group" value="settings" disabled>Settings</nve-tabs-item>
        </nve-tabs>
        <div slot="overview">Overview panel</div>
        <div slot="details">Details panel</div>
        <div slot="settings">Settings panel</div>
      </nve-tabs-group>
      <nve-button id="details-button" command="--toggle" commandfor="tab-group" value="details">Details</nve-button>
      <nve-button id="settings-button" command="--toggle" commandfor="tab-group" value="settings">Settings</nve-button>
      <nve-button id="unknown-button" command="--toggle" commandfor="tab-group" value="unknown">Unknown</nve-button>
    `);
    assignRefsFromFixture();
    await stabilizeTabsGroup();
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define the group element', () => {
    expect(customElements.get(TabsGroup.metadata.tag)).toBeDefined();
  });

  it('should assign a group role to the host internals', () => {
    expect(group._internals.role).toBe('group');
  });

  it('should reflect alignment attribute', async () => {
    expect(group.alignment).toBe('top');
    expect(group.getAttribute('alignment')).toBe('top');
    group.alignment = 'start';
    await elementIsStable(group);
    expect(group.getAttribute('alignment')).toBe('start');
    group.alignment = 'end';
    await elementIsStable(group);
    expect(group.getAttribute('alignment')).toBe('end');
  });

  it('should keep a preselected tab active on initial sync', () => {
    expect(tabItems[0]!.selected).toBe(true);
    expect(tabItems[1]!.selected).toBe(false);
    expect(panels[0]!.hidden).toBe(false);
    expect(panels[1]!.hidden).toBe(true);
  });

  it('should render named panel slots on initial sync', () => {
    expect(Array.from(group.shadowRoot!.querySelectorAll('slot[name]')).map(slot => slot.getAttribute('name'))).toEqual(
      ['overview', 'details', 'settings']
    );
  });

  it('should not warn when remounting an already synchronized group', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await remount(html`
      <nve-tabs-group id="tab-group">
        <nve-tabs>
          <nve-tabs-item selected value="overview" command="--toggle" commandfor="tab-group">Overview</nve-tabs-item>
          <nve-tabs-item value="details" command="--toggle" commandfor="tab-group">Details</nve-tabs-item>
        </nve-tabs>
        <div slot="overview">Overview panel</div>
        <div slot="details">Details panel</div>
      </nve-tabs-group>
    `);

    const syncWarnings = warnSpy.mock.calls
      .flatMap(call => call)
      .filter(
        message => typeof message === 'string' && message.includes('scheduled an update after an update completed')
      );

    expect(syncWarnings).toHaveLength(0);

    warnSpy.mockRestore();
  });

  it('should select the first enabled valued tab when none are preselected', async () => {
    await remount(html`
      <nve-tabs-group id="tab-group">
        <nve-tabs>
          <nve-tabs-item value="overview" disabled command="--toggle" commandfor="tab-group">Overview</nve-tabs-item>
          <nve-tabs-item value="details" command="--toggle" commandfor="tab-group">Details</nve-tabs-item>
          <nve-tabs-item value="settings" command="--toggle" commandfor="tab-group">Settings</nve-tabs-item>
        </nve-tabs>
        <div slot="overview">Overview panel</div>
        <div slot="details">Details panel</div>
        <div slot="settings">Settings panel</div>
      </nve-tabs-group>
    `);

    expect(tabItems[0]!.selected).toBe(false);
    expect(tabItems[1]!.selected).toBe(true);
    expect(tabItems[2]!.selected).toBe(false);
    expect(panels[0]!.hidden).toBe(true);
    expect(panels[1]!.hidden).toBe(false);
  });

  it('should normalize multiple selected tabs to the first valid selection', async () => {
    await remount(html`
      <nve-tabs-group id="tab-group">
        <nve-tabs>
          <nve-tabs-item selected value="overview" command="--toggle" commandfor="tab-group">Overview</nve-tabs-item>
          <nve-tabs-item selected value="details" command="--toggle" commandfor="tab-group">Details</nve-tabs-item>
        </nve-tabs>
        <div slot="overview">Overview panel</div>
        <div slot="details">Details panel</div>
      </nve-tabs-group>
    `);

    expect(tabItems[0]!.selected).toBe(true);
    expect(tabItems[1]!.selected).toBe(false);
    expect(panels[0]!.hidden).toBe(false);
    expect(panels[1]!.hidden).toBe(true);
  });

  it('should select a tab from a command event source value', async () => {
    const event = untilEvent<TabsGroupSelectEvent>(group, 'select');
    group.dispatchEvent(
      new CommandEvent('command', {
        command: '--toggle',
        source: tabItems[1]!
      })
    );
    const selectEvent = await event;

    expect(selectEvent.detail).toEqual({ value: 'details' });
    expect(tabItems[0]!.selected).toBe(false);
    expect(tabItems[1]!.selected).toBe(true);
    expect(panels[0]!.hidden).toBe(true);
    expect(panels[1]!.hidden).toBe(false);
  });

  it('should select a tab through tab item invoker clicks', async () => {
    const event = untilEvent<TabsGroupSelectEvent>(group, 'select');
    await emulateClick(tabItems[1]!);
    const selectEvent = await event;

    expect(selectEvent.detail).toEqual({ value: 'details' });
    expect(tabItems[0]!.selected).toBe(false);
    expect(tabItems[1]!.selected).toBe(true);
    expect(panels[0]!.hidden).toBe(true);
    expect(panels[1]!.hidden).toBe(false);
  });

  it('should select a tab through external invoker clicks', async () => {
    const externalButton = fixture.querySelector<HTMLElement>('#details-button')!;
    const event = untilEvent<TabsGroupSelectEvent>(group, 'select');
    await emulateClick(externalButton);
    const selectEvent = await event;

    expect(selectEvent.detail).toEqual({ value: 'details' });
    expect(tabItems[1]!.selected).toBe(true);
    expect(panels[1]!.hidden).toBe(false);
  });

  it('should ignore invokers that target unknown values', async () => {
    const externalButton = fixture.querySelector<HTMLElement>('#unknown-button')!;
    let fired = false;

    group.addEventListener('select', () => (fired = true));
    await emulateClick(externalButton);
    await elementIsStable(group);

    expect(fired).toBe(false);
    expect(tabItems[0]!.selected).toBe(true);
    expect(panels[0]!.hidden).toBe(false);
  });

  it('should ignore invokers that target disabled tabs', async () => {
    const externalButton = fixture.querySelector<HTMLElement>('#settings-button')!;
    let fired = false;

    group.addEventListener('select', () => (fired = true));
    await emulateClick(externalButton);
    await elementIsStable(group);

    expect(fired).toBe(false);
    expect(tabItems[2]!.selected).toBe(false);
    expect(panels[2]!.hidden).toBe(true);
  });

  it('should not emit select when the active value does not change', async () => {
    let fired = false;

    group.addEventListener('select', () => (fired = true));
    await emulateClick(tabItems[0]!);
    await elementIsStable(group);

    expect(fired).toBe(false);
  });

  it('should wire aria relationships on panels internally', () => {
    expect(tabItems[0]!.getAttribute('aria-controls')).toBe(panels[0]!.id);
    expect(tabItems[1]!.getAttribute('aria-controls')).toBe(panels[1]!.id);
    expect(panels[0]!.getAttribute('aria-labelledby')).toBe(tabItems[0]!.id);
    expect(panels[1]!.getAttribute('role')).toBe('tabpanel');
  });

  it('should preserve author-provided panel aria attributes', async () => {
    await remount(html`
      <nve-tabs-group id="tab-group">
        <nve-tabs>
          <nve-tabs-item value="overview" command="--toggle" commandfor="tab-group" selected>Overview</nve-tabs-item>
        </nve-tabs>
        <div id="custom-panel" slot="overview" role="region" aria-labelledby="existing-tab">Overview panel</div>
      </nve-tabs-group>
    `);

    expect(panels[0]!.id).toBe('custom-panel');
    expect(panels[0]!.getAttribute('role')).toBe('region');
    expect(panels[0]!.getAttribute('aria-labelledby')).toBe('existing-tab');
    expect(tabItems[0]!.getAttribute('aria-controls')).toBe('custom-panel');
  });

  it('should not emit select when panels change without changing the active tab', async () => {
    let fired = false;

    group.addEventListener('select', () => (fired = true));

    const extraPanel = document.createElement('div');
    extraPanel.slot = 'overview';
    extraPanel.textContent = 'Secondary overview panel';
    group.appendChild(extraPanel);

    await Promise.all([elementIsStable(group), elementIsStable(tabItems[0]!)]);

    expect(fired).toBe(false);
    expect(tabItems[0]!.selected).toBe(true);
    expect(extraPanel.hidden).toBe(false);
  });

  it('should resync when a new tab and panel are added', async () => {
    const newTab = document.createElement('nve-tabs-item') as TabsItem;
    newTab.value = 'logs';
    newTab.setAttribute('command', '--toggle');
    newTab.setAttribute('commandfor', 'tab-group');
    newTab.textContent = 'Logs';

    const newPanel = document.createElement('div');
    newPanel.slot = 'logs';
    newPanel.textContent = 'Logs panel';

    tabs.appendChild(newTab);
    group.appendChild(newPanel);

    await Promise.all([elementIsStable(group), elementIsStable(newTab)]);

    const event = untilEvent<TabsGroupSelectEvent>(group, 'select');
    await emulateClick(newTab);
    const selectEvent = await event;

    expect(selectEvent.detail).toEqual({ value: 'logs' });
    expect(newPanel.hidden).toBe(false);
    expect(newPanel.getAttribute('role')).toBe('tabpanel');
  });
});
