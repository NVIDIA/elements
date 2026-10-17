// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspaceChrome } from './workspace-chrome.controller.js';
import type { WorkspaceTabGroup } from './workspace-tabstrip.utils.js';
import { clipCue } from './workspace-drag-preview.utils.js';
import type { WorkspaceNode } from './workspace-layout.utils.js';
import { findGroup } from './workspace-operations.utils.js';
import type { WorkspaceRect } from './workspace-rearrange.controller.js';

export function allocatedTabWidth(group: WorkspaceTabGroup, chrome: WorkspaceChrome) {
  const suffix = chrome.panels?.[group.active]?.suffixWidth ?? 0;
  return Math.max(chrome.tabWidth, (group.rect.width - group.gripWidth - suffix) / group.panels.length);
}

/** Keeps a recipient strip stable while carried members enter or leave its preview. */
export function tabStripIdentity(root: WorkspaceNode | null, members: string[], source: string[]): string {
  return JSON.stringify([...committedTabMembers(root, members, source)].sort());
}

/** Keeps grip allocation stable during dragging while excluding closed or unavailable panels. */
export function tabStripGripWidth(input: {
  root: WorkspaceNode | null;
  members: string[];
  source: string[];
  visible: string[];
  width: number;
}) {
  const members = committedTabMembers(input.root, input.members, input.source).filter(id => input.visible.includes(id));
  return members.length > 1 ? input.width : 0;
}

function committedTabMembers(root: WorkspaceNode | null, members: string[], source: string[]) {
  const anchor = members.find(id => !source.includes(id)) ?? members[0];
  const group = anchor ? findGroup(root, anchor) : undefined;
  return group?.panels ?? members;
}

/** Preserves the recipient body until the workspace commits the placement. */
export function presentedTabActive(input: {
  root: WorkspaceNode | null;
  members: string[];
  source: string[];
  active: string;
}): string {
  const { root, members, source, active } = input;
  const remaining = members.filter(id => !source.includes(id));
  const anchor = remaining[0];
  const original = anchor ? findGroup(root, anchor)?.active : undefined;
  return original && remaining.includes(original) ? original : (remaining[0] ?? active);
}

/** Maps a visible insertion neighbor to its original order, retaining dormant members. */
export function tabInsertionIndex(preferred: string[], before: string | undefined): number {
  const index = before === undefined ? preferred.length : preferred.indexOf(before);
  return index < 0 ? preferred.length : index;
}

/** Captures only native strip positions for the lifetime of one gesture. */
export function captureTabScroll(host: HTMLElement & { updateComplete: Promise<unknown>; requestUpdate(): void }) {
  const positions = [...(host.shadowRoot?.querySelectorAll<HTMLElement>('.tablist[data-group]') ?? [])].map(strip => ({
    key: strip.dataset.group!,
    left: strip.scrollLeft
  }));
  return () => {
    void host.updateComplete.then(() => {
      for (const { key, left } of positions) {
        const strip = host.shadowRoot?.querySelector<HTMLElement>(`[data-group="${CSS.escape(key)}"]`);
        if (strip) strip.scrollLeft = left;
      }
      host.requestUpdate();
    });
  };
}

/** Allocates a carried tab reservation inside its native scrolling strip. */
export function reservedTabCue(input: {
  rect: WorkspaceRect;
  viewport: WorkspaceRect;
  grip: number;
  suffixWidth: number;
  headerHeight: number;
  tabWidth: number;
  panels: string[];
  source: string[];
  scroll: number;
}) {
  const { rect, viewport, grip, suffixWidth, headerHeight, tabWidth, panels, source, scroll } = input;
  return {
    cue: {
      x: rect.x + grip + panels.findIndex(id => source.includes(id)) * tabWidth - scroll,
      y: rect.y,
      width: panels.filter(id => source.includes(id)).length * tabWidth,
      height: headerHeight
    },
    bounds: clipCue(
      { x: rect.x + grip, y: rect.y, width: Math.max(0, rect.width - grip - suffixWidth), height: headerHeight },
      viewport
    )
  };
}
