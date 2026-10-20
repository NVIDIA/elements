// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { html } from 'lit';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { SceneContent } from '../internal/composition/scene/content.js';
import { isFrameChainValid } from '../internal/composition/frame/state.js';
import { configureSceneTesting, resetSceneTesting } from '../internal/testing/scene.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import type { SceneFrame } from './frame.js';
import type { Vec3 } from '../internal/math/types.js';
import './define.js';
import '../body/define.js';
import '../points/define.js';

function frame(name: string, position: Vec3 = [0, 0, 0]): SceneFrame {
  const element = document.createElement('nve-scene-frame');
  element.name = name;
  element.position = position;
  element.orientation = [0, 0, 0, 1];
  return element;
}

function composition() {
  const scene = document.createElement('nve-scene');
  const errors: SceneErrorDetail[] = [];
  scene.addEventListener('nve-scene-error', event => errors.push(event.detail));
  const content = new SceneContent(scene);
  const body = document.createElement('nve-scene-body');
  body.geometry = [{ type: 'cube' }];
  scene.append(body);
  return {
    scene,
    body,
    errors,
    content,
    resolve() {
      content.refresh();
      content.resolveFrames();
    }
  };
}

describe('coordinate frame references', () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    resetSceneTesting();
    vi.restoreAllMocks();
  });

  it('resolves late targets, reassigns references, and fails closed when a target leaves', () => {
    const { scene, body, content, errors, resolve } = composition();
    const moving = frame('moving', [0, 1, 0]);
    moving.frame = 'late';
    scene.append(moving);
    const attached = document.createElement('nve-scene-body');
    attached.geometry = [{ type: 'cube' }];
    attached.frame = 'moving';
    scene.append(attached);
    resolve();
    expect(errors).toContainEqual(expect.objectContaining({ code: 'frame-unresolved', element: moving }));
    expect(() => moving.getWorldMatrix()).toThrow();
    expect(content.compileRenderItems().map(item => item.layer)).toEqual([body]);

    const late = frame('late', [3, 0, 0]);
    const other = frame('other', [7, 0, 0]);
    scene.append(late, other);
    resolve();
    expect([...moving.getWorldMatrix().slice(12, 15)]).toEqual([3, 1, 0]);
    moving.frame = 'other';
    resolve();
    expect([...moving.getWorldMatrix().slice(12, 15)]).toEqual([7, 1, 0]);
    other.remove();
    expect(isFrameChainValid(moving)).toBe(false);
    expect(() => moving.getWorldMatrix()).toThrow();
    resolve();
    expect(content.compileRenderItems().map(item => item.layer)).toEqual([body]);
    moving.frame = null;
    resolve();
    expect([...moving.getWorldMatrix().slice(12, 15)]).toEqual([0, 1, 0]);
    expect(content.compileRenderItems().map(item => item.layer)).toEqual([body, attached]);
  });

  it.each([1, 2, 3])('rejects a cycle of length %i and recovers independently of unrelated content', length => {
    const { scene, body, content, errors, resolve } = composition();
    const frames = Array.from({ length }, (_, index) => frame(`f${index}`));
    frames.forEach((element, index) => {
      element.frame = `f${(index + 1) % length}`;
    });
    scene.append(...frames);
    const points = document.createElement('nve-scene-points');
    points.frame = 'f0';
    scene.append(points);
    resolve();
    for (const element of frames) {
      expect(isFrameChainValid(element)).toBe(false);
      expect(() => element.getWorldMatrix()).toThrow();
      expect(errors).toContainEqual(expect.objectContaining({ code: 'frame-unresolved', element }));
    }
    expect(content.compileRenderItems().map(item => item.layer)).toEqual([body]);
    // Repeat registry evaluation to verify that a cached rejected cycle remains invalid.
    resolve();
    expect(isFrameChainValid(points)).toBe(false);
    frames[0]!.frame = null;
    resolve();
    expect(frames.every(isFrameChainValid)).toBe(true);
    expect(content.compileRenderItems().map(item => item.layer)).toEqual([body, points]);
  });

  it('detects a cycle that mixes DOM nesting with a reference', () => {
    const { scene, resolve } = composition();
    const parent = frame('parent');
    const child = frame('child');
    parent.frame = 'child';
    parent.append(child);
    scene.append(parent);
    resolve();
    expect(isFrameChainValid(child)).toBe(false);
    expect(() => child.getWorldMatrix()).toThrow();
  });

  it('keeps references local to the owning scene and excludes duplicate names', () => {
    const first = composition();
    const second = composition();
    const target = frame('target', [10, 0, 0]);
    first.scene.append(target, second.scene);
    const local = frame('local');
    local.frame = 'target';
    second.scene.append(local);
    first.resolve();
    second.resolve();
    expect(isFrameChainValid(local)).toBe(false);
    expect(second.content.compileRenderItems().map(item => item.layer)).toEqual([second.body]);
    second.scene.append(frame('target'), frame('target'));
    second.resolve();
    expect(second.errors.filter(error => error.code === 'frame-name-duplicate')).toHaveLength(2);
    expect(isFrameChainValid(local)).toBe(false);
  });

  it('matches nested world matrices while mixing referenced and nested parents', () => {
    const { scene, resolve } = composition();
    const root = frame('root', [1, 0, 0]);
    root.position = [1, 0, 0];
    root.orientation = [0, 0, Math.SQRT1_2, Math.SQRT1_2];
    const nested = frame('nested', [2, 0, 0]);
    const expected = frame('expected', [1, 0, 0]);
    const referenced = frame('referenced', [1, 0, 0]);
    root.append(nested);
    nested.append(expected);
    referenced.frame = 'nested';
    scene.append(root, referenced);
    resolve();
    expect(referenced.getWorldMatrix()).toEqual(expected.getWorldMatrix());
    root.frame = 'reference-root';
    scene.append(frame('reference-root', [4, 0, 0]));
    resolve();
    expect(referenced.getWorldMatrix()).toEqual(expected.getWorldMatrix());
    expect(referenced.getWorldMatrix()[12]).toBeCloseTo(5);
    expect(referenced.getWorldMatrix()[13]).toBeCloseTo(3);
  });

  it('owns bodies and points through references and propagates hidden and invalid chains', () => {
    const { scene, body, content, resolve } = composition();
    const root = frame('root', [2, 0, 0]);
    const child = frame('child', [0, 3, 0]);
    child.frame = 'root';
    const attached = document.createElement('nve-scene-body');
    attached.geometry = [{ type: 'cube' }];
    attached.frame = 'child';
    const points = document.createElement('nve-scene-points');
    points.frame = 'child';
    scene.append(root, child, attached, points);
    resolve();
    const items = content.compileRenderItems();
    for (const item of items.slice(1)) expect([...item.frameMatrix.slice(12, 15)]).toEqual([2, 3, 0]);
    root.hidden = true;
    expect(content.compileRenderItems().map(item => item.layer)).toEqual([body]);
    root.hidden = false;
    root.position = [NaN, 0, 0];
    root.orientation = [0, 0, 0, 1];
    expect(isFrameChainValid(attached)).toBe(false);
    expect(isFrameChainValid(points)).toBe(false);
    expect(content.compileRenderItems().map(item => item.layer)).toEqual([body]);
    root.position = null;
    expect(content.compileRenderItems()).toHaveLength(3);
  });

  it('resolves references and structural changes before WebGPU is available', async () => {
    configureSceneTesting({ requestAdapter: async () => null });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fixture = await createFixture(
      html`<nve-scene aria-label="CPU references"><nve-scene-frame name="moving" frame="late"></nve-scene-frame></nve-scene>`
    );
    const scene = fixture.querySelector('nve-scene')!;
    const moving = scene.querySelector('nve-scene-frame')!;
    await elementIsStable(moving);
    expect(() => moving.getWorldMatrix()).toThrow();
    const target = frame('late', [3, 0, 0]);
    scene.append(target);
    await elementIsStable(target);
    await vi.waitFor(() => expect(moving.getWorldMatrix()[12]).toBe(3));
    target.name = 'renamed';
    await elementIsStable(target);
    expect(() => moving.getWorldMatrix()).toThrow();
    moving.frame = 'renamed';
    expect(moving.getWorldMatrix()[12]).toBe(3);
  });
});
