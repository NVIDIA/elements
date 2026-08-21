// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TransformSample } from './types.js';
import { FrameTransformBuffer, type FrameTransformBufferSnapshot } from './transform-buffer.js';
import { identityMat4, multiplyMat4 } from '../math/mat4.js';
import { getLiveSceneTime } from '../gpu/platform.js';
import type { Mat4 } from '../types.js';

interface FrameState {
  readonly transforms: FrameTransformBuffer;
  staleness: number;
  version: number;
}

const frameStates = new WeakMap<HTMLElement, FrameState>();
const sceneSampledTimes = new WeakMap<HTMLElement, number>();
const sceneNamedFrames = new WeakMap<HTMLElement, ReadonlyMap<string, HTMLElement>>();

export function registerFrameState(frame: HTMLElement): void {
  frameStates.set(frame, {
    transforms: new FrameTransformBuffer(),
    staleness: Number.POSITIVE_INFINITY,
    version: 0
  });
}

export function isFrameStateRegistered(frame: HTMLElement): boolean {
  return frameStates.has(frame);
}

export function touchFrameState(frame: HTMLElement): void {
  getFrameState(frame).version += 1;
}

export function setFrameTransform(frame: HTMLElement, sample: TransformSample): void {
  const state = getFrameState(frame);
  state.transforms.setTransform(sample);
  if (state.transforms.getSnapshot().staticTransform) {
    state.staleness = 0;
  }
  state.version += 1;
}

export function clearFrameTransforms(frame: HTMLElement): void {
  const state = getFrameState(frame);
  if (state.transforms.clear()) {
    state.staleness = Number.POSITIVE_INFINITY;
    state.version += 1;
  }
}

export function getFrameTransform(frame: HTMLElement): TransformSample | null {
  return getFrameState(frame).transforms.getNewestTransform();
}

export function getFrameStaleness(frame: HTMLElement): number {
  return getFrameState(frame).staleness;
}

export function getFrameVersion(frame: HTMLElement): number {
  return getFrameState(frame).version;
}

export function frameHasTimestampedSamples(frame: HTMLElement): boolean {
  return getFrameState(frame).transforms.hasTimestampedSamples;
}

export function resolveFrameForScene(frame: HTMLElement, sceneTime: number, staleAfter: number): void {
  const state = getFrameState(frame);
  state.staleness = state.transforms.getStaleness(sceneTime);
  frame.toggleAttribute('stale', state.staleness > staleAfter);
}

export function getFrameWorldMatrix(frame: HTMLElement, time?: number): Mat4 {
  const resolvedTime = time === undefined ? getDefaultFrameTime(frame) : validateExplicitTime(time);
  const owningScene = frame.closest<HTMLElement>('nve-scene');
  const matrices: Mat4[] = [];
  let current: HTMLElement | null = frame;
  while (current && current !== owningScene) {
    const state = frameStates.get(current);
    if (state) {
      matrices.unshift(state.transforms.resolve(resolvedTime));
    }
    current = current.parentElement;
  }
  return matrices.reduce((world, local) => multiplyMat4(world, local), identityMat4());
}

export function getFrameName(frame: HTMLElement): string {
  const name = Reflect.get(frame, 'name');
  return typeof name === 'string' ? canonicalizeFrameName(name) : '';
}

export function setSceneSampledTime(scene: HTMLElement, time: number): void {
  sceneSampledTimes.set(scene, time);
}

export function setSceneNamedFrames(scene: HTMLElement, frames: ReadonlyMap<string, HTMLElement>): void {
  sceneNamedFrames.set(scene, frames);
}

export function getNamedSceneFrame(scene: HTMLElement, name: string): HTMLElement | undefined {
  return sceneNamedFrames.get(scene)?.get(canonicalizeFrameName(name));
}

export function getFrameStateSnapshot(frame: HTMLElement): FrameTransformBufferSnapshot {
  return getFrameState(frame).transforms.getSnapshot();
}

function getDefaultFrameTime(frame: HTMLElement): number {
  const scene = frame.closest<HTMLElement>('nve-scene');
  return (scene && sceneSampledTimes.get(scene)) ?? getLiveSceneTime();
}

function validateExplicitTime(time: number): number {
  if (typeof time !== 'number') {
    throw new TypeError('Time must be a number.');
  }
  if (!Number.isFinite(time)) {
    throw new RangeError('Time must be finite.');
  }
  return time;
}

function canonicalizeFrameName(name: string): string {
  return name.trim();
}

function getFrameState(frame: HTMLElement): FrameState {
  const state = frameStates.get(frame);
  if (!state) {
    throw new TypeError('Element is not a registered scene frame.');
  }
  return state;
}
