// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { FrameTransform } from './types.js';
import { composeMat4, identityMat4, multiplyMat4 } from '../math/mat4.js';
import { normalizeQuaternion } from '../math/quaternion.js';
import type { Mat4, Quaternion, Vec3 } from '../types.js';
import { notifyOwningScene } from '../label/notifications.js';

interface FrameState {
  localMatrix: Mat4;
  transform: FrameTransform | null;
  valid: boolean;
  version: number;
}

const frameStates = new WeakMap<HTMLElement, FrameState>();
const sceneNamedFrames = new WeakMap<HTMLElement, ReadonlyMap<string, HTMLElement>>();

export function registerFrameState(frame: HTMLElement): void {
  frameStates.set(frame, {
    localMatrix: identityMat4(),
    transform: null,
    valid: true,
    version: 0
  });
}

export function isFrameStateRegistered(frame: HTMLElement): boolean {
  return frameStates.has(frame);
}

export function touchFrameState(frame: HTMLElement): void {
  getFrameState(frame).version += 1;
  notifyOwningScene(frame);
}

export function setFrameTransform(frame: HTMLElement, transform: FrameTransform): void {
  const state = getFrameState(frame);
  const normalized = normalizeFrameTransform(transform);
  state.transform = normalized;
  state.localMatrix = composeMat4(normalized.position, normalized.orientation);
  state.valid = true;
  state.version += 1;
  notifyOwningScene(frame);
}

export function clearFrameTransform(frame: HTMLElement): void {
  const state = getFrameState(frame);
  if (state.transform !== null || !state.valid) {
    state.transform = null;
    state.localMatrix = identityMat4();
    state.valid = true;
    state.version += 1;
    notifyOwningScene(frame);
  }
}

export function invalidateFrameTransform(frame: HTMLElement): void {
  const state = getFrameState(frame);
  if (!state.valid) return;
  state.valid = false;
  state.version += 1;
  notifyOwningScene(frame);
}

export function getFrameTransform(frame: HTMLElement): FrameTransform | null {
  const transform = getFrameState(frame).transform;
  return transform ? cloneFrameTransform(transform) : null;
}

export function frameHasTransform(frame: HTMLElement): boolean {
  return getFrameState(frame).transform !== null;
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

export function getFrameVersion(frame: HTMLElement): number {
  return getFrameState(frame).version;
}

export function getFrameWorldMatrix(frame: HTMLElement): Mat4 {
  if (!isFrameChainValid(frame)) {
    throw new DOMException('The frame or one of its ancestors has an invalid transform.', 'InvalidStateError');
  }
  const owningScene = frame.closest<HTMLElement>('nve-scene');
  const matrices: Mat4[] = [];
  let current: HTMLElement | null = frame;
  while (current && current !== owningScene) {
    const state = frameStates.get(current);
    if (state) {
      matrices.unshift(state.localMatrix);
    }
    current = current.parentElement;
  }
  return matrices.reduce((world, local) => multiplyMat4(world, local), identityMat4());
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

function normalizeFrameTransform(value: FrameTransform): FrameTransform {
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
    orientation: normalizeQuaternion(orientation as Quaternion)
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

function cloneFrameTransform(transform: FrameTransform): FrameTransform {
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
