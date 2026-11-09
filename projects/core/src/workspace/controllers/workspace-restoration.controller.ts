// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';

import { matchesElementName } from '@nvidia-elements/core/internal';

import { isResizeKey } from '../utils/interaction/resize-input.utils.js';
import { sameWorkspaceLayout } from '../utils/model/value.utils.js';

import { WorkspacePanel } from '../panel/panel.js';

import type {
  WorkspacePanelTransitionTargets,
  WorkspaceTransitionTargets
} from './workspace-composition.controller.js';
import type { WorkspaceLayout } from '../utils/model/layout.utils.js';
import type { WorkspaceMeasurementChange } from '../utils/presentation/measurements.utils.js';

import type { WorkspacePanelHeader } from '../panel-header/panel-header.js';
import type { WorkspaceAnimationOptions } from '../workspace.types.js';

interface Box {
  element: HTMLElement;
  rect: DOMRect;
  frame: {
    left: string;
    top: string;
    width: string;
    height: string;
    transform?: string;
  };
}

interface GroupBox extends Box {
  tabs: Map<string, Box>;
}

interface WorkspacePresentation {
  panels: Map<string, { box: Box; header: Map<string, Box> }>;
  groups: Map<string, GroupBox>;
  gutters: Map<string, Box>;
}

interface Restoration {
  target?: { layout: WorkspaceLayout | undefined };
  before: WorkspacePresentation;
  duration: number;
  animations: Animation[];
}

interface WorkspaceRestorationDelegate {
  readonly getLayout: () => WorkspaceLayout | undefined;
  readonly applyLayout: (layout: WorkspaceLayout | undefined) => void;
  readonly getTransitionTargets: () => WorkspaceTransitionTargets;
}

export class WorkspaceRestorationController {
  readonly #host: HTMLElement & ReactiveControllerHost;
  readonly #delegate: WorkspaceRestorationDelegate;
  #restoration?: Restoration;

  constructor(host: HTMLElement & ReactiveControllerHost, delegate: WorkspaceRestorationDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    host.addController(this);
  }

  get active() {
    return this.#restoration !== undefined;
  }

  hostConnected() {
    this.#host.addEventListener('pointerdown', this.#guardStart, true);
    this.#host.addEventListener('keydown', this.#guardStart, true);
  }

  hostDisconnected() {
    this.finish();
    this.#host.removeEventListener('pointerdown', this.#guardStart, true);
    this.#host.removeEventListener('keydown', this.#guardStart, true);
  }

  handleMeasurementsChange(change: WorkspaceMeasurementChange) {
    if (change.spaceChanged) {
      this.finish();
    }
  }

  animateTo(layout: WorkspaceLayout | undefined, options: WorkspaceAnimationOptions) {
    const target = this.#restoration?.target;
    if (target && sameWorkspaceLayout(layout, target.layout)) {
      return;
    }
    if (!this.active && sameWorkspaceLayout(layout, this.#delegate.getLayout())) {
      this.#delegate.applyLayout(layout);
      return;
    }
    this.transition(() => this.#delegate.applyLayout(layout), options, { layout });
  }

  transition(
    apply: () => void,
    options: WorkspaceAnimationOptions = {},
    target?: { layout: WorkspaceLayout | undefined }
  ) {
    const canAnimate = this.#host.isConnected && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = canAnimate ? getWorkspaceAnimationDuration(this.#host, options.duration) : 0;
    if (duration === 0) {
      this.finish();
      apply();
      return;
    }

    const before = captureWorkspacePresentation(this.#delegate.getTransitionTargets());
    this.finish();
    if (!before.panels.size) {
      apply();
      return;
    }
    const restoration: Restoration = { target, before, duration, animations: [] };
    this.#restoration = restoration;
    apply();
    void this.#animate(restoration);
  }

  finish() {
    const restoration = this.#restoration;
    this.#restoration = undefined;
    restoration?.animations.forEach(animation => animation.cancel());
  }

  async #animate(restoration: Restoration) {
    await this.#host.updateComplete;
    await Promise.all(getPanelUpdatePromises(this.#host));
    if (this.#restoration !== restoration || !this.#host.isConnected) return;
    const after = captureWorkspacePresentation(this.#delegate.getTransitionTargets());
    const easing = getWorkspaceAnimationEasing(this.#host);
    restoration.animations = animateWorkspacePresentation({ ...restoration, after, easing });
    await Promise.allSettled(restoration.animations.map(animation => animation.finished));
    if (this.#restoration === restoration) {
      this.finish();
    }
  }

  #guardStart = (event: Event) => {
    if (!this.active) {
      return;
    }
    const control = this.#findInteractionControl(event);
    if (!control) {
      return;
    }
    const isResizeControl = control.hasAttribute('data-boundary');
    if (event instanceof KeyboardEvent && (!isResizeControl || !isResizeKey(event.key))) {
      return;
    }

    event.stopImmediatePropagation();
    if (isResizeControl) {
      event.preventDefault();
    }
  };

  #findInteractionControl(event: Event): HTMLElement | undefined {
    return event
      .composedPath()
      .find(
        (node): node is HTMLElement =>
          node instanceof HTMLElement &&
          node.getRootNode() === this.#host.shadowRoot &&
          (node.hasAttribute('data-panel') ||
            node.hasAttribute('data-drag-group') ||
            node.hasAttribute('data-boundary'))
      );
  }
}

function captureBox(element: HTMLElement): Box {
  const style = getComputedStyle(element);
  return {
    element,
    rect: element.getBoundingClientRect(),
    frame: { left: style.left, top: style.top, width: style.width, height: style.height }
  };
}

function captureHeader(elements: WorkspacePanelTransitionTargets['header']) {
  const parts = new Map<string, Box>();
  for (const [role, element] of Object.entries(elements ?? {})) {
    if (!element) continue;
    const entry = captureBox(element);
    if (role === 'labelTrack') {
      entry.frame.transform = getComputedStyle(element).transform;
    }
    parts.set(role, entry);
  }
  return parts;
}

function captureGroups(elements: WorkspaceTransitionTargets['groups']): WorkspacePresentation['groups'] {
  const groups: WorkspacePresentation['groups'] = new Map();
  for (const { element, tabs } of elements) {
    const capturedTabs = new Map<string, Box>();
    tabs.forEach((tab, id) => capturedTabs.set(id, captureBox(tab)));
    const group = { ...captureBox(element), tabs: capturedTabs };
    tabs.forEach((_, id) => groups.set(id, group));
  }
  return groups;
}

function captureWorkspacePresentation(elements: WorkspaceTransitionTargets): WorkspacePresentation {
  const panels: WorkspacePresentation['panels'] = new Map();
  elements.panels.forEach((panel, id) => {
    panels.set(id, { box: captureBox(panel.element), header: captureHeader(panel.header) });
  });
  const gutters = new Map<string, Box>();
  elements.gutters.forEach((gutter, id) => gutters.set(id, captureBox(gutter)));
  return { panels, groups: captureGroups(elements.groups), gutters };
}

function getWorkspaceAnimationDuration(host: HTMLElement, duration?: number): number {
  if (duration !== undefined && Number.isFinite(duration) && duration >= 0) return duration;

  const probe = host.shadowRoot?.querySelector('[data-chrome]');
  if (!host.isConnected || !probe) return 0;
  const value = getComputedStyle(probe).animationDuration;
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? Math.max(0, value.endsWith('ms') ? number : number * 1000) : 150;
}

function getWorkspaceAnimationEasing(host: HTMLElement): string {
  const probe = host.shadowRoot?.querySelector('[data-chrome]');
  return probe ? getComputedStyle(probe).animationTimingFunction : 'ease';
}

function getPanelUpdatePromises(host: HTMLElement): Promise<unknown>[] {
  const updates: Promise<unknown>[] = [];
  for (const child of host.children) {
    if (!matchesElementName(child, WorkspacePanel)) continue;
    const panel = child as WorkspacePanel;
    updates.push(panel.updateComplete);
    const header = panel.querySelector<WorkspacePanelHeader>(':scope > nve-workspace-panel-header');
    if (header) {
      updates.push(header.updateComplete);
    }
  }
  return updates;
}

function animateWorkspacePresentation(input: {
  before: WorkspacePresentation;
  after: WorkspacePresentation;
  duration: number;
  easing: string;
}): Animation[] {
  const animations: Animation[] = [];
  const animate = (from: Box['frame'], to: Box) => {
    if (
      from.left === to.frame.left &&
      from.top === to.frame.top &&
      from.width === to.frame.width &&
      from.height === to.frame.height &&
      from.transform === to.frame.transform
    )
      return;
    animations.push(to.element.animate([from, to.frame], { duration: input.duration, easing: input.easing }));
  };
  input.after.panels.forEach((panel, id) => {
    const previous = input.before.panels.get(id);
    if (!previous) return;
    animate(previous.box.frame, panel.box);
    panel.header.forEach((part, key) => {
      const oldPart = previous.header.get(key);
      if (oldPart) {
        animate(oldPart.frame, part);
      }
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
    if (previous) {
      animate(previous.frame, gutter);
    }
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
    if (x || y || from.width !== to.width || from.height !== to.height) {
      animations.push(tab.element.animate([from, to], { duration: input.duration, easing: input.easing }));
    }
  });
}
