// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getNameScope, resolveJointName } from '../frame/registry.js';

interface JointState {
  readonly refresh: () => void;
  readonly mimic: () => string | null;
  readonly dependents: Set<HTMLElement>;
  effective: number | null;
  target: HTMLElement | null;
  candidate: HTMLElement | undefined;
  candidateMimic: string | null;
  scene: HTMLElement | null;
}
const joints = new WeakMap<HTMLElement, JointState>();

export function registerJoint(element: HTMLElement, refresh: () => void, mimic: () => string | null): void {
  joints.set(element, {
    refresh,
    mimic,
    dependents: new Set(),
    effective: 0,
    target: null,
    candidate: undefined,
    candidateMimic: null,
    scene: null
  });
}

/** One level of mimic dependency; targets that themselves mimic are never subscribed. */
export function getJointMimicValue(element: HTMLElement): number | null {
  const state = joints.get(element)!;
  const { scene, candidate, candidateMimic } = lookupTarget(element, state);
  const target = candidate && candidate !== element && joints.has(candidate) && !candidateMimic ? candidate : null;
  rebindTarget(element, state, target);
  state.candidate = candidate;
  state.candidateMimic = candidateMimic;
  state.scene = scene;
  return target ? (joints.get(target)?.effective ?? null) : null;
}

function rebindTarget(element: HTMLElement, state: JointState, target: HTMLElement | null): void {
  if (state.target !== target) {
    if (state.target) joints.get(state.target)?.dependents.delete(element);
    if (target) joints.get(target)?.dependents.add(element);
  }
  state.target = target;
}

export function publishJointValue(element: HTMLElement, effective: number | null): void {
  const state = joints.get(element)!;
  state.effective = effective;
  for (const dependent of [...state.dependents]) joints.get(dependent)?.refresh();
}

export function disconnectJoint(element: HTMLElement): void {
  const state = joints.get(element)!;
  if (state.target) joints.get(state.target)?.dependents.delete(element);
  state.target = null;
  state.candidate = undefined;
  state.candidateMimic = null;
  state.scene = null;
  for (const dependent of [...state.dependents]) joints.get(dependent)?.refresh();
}

/** Rebinds on registry edits, without recapturing unchanged joints on every render. */
export function refreshSceneJoints(scene: HTMLElement, frames: readonly HTMLElement[]): void {
  for (const element of frames) {
    const state = joints.get(element);
    if (!state) continue;
    const target = lookupTarget(element, state);
    if (state.scene !== scene || state.candidate !== target.candidate || state.candidateMimic !== target.candidateMimic)
      state.refresh();
  }
}

function lookupTarget(element: HTMLElement, state: JointState) {
  const scene = typeof element.closest === 'function' ? element.closest<HTMLElement>('nve-scene') : null;
  const name = state.mimic()?.trim();
  const named = scene && name ? resolveJointName(scene, name, element) : undefined;
  const candidate = scene && named && isVisibleJointScope(element, named, scene) ? named : undefined;
  return { scene, candidate, candidateMimic: getMimicName(candidate) };
}

/** Mimic can read its lexical scopes, but cannot bind into a different entity's private scope. */
function isVisibleJointScope(element: HTMLElement, target: HTMLElement, scene: HTMLElement): boolean {
  if (target.closest('nve-scene') !== scene) return false;
  const targetScope = getNameScope(target, scene);
  let scope = getNameScope(element, scene);
  while (scope !== targetScope && scope !== scene) scope = getNameScope(scope, scene);
  return scope === targetScope;
}

function getMimicName(element: HTMLElement | undefined): string | null {
  return element ? (joints.get(element)?.mimic()?.trim() ?? null) : null;
}
