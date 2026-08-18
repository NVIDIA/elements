// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import {
  configureSceneTesting,
  FRAME_SAMPLE_MAX_COUNT,
  FRAME_SAMPLE_MAX_SPAN_MS,
  getFrameTestingSnapshot,
  getNamedSceneFrameForTesting,
  resetSceneTesting,
  type SceneGPUCanvasContext,
  type SceneGPUDevice
} from '../internal/testing.js';
import { transformPointMat4 } from '../internal/math/mat4.js';
import { Scene } from '../scene/scene.js';
import { SceneFrame } from './frame.js';
import type { TransformSample } from './transform-sample.js';
import './define.js';

/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value -- This package defines Scene Frame and Scene discovery content. */

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
    expect(transformPointMat4(frame.getWorldMatrix(42), [0, 0, 0])).toEqual([1, 2, 3]);
    expect(frame.staleness).toBe(0);
  });

  it('should isolate stored and returned transform samples from external mutation', async () => {
    const frame = await createFrame();
    const sample: TransformSample = { stamp: 10, position: [1, 2, 3], orientation: [0, 0, 0, 2] };
    frame.setTransform(sample);
    sample.position[0] = 99;
    const first = frame.transform;
    if (!first) {
      throw new Error('Expected a stored transform.');
    }
    first.position[1] = 99;

    expect(frame.transform).toEqual({ stamp: 10, position: [1, 2, 3], orientation: [0, 0, 0, 1] });
  });

  it('should support transform assignment, partial attribute defaults, and attribute removal', async () => {
    const frame = await createFrame();
    frame.transform = { position: [4, 5, 6], orientation: [0, 0, 0, 1] };
    expect(transformPointMat4(frame.getWorldMatrix(0), [0, 0, 0])).toEqual([4, 5, 6]);

    frame.position = [1, 2, 3];
    frame.orientation = [0, 0, 0, 1];
    await elementIsStable(frame);
    expect(transformPointMat4(frame.getWorldMatrix(0), [0, 0, 0])).toEqual([1, 2, 3]);

    frame.position = null;
    frame.orientation = [0, 0, 1, 0];
    await elementIsStable(frame);
    expect(transformPointMat4(frame.getWorldMatrix(0), [0, 0, 0])).toEqual([0, 0, 0]);

    frame.orientation = null;
    await elementIsStable(frame);
    expect(frame.transform).toBeNull();
  });

  it('should report invalid declarative transforms once per error episode and recover', async () => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const frame = await createFrame();
    const errors: CustomEvent[] = [];
    frame.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent));

    Reflect.set(frame, 'position', [0, 0]);
    await elementIsStable(frame);
    expect(frame.transform).toBeNull();
    expect([...frame.getWorldMatrix(0)]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ bubbles: true, composed: true, cancelable: false });
    expect(errors[0]?.detail).toMatchObject({ code: 'frame-transform', element: frame, severity: 'error' });

    Reflect.set(frame, 'position', [0, 0]);
    await elementIsStable(frame);
    expect(errors).toHaveLength(1);

    Reflect.set(frame, 'position', [0, 0, Number.NaN]);
    await elementIsStable(frame);
    expect(frame.transform).toBeNull();

    frame.position = [1, 2, 3];
    await elementIsStable(frame);
    expect(frame.transform).toEqual({ position: [1, 2, 3], orientation: [0, 0, 0, 1] });

    Reflect.set(frame, 'orientation', [0, 0, 0]);
    await elementIsStable(frame);
    expect(frame.transform).toBeNull();

    frame.orientation = [0, 0, 0, 0];
    await elementIsStable(frame);
    expect(frame.transform).toBeNull();
    expect(errors).toHaveLength(2);
    expect(consoleError).toHaveBeenCalledTimes(2);
  });

  it('should interpolate position and orientation and clamp both endpoints', async () => {
    const frame = await createFrame();
    frame.setTransform({ stamp: 0, position: [0, 0, 0], orientation: [0, 0, 0, 1] });
    frame.setTransform({ stamp: 10, position: [10, 0, 0], orientation: [0, 0, 1, 0] });

    expect(transformPointMat4(frame.getWorldMatrix(-1), [0, 0, 0])).toEqual([0, 0, 0]);
    expect(transformPointMat4(frame.getWorldMatrix(11), [0, 0, 0])).toEqual([10, 0, 0]);
    expect(transformPointMat4(frame.getWorldMatrix(5), [1, 0, 0])).toEqual([
      expect.closeTo(5, 5),
      expect.closeTo(1, 5),
      expect.closeTo(0, 5)
    ]);
  });

  it('should sort out-of-order samples and replace duplicate timestamps', async () => {
    const frame = await createFrame();
    frame.setTransform({ stamp: 20, position: [20, 0, 0], orientation: [0, 0, 0, 1] });
    frame.setTransform({ stamp: 0, position: [0, 0, 0], orientation: [0, 0, 0, 1] });
    frame.setTransform({ stamp: 10, position: [10, 0, 0], orientation: [0, 0, 0, 1] });
    frame.setTransform({ stamp: 10, position: [11, 0, 0], orientation: [0, 0, 0, 1] });

    expect(transformPointMat4(frame.getWorldMatrix(10), [0, 0, 0])).toEqual([11, 0, 0]);
    expect(frame.transform?.stamp).toBe(20);
    expect(getFrameTestingSnapshot(frame).sampleCount).toBe(3);
  });

  it('should replace static and timestamped storage modes in both directions', async () => {
    const frame = await createFrame();
    frame.setTransform({ position: [1, 0, 0], orientation: [0, 0, 0, 1] });
    expect(getFrameTestingSnapshot(frame)).toMatchObject({ sampleCount: 0, staticTransform: true });

    frame.setTransform({ stamp: 1, position: [2, 0, 0], orientation: [0, 0, 0, 1] });
    expect(getFrameTestingSnapshot(frame)).toMatchObject({ sampleCount: 1, staticTransform: false });

    frame.setTransform({ position: [3, 0, 0], orientation: [0, 0, 0, 1] });
    expect(getFrameTestingSnapshot(frame)).toMatchObject({ sampleCount: 0, staticTransform: true });
    expect(transformPointMat4(frame.getWorldMatrix(100), [0, 0, 0])).toEqual([3, 0, 0]);
  });

  it('should reject malformed, nonfinite, and zero-length transform data', async () => {
    const frame = await createFrame();
    const setTransform = (sample: unknown) => Reflect.apply(frame.setTransform, frame, [sample]);

    expect(() => setTransform(null)).toThrow(TypeError);
    expect(() => setTransform({ position: [0, 0], orientation: [0, 0, 0, 1] })).toThrow(TypeError);
    expect(() => setTransform({ stamp: 'invalid', position: [0, 0, 0], orientation: [0, 0, 0, 1] })).toThrow(TypeError);
    expect(() => setTransform({ position: [0, 0, Number.NaN], orientation: [0, 0, 0, 1] })).toThrow(RangeError);
    expect(() => setTransform({ position: [0, 0, 0], orientation: [0, 0, 0, 0] })).toThrow(RangeError);
    expect(() =>
      setTransform({ stamp: Number.POSITIVE_INFINITY, position: [0, 0, 0], orientation: [0, 0, 0, 1] })
    ).toThrow(RangeError);
  });

  it('should resolve identity without samples and clear samples through transform', async () => {
    const frame = await createFrame();
    expect([...frame.getWorldMatrix(0)]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    expect(frame.transform).toBeNull();

    frame.setTransform({ position: [1, 2, 3], orientation: [0, 0, 0, 1] });
    frame.transform = null;
    expect(frame.transform).toBeNull();
    expect(frame.staleness).toBe(Number.POSITIVE_INFINITY);
  });

  it('should enforce both timestamp retention limits', async () => {
    const frame = await createFrame();
    for (let stamp = 0; stamp <= FRAME_SAMPLE_MAX_COUNT; stamp += 1) {
      frame.setTransform({ stamp, position: [stamp, 0, 0], orientation: [0, 0, 0, 1] });
    }
    expect(getFrameTestingSnapshot(frame)).toMatchObject({
      sampleCount: FRAME_SAMPLE_MAX_COUNT,
      oldestStamp: 1,
      newestStamp: FRAME_SAMPLE_MAX_COUNT
    });

    frame.transform = null;
    for (const stamp of [0, FRAME_SAMPLE_MAX_SPAN_MS, FRAME_SAMPLE_MAX_SPAN_MS + 1]) {
      frame.setTransform({ stamp, position: [stamp, 0, 0], orientation: [0, 0, 0, 1] });
    }
    expect(getFrameTestingSnapshot(frame)).toMatchObject({
      sampleCount: 2,
      oldestStamp: FRAME_SAMPLE_MAX_SPAN_MS,
      newestStamp: FRAME_SAMPLE_MAX_SPAN_MS + 1
    });
  });

  it('should reject invalid explicit world-matrix times', async () => {
    const frame = await createFrame();
    expect(() => Reflect.apply(frame.getWorldMatrix, frame, ['invalid'])).toThrow(TypeError);
    expect(() => frame.getWorldMatrix(Number.NaN)).toThrow(RangeError);
  });

  it('should default an unowned frame to the live clock and reject unregistered test targets', async () => {
    configureSceneTesting({ getTimeOrigin: () => 100, now: () => 23 });
    const frame = await createFrame();
    frame.setTransform({ stamp: 123, position: [3, 0, 0], orientation: [0, 0, 0, 1] });
    frame.setTransform({ stamp: 124, position: [4, 0, 0], orientation: [0, 0, 0, 1] });

    expect(transformPointMat4(frame.getWorldMatrix(), [0, 0, 0])).toEqual([3, 0, 0]);
    expect(() => getFrameTestingSnapshot(document.createElement('div'))).toThrow(TypeError);
  });

  describe('owning scene integration', () => {
    beforeEach(() => {
      configureFakeWebGPU();
    });

    it('should sample finite scene time and update reflected stale state only on render', async () => {
      const { gpu, scene } = await createScene(html`
        <nve-scene aria-label="Scene"><nve-scene-frame></nve-scene-frame></nve-scene>
      `);
      const frame = scene.querySelector<SceneFrame>(SceneFrame.metadata.tag);
      frame.setTransform({ stamp: 1_000, position: [0, 0, 0], orientation: [0, 0, 0, 1] });
      frame.setTransform({ stamp: 2_000, position: [1, 0, 0], orientation: [0, 0, 0, 1] });
      scene.staleAfter = 500;
      scene.time = 2_501;
      gpu.resolveNextDevice();
      await scene.ready;

      expect(frame.staleness).toBe(501);
      expect(frame.stale).toBe(true);
      expect(frame.hasAttribute('stale')).toBe(true);

      const submissions = gpu.submissions.length;
      scene.time = 2_000;
      await vi.waitFor(() => expect(gpu.submissions.length).toBeGreaterThan(submissions));
      expect(frame.staleness).toBe(0);
      expect(frame.stale).toBe(false);

      frame.stale = true;
      scene.time = 2_001;
      await vi.waitFor(() => expect(frame.stale).toBe(false));
    });

    it('should validate imperative scene time and staleness thresholds', async () => {
      const { scene } = await createScene(html`<nve-scene aria-label="Scene"></nve-scene>`);

      expect(() => Reflect.set(scene, 'time', 'invalid')).toThrow(TypeError);
      expect(() => Reflect.set(scene, 'time', Number.NaN)).toThrow(RangeError);
      expect(() => Reflect.set(scene, 'staleAfter', 'invalid')).toThrow(TypeError);
      expect(() => Reflect.set(scene, 'staleAfter', -1)).toThrow(RangeError);
      expect(scene.time).toBe('live');
      expect(scene.staleAfter).toBe(1_000);
    });

    it('should parse stale-after attributes and mark a sampleless frame stale', async () => {
      consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { gpu, scene } = await createScene(html`
        <nve-scene aria-label="Scene" stale-after="0"><nve-scene-frame></nve-scene-frame></nve-scene>
      `);
      const frame = scene.querySelector<SceneFrame>(SceneFrame.metadata.tag);
      gpu.resolveNextDevice();
      await scene.ready;

      expect(scene.staleAfter).toBe(0);
      expect(frame.staleness).toBe(Number.POSITIVE_INFINITY);
      expect(frame.stale).toBe(true);

      const warnings: CustomEvent[] = [];
      scene.addEventListener('nve-scene-error', event => warnings.push(event as CustomEvent));
      scene.setAttribute('stale-after', 'invalid');
      await elementIsStable(scene);
      expect(scene.staleAfter).toBe(1_000);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toMatchObject({ bubbles: true, composed: true, cancelable: false });
      expect(warnings[0]?.detail).toMatchObject({
        code: 'scene-stale-after',
        element: scene,
        severity: 'warning'
      });

      scene.setAttribute('stale-after', 'still invalid');
      await elementIsStable(scene);
      expect(warnings).toHaveLength(1);

      scene.setAttribute('stale-after', '10');
      await elementIsStable(scene);
      scene.setAttribute('stale-after', 'invalid again');
      await elementIsStable(scene);
      expect(warnings).toHaveLength(2);
      expect(consoleWarn).toHaveBeenCalledTimes(2);
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
      scene.time = 0;
      const child = scene.querySelector<SceneFrame>('#child');
      const second = scene.querySelector<SceneFrame>('#second');
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

    it('should exclude duplicate names from lookup and recover each warning episode', async () => {
      consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { gpu, scene } = await createScene(html`
        <nve-scene aria-label="Scene">
          <nve-scene-frame id="first" name="target" position="[1,0,0]"></nve-scene-frame>
          <nve-scene-frame id="second" name="target" position="[2,0,0]"></nve-scene-frame>
        </nve-scene>
      `);
      const first = scene.querySelector<SceneFrame>('#first');
      const second = scene.querySelector<SceneFrame>('#second');
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
      const inner = outer.querySelector<Scene>('#inner');
      const outerFrame = outer.querySelector<SceneFrame>('#outer-frame');
      const innerFrame = outer.querySelector<SceneFrame>('#inner-frame');
      await Promise.all([elementIsStable(inner), elementIsStable(outerFrame), elementIsStable(innerFrame)]);
      outer.time = 0;
      inner.time = 0;
      gpu.resolveNextDevice();
      await Promise.all([outer.ready, inner.ready]);

      expect(getNamedSceneFrameForTesting(outer, 'shared')).toBe(outerFrame);
      expect(getNamedSceneFrameForTesting(inner, 'shared')).toBe(innerFrame);
      expect(transformPointMat4(innerFrame.getWorldMatrix(), [0, 0, 0])).toEqual([2, 0, 0]);
    });

    it('should not mutate scene time or staleness during explicit matrix resolution', async () => {
      const { gpu, scene } = await createScene(html`
        <nve-scene aria-label="Scene"><nve-scene-frame></nve-scene-frame></nve-scene>
      `);
      const frame = scene.querySelector<SceneFrame>(SceneFrame.metadata.tag);
      frame.setTransform({ stamp: 0, position: [0, 0, 0], orientation: [0, 0, 0, 1] });
      frame.setTransform({ stamp: 10, position: [10, 0, 0], orientation: [0, 0, 0, 1] });
      scene.time = 5;
      gpu.resolveNextDevice();
      await scene.ready;
      const staleness = frame.staleness;

      expect(transformPointMat4(frame.getWorldMatrix(10), [0, 0, 0])).toEqual([10, 0, 0]);
      expect(scene.time).toBe(5);
      expect(frame.staleness).toBe(staleness);
    });
  });

  async function createFrame(): Promise<SceneFrame> {
    const fixture = await createFixture(html`<nve-scene-frame></nve-scene-frame>`);
    fixtures.push(fixture);
    const frame = fixture.querySelector<SceneFrame>(SceneFrame.metadata.tag);
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
    const scene = fixture.querySelector<Scene>(Scene.metadata.tag);
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
    getTimeOrigin: () => 0,
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
