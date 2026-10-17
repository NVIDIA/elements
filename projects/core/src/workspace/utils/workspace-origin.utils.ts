// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspaceDropIntent, WorkspaceDragCue, WorkspaceDragOffer } from './workspace-drag-preview.utils.js';
import { splitSide, type WorkspaceLayout, type WorkspaceNode } from './workspace-layout.utils.js';
import { findGroup, projectLayout } from './workspace-operations.utils.js';

/** Reserves the actual unchanged origin, including a source with no neighboring group. */
export function initialReservation(input: {
  layout: WorkspaceLayout;
  source: string[];
  available: string[];
  cue: WorkspaceDragCue;
  evaluate(intent: WorkspaceDropIntent): WorkspaceDragOffer | undefined;
}) {
  const intent = originIntent(input);
  const offer = intent.kind === 'invalid' ? undefined : input.evaluate(intent);
  return {
    intent,
    offer: offer ?? { cue: input.cue, feasible: true, allocation: 'reserved' as const, layout: input.layout }
  };
}

function originIntent(input: { layout: WorkspaceLayout; source: string[]; available: string[] }): WorkspaceDropIntent {
  const visible = projectLayout(input.layout, input.available).root;
  const anchor = input.source.find(id => findGroup(visible, id));
  if (!anchor) return { kind: 'invalid' };
  const group = findGroup(visible, anchor);
  const canonical = findGroup(input.layout.root, input.source[0]);
  if (!group || !canonical) return { kind: 'invalid' };
  const survivor = group.panels.find(id => !input.source.includes(id));
  if (survivor) {
    return {
      kind: 'tab',
      destination: { target: survivor, position: 'tab', index: canonical.panels.indexOf(input.source[0]!) }
    };
  }
  if (canonical.panels.some(id => !input.source.includes(id))) return { kind: 'invalid' };
  return peerOrigin(visible, input.source) ?? { kind: 'invalid' };
}

function peerOrigin(node: WorkspaceNode | null, source: string[]): WorkspaceDropIntent | undefined {
  if (node?.type !== 'split') return undefined;
  const index = node.children.findIndex(
    child => child.type === 'group' && child.panels.every(id => source.includes(id))
  );
  if (index < 0) return node.children.map(child => peerOrigin(child, source)).find(Boolean);
  const next = node.children[index + 1];
  const neighbor = next ?? node.children[index - 1];
  if (!neighbor) return undefined;
  const target = firstPanel(neighbor);
  return {
    kind: 'order',
    destination: { target, position: splitSide(node.axis, next ? 'before' : 'after') }
  };
}

function firstPanel(node: WorkspaceNode): string {
  return node.type === 'group' ? node.panels[0]! : firstPanel(node.children[0]!);
}
