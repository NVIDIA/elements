// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getElementName, getNameScope, getScopedFrameName } from '../frame/registry.js';
import { setFrameConstraint } from '../frame/constraints.js';
import { JOINT_CONNECTION } from '../../diagnostics/errors.js';
import { diagnosticReporterService } from '../../diagnostics/reporter.service.js';

type ConnectionFailure =
  | 'missing-parent'
  | 'missing-child'
  | 'ambiguous-parent'
  | 'ambiguous-child'
  | 'invalid-parent'
  | 'invalid-child'
  | 'same-body'
  | 'multiple-incoming'
  | 'child-frame-override'
  | 'cycle';

interface Connection {
  readonly joint: HTMLElement;
  readonly parent: HTMLElement | undefined;
  readonly child: HTMLElement | undefined;
  readonly reason: ConnectionFailure | null;
}

interface Connections {
  readonly parents: Map<HTMLElement, HTMLElement | null>;
  readonly edges: readonly Connection[];
}

/** Captures explicit body connections; the existing frame evaluator composes their transforms. */
export function captureJointConnections(scene: HTMLElement, frames: readonly HTMLElement[]): Connections {
  const parents = new Map<HTMLElement, HTMLElement | null>();
  const incoming = new Map<HTMLElement, HTMLElement[]>();
  const edges = frames
    .filter(frame => frame.localName === 'nve-scene-joint')
    .map(joint => {
      const connection = captureConnection(scene, joint);
      const { parent, child, reason } = connection;
      const valid = reason === null;
      parents.set(joint, valid && parent ? parent : null);
      if (child) {
        const joints = incoming.get(child) ?? [];
        joints.push(joint);
        incoming.set(child, joints);
        parents.set(child, valid ? joint : null);
      } else {
        for (const body of unresolvedChildren(scene, joint, frames)) parents.set(body, null);
      }
      return connection;
    });
  for (const [child, joints] of incoming) {
    if (joints.length > 1) {
      parents.set(child, null);
      for (const joint of joints) parents.set(joint, null);
    }
  }
  return { parents, edges };
}

function captureConnection(scene: HTMLElement, joint: HTMLElement): Connection {
  const parentTarget = bodyTarget(scene, joint, 'parent');
  const childTarget = bodyTarget(scene, joint, 'child');
  const parent = parentTarget.body;
  const child = childTarget.body;
  const reason = parentTarget.reason ?? childTarget.reason ?? connectionFailure(parent, child);
  return { joint, parent, child, reason };
}

/** Ambiguous child names must suppress their candidate bodies instead of placing them at the root. */
function unresolvedChildren(scene: HTMLElement, joint: HTMLElement, frames: readonly HTMLElement[]): HTMLElement[] {
  const name: unknown = Reflect.get(joint, 'child');
  if (typeof name !== 'string' || !name.trim()) return [];
  const scope = getNameScope(joint, scene);
  return frames.filter(
    body =>
      body.localName === 'nve-scene-body' && getNameScope(body, scene) === scope && getElementName(body) === name.trim()
  );
}

function connectionFailure(parent: HTMLElement | undefined, child: HTMLElement | undefined): ConnectionFailure | null {
  if (parent === child) return 'same-body';
  const frame: unknown = child ? Reflect.get(child, 'frame') : null;
  const override = typeof frame === 'string' && frame.trim().length > 0;
  return override ? 'child-frame-override' : null;
}

function bodyTarget(
  scene: HTMLElement,
  joint: HTMLElement,
  property: 'parent' | 'child'
): { readonly body?: HTMLElement; readonly reason: ConnectionFailure | null } {
  const name: unknown = Reflect.get(joint, property);
  if (typeof name !== 'string' || !name.trim()) return { reason: `missing-${property}` };
  if (name.includes('/')) return { reason: `invalid-${property}` };
  const body = getScopedFrameName(scene, name.trim(), joint);
  if (body === null) return { reason: `ambiguous-${property}` };
  if (!body) return { reason: `missing-${property}` };
  return body.localName === 'nve-scene-body' && body.closest('nve-scene') === scene
    ? { body, reason: null }
    : { reason: `invalid-${property}` };
}

function connectionMessage(
  connection: Connection,
  capturedParents: ReadonlyMap<HTMLElement, HTMLElement | null>,
  parents: ReadonlyMap<HTMLElement, HTMLElement | null>
): string | null {
  if (connection.reason) return failureMessages[connection.reason];
  const { joint, parent, child } = connection;
  if (capturedParents.get(joint) === null) return failureMessages['multiple-incoming'];
  return !child || parents.get(joint) !== parent || parents.get(child) !== joint ? failureMessages.cycle : null;
}

const failureMessages: Record<ConnectionFailure, string> = {
  'missing-parent': 'The parent name must identify a body in this joint scope.',
  'missing-child': 'The child name must identify a body in this joint scope.',
  'ambiguous-parent': 'The parent name identifies more than one frame in this joint scope.',
  'ambiguous-child': 'The child name identifies more than one frame in this joint scope.',
  'invalid-parent': 'The parent must name a body directly in this joint scope without a qualified path.',
  'invalid-child': 'The child must name a body directly in this joint scope without a qualified path.',
  'same-body': 'A joint must connect two distinct bodies.',
  'multiple-incoming': 'The child body has more than one incoming joint.',
  'child-frame-override': 'A joint child body cannot also declare a frame reference.',
  cycle: 'The joint connection belongs to a frame cycle.'
};

/** Reports topology failures after cycle rejection, before any render snapshot can use the graph. */
export function reportJointConnections(
  connections: Connections,
  parents: ReadonlyMap<HTMLElement, HTMLElement | null>
): void {
  for (const connection of connections.edges) {
    const { joint } = connection;
    const message = connectionMessage(connection, connections.parents, parents);
    const active = message !== null;
    setFrameConstraint(joint, JOINT_CONNECTION, !active);
    diagnosticReporterService.update({
      element: joint,
      code: JOINT_CONNECTION,
      active,
      severity: 'error',
      message: message ?? ''
    });
  }
}
