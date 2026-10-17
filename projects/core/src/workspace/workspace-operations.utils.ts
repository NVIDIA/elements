// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  normalizeLayout,
  type WorkspaceLayout,
  type WorkspaceNode,
  type WorkspacePane
} from './workspace-layout.utils.js';

export interface WorkspaceDestination {
  target: string;
  /** Canonical visible region in the committed projection. */
  region?: string;
  position: 'tab' | 'left' | 'right' | 'top' | 'bottom';
  index?: number;
}

export function findPane(node: WorkspaceNode | null, id?: string): WorkspacePane | undefined {
  if (!node) return undefined;
  if (node.type === 'pane') return id === undefined || node.panels.includes(id) ? node : undefined;
  for (const child of node.children) {
    const pane = findPane(child, id);
    if (pane) return pane;
  }
  return undefined;
}

function mapPanes(
  node: WorkspaceNode | null,
  visit: (pane: WorkspacePane) => WorkspaceNode | null
): WorkspaceNode | null {
  if (!node) return null;
  if (node.type === 'pane') return visit(node);
  const children: WorkspaceNode[] = [];
  const weights: number[] = [];
  node.children.forEach((child, index) => {
    const mapped = mapPanes(child, visit);
    const weight = node.weights[index];
    if (mapped && weight !== undefined) {
      children.push(mapped);
      weights.push(weight);
    }
  });
  if (!children.length) return null;
  if (children.length === 1) return children[0] ?? null;
  return normalizeLayout({ ...node, children, weights });
}

function filterPane(pane: WorkspacePane, keep: (id: string) => boolean): WorkspacePane | null {
  const panels = pane.panels.filter(keep);
  const first = panels[0];
  if (first === undefined) return null;
  return { type: 'pane', panels, active: panels.includes(pane.active) ? pane.active : first };
}

function appendPanels(root: WorkspaceNode | null, panels: string[], active?: string): WorkspaceNode | null {
  if (!panels.length) return root;
  const first = findPane(root);
  return first
    ? mapPanes(root, pane => ({
        ...pane,
        panels: pane === first ? [...pane.panels, ...panels] : [...pane.panels],
        active: pane === first ? (active ?? pane.active) : pane.active
      }))
    : { type: 'pane', panels: [...panels], active: active ?? panels[0] ?? '' };
}

function validSource(pane: WorkspacePane, source: string[]): boolean {
  return (
    source.length === 1 ||
    (source.length === pane.panels.length && source.every((id, index) => pane.panels[index] === id))
  );
}

export function validIndex(index: number | undefined): boolean {
  return index === undefined || (Number.isInteger(index) && index >= 0);
}

/** Removes dragged identities from the derived arrangement while preserving closed identities. */
export function detachedLayout(layout: WorkspaceLayout, source: string[]): WorkspaceLayout {
  const removed = new Set(source);
  return {
    version: 1,
    root: mapPanes(layout.root, pane => filterPane(pane, id => !removed.has(id))),
    closed: layout.closed.filter(id => !removed.has(id))
  };
}

/** Applies a placement with optional preferred moving and recipient split shares. */
export function placePanels(input: {
  layout: WorkspaceLayout;
  source: string[];
  destination: WorkspaceDestination;
  splitWeights?: [number, number];
}): WorkspaceLayout | undefined {
  const { layout, source, destination, splitWeights = [0.5, 0.5] } = input;
  if (destination.region) return undefined;
  if (!splitWeights.every(weight => Number.isFinite(weight) && weight > 0)) return undefined;
  const match = moveSource(layout, source, destination);
  if (!match) return undefined;
  const { sourcePane, targetPane } = match;
  const first = source[0]!;
  const removed = new Set(source);
  const target = targetPane.panels.find(id => !removed.has(id));
  if (!target) return layout;
  const stripped = mapPanes(layout.root, pane => filterPane(pane, id => !removed.has(id)));
  const moving: WorkspacePane = {
    type: 'pane',
    panels: [...source],
    active: source.includes(sourcePane.active) ? sourcePane.active : first
  };
  const root = mapPanes(stripped, pane => {
    if (!pane.panels.includes(target)) return { ...pane, panels: [...pane.panels] };
    if (destination.position === 'tab') {
      const originalIndex = Math.min(destination.index ?? targetPane.panels.length, targetPane.panels.length);
      const index = originalIndex - targetPane.panels.slice(0, originalIndex).filter(id => removed.has(id)).length;
      const panels = [...pane.panels];
      panels.splice(index, 0, ...source);
      return { type: 'pane', panels, active: sourcePane === targetPane ? sourcePane.active : moving.active };
    }
    const before = destination.position === 'left' || destination.position === 'top';
    return {
      type: 'split',
      axis: destination.position === 'left' || destination.position === 'right' ? 'horizontal' : 'vertical',
      weights: before ? splitWeights : [...splitWeights].reverse(),
      children: before ? [moving, pane] : [pane, moving]
    };
  });
  return placedLayout(layout, root);
}

function placedLayout(layout: WorkspaceLayout, root: WorkspaceNode | null): WorkspaceLayout {
  const result: WorkspaceLayout = { version: 1, root: root ? normalizeLayout(root) : null, closed: [...layout.closed] };
  const normalized = { ...layout, root: layout.root ? normalizeLayout(layout.root) : null };
  return JSON.stringify(result) === JSON.stringify(normalized) ? layout : result;
}

function moveSource(layout: WorkspaceLayout, source: string[], destination: WorkspaceDestination) {
  const first = source[0];
  if (first === undefined || new Set(source).size !== source.length) return undefined;
  const sourcePane = findPane(layout.root, first);
  const targetPane = findPane(layout.root, destination.target);
  if (!sourcePane || !targetPane) return undefined;
  if (destination.position !== 'tab' && source.includes(destination.target)) return undefined;
  if (!validSource(sourcePane, source) || !validIndex(destination.index)) return undefined;
  return { sourcePane, targetPane };
}

/** Closes an identity without changing its canonical placement or active preference. */
export function closePanel(layout: WorkspaceLayout, id: string): WorkspaceLayout | undefined {
  if (!findPane(layout.root, id) || layout.closed.includes(id)) return undefined;
  return { ...layout, closed: [...layout.closed, id] };
}

/** Opens an identity in its existing canonical placement. */
export function openPanel(layout: WorkspaceLayout, id: string): WorkspaceLayout | undefined {
  if (!layout.closed.includes(id)) return undefined;
  return { ...layout, closed: layout.closed.filter(panel => panel !== id) };
}

/** Adds new consumer identities without discarding saved panel positions. */
export function reconcilePanels(layout: WorkspaceLayout, available: string[]): WorkspaceLayout {
  const saved = new Set<string>();
  mapPanes(layout.root, pane => {
    pane.panels.forEach(id => saved.add(id));
    return pane;
  });
  const added = available.filter(id => {
    if (saved.has(id)) return false;
    saved.add(id);
    return true;
  });
  return { version: 1, root: appendPanels(layout.root, added), closed: [...layout.closed] };
}

/** Creates the visible arrangement while retaining the saved snapshot. */
export function projectLayout(layout: WorkspaceLayout, available: string[]): WorkspaceLayout {
  const visible = new Set(available.filter(id => !layout.closed.includes(id)));
  return {
    version: 1,
    root: mapPanes(layout.root, pane => filterPane(pane, id => visible.has(id))),
    closed: []
  };
}

/** Selects an open canonical panel without changing its visibility. */
export function selectPanel(layout: WorkspaceLayout, id: string): WorkspaceLayout | undefined {
  if (layout.closed.includes(id) || !findPane(layout.root, id)) return undefined;
  const root = mapPanes(layout.root, pane => (pane.panels.includes(id) ? { ...pane, active: id } : pane));
  const next = { ...layout, root };
  return JSON.stringify(next) === JSON.stringify(layout) ? undefined : next;
}
