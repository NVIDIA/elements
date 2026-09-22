// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { composePreciseMat4, identityPreciseMat4, multiplyPreciseMat4 } from '../../math/mat4.js';
import { normalizeQuaternion } from '../../math/quaternion.js';
import type { Mat4, PreciseMat4, ScenePose, Vec3 } from '../../math/types.js';
import { notifyOwningScene } from '../scene/notifications.js';

interface FrameState {
  localMatrix: PreciseMat4;
  pose: ScenePose | null;
  valid: boolean;
}

const frameStates = new WeakMap<HTMLElement, FrameState>();
const sceneNamedFrames = new WeakMap<HTMLElement, ReadonlyMap<string, HTMLElement>>();

/** Memoizes DOM ancestry for one synchronous render snapshot. Create a new instance after edits. */
export class FrameEvaluation {
  readonly #identity = identityPreciseMat4();
  readonly #matrices = new Map<HTMLElement, PreciseMat4 | null>();

  /** Returns a shared world matrix, or null for an invalid chain. Treat returned matrices as read-only. */
  getWorldMatrix(element: HTMLElement): PreciseMat4 | null {
    const path: HTMLElement[] = [];
    let current: HTMLElement | null = element;
    while (current && current.localName !== 'nve-scene' && !this.#matrices.has(current)) {
      path.push(current);
      current = current.parentElement;
    }
    let world: PreciseMat4 | null =
      current && this.#matrices.has(current) ? (this.#matrices.get(current) ?? null) : this.#identity;
    for (let index = path.length - 1; index >= 0; index -= 1) {
      const ancestor = path[index]!;
      world = this.#compose(ancestor, world);
      this.#matrices.set(ancestor, world);
    }
    return world;
  }

  #compose(element: HTMLElement, parent: PreciseMat4 | null): PreciseMat4 | null {
    if (!parent) return null;
    const state = frameStates.get(element);
    if (element.localName === 'nve-scene-frame' && !state?.valid) return null;
    return state ? multiplyPreciseMat4(parent, state.localMatrix) : parent;
  }
}

export function registerFrameState(frame: HTMLElement): void {
  frameStates.set(frame, {
    localMatrix: identityPreciseMat4(),
    pose: null,
    valid: true
  });
}

export function isFrameStateRegistered(frame: HTMLElement): boolean {
  return frameStates.has(frame);
}

export function notifyFrameStateChange(frame: HTMLElement): void {
  getFrameState(frame);
  notifyOwningScene(frame);
}

export function setFrameTransform(frame: HTMLElement, transform: ScenePose): void {
  const state = getFrameState(frame);
  const normalized = normalizeFrameTransform(transform);
  state.pose = normalized;
  state.localMatrix = composePreciseMat4(normalized.position, normalized.orientation);
  state.valid = true;
  notifyOwningScene(frame);
}

export function clearFrameTransform(frame: HTMLElement): void {
  const state = getFrameState(frame);
  if (state.pose !== null || !state.valid) {
    state.pose = null;
    state.localMatrix = identityPreciseMat4();
    state.valid = true;
    notifyOwningScene(frame);
  }
}

export function invalidateFrameTransform(frame: HTMLElement): void {
  const state = getFrameState(frame);
  if (!state.valid) return;
  state.valid = false;
  notifyOwningScene(frame);
}

export function getFramePose(frame: HTMLElement): ScenePose {
  const state = getFrameState(frame);
  if (!state.valid) throw new DOMException('The frame has an invalid pose.', 'InvalidStateError');
  return cloneFrameTransform(state.pose ?? { orientation: [0, 0, 0, 1], position: [0, 0, 0] });
}

/** Returns false when a frame in the owning-scene chain lacks state or has an invalid transform. */
export function isFrameChainValid(element: HTMLElement): boolean {
  const owningScene = element.closest<HTMLElement>('nve-scene');
  let current: HTMLElement | null = element;
  while (current && current !== owningScene) {
    if (current.localName === 'nve-scene-frame') {
      const state = frameStates.get(current);
      if (!state?.valid) return false;
    }
    current = current.parentElement;
  }
  return true;
}

export function getFrameWorldMatrix(frame: HTMLElement): Mat4 {
  return new Float32Array(getFrameWorldMatrixPrecise(frame));
}

/** Resolves the world matrix without truncating translations to GPU precision. */
export function getFrameWorldMatrixPrecise(frame: HTMLElement): PreciseMat4 {
  const matrix = new FrameEvaluation().getWorldMatrix(frame);
  if (!matrix) {
    throw new DOMException('The frame or one of its ancestors has an invalid transform.', 'InvalidStateError');
  }
  return matrix;
}

export function getFrameName(frame: HTMLElement): string {
  const name = Reflect.get(frame, 'name');
  return typeof name === 'string' ? canonicalizeFrameName(name) : '';
}

export function setSceneNamedFrames(scene: HTMLElement, frames: ReadonlyMap<string, HTMLElement>): void {
  sceneNamedFrames.set(scene, frames);
}

export function getNamedSceneFrame(scene: HTMLElement, name: string): HTMLElement | undefined {
  return sceneNamedFrames.get(scene)?.get(canonicalizeFrameName(name));
}

function canonicalizeFrameName(name: string): string {
  return name.trim();
}

function normalizeFrameTransform(value: ScenePose): ScenePose {
  if (typeof value !== 'object' || value === null) {
    throw new TypeError('Frame transform must be an object.');
  }
  if (Reflect.has(value, 'stamp')) {
    throw new TypeError('Frame transforms do not accept timestamps.');
  }
  const position = Reflect.get(value, 'position');
  const orientation = Reflect.get(value, 'orientation');
  assertNumberTuple(position, 3, 'Position');
  assertNumberTuple(orientation, 4, 'Orientation');
  return {
    position: [...position] as Vec3,
    orientation: normalizeQuaternion(orientation)
  };
}

function assertNumberTuple(value: unknown, length: number, label: string): asserts value is number[] {
  if (!Array.isArray(value) || value.length !== length || value.some(item => typeof item !== 'number')) {
    throw new TypeError(`${label} must contain exactly ${length} numbers.`);
  }
  if (value.some(item => !Number.isFinite(item))) {
    throw new RangeError(`${label} components must be finite.`);
  }
}

function cloneFrameTransform(transform: ScenePose): ScenePose {
  return {
    position: [...transform.position],
    orientation: [...transform.orientation]
  };
}

function getFrameState(frame: HTMLElement): FrameState {
  const state = frameStates.get(frame);
  if (!state) {
    throw new TypeError('Element is not a registered scene frame.');
  }
  return state;
}
