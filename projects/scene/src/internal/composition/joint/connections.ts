// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getElementName, getNameScope, resolveFrameName } from '../frame/registry.js';
import { setFrameConstraint } from '../frame/constraints.js';
import { JOINT_CONNECTION } from '../../diagnostics/errors.js';
import { diagnosticReporterService } from '../../diagnostics/reporter.service.js';

interface Connection {
  readonly joint: HTMLElement;
  readonly parent: HTMLElement | undefined;
  readonly child: HTMLElement | undefined;
  readonly valid: boolean;
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
      const parent = bodyTarget(scene, joint, 'parent');
      const child = bodyTarget(scene, joint, 'child');
      const valid = validConnection(parent, child);
      parents.set(joint, valid && parent ? parent : null);
      if (child) {
        const joints = incoming.get(child) ?? [];
        joints.push(joint);
        incoming.set(child, joints);
        parents.set(child, valid ? joint : null);
      } else {
        for (const body of unresolvedChildren(scene, joint, frames)) parents.set(body, null);
      }
      return { joint, parent, child, valid };
    });
  for (const [child, joints] of incoming) {
    if (joints.length > 1) {
      parents.set(child, null);
      for (const joint of joints) parents.set(joint, null);
    }
  }
  return { parents, edges };
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

function validConnection(parent: HTMLElement | undefined, child: HTMLElement | undefined): boolean {
  const frame: unknown = child ? Reflect.get(child, 'frame') : null;
  const override = typeof frame === 'string' && frame.trim().length > 0;
  return Boolean(parent && child && parent !== child && !override);
}

function bodyTarget(scene: HTMLElement, joint: HTMLElement, property: 'parent' | 'child'): HTMLElement | undefined {
  const name: unknown = Reflect.get(joint, property);
  if (typeof name !== 'string' || !name.trim() || name.includes('/')) return undefined;
  const body = resolveFrameName(scene, name, joint);
  return body &&
    body.closest('nve-scene') === scene &&
    body.localName === 'nve-scene-body' &&
    getNameScope(body, scene) === getNameScope(joint, scene)
    ? body
    : undefined;
}

/** Reports topology failures after cycle rejection, before any render snapshot can use the graph. */
export function reportJointConnections(
  connections: Connections,
  parents: ReadonlyMap<HTMLElement, HTMLElement | null>
): void {
  for (const { joint, parent, child, valid } of connections.edges) {
    const active = !valid || !parent || !child || parents.get(joint) !== parent || parents.get(child) !== joint;
    setFrameConstraint(joint, JOINT_CONNECTION, !active);
    diagnosticReporterService.update({
      element: joint,
      code: JOINT_CONNECTION,
      active,
      severity: 'error',
      message:
        'A joint must connect two distinct bodies in its scope, with one incoming joint per child, no child frame override, and no cycles.'
    });
  }
}
