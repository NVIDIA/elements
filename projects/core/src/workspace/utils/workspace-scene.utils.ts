// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspaceChrome } from '../controllers/workspace-chrome.controller.js';
import { createAllocatedContextRect } from './workspace-context.utils.js';
import { canvasClientRect, interactionBounds } from './workspace-computed-targets.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from './workspace-layout.utils.js';
import { detachedLayout } from './workspace-operations.utils.js';
import { createWorkspaceLayoutProjector } from './workspace-projection.utils.js';
import type { WorkspacePanel } from '../panel/panel.js';
import { allocateWorkspace, type WorkspaceRect } from './workspace-placement.utils.js';
import { minimumWorkspace, workspaceRequirements, type WorkspaceExtent } from './workspace-sizing.utils.js';
import { createTabGroups, type WorkspaceTabGroup } from './workspace-tabstrip.utils.js';

interface SceneInput {
  panels: WorkspacePanel[];
  layout: WorkspaceLayout;
  source: string[];
  chrome: WorkspaceChrome;
  policy: 'stop' | 'propagate';
  strip(group: WorkspaceTabGroup): HTMLElement | null | undefined;
}

/** Shares layout inputs and browser reads within one synchronous evaluation. */
export class WorkspaceScene {
  readonly panels: WorkspacePanel[];
  readonly available: string[];
  readonly requirements;
  readonly projectLayout = createWorkspaceLayoutProjector();
  readonly contextRect = createAllocatedContextRect();

  readonly #host: HTMLElement;
  readonly #input: SceneInput;
  readonly #scroll = new WeakMap<HTMLElement, number>();
  readonly #allocations = new Map<WorkspaceNode | null, Map<WorkspaceNode | null, ReturnType<typeof allocateScene>>>();
  readonly #minima = new Map<WorkspaceNode | null, WorkspaceExtent>();
  readonly #detached = new WeakMap<string[], ReturnType<typeof allocateScene>>();

  #origin?: WorkspaceRect;
  #bounds?: WorkspaceRect;

  constructor(host: HTMLElement, input: SceneInput) {
    this.#host = host;
    this.#input = input;
    this.panels = input.panels;
    this.available = input.panels.map(panel => panel.id);
    this.requirements = workspaceRequirements(input);
  }

  minimum(node: WorkspaceNode | null) {
    let minimum = this.#minima.get(node);
    if (!minimum) {
      minimum = minimumWorkspace(node, this.requirements);
      this.#minima.set(node, minimum);
    }
    return minimum;
  }

  project(layout: WorkspaceLayout) {
    return this.projectLayout(layout, this.available);
  }

  geometry(layout: WorkspaceLayout, extent = layout) {
    let allocations = this.#allocations.get(layout.root);
    if (!allocations) {
      allocations = new Map();
      this.#allocations.set(layout.root, allocations);
    }
    let geometry = allocations.get(extent.root);
    if (!geometry) {
      geometry = allocateScene({ ...this.#input, minimum: node => this.minimum(node) }, layout, extent);
      allocations.set(extent.root, geometry);
    }
    return geometry;
  }

  detached(source: string[]) {
    let geometry = this.#detached.get(source);
    if (!geometry) {
      geometry = this.geometry(
        this.project(detachedLayout(this.#input.layout, source)),
        this.project(this.#input.layout)
      );
      this.#detached.set(source, geometry);
    }
    return geometry;
  }

  bounds() {
    return (this.#bounds ??= interactionBounds(this.#host));
  }

  client(rect: WorkspaceRect) {
    const origin = (this.#origin ??= canvasClientRect(this.#host, { x: 0, y: 0, width: 0, height: 0 }));
    return { ...rect, x: rect.x + origin.x, y: rect.y + origin.y };
  }

  scroll(group: WorkspaceTabGroup) {
    if (group.panels.length < 2) return 0;
    const strip = this.#input.strip(group);
    if (!strip) return 0;
    let scroll = this.#scroll.get(strip);
    if (scroll === undefined) {
      scroll = strip.scrollLeft;
      this.#scroll.set(strip, scroll);
    }
    return scroll;
  }
}

function allocateScene(
  input: SceneInput & { minimum(node: WorkspaceNode | null): WorkspaceExtent },
  layout: WorkspaceLayout,
  extent: WorkspaceLayout
) {
  const floor = input.minimum(extent.root);
  const width = Math.max(input.chrome.width, floor.width);
  const height = Math.max(input.chrome.height, floor.height);
  const allocated = allocateWorkspace({
    root: layout.root,
    rect: { x: 0, y: 0, width, height },
    minimum: input.minimum,
    policy: input.policy,
    gap: input.chrome.gap
  });
  const groups = createTabGroups({
    groups: allocated.groups,
    panels: input.panels,
    root: input.layout.root,
    closed: input.layout.closed,
    source: input.source,
    gripWidth: input.chrome.gripWidth
  });
  return { ...allocated, width, height, minimum: floor, groups };
}
