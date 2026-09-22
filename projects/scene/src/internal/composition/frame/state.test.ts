// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { composePreciseMat4, identityPreciseMat4, multiplyPreciseMat4 } from '../../math/mat4.js';
import {
  clearFrameTransform,
  FrameEvaluation,
  getFramePose,
  getFrameWorldMatrix,
  getFrameWorldMatrixPrecise,
  getNamedSceneFrame,
  invalidateFrameTransform,
  isFrameChainValid,
  isFrameStateRegistered,
  registerFrameState,
  setFrameTransform,
  setSceneNamedFrames
} from './state.js';

describe('frame transform state', () => {
  it('captures poses, composes ancestor rotation, and returns independently owned matrices', () => {
    const root = document.createElement('nve-scene-frame');
    const child = document.createElement('nve-scene-frame');
    root.append(child);
    registerFrameState(root);
    registerFrameState(child);
    setFrameTransform(root, { position: [10, 0, 0], orientation: [0, 0, Math.SQRT1_2, Math.SQRT1_2] });
    const position: [number, number, number] = [2, 0, 0];
    setFrameTransform(child, { position, orientation: [0, 0, 0, 2] });
    position[0] = 99;
    const world = getFrameWorldMatrixPrecise(child);
    expect(world[12]).toBeCloseTo(10);
    expect(world[13]).toBeCloseTo(2);
    expect(isFrameStateRegistered(child)).toBe(true);
    expect(getFramePose(child).position).toEqual([2, 0, 0]);
    getFrameWorldMatrix(child).fill(0);
    expect(getFrameWorldMatrixPrecise(child)).toEqual(world);
    getFrameWorldMatrixPrecise(child).fill(0);
    expect(getFrameWorldMatrixPrecise(child)).toEqual(world);
  });

  it('propagates invalid ancestors and restores validity after clearing their transform', () => {
    const parent = document.createElement('nve-scene-frame');
    const child = document.createElement('nve-scene-frame');
    parent.append(child);
    registerFrameState(parent);
    registerFrameState(child);
    invalidateFrameTransform(parent);
    expect(isFrameChainValid(child)).toBe(false);
    expect(() => getFrameWorldMatrix(child)).toThrow();
    clearFrameTransform(parent);
    expect(isFrameChainValid(child)).toBe(true);
    expect(() => setFrameTransform(child, { position: [NaN, 0, 0], orientation: [0, 0, 0, 1] })).toThrow();
    expect(getFramePose(child).position).toEqual([0, 0, 0]);
  });

  it('normalizes lookup names without leaking named frames between scenes', () => {
    const scene = document.createElement('div');
    const frame = document.createElement('div');
    setSceneNamedFrames(scene, new Map([['arm', frame]]));
    expect(getNamedSceneFrame(scene, ' arm ')).toBe(frame);
    expect(getNamedSceneFrame(document.createElement('div'), 'arm')).toBeUndefined();
  });
});

describe(FrameEvaluation.name, () => {
  it('shares evaluated matrices across ordinary wrappers and layers in the same frame', () => {
    const scene = document.createElement('nve-scene');
    const frame = document.createElement('nve-scene-frame');
    const wrapper = document.createElement('div');
    const first = document.createElement('div');
    const second = document.createElement('div');
    registerFrameState(frame);
    setFrameTransform(frame, { position: [1e12 + 0.25, 2, 3], orientation: [0, 0, 0, 1] });
    scene.append(frame);
    frame.append(wrapper);
    wrapper.append(first, second);
    const evaluation = new FrameEvaluation();

    const world = evaluation.getWorldMatrix(first);

    expect(world).toEqual(getFrameWorldMatrixPrecise(frame));
    expect(world?.[12]).toBe(1e12 + 0.25);
    expect(evaluation.getWorldMatrix(frame)).toBe(world);
    expect(evaluation.getWorldMatrix(second)).toBe(world);
    expect(evaluation.getWorldMatrix(first)).toBe(world);
  });

  it('matches uncached composition through a deterministic branching hierarchy', () => {
    const scene = document.createElement('nve-scene');
    const frames: HTMLElement[] = [];
    for (let index = 0; index < 128; index += 1) {
      const frame = document.createElement('nve-scene-frame');
      const wrapper = document.createElement('div');
      registerFrameState(frame);
      setFrameTransform(frame, {
        position: [index / 4, index % 3, -index],
        orientation: index % 2 ? [0, 0, Math.SQRT1_2, Math.SQRT1_2] : [Math.SQRT1_2, 0, 0, Math.SQRT1_2]
      });
      (frames[Math.floor((index - 1) / 3)] ?? scene).append(wrapper);
      wrapper.append(frame);
      frames.push(frame);
    }
    const evaluation = new FrameEvaluation();

    for (const frame of frames.slice().reverse()) {
      expect(evaluation.getWorldMatrix(frame)).toEqual(resolveUncached(frame));
    }
  });

  it('memoizes invalid and unregistered frame chains without suppressing siblings', () => {
    const scene = document.createElement('nve-scene');
    const invalid = document.createElement('nve-scene-frame');
    const child = document.createElement('div');
    const sibling = document.createElement('div');
    const parsed = new DOMParser().parseFromString('<nve-scene-frame><div></div></nve-scene-frame>', 'text/html');
    const missing = parsed.body.firstElementChild;
    if (!(missing instanceof HTMLElement)) throw new Error('Expected an unregistered HTML frame.');
    registerFrameState(invalid);
    invalidateFrameTransform(invalid);
    invalid.append(child);
    scene.append(invalid, sibling, missing);
    const evaluation = new FrameEvaluation();

    expect(evaluation.getWorldMatrix(child)).toBeNull();
    expect(evaluation.getWorldMatrix(invalid)).toBeNull();
    expect(evaluation.getWorldMatrix(missing)).toBeNull();
    expect(evaluation.getWorldMatrix(sibling)).toEqual(
      new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
    );
    clearFrameTransform(invalid);
    expect(new FrameEvaluation().getWorldMatrix(child)).not.toBeNull();
  });

  it('stops at scene boundaries and also evaluates detached ancestry', () => {
    const outer = document.createElement('nve-scene-frame');
    const scene = document.createElement('nve-scene');
    const child = document.createElement('div');
    registerFrameState(outer);
    setFrameTransform(outer, { position: [9, 0, 0], orientation: [0, 0, 0, 1] });
    outer.append(scene);
    scene.append(child);
    const evaluation = new FrameEvaluation();

    expect(evaluation.getWorldMatrix(child)?.[12]).toBe(0);
    expect(evaluation.getWorldMatrix(outer)?.[12]).toBe(9);
    invalidateFrameTransform(outer);
    expect(new FrameEvaluation().getWorldMatrix(child)?.[12]).toBe(0);
    expect(evaluation.getWorldMatrix(scene)?.[12]).toBe(0);
  });

  it('walks deep ancestry iteratively', () => {
    const frame = document.createElement('nve-scene-frame');
    registerFrameState(frame);
    setFrameTransform(frame, { position: [7, 8, 9], orientation: [0, 0, 0, 1] });
    let descendant: HTMLElement = frame;
    for (let index = 0; index < 4096; index += 1) {
      const wrapper = document.createElement('div');
      descendant.append(wrapper);
      descendant = wrapper;
    }

    expect(new FrameEvaluation().getWorldMatrix(descendant)).toEqual(getFrameWorldMatrixPrecise(frame));
  });
});

function resolveUncached(frame: HTMLElement) {
  const matrices = [];
  let current: HTMLElement | null = frame;
  while (current && current.localName !== 'nve-scene') {
    if (isFrameStateRegistered(current)) {
      const pose = getFramePose(current);
      matrices.unshift(composePreciseMat4(pose.position, pose.orientation));
    }
    current = current.parentElement;
  }
  return matrices.reduce((world, local) => multiplyPreciseMat4(world, local), identityPreciseMat4());
}
