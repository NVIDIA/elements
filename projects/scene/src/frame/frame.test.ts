// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import {
  configureSceneTesting,
  getNamedSceneFrameForTesting,
  resetSceneTesting,
  type SceneGPUCanvasContext,
  type SceneGPUDevice
} from '../internal/testing.js';
import { transformPointMat4 } from '../internal/math/mat4.js';
import type { FrameTransform } from '../internal/frame/types.js';
import { Scene } from '../scene/scene.js';
import { SceneFrame } from './frame.js';
import './define.js';

describe(SceneFrame.metadata.tag, () => {
  const fixtures: HTMLElement[] = [];
  let consoleError: ReturnType<typeof vi.spyOn> | undefined;
  let consoleWarn: ReturnType<typeof vi.spyOn> | undefined;

  afterEach(() => {
    fixtures.forEach(removeFixture);
    fixtures.length = 0;
    resetSceneTesting();
    consoleError?.mockRestore();
    consoleError = undefined;
    consoleWarn?.mockRestore();
    consoleWarn = undefined;
  });

  it('should define a layout-transparent coordinate frame', async () => {
    const frame = await createFrame();

    expect(customElements.get(Scene.metadata.tag)).toBe(Scene);
    expect(customElements.get(SceneFrame.metadata.tag)).toBe(SceneFrame);
    expect(frame.shadowRoot?.querySelector('slot')).toBeDefined();
    expect(getComputedStyle(frame).display).toBe('contents');
  });

  it('should use position and orientation attributes as one normalized static transform', async () => {
    const frame = await createFrame();
    frame.setAttribute('position', '[1,2,3]');
    frame.setAttribute('orientation', '[0,0,0,2]');
    await elementIsStable(frame);

    expect(frame.transform).toEqual({ position: [1, 2, 3], orientation: [0, 0, 0, 1] });
    expect(transformPointMat4(frame.getWorldMatrix(), [0, 0, 0])).toEqual([1, 2, 3]);
  });

  it('should isolate stored and returned transforms from external mutation', async () => {
    const frame = await createFrame();
    const transform: FrameTransform = { position: [1, 2, 3], orientation: [0, 0, 0, 2] };
    frame.setTransform(transform);
    transform.position[0] = 99;
    const first = frame.transform;
    if (!first) {
      throw new Error('Expected a stored transform.');
    }
    first.position[1] = 99;

    expect(frame.transform).toEqual({ position: [1, 2, 3], orientation: [0, 0, 0, 1] });
  });

  it('should support transform assignment, partial attribute defaults, and attribute removal', async () => {
    const frame = await createFrame();
    frame.transform = { position: [4, 5, 6], orientation: [0, 0, 0, 1] };
    expect(transformPointMat4(frame.getWorldMatrix(), [0, 0, 0])).toEqual([4, 5, 6]);

    frame.position = [1, 2, 3];
    frame.orientation = [0, 0, 0, 1];
    await elementIsStable(frame);
    expect(transformPointMat4(frame.getWorldMatrix(), [0, 0, 0])).toEqual([1, 2, 3]);

    frame.position = null;
    frame.orientation = [0, 0, 1, 0];
    await elementIsStable(frame);
    expect(transformPointMat4(frame.getWorldMatrix(), [0, 0, 0])).toEqual([0, 0, 0]);

    frame.orientation = null;
    await elementIsStable(frame);
    expect(frame.transform).toBeNull();
  });

  it('should report invalid declarative transforms once per error episode and recover', async () => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const frame = await createFrame();
    const errors: CustomEvent[] = [];
    frame.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent));
    frame.setTransform({ position: [4, 5, 6], orientation: [0, 0, 0, 1] });

    Reflect.set(frame, 'position', [0, 0]);
    await elementIsStable(frame);
    expect(frame.transform).toEqual({ position: [4, 5, 6], orientation: [0, 0, 0, 1] });
    expect(() => frame.getWorldMatrix()).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ bubbles: true, composed: true, cancelable: false });
    expect(errors[0]?.detail).toMatchObject({ code: 'frame-transform', element: frame, severity: 'error' });

    Reflect.set(frame, 'position', [0, 0]);
    await elementIsStable(frame);
    expect(errors).toHaveLength(1);

    Reflect.set(frame, 'position', [0, 0, Number.NaN]);
    await elementIsStable(frame);
    expect(() => frame.getWorldMatrix()).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));

    frame.setTransform({ position: [7, 8, 9], orientation: [0, 0, 0, 1] });
    expect(frame.transform).toEqual({ position: [7, 8, 9], orientation: [0, 0, 0, 1] });
    expect(() => frame.getWorldMatrix()).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));
    expect(errors).toHaveLength(1);

    frame.position = [1, 2, 3];
    await elementIsStable(frame);
    expect(frame.transform).toEqual({ position: [1, 2, 3], orientation: [0, 0, 0, 1] });

    Reflect.set(frame, 'orientation', [0, 0, 0]);
    await elementIsStable(frame);
    expect(frame.transform).toEqual({ position: [1, 2, 3], orientation: [0, 0, 0, 1] });

    frame.orientation = [0, 0, 0, 0];
    await elementIsStable(frame);
    expect(() => frame.getWorldMatrix()).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));
    expect(errors).toHaveLength(2);
    expect(consoleError).toHaveBeenCalledTimes(2);

    frame.position = null;
    frame.orientation = null;
    await elementIsStable(frame);
    expect(frame.transform).toBeNull();
    expect([...frame.getWorldMatrix()]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  });

  it('should replace the current transform on every assignment', async () => {
    const frame = await createFrame();
    frame.setTransform({ position: [1, 0, 0], orientation: [0, 0, 0, 1] });
    frame.setTransform({ position: [3, 0, 0], orientation: [0, 0, 0, 1] });
    expect(frame.transform).toEqual({ position: [3, 0, 0], orientation: [0, 0, 0, 1] });
    expect(transformPointMat4(frame.getWorldMatrix(), [0, 0, 0])).toEqual([3, 0, 0]);
  });

  it('should reject malformed, nonfinite, and zero-length transform data', async () => {
    const frame = await createFrame();
    frame.setTransform({ position: [1, 2, 3], orientation: [0, 0, 0, 1] });
    const setTransform = (sample: unknown) => Reflect.apply(frame.setTransform, frame, [sample]);

    expect(() => setTransform(null)).toThrow(TypeError);
    expect(() => setTransform({ position: [0, 0], orientation: [0, 0, 0, 1] })).toThrow(TypeError);
    expect(() => setTransform({ stamp: 1, position: [0, 0, 0], orientation: [0, 0, 0, 1] })).toThrow(TypeError);
    expect(() => setTransform({ position: [0, 0, Number.NaN], orientation: [0, 0, 0, 1] })).toThrow(RangeError);
    expect(() => setTransform({ position: [0, 0, 0], orientation: [0, 0, 0, 0] })).toThrow(RangeError);
    expect(frame.transform).toEqual({ position: [1, 2, 3], orientation: [0, 0, 0, 1] });
    expect(transformPointMat4(frame.getWorldMatrix(), [0, 0, 0])).toEqual([1, 2, 3]);
  });

  it('should resolve identity without a transform and clear through transform assignment', async () => {
    const frame = await createFrame();
    expect([...frame.getWorldMatrix()]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    expect(frame.transform).toBeNull();

    frame.setTransform({ position: [1, 2, 3], orientation: [0, 0, 0, 1] });
    frame.transform = null;
    expect(frame.transform).toBeNull();
    expect([...frame.getWorldMatrix()]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  });

  it('should reject legacy time arguments during world-matrix resolution', async () => {
    const frame = await createFrame();
    expect(() => Reflect.apply(frame.getWorldMatrix, frame, ['invalid'])).toThrow(TypeError);
  });

  describe('owning scene integration', () => {
    beforeEach(() => {
      configureFakeWebGPU();
    });

    it('should submit a new scene snapshot when the current transform changes', async () => {
      const { gpu, scene } = await createScene(html`
        <nve-scene aria-label="Scene"><nve-scene-frame></nve-scene-frame></nve-scene>
      `);
      const frame = required(
        scene.querySelector<SceneFrame>(SceneFrame.metadata.tag),
        'Expected current transform frame.'
      );
      frame.setTransform({ position: [0, 0, 0], orientation: [0, 0, 0, 1] });
      gpu.resolveNextDevice();
      await scene.ready;

      const submissions = gpu.submissions.length;
      frame.setTransform({ position: [2, 0, 0], orientation: [0, 0, 0, 1] });
      await vi.waitFor(() => expect(gpu.submissions.length).toBeGreaterThan(submissions));
      expect(transformPointMat4(frame.getWorldMatrix(), [0, 0, 0])).toEqual([2, 0, 0]);
    });

    it('should compose nested matrices and re-root a moved frame through transparent containers', async () => {
      const { gpu, scene } = await createScene(html`
        <nve-scene aria-label="Scene">
          <nve-scene-frame id="first" position="[1,0,0]" orientation="[0,0,1,0]">
            <div><nve-scene-frame id="child" position="[2,0,0]"></nve-scene-frame></div>
          </nve-scene-frame>
          <nve-scene-frame id="second" position="[10,0,0]"></nve-scene-frame>
        </nve-scene>
      `);
      const child = required(scene.querySelector<SceneFrame>('#child'), 'Expected child frame.');
      const second = required(scene.querySelector<SceneFrame>('#second'), 'Expected second frame.');
      await Promise.all([elementIsStable(child), elementIsStable(second)]);
      gpu.resolveNextDevice();
      await scene.ready;
      expect(transformPointMat4(child.getWorldMatrix(), [0, 0, 0])).toEqual([-1, 0, 0]);

      const submissions = gpu.submissions.length;
      second.append(child);
      await elementIsStable(child);
      await vi.waitFor(() => expect(gpu.submissions.length).toBeGreaterThan(submissions));
      expect(transformPointMat4(child.getWorldMatrix(), [0, 0, 0])).toEqual([12, 0, 0]);
    });

    it('should reject world matrices beneath an invalid ancestor and recover the chain', async () => {
      consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { gpu, scene } = await createScene(html`
        <nve-scene aria-label="Scene">
          <nve-scene-frame id="parent" name="parent" position="[1,0,0]">
            <nve-scene-frame id="child" name="child" position="[2,0,0]"></nve-scene-frame>
          </nve-scene-frame>
        </nve-scene>
      `);
      const parent = required(scene.querySelector<SceneFrame>('#parent'), 'Expected parent frame.');
      const child = required(scene.querySelector<SceneFrame>('#child'), 'Expected child frame.');
      await Promise.all([elementIsStable(parent), elementIsStable(child)]);
      gpu.resolveNextDevice();
      await scene.ready;

      Reflect.set(parent, 'position', [0, 0]);
      await elementIsStable(parent);
      expect(() => parent.getWorldMatrix()).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));
      expect(() => child.getWorldMatrix()).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));
      await vi.waitFor(() => expect(getNamedSceneFrameForTesting(scene, 'parent')).toBeUndefined());
      expect(getNamedSceneFrameForTesting(scene, 'child')).toBeUndefined();

      parent.position = [3, 0, 0];
      await elementIsStable(parent);
      expect(transformPointMat4(child.getWorldMatrix(), [0, 0, 0])).toEqual([5, 0, 0]);
      await vi.waitFor(() => expect(getNamedSceneFrameForTesting(scene, 'parent')).toBe(parent));
      expect(getNamedSceneFrameForTesting(scene, 'child')).toBe(child);
    });

    it('should exclude duplicate names from lookup and recover each warning episode', async () => {
      consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { gpu, scene } = await createScene(html`
        <nve-scene aria-label="Scene">
          <nve-scene-frame id="first" name="target" position="[1,0,0]"></nve-scene-frame>
          <nve-scene-frame id="second" name="target" position="[2,0,0]"></nve-scene-frame>
        </nve-scene>
      `);
      const first = required(scene.querySelector<SceneFrame>('#first'), 'Expected first named frame.');
      const second = required(scene.querySelector<SceneFrame>('#second'), 'Expected second named frame.');
      const errors: CustomEvent[] = [];
      scene.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent));
      gpu.resolveNextDevice();
      await scene.ready;

      expect(errors).toHaveLength(2);
      expect(errors.map(event => event.detail)).toEqual([
        expect.objectContaining({ code: 'frame-name-duplicate', element: first, severity: 'warning' }),
        expect.objectContaining({ code: 'frame-name-duplicate', element: second, severity: 'warning' })
      ]);
      expect(errors[0]).toMatchObject({ bubbles: true, composed: true, cancelable: false });
      expect(getNamedSceneFrameForTesting(scene, 'target')).toBeUndefined();
      expect(transformPointMat4(first.getWorldMatrix(), [0, 0, 0])).toEqual([1, 0, 0]);
      expect(transformPointMat4(second.getWorldMatrix(), [0, 0, 0])).toEqual([2, 0, 0]);

      second.name = 'other';
      await elementIsStable(second);
      await vi.waitFor(() => expect(getNamedSceneFrameForTesting(scene, 'target')).toBe(first));

      second.name = 'target';
      await elementIsStable(second);
      await vi.waitFor(() => expect(errors).toHaveLength(4));
      second.remove();
      await vi.waitFor(() => expect(getNamedSceneFrameForTesting(scene, 'target')).toBe(first));
      expect(consoleWarn).toHaveBeenCalledTimes(4);
    });

    it('should trim frame names for lookup and canonical duplicate detection', async () => {
      consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { gpu, scene } = await createScene(html`
        <nve-scene aria-label="Scene">
          <nve-scene-frame id="trimmed" name=" robot " position="[1,0,0]"></nve-scene-frame>
        </nve-scene>
      `);
      const trimmed = scene.querySelector<SceneFrame>('#trimmed');
      if (!trimmed) throw new Error('Expected trimmed frame.');
      const errors: CustomEvent[] = [];
      scene.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent));
      gpu.resolveNextDevice();
      await scene.ready;

      expect(getNamedSceneFrameForTesting(scene, 'robot')).toBe(trimmed);
      expect(getNamedSceneFrameForTesting(scene, ' robot ')).toBe(trimmed);

      const duplicate = document.createElement(SceneFrame.metadata.tag) as SceneFrame;
      duplicate.name = 'robot';
      scene.append(duplicate);
      await elementIsStable(duplicate);
      await vi.waitFor(() => expect(getNamedSceneFrameForTesting(scene, 'robot')).toBeUndefined());
      expect(errors.map(event => event.detail)).toEqual([
        expect.objectContaining({ code: 'frame-name-duplicate', element: trimmed, severity: 'warning' }),
        expect.objectContaining({ code: 'frame-name-duplicate', element: duplicate, severity: 'warning' })
      ]);
      expect(consoleWarn).toHaveBeenCalledTimes(2);
    });

    it('should isolate named lookup and world transforms at nested scene boundaries', async () => {
      const { gpu, scene: outer } = await createScene(html`
        <nve-scene id="outer" aria-label="Outer scene">
          <nve-scene-frame id="outer-frame" name="shared" position="[10,0,0]">
            <nve-scene id="inner" aria-label="Inner scene">
              <nve-scene-frame id="inner-frame" name="shared" position="[2,0,0]"></nve-scene-frame>
            </nve-scene>
          </nve-scene-frame>
        </nve-scene>
      `);
      const inner = required(outer.querySelector<Scene>('#inner'), 'Expected nested scene.');
      const outerFrame = required(outer.querySelector<SceneFrame>('#outer-frame'), 'Expected outer frame.');
      const innerFrame = required(outer.querySelector<SceneFrame>('#inner-frame'), 'Expected inner frame.');
      await Promise.all([elementIsStable(inner), elementIsStable(outerFrame), elementIsStable(innerFrame)]);
      gpu.resolveNextDevice();
      await Promise.all([outer.ready, inner.ready]);

      expect(getNamedSceneFrameForTesting(outer, 'shared')).toBe(outerFrame);
      expect(getNamedSceneFrameForTesting(inner, 'shared')).toBe(innerFrame);
      expect(transformPointMat4(innerFrame.getWorldMatrix(), [0, 0, 0])).toEqual([2, 0, 0]);
    });
  });

  async function createFrame(): Promise<SceneFrame> {
    const fixture = await createFixture(html`<nve-scene-frame></nve-scene-frame>`);
    fixtures.push(fixture);
    const frame = required(fixture.querySelector<SceneFrame>(SceneFrame.metadata.tag), 'Expected frame fixture.');
    await elementIsStable(frame);
    return frame;
  }

  async function createScene(template: ReturnType<typeof html>): Promise<{ gpu: FakeGPU; scene: Scene }> {
    const gpu = activeFakeGPU;
    if (!gpu) {
      throw new Error('Fake WebGPU must be configured before creating a scene.');
    }
    const fixture = await createFixture(template);
    fixtures.push(fixture);
    const scene = required(fixture.querySelector<Scene>(Scene.metadata.tag), 'Expected scene fixture.');
    await elementIsStable(scene);
    return { gpu, scene };
  }
});

interface FakeGPU {
  readonly submissions: unknown[][];
  resolveNextDevice(): void;
}

let activeFakeGPU: FakeGPU | undefined;

function configureFakeWebGPU(): FakeGPU {
  const submissions: unknown[][] = [];
  const pendingDevices: Array<(device: SceneGPUDevice) => void> = [];
  configureSceneTesting({
    requestAdapter: async () => ({ requestDevice: () => new Promise(resolve => pendingDevices.push(resolve)) }),
    getPreferredCanvasFormat: () => 'bgra8unorm',
    getCanvasContext: () => createFakeContext(),
    getDevicePixelRatio: () => 1,
    now: () => 0
  });
  activeFakeGPU = {
    submissions,
    resolveNextDevice() {
      const resolve = pendingDevices.shift();
      if (!resolve) {
        throw new Error('No Scene device request is pending.');
      }
      resolve(createFakeDevice(submissions));
    }
  };
  return activeFakeGPU;
}

function createFakeContext(): SceneGPUCanvasContext {
  return {
    configure: () => undefined,
    unconfigure: () => undefined,
    getCurrentTexture: () => ({ createView: () => ({}) })
  };
}

function createFakeDevice(submissions: unknown[][]): SceneGPUDevice {
  return {
    lost: new Promise(() => undefined),
    queue: { submit: commandBuffers => submissions.push([...commandBuffers]) },
    createCommandEncoder: () => ({
      beginRenderPass: () => ({ end: () => undefined }),
      finish: () => ({})
    }),
    destroy: () => undefined
  };
}
