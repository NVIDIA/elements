// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';
import { WorkspacePanel } from '../panel/panel.js';

interface Box {
  element: HTMLElement;
  rect: DOMRect;
  frame: Keyframe;
}

interface GroupBox extends Box {
  tabs: Map<string, Box>;
}

export interface WorkspacePresentation {
  panels: Map<string, { box: Box; header: Map<string, Box> }>;
  groups: Map<string, GroupBox>;
  gutters: Map<string, Box>;
}

const headerParts = ['.label-viewport', '.label-track', '.label', '.suffix'] as const;

function box(element: HTMLElement): Box {
  const style = getComputedStyle(element);
  return {
    element,
    rect: element.getBoundingClientRect(),
    frame: { left: style.left, top: style.top, width: style.width, height: style.height }
  };
}

function captureHeader(panel: WorkspacePanel): Map<string, Box> {
  const header = panel.querySelector(':scope > nve-workspace-panel-header');
  const parts = new Map<string, Box>();
  for (const selector of headerParts) {
    const element = header?.shadowRoot?.querySelector<HTMLElement>(selector);
    if (!element) continue;
    const entry = box(element);
    if (selector === '.label-track') entry.frame.transform = getComputedStyle(element).transform;
    parts.set(selector, entry);
  }
  return parts;
}

function captureGroups(host: HTMLElement): WorkspacePresentation['groups'] {
  const groups: WorkspacePresentation['groups'] = new Map();
  for (const element of host.shadowRoot?.querySelectorAll<HTMLElement>('.group-chrome') ?? []) {
    const tabs = new Map<string, Box>();
    for (const tab of element.querySelectorAll<HTMLElement>('[data-panel]')) {
      const entry = tab.closest<HTMLElement>('.tab-entry');
      if (entry && tab.dataset.panel) tabs.set(tab.dataset.panel, box(entry));
    }
    const group = { ...box(element), tabs };
    tabs.forEach((_, id) => groups.set(id, group));
  }
  return groups;
}

export function captureWorkspacePresentation(host: HTMLElement): WorkspacePresentation {
  const panels: WorkspacePresentation['panels'] = new Map();
  for (const panel of host.children) {
    if (panel instanceof WorkspacePanel && panel.checkVisibility())
      panels.set(panel.id, { box: box(panel), header: captureHeader(panel) });
  }
  const gutters = new Map<string, Box>();
  for (const handle of host.shadowRoot?.querySelectorAll<HTMLElement>('[data-boundary]') ?? []) {
    if (handle.parentElement) gutters.set(handle.dataset.boundary!, box(handle.parentElement));
  }
  return { panels, groups: captureGroups(host), gutters };
}

export function workspaceAnimationDuration(host: HTMLElement): number {
  const probe = host.shadowRoot?.querySelector('[data-chrome]');
  if (!host.isConnected || !probe) return 0;
  const value = getComputedStyle(probe).animationDuration;
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? Math.max(0, value.endsWith('ms') ? number : number * 1000) : 150;
}

export async function workspacePresentationReady(host: HTMLElement & ReactiveControllerHost) {
  await host.updateComplete;
  const pending: Promise<unknown>[] = [];
  for (const panel of host.children) {
    if (!(panel instanceof WorkspacePanel)) continue;
    pending.push(panel.updateComplete);
    const header = panel.querySelector<HTMLElement & ReactiveControllerHost>(':scope > nve-workspace-panel-header');
    if (header) pending.push(header.updateComplete);
  }
  await Promise.all(pending);
}

export function animateWorkspacePresentation(input: {
  before: WorkspacePresentation;
  after: WorkspacePresentation;
  duration: number;
  easing: string;
}): Animation[] {
  const animations: Animation[] = [];
  const animate = (from: Keyframe, to: Box) => {
    if (JSON.stringify(from) === JSON.stringify(to.frame)) return;
    animations.push(to.element.animate([from, to.frame], { duration: input.duration, easing: input.easing }));
  };
  input.after.panels.forEach((panel, id) => {
    const previous = input.before.panels.get(id);
    if (!previous) return;
    animate(previous.box.frame, panel.box);
    panel.header.forEach((part, key) => {
      const oldPart = previous.header.get(key);
      if (oldPart) animate(oldPart.frame, part);
    });
  });
  const transition = { input, animations };
  const visited = new Set<HTMLElement>();
  input.after.groups.forEach((group, id) => {
    if (visited.has(group.element)) return;
    visited.add(group.element);
    const previous = input.before.groups.get(id);
    if (!previous) return;
    animate(previous.frame, group);
    animateGroupTabs(transition, previous, group);
  });
  input.after.gutters.forEach((gutter, id) => {
    const previous = input.before.gutters.get(id);
    if (previous) animate(previous.frame, gutter);
  });
  return animations;
}

function animateGroupTabs(
  { input, animations }: { input: Parameters<typeof animateWorkspacePresentation>[0]; animations: Animation[] },
  previous: GroupBox,
  group: GroupBox
) {
  group.tabs.forEach((tab, panelId) => {
    const oldGroup = input.before.groups.get(panelId);
    const oldTab = oldGroup?.tabs.get(panelId);
    if (!oldTab) return;
    const x = oldTab.rect.x - previous.rect.x - (tab.rect.x - group.rect.x);
    const y = oldTab.rect.y - previous.rect.y - (tab.rect.y - group.rect.y);
    const from = { width: oldTab.frame.width, height: oldTab.frame.height, translate: `${x}px ${y}px` };
    const to = { width: tab.frame.width, height: tab.frame.height, translate: '0px 0px' };
    if (x || y || from.width !== to.width || from.height !== to.height)
      animations.push(tab.element.animate([from, to], { duration: input.duration, easing: input.easing }));
  });
}
