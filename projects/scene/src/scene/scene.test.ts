// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { sceneCameraController, type SceneCamera } from '../camera/camera.js';
import type { SceneFrame } from '../frame/frame.js';
import { LINE_VERTEX, MARKER, POINT, TRIANGLE_VERTEX } from '../internal/layouts/built-ins.js';
import { writeLineVertex, writeMarker, writePoint, writeTriangleVertex } from '../internal/layouts/helpers.js';
import { takeHeightfieldLayerRenderData } from '../internal/heightfield/layer-state.js';
import { takeModelLayerRenderData } from '../internal/model/layer-state.js';
import { takePolygonLayerRenderData } from '../internal/polygon/layer-state.js';
import type { Vec3 } from '../internal/types.js';
import { SceneRenderer, type SceneRenderItem } from '../internal/rendering/renderer.js';
import { SceneModel } from '../model/model.js';
import { ScenePart } from '../model/part.js';
import {
  createLineVertexSource,
  createMarkerSource,
  createPointSource,
  createTriangleVertexSource
} from '../internal/external-record-sources.js';
import {
  configureSceneTesting,
  getNamedSceneFrameForTesting,
  getSceneTestingSnapshot,
  resetSceneTesting,
  type SceneGPUCanvasContext,
  type SceneGPUDevice,
  type SceneGPUDeviceLostInfo,
  type ScenePlatform
} from '../internal/testing.js';
import { Scene, type SceneErrorDetail } from './scene.js';
import '../cubes/define.js';
import '../camera/define.js';
import '../frame/define.js';
import '../heightfield/define.js';
import '../lines/define.js';
import '../marker/define.js';
import '../mesh/define.js';
import '../model/define.js';
import '../points/define.js';
import '../polygon/define.js';
import '../triangles/define.js';
import './define.js';

const meshTriangle = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);

describe(Scene.metadata.tag, () => {
  const fixtures: HTMLElement[] = [];
  let consoleError: ReturnType<typeof vi.spyOn> | undefined;

  afterEach(() => {
    fixtures.forEach(removeFixture);
    fixtures.length = 0;
    resetSceneTesting();
    vi.restoreAllMocks();
    consoleError = undefined;
  });

  it('should initialize its accessible shadow structure and resolve readiness after submit', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Robot visualization"></nve-scene>`);
    appendSlottedParagraph(element, { slot: 'fallback', id: 'fallback', text: 'A textual scene fallback.' });
    const eventOrder: string[] = [];
    element.addEventListener('nve-scene-ready', event => {
      eventOrder.push('ready');
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
      expect(event.cancelable).toBe(false);
      expect(gpu.devices[0]?.submissions).toHaveLength(1);
    });

    gpu.resolveNextDevice();
    await element.ready;
    await element.updateComplete;

    const canvas = element.shadowRoot?.querySelector('canvas');
    expect(customElements.get(Scene.metadata.tag)).toBe(Scene);
    expect(element._internals.role).toBe('region');
    expect(element.tabIndex).toBe(0);
    expect(canvas?.getAttribute('aria-hidden')).toBe('true');
    expect(element.shadowRoot?.querySelector('.fallback')?.hasAttribute('hidden')).toBe(true);
    expect(eventOrder).toEqual(['ready']);

    await waitForAnimationFrames(3);
    const idleSubmissions = gpu.devices[0]?.submissions.length;
    await waitForAnimationFrames(3);
    expect(gpu.devices[0]?.submissions).toHaveLength(idleSubmissions ?? 0);
  });

  it('keeps readiness pending until large derived mesh geometry is installed', async () => {
    const releases: Array<() => void> = [];
    const gpu = configureFakeWebGPU({
      yieldForPreparation: () => new Promise<void>(resolve => releases.push(resolve))
    });
    const { element } = await createScene(html`
      <nve-scene aria-label="Prepared mesh"><nve-scene-mesh id="mesh"></nve-scene-mesh></nve-scene>
    `);
    const mesh = required(element.querySelector<HTMLElement>('#mesh'), 'Expected mesh layer.');
    const vertexCount = 16_386;
    Reflect.set(mesh, 'geometry', {
      colors: new Float32Array(vertexCount * 4).fill(1),
      normals: new Float32Array(vertexCount * 3),
      positions: new Float32Array(vertexCount * 3),
      uvs: new Float32Array(vertexCount * 2)
    });
    let ready = false;
    void element.ready.then(() => (ready = true));

    gpu.resolveNextDevice();
    await vi.waitFor(() => expect(releases).toHaveLength(1));
    expect(ready).toBe(false);
    expect(gpu.devices[0]?.submissions).toHaveLength(0);

    releases.shift()?.();
    await element.ready;
    expect(gpu.devices[0]?.submissions).toHaveLength(1);
    expect(gpu.devices[0]?.draws.at(-1)).toMatchObject({ vertexCount });
  });

  it('projects submitted world points and creates continuous near-plane rays', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Coordinate helpers"><nve-scene-camera behavior="pose"></nve-scene-camera></nve-scene>
    `);
    const canvas = required(element.shadowRoot?.querySelector('canvas'), 'Expected scene canvas.');
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 20, 200, 100));
    const canvasRect = vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 20, 200, 100));
    gpu.resolveNextDevice();
    await element.ready;

    expect(element.getClientPoint([0, 0, 1])).toMatchObject({
      clientX: 110,
      clientY: 70,
      visibility: 'visible'
    });
    expect(element.getClientPoint([0, 0, -1])).toBeNull();
    const ray = element.getRay(110, 70);
    expect(ray?.origin).toEqual([expect.closeTo(0), expect.closeTo(0), expect.closeTo(0.01)]);
    expect(ray?.direction).toEqual([expect.closeTo(0), expect.closeTo(0), expect.closeTo(1)]);
    expect(Object.isFrozen(ray?.origin)).toBe(true);
    expect(element.getRay(210, 70)).toBeNull();

    canvasRect.mockReturnValue(new DOMRect(10, 20, 300, 100));
    expect(element.getClientPoint([0, 0, 1])).toBeNull();
    expect(element.getRay(110, 70)).toBeNull();
  });

  it('should park a connected static scene without scheduling another frame', async () => {
    const animation = new ManualAnimationFrames();
    const gpu = configureFakeWebGPU({
      cancelAnimationFrame: handle => animation.cancel(handle),
      requestAnimationFrame: callback => animation.request(callback)
    });
    const { element } = await createScene(html`<nve-scene aria-label="Static scene"></nve-scene>`);
    gpu.resolveNextDevice();
    await element.ready;
    await drainSceneTicks(animation, element);

    expect(animation.pendingCount).toBe(0);

    await Promise.resolve();
    expect(animation.pendingCount).toBe(0);
  });

  it('should park a stale animation callback after disconnecting', async () => {
    const animation = new ManualAnimationFrames();
    const gpu = configureFakeWebGPU({
      cancelAnimationFrame: () => undefined,
      requestAnimationFrame: callback => animation.request(callback)
    });
    const { element } = await createScene(html`<nve-scene aria-label="Disconnecting scene"></nve-scene>`);
    gpu.resolveNextDevice();
    await element.ready;
    await vi.waitFor(() => expect(animation.pendingCount).toBeGreaterThan(0));

    element.remove();
    animation.flush();

    expect(animation.pendingCount).toBe(0);
  });

  it('should wake once for a current frame transform and park again', async () => {
    const animation = new ManualAnimationFrames();
    const gpu = configureFakeWebGPU({
      cancelAnimationFrame: handle => animation.cancel(handle),
      requestAnimationFrame: callback => animation.request(callback)
    });
    const { element } = await createScene(html`
      <nve-scene aria-label="Live scene"><nve-scene-frame name="robot"></nve-scene-frame></nve-scene>
    `);
    const frame = element.querySelector<HTMLElement>('nve-scene-frame');
    if (!frame) throw new Error('Expected frame.');
    gpu.resolveNextDevice();
    await element.ready;
    await drainSceneTicks(animation, element);

    Reflect.get(frame, 'setPose').call(frame, { position: [1, 0, 0], orientation: [0, 0, 0, 1] });
    await vi.waitFor(() => expect(animation.pendingCount).toBe(1));
    animation.flush();
    await drainSceneTicks(animation, element);
    expect(animation.pendingCount).toBe(0);
  });

  it('should coalesce independent state, observer, resize, and pointer wakes', async () => {
    const animation = new ManualAnimationFrames();
    let resizeCallback: ResizeObserverCallback | undefined;
    const resizeObserver = createManualResizeObserver();
    const gpu = configureFakeWebGPU({
      cancelAnimationFrame: handle => animation.cancel(handle),
      createResizeObserver: callback => {
        resizeCallback = callback;
        return resizeObserver;
      },
      requestAnimationFrame: callback => animation.request(callback)
    });
    const { element } = await createScene(html`
      <nve-scene aria-label="Wake paths">
        <nve-scene-camera behavior="orbit"></nve-scene-camera>
        <nve-scene-frame name="robot"></nve-scene-frame>
        <nve-scene-points></nve-scene-points>
      </nve-scene>
    `);
    const camera = element.querySelector<SceneCamera>('nve-scene-camera');
    const frame = element.querySelector<HTMLElement>('nve-scene-frame');
    const points = element.querySelector<HTMLElement>('nve-scene-points');
    if (!camera || !frame || !points || !resizeCallback) throw new Error('Expected wake fixtures.');
    const notifyResize = resizeCallback;
    gpu.resolveNextDevice();
    await element.ready;
    await drainSceneTicks(animation, element);
    setStreamBytes(points, 1);
    await drainSceneTicks(animation, element);

    const expectWake = async (action: () => void | Promise<void>): Promise<void> => {
      await action();
      await vi.waitFor(() => expect(animation.pendingCount).toBe(1));
      animation.flush();
      await drainSceneTicks(animation, element);
      expect(animation.pendingCount).toBe(0);
    };

    await expectWake(() => {
      Reflect.get(points, 'publish').call(points);
    });
    await expectWake(async () => {
      Reflect.set(points, 'size', 7);
      await Reflect.get(points, 'updateComplete');
    });
    await expectWake(() => {
      camera.setAttribute('distance', '18');
    });
    await expectWake(async () => {
      camera.distance = 19;
      await camera.updateComplete;
    });
    await expectWake(() => {
      Reflect.get(frame, 'setPose').call(frame, { position: [1, 2, 3], orientation: [0, 0, 0, 1] });
    });
    await expectWake(() => {
      const entry = {
        borderBoxSize: [],
        contentBoxSize: [],
        contentRect: new DOMRectReadOnly(0, 0, 20, 10),
        target: element
      };
      Reflect.apply(notifyResize, undefined, [[entry], resizeObserver]);
    });
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!canvas) throw new Error('Expected canvas.');
    await expectWake(() => {
      canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 1, clientY: 1, pointerId: 1 }));
      canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 4, clientY: 1, pointerId: 1 }));
      canvas.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 4, clientY: 1, pointerId: 1 }));
    });
  });

  it('should preserve authored role and tabindex values', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene role="application" tabindex="-1"></nve-scene>`);
    gpu.resolveNextDevice();
    await element.ready;

    expect(element.getAttribute('role')).toBe('application');
    expect(element.tabIndex).toBe(-1);
  });

  it('should reject a pending cycle on disconnect and create a new cycle on reconnect', async () => {
    const gpu = configureFakeWebGPU();
    const { fixture, element } = await createScene(html`<nve-scene aria-label="Scene"></nve-scene>`);
    const firstReady = element.ready;

    element.remove();
    await expect(firstReady).rejects.toMatchObject({ name: 'AbortError' });
    fixture.append(element);
    await elementIsStable(element);
    const reconnectedReady = element.ready;
    expect(reconnectedReady).not.toBe(firstReady);

    gpu.resolveNextDevice();
    await reconnectedReady;
    expect(getSceneTestingSnapshot().requestDeviceCount).toBe(1);
  });

  it('should stop initialization when disconnected before the first render completes', async () => {
    const fixture = await createFixture(html`<nve-scene aria-label="Scene"></nve-scene>`);
    fixtures.push(fixture);
    const element = fixture.querySelector<Scene>(Scene.metadata.tag);
    if (!element) throw new Error('Expected a scene.');
    const ready = element.ready;

    element.remove();

    await expect(ready).rejects.toMatchObject({ name: 'AbortError' });
    await Promise.resolve();
  });

  it('should ignore an initialization failure after disconnecting during device acquisition', async () => {
    let rejectAdapter: ((error: unknown) => void) | undefined;
    configureSceneTesting({
      requestAdapter: () =>
        new Promise((_, reject) => {
          rejectAdapter = reject;
        })
    });
    const fixture = await createFixture(html`<nve-scene aria-label="Scene"></nve-scene>`);
    fixtures.push(fixture);
    const element = fixture.querySelector<Scene>(Scene.metadata.tag);
    if (!element) throw new Error('Expected a scene.');
    const ready = element.ready;
    await vi.waitFor(() => expect(rejectAdapter).not.toBeUndefined());

    element.remove();
    rejectAdapter?.(new Error('adapter failed'));

    await expect(ready).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('should retain the shared device across a ready disconnect and reconnect', async () => {
    const gpu = configureFakeWebGPU();
    const { fixture, element } = await createScene(html`<nve-scene aria-label="Scene"></nve-scene>`);
    gpu.resolveNextDevice();
    const firstReady = element.ready;
    await firstReady;

    element.remove();
    fixture.append(element);
    await elementIsStable(element);
    expect(element.ready).not.toBe(firstReady);
    await element.ready;
    expect(getSceneTestingSnapshot()).toMatchObject({ requestDeviceCount: 1, hasDevice: true });
  });

  it('should share one device while keeping per-scene contexts and clears', async () => {
    const gpu = configureFakeWebGPU();
    const fixture = await createFixture(html`
      <nve-scene id="first" aria-label="First scene" style="background: rgb(255, 0, 0)"></nve-scene>
      <nve-scene id="second" aria-label="Second scene" style="background: rgb(0, 0, 255)"></nve-scene>
      <nve-scene aria-label="Third scene"></nve-scene>
      <nve-scene aria-label="Fourth scene"></nve-scene>
      <nve-scene aria-label="Fifth scene"></nve-scene>
      <nve-scene aria-label="Sixth scene"></nve-scene>
      <nve-scene aria-label="Seventh scene"></nve-scene>
      <nve-scene aria-label="Eighth scene"></nve-scene>
      <nve-scene aria-label="Ninth scene"></nve-scene>
    `);
    fixtures.push(fixture);
    const scenes = [...fixture.querySelectorAll<Scene>(Scene.metadata.tag)];
    await Promise.all(scenes.map(elementIsStable));

    gpu.resolveNextDevice();
    await Promise.all(scenes.map(scene => scene.ready));

    expect(getSceneTestingSnapshot().requestDeviceCount).toBe(1);
    expect(gpu.contexts).toHaveLength(9);
    expect(scenes.slice(0, 2).map(scene => globalThis.getComputedStyle(scene).backgroundColor)).toEqual([
      'rgb(255, 0, 0)',
      'rgb(0, 0, 255)'
    ]);
    expect(gpu.devices[0]?.renderPasses.slice(0, 2)).toEqual([
      expect.objectContaining({
        colorAttachments: [expect.objectContaining({ clearValue: { r: 1, g: 0, b: 0, a: 1 } })]
      }),
      expect.objectContaining({
        colorAttachments: [expect.objectContaining({ clearValue: { r: 0, g: 0, b: 1, a: 1 } })]
      })
    ]);
  });

  it('should size its canvas in device pixels and rerender when the background changes', async () => {
    const gpu = configureFakeWebGPU({ devicePixelRatio: 2 });
    const { element } = await createScene(
      html`<nve-scene aria-label="Scene" style="width: 12px; height: 8px; background: rgb(255, 0, 0)"></nve-scene>`
    );
    gpu.resolveNextDevice();
    await element.ready;

    const canvas = element.shadowRoot?.querySelector('canvas');
    expect(canvas?.width).toBe(24);
    expect(canvas?.height).toBe(16);

    const initialSubmissions = gpu.devices[0]?.submissions.length ?? 0;
    element.style.background = 'rgb(0, 255, 0)';
    await vi.waitFor(() => expect(gpu.devices[0]?.submissions.length).toBeGreaterThan(initialSubmissions));
    expect(gpu.devices[0]?.renderPasses.at(-1)).toMatchObject({
      colorAttachments: [expect.objectContaining({ clearValue: { r: 0, g: 1, b: 0, a: 1 } })]
    });
  });

  it('should fall back to content pixels when device pixel sizing is unavailable', async () => {
    let resizeCallback: ResizeObserverCallback | undefined;
    const resizeObserver = createManualResizeObserver();
    const gpu = configureFakeWebGPU({
      createResizeObserver: callback => {
        resizeCallback = callback;
        return resizeObserver;
      },
      devicePixelRatio: 2
    });
    const { element } = await createScene(html`<nve-scene aria-label="Scene"></nve-scene>`);
    gpu.resolveNextDevice();
    await element.ready;
    if (!resizeCallback) throw new Error('Expected the Scene resize observer callback.');

    const legacyEntry = {
      borderBoxSize: [],
      contentBoxSize: [],
      contentRect: new DOMRectReadOnly(0, 0, 12, 8),
      target: element
    };
    Reflect.apply(resizeCallback, undefined, [[legacyEntry], resizeObserver]);

    const canvas = element.shadowRoot?.querySelector('canvas');
    expect(canvas?.width).toBe(24);
    expect(canvas?.height).toBe(16);
  });

  it('should construct DOM-ordered marker and stream draws with live stream configuration', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="M5 layers">
        <nve-scene-triangles id="triangles"></nve-scene-triangles>
        <nve-scene-cubes id="cubes"></nve-scene-cubes>
        <nve-scene-points id="points" size="3"></nve-scene-points>
        <nve-scene-lines id="lines"></nve-scene-lines>
      </nve-scene>
    `);
    const triangles = required(element.querySelector<HTMLElement>('#triangles'), 'Expected triangle layer.');
    const cubes = required(element.querySelector<HTMLElement>('#cubes'), 'Expected cube layer.');
    const points = required(element.querySelector<HTMLElement>('#points'), 'Expected point layer.');
    const lines = required(element.querySelector<HTMLElement>('#lines'), 'Expected line layer.');
    setStreamBytes(triangles, 3);
    setMarkerBytes(cubes);
    setStreamBytes(points, 1);
    setStreamBytes(lines, 3);

    gpu.resolveNextDevice();
    await element.ready;
    await new Promise(resolve => setTimeout(resolve, 0));
    await waitForAnimationFrames(4);

    expect(gpu.devices[0]?.draws.length).toBeGreaterThanOrEqual(4);
    expect(gpu.devices[0]?.draws.slice(-4)).toEqual([
      expect.objectContaining({ vertexCount: 3 }),
      expect.objectContaining({ indexed: true }),
      expect.objectContaining({ vertexCount: 6 }),
      expect.objectContaining({ vertexCount: 15 })
    ]);

    points.setAttribute('size', '7');
    points.setAttribute('size-unit', 'world');
    lines.setAttribute('topology', 'loop');
    await waitForAnimationFrames(2);
    expect(gpu.devices[0]?.draws.at(-2)).toEqual(expect.objectContaining({ vertexCount: 6 }));
    expect(gpu.devices[0]?.draws.at(-1)).toEqual(expect.objectContaining({ vertexCount: 27 }));
  });

  it('should synchronize mesh geometry, instances, owning frames, hidden updates, and removal', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Mesh scene">
        <nve-scene-frame id="frame" position="[1,0,0]">
          <nve-scene-mesh id="identity"></nve-scene-mesh>
          <nve-scene-mesh id="instanced">
            <nve-scene-marker></nve-scene-marker>
          </nve-scene-mesh>
          <nve-scene-mesh id="invalid"></nve-scene-mesh>
        </nve-scene-frame>
      </nve-scene>
    `);
    const identity = element.querySelector<HTMLElement>('#identity');
    const instanced = element.querySelector<HTMLElement>('#instanced');
    const invalid = element.querySelector<HTMLElement>('#invalid');
    if (!identity || !instanced || !invalid) throw new Error('Expected mesh layers.');
    Reflect.set(identity, 'geometry', { positions: meshTriangle });
    Reflect.set(instanced, 'geometry', { positions: meshTriangle });
    Reflect.set(instanced, 'countLimit', 0);
    Reflect.set(invalid, 'geometry', { positions: new Float32Array(6) });

    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(4);
    const initialDraws = gpu.devices[0]?.draws.length ?? 0;
    expect(initialDraws).toBeGreaterThan(0);

    identity.hidden = true;
    Reflect.set(identity, 'geometry', {
      positions: new Float32Array([0, 0, 0, 2, 0, 0, 0, 2, 0])
    });
    await waitForAnimationFrames(2);
    identity.hidden = false;
    await vi.waitFor(() => expect(gpu.devices[0]?.draws.length).toBeGreaterThan(initialDraws));

    instanced.remove();
    await waitForAnimationFrames(2);
    expect(gpu.devices[0]?.draws.length).toBeGreaterThan(initialDraws);
  });

  it('should collect polygons as unlit frame-owned meshes with identity and marker instances', async () => {
    const gpu = configureFakeWebGPU();
    const render = vi.spyOn(SceneRenderer.prototype, 'render');
    const { element } = await createScene(html`
      <nve-scene aria-label="Polygon scene">
        <nve-scene-frame id="polygon-frame" position="[2,3,4]">
          <nve-scene-polygon id="identity" geometry='{"outer":[[0,0],[2,0],[2,2],[0,2]]}'></nve-scene-polygon>
          <nve-scene-polygon id="instanced" geometry='{"outer":[[0,0],[1,0],[0,1]]}'>
            <nve-scene-marker position="[1,0,0]"></nve-scene-marker>
          </nve-scene-polygon>
        </nve-scene-frame>
      </nve-scene>
    `);
    const identity = element.querySelector<HTMLElement>('#identity');
    const instanced = element.querySelector<HTMLElement>('#instanced');
    if (!identity || !instanced) throw new Error('Expected polygon layers.');

    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(4);

    const expectedFrameMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 3, 4, 1]);
    const identityItem = renderedItems(render)
      .filter(item => item.layer === identity)
      .at(-1);
    const instancedItem = renderedItems(render)
      .filter(item => item.layer === instanced)
      .at(-1);
    expect(identityItem).toMatchObject({
      data: { identityInstance: true, shading: 'unlit' },
      frameMatrix: new Float64Array(expectedFrameMatrix),
      instances: { count: 0 },
      type: 'mesh'
    });
    expect(instancedItem).toMatchObject({
      data: { identityInstance: false, shading: 'unlit' },
      frameMatrix: new Float64Array(expectedFrameMatrix),
      instances: { count: 1 },
      type: 'mesh'
    });
    expect(takePolygonLayerRenderData(identity).positions).toHaveLength(12);

    identity.hidden = true;
    Reflect.set(identity, 'data', {
      outer: [
        [0, 0],
        [3, 0],
        [3, 3],
        [0, 3]
      ]
    });
    await waitForAnimationFrames(2);
    identity.hidden = false;
    await waitForAnimationFrames(2);
  });

  it('should collect heightfields as frame-owned meshes while respecting hidden and nested-scene boundaries', async () => {
    const gpu = configureFakeWebGPU();
    const render = vi.spyOn(SceneRenderer.prototype, 'render');
    const { element: outer } = await createScene(html`
      <nve-scene id="outer" aria-label="Outer terrain scene">
        <nve-scene-frame id="terrain-frame" position="[2,3,4]">
          <nve-scene-heightfield id="terrain"></nve-scene-heightfield>
        </nve-scene-frame>
        <nve-scene id="inner" aria-label="Inner terrain scene">
          <nve-scene-heightfield id="inner-terrain"></nve-scene-heightfield>
        </nve-scene>
      </nve-scene>
    `);
    const frame = outer.querySelector<SceneFrame>('#terrain-frame');
    const terrain = outer.querySelector<HTMLElement>('#terrain');
    const inner = outer.querySelector<Scene>('#inner');
    const innerTerrain = outer.querySelector<HTMLElement>('#inner-terrain');
    if (!frame || !terrain || !inner || !innerTerrain) throw new Error('Expected heightfield integration fixtures.');
    const grid = () => ({
      columns: 2,
      heights: new Float32Array([0, 1, 2, 3]),
      rows: 2,
      spacing: 1
    });
    Reflect.set(terrain, 'grid', grid());
    Reflect.set(innerTerrain, 'grid', grid());

    gpu.resolveNextDevice();
    await Promise.all([outer.ready, inner.ready]);
    await waitForAnimationFrames(4);

    const initialData = takeHeightfieldLayerRenderData(terrain);
    const terrainItem = renderedItems(render)
      .filter(item => item.layer === terrain)
      .at(-1);
    expect(initialData.positions).toBeNull();
    expect(initialData.heightfield?.heights).toHaveLength(4);

    // The heightfield is a mesh render item at frame-local identity; Scene
    // supplies the ancestor frame matrix rather than altering terrain data.
    const expectedFrameMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 3, 4, 1]);
    expect(frame.getWorldMatrix()).toEqual(expectedFrameMatrix);
    expect(terrainItem).toMatchObject({
      data: { identityInstance: true },
      frameMatrix: new Float64Array(expectedFrameMatrix),
      instances: undefined,
      layer: terrain,
      type: 'mesh'
    });

    let callCount = render.mock.calls.length;
    terrain.hidden = true;
    await waitForAnimationFrames(2);
    expect(takeHeightfieldLayerRenderData(terrain).heightfield?.heights).toBe(initialData.heightfield?.heights);
    expect(renderedItems(render, callCount).some(item => item.layer === terrain)).toBe(false);

    callCount = render.mock.calls.length;
    terrain.hidden = false;
    frame.hidden = true;
    await waitForAnimationFrames(2);
    expect(takeHeightfieldLayerRenderData(terrain).heightfield?.heights).toBe(initialData.heightfield?.heights);
    expect(renderedItems(render, callCount).some(item => item.layer === terrain)).toBe(false);

    frame.hidden = false;
    await waitForAnimationFrames(2);
  });

  it('should collect models as frame-owned instanced meshes while respecting hidden and nested-scene boundaries', async () => {
    const gpu = configureFakeWebGPU();
    const render = vi.spyOn(SceneRenderer.prototype, 'render');
    const { element: outer } = await createScene(html`
      <nve-scene id="outer" aria-label="Outer model scene">
        <nve-scene-frame id="model-frame" position="[2,3,4]"></nve-scene-frame>
        <nve-scene id="inner" aria-label="Inner model scene"></nve-scene>
      </nve-scene>
    `);
    const frame = outer.querySelector<SceneFrame>('#model-frame');
    const inner = outer.querySelector<Scene>('#inner');
    if (!frame || !inner) throw new Error('Expected model integration fixtures.');
    const identity = createModel('identity', 'cube');
    const instanced = createModel('instanced', 'sphere');
    const innerModel = createModel('inner-model', 'cone');
    const marker = document.createElement('nve-scene-marker');
    instanced.append(marker);
    frame.append(identity, instanced);
    inner.append(innerModel);
    await Promise.all([elementIsStable(outer), elementIsStable(inner)]);

    gpu.resolveNextDevice();
    await Promise.all([outer.ready, inner.ready]);
    await waitForAnimationFrames(4);

    const expectedFrameMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 3, 4, 1]);
    const identityItem = renderedItems(render)
      .filter(item => item.layer === identity)
      .at(-1);
    const instancedItem = renderedItems(render)
      .filter(item => item.layer === instanced)
      .at(-1);
    expect(frame.getWorldMatrix()).toEqual(expectedFrameMatrix);
    expect(identityItem).toMatchObject({
      data: { identityInstance: true },
      frameMatrix: new Float64Array(expectedFrameMatrix),
      instances: { count: 0 },
      layer: identity,
      type: 'mesh'
    });
    expect(instancedItem).toMatchObject({
      data: { identityInstance: false },
      frameMatrix: new Float64Array(expectedFrameMatrix),
      instances: { count: 1 },
      layer: instanced,
      type: 'mesh'
    });
    expect(takeModelLayerRenderData(identity).positions?.length).toBeGreaterThan(0);

    const identityPart = identity.querySelector<HTMLElement>(ScenePart.metadata.tag);
    if (!identityPart) throw new Error('Expected a declarative model part.');
    identityPart.setAttribute('position', '[1,0,0]');
    await waitForAnimationFrames(2);

    Reflect.set(identity, 'parts', [{ shape: 'cube', position: [1, 0, 0] }]);
    await waitForAnimationFrames(2);
    expect(Reflect.get(identity, 'parts')).not.toBeNull();

    let callCount = render.mock.calls.length;
    identity.hidden = true;
    await waitForAnimationFrames(2);
    expect(renderedItems(render, callCount).some(item => item.layer === identity)).toBe(false);

    callCount = render.mock.calls.length;
    identity.hidden = false;
    frame.hidden = true;
    await waitForAnimationFrames(2);
    expect(renderedItems(render, callCount).some(item => item.layer === identity || item.layer === instanced)).toBe(
      false
    );

    marker.setAttribute('position', '[3,0,0]');
    await waitForAnimationFrames(2);

    frame.hidden = false;
    await waitForAnimationFrames(2);
    expect(
      renderedItems(render)
        .filter(item => item.layer === instanced)
        .at(-1)
    ).toMatchObject({ instances: { uploadRanges: [expect.anything()] } });
  });

  it('should assign only direct fallback children across nested scene boundaries', async () => {
    const gpu = configureFakeWebGPU();
    const { fixture } = await createScene(html`<nve-scene id="outer" aria-label="Outer scene"></nve-scene>`);
    const outer = required(fixture.querySelector<Scene>('#outer'), 'Expected outer scene.');
    appendSlottedParagraph(outer, { slot: 'fallback', id: 'outer-fallback', text: 'Outer fallback.' });
    const inner = document.createElement(Scene.metadata.tag) as Scene;
    const innerFallback = document.createElement('p');
    inner.id = 'inner';
    inner.setAttribute('aria-label', 'Inner scene');
    innerFallback.id = 'inner-fallback';
    innerFallback.slot = 'fallback';
    innerFallback.setAttribute('nve-text', 'body');
    innerFallback.textContent = 'Inner fallback.';
    inner.append(innerFallback);
    outer.append(inner);
    await Promise.all([elementIsStable(outer), elementIsStable(inner)]);
    gpu.resolveNextDevice();
    await Promise.all([outer.ready, inner.ready]);

    const outerAssigned = outer.shadowRoot
      ?.querySelector<HTMLSlotElement>('slot[name="fallback"]')
      ?.assignedElements()
      .map(element => element.id);
    const innerAssigned = inner.shadowRoot
      ?.querySelector<HTMLSlotElement>('slot[name="fallback"]')
      ?.assignedElements()
      .map(element => element.id);
    expect(outerAssigned).toEqual(['outer-fallback']);
    expect(innerAssigned).toEqual(['inner-fallback']);
  });

  it('should resynchronize direct fallback slot attribute mutations', async () => {
    const mutationCallbacks: MutationCallback[] = [];
    const gpu = configureFakeWebGPU({
      createMutationObserver: callback => {
        mutationCallbacks.push(callback);
        return createManualMutationObserver();
      }
    });
    const { element } = await createScene(html`<nve-scene aria-label="Fallback mutation"></nve-scene>`);
    const fallback = appendSlottedParagraph(element, {
      id: 'fallback-mutation',
      slot: 'fallback',
      text: 'Fallback.'
    });
    await elementIsStable(element);
    gpu.resolveNextDevice();
    await element.ready;
    const slot = element.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="fallback"]');
    if (!slot) throw new Error('Expected the fallback slot.');
    expect(slot.assignedElements()).toEqual([]);

    fallback.removeAttribute('slot');
    notifyMutation(mutationCallbacks[0], [
      createMutationRecord({ attributeName: 'slot', target: fallback, type: 'attributes' })
    ]);
    expect(slot.assignedElements()).toEqual([]);

    fallback.setAttribute('slot', 'fallback');
    notifyMutation(mutationCallbacks[0], [
      createMutationRecord({ attributeName: 'class', target: fallback, type: 'attributes' })
    ]);
    notifyMutation(mutationCallbacks[0], [
      createMutationRecord({ attributeName: 'slot', target: fallback, type: 'attributes' })
    ]);
    expect(slot.assignedElements()).toEqual([fallback]);
  });

  it('should reject readiness, show fallback, and dispatch the WebGPU unavailable error', async () => {
    let resolveAdapter: (adapter: null) => void = () => undefined;
    configureSceneTesting({
      requestAdapter: () => new Promise(resolve => (resolveAdapter = resolve))
    });
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { element } = await createScene(html`<nve-scene aria-label="Scene"></nve-scene>`);
    appendSlottedParagraph(element, { slot: 'fallback', id: 'fallback', text: 'Scene unavailable.' });
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    element.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent<SceneErrorDetail>));
    const ready = element.ready;

    resolveAdapter(null);
    await expect(ready).rejects.toMatchObject({ name: 'NotSupportedError' });
    await element.updateComplete;

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ bubbles: true, composed: true, cancelable: false });
    expect(errors[0]?.detail).toMatchObject({ code: 'webgpu-unavailable', element, severity: 'error' });
    expect(element.shadowRoot?.querySelector('.fallback')?.hasAttribute('hidden')).toBe(false);
    expect(element.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="fallback"]')?.assignedElements()[0]?.id).toBe(
      'fallback'
    );
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('should preserve an initialization Error message when WebGPU acquisition rejects', async () => {
    configureSceneTesting({
      requestAdapter: async () => {
        throw new Error('adapter failed');
      }
    });
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { element } = await createScene(html`<nve-scene aria-label="Scene"></nve-scene>`);
    const ready = element.ready;
    await expect(ready).rejects.toMatchObject({ name: 'NotSupportedError', message: 'adapter failed' });
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it('should use the safe WebGPU-unavailable message for a non-Error initialization rejection', async () => {
    configureSceneTesting({
      requestAdapter: async () => Promise.reject('adapter rejected')
    });
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { element } = await createScene(html`<nve-scene aria-label="Scene"></nve-scene>`);

    await expect(element.ready).rejects.toMatchObject({ name: 'NotSupportedError', message: 'WebGPU is unavailable.' });
    expect(consoleError).toHaveBeenCalledWith('[webgpu-unavailable] WebGPU is unavailable.', expect.anything());
  });

  it('should suppress a repeated WebGPU unavailable error across reconnects', async () => {
    configureSceneTesting({ requestAdapter: async () => null });
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { fixture, element } = await createScene(html`<nve-scene aria-label="Repeated failure"></nve-scene>`);

    await expect(element.ready).rejects.toMatchObject({ name: 'NotSupportedError' });
    element.remove();
    fixture.append(element);
    await elementIsStable(element);
    await expect(element.ready).rejects.toMatchObject({ name: 'NotSupportedError' });

    expect(consoleError).toHaveBeenCalledOnce();
  });

  it('should recover once from device loss and require reconnect after a rapid second loss', async () => {
    const gpu = configureFakeWebGPU();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { fixture, element } = await createScene(html`<nve-scene aria-label="Scene"></nve-scene>`);
    appendSlottedParagraph(element, { slot: 'fallback', id: 'recovery-fallback', text: 'Scene unavailable.' });
    const errorCodes: string[] = [];
    element.addEventListener('nve-scene-error', event => {
      errorCodes.push((event as CustomEvent<SceneErrorDetail>).detail.code);
    });
    gpu.resolveNextDevice();
    const initialReady = element.ready;
    await initialReady;

    gpu.devices[0]?.lose({ message: 'first loss', reason: 'unknown' });
    await vi.waitFor(() => expect(getSceneTestingSnapshot().requestDeviceCount).toBe(2));
    const recoveryReady = element.ready;
    expect(recoveryReady).not.toBe(initialReady);
    await element.updateComplete;
    expect(element.shadowRoot?.querySelector('.fallback')?.hasAttribute('hidden')).toBe(false);

    gpu.resolveNextDevice();
    await recoveryReady;
    expect(errorCodes).toEqual(['device-lost']);

    gpu.devices[1]?.lose({ message: 'second loss', reason: 'unknown' });
    await vi.waitFor(() => expect(getSceneTestingSnapshot().recoveryBlocked).toBe(true));
    const blockedReady = element.ready;
    element.remove();
    await expect(blockedReady).rejects.toMatchObject({ name: 'AbortError' });
    fixture.append(element);
    await elementIsStable(element);
    const reconnectReady = element.ready;
    await vi.waitFor(() => expect(getSceneTestingSnapshot().requestDeviceCount).toBe(3));
    gpu.resolveNextDevice();
    await reconnectReady;

    expect(errorCodes).toEqual(['device-lost', 'device-lost']);
    expect(getSceneTestingSnapshot().recoveryBlocked).toBe(false);
  });

  it('should recover a still-connected peer when another scene reconnects after a rapid second loss', async () => {
    const gpu = configureFakeWebGPU();
    const fixture = await createFixture(html`
      <nve-scene id="first" aria-label="First scene"></nve-scene>
      <nve-scene id="second" aria-label="Second scene"></nve-scene>
    `);
    fixtures.push(fixture);
    const [first, second] = [...fixture.querySelectorAll<Scene>(Scene.metadata.tag)];
    if (!first || !second) throw new Error('Expected both scenes.');
    await Promise.all([elementIsStable(first), elementIsStable(second)]);

    gpu.resolveNextDevice();
    await Promise.all([first.ready, second.ready]);

    gpu.devices[0]?.lose({ message: 'first loss', reason: 'unknown' });
    await vi.waitFor(() => expect(getSceneTestingSnapshot().requestDeviceCount).toBe(2));
    const firstRecovery = first.ready;
    const secondRecovery = second.ready;
    gpu.resolveNextDevice();
    await Promise.all([firstRecovery, secondRecovery]);

    gpu.devices[1]?.lose({ message: 'second loss', reason: 'unknown' });
    await vi.waitFor(() => expect(getSceneTestingSnapshot().recoveryBlocked).toBe(true));
    const secondBlockedReady = second.ready;

    first.remove();
    fixture.append(first);
    await elementIsStable(first);
    const reconnectReady = first.ready;
    await vi.waitFor(() => expect(getSceneTestingSnapshot().requestDeviceCount).toBe(3));
    gpu.resolveNextDevice();
    await Promise.all([reconnectReady, secondBlockedReady]);

    expect(getSceneTestingSnapshot()).toMatchObject({ hasDevice: true, recoveryBlocked: false, requestDeviceCount: 3 });
  });

  it('should fail the new readiness cycle and show fallback when renderer recovery initialization throws', async () => {
    const gpu = configureFakeWebGPU({ failCanvasContextAt: 2 });
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { element } = await createScene(html`<nve-scene aria-label="Scene"></nve-scene>`);
    appendSlottedParagraph(element, { slot: 'fallback', id: 'recovery-fallback', text: 'Scene unavailable.' });
    gpu.resolveNextDevice();
    await element.ready;

    gpu.devices[0]?.lose({ message: 'recovery loss', reason: 'unknown' });
    await vi.waitFor(() => expect(getSceneTestingSnapshot().requestDeviceCount).toBe(2));
    const recovery = element.ready;
    gpu.resolveNextDevice();
    await expect(recovery).rejects.toMatchObject({ name: 'NotSupportedError' });
    await element.updateComplete;
    expect(element.shadowRoot?.querySelector('.fallback')?.hasAttribute('hidden')).toBe(false);
    expect(consoleError).toHaveBeenCalledWith(
      '[webgpu-unavailable] A WebGPU canvas context is unavailable.',
      expect.anything()
    );
  });

  it('should validate pick coordinates and reject disconnected calls', async () => {
    const scene = new Scene();
    expect(() => scene.pick('0' as never, 0)).toThrow(TypeError);
    expect(() => scene.pick(Number.NaN, 0)).toThrow(RangeError);
    expect(() => scene.pick(0, Number.POSITIVE_INFINITY)).toThrow(RangeError);
    await expect(scene.pick(0, 0)).rejects.toMatchObject({ name: 'InvalidStateError' });
  });

  it('should resolve follow camera state for host-updated named frame poses without a change event', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Follow camera">
        <nve-scene-camera behavior="follow" frame="robot" follow-mode="pose"></nve-scene-camera>
        <nve-scene-frame name="robot"></nve-scene-frame>
      </nve-scene>
    `);
    const frame = element.querySelector<HTMLElement>('nve-scene-frame');
    if (!frame) throw new Error('Expected frame.');
    Reflect.get(frame, 'setPose').call(frame, { position: [2, 3, 4], orientation: [0, 0, 0, 1] });
    let changes = 0;
    element.addEventListener('nve-scene-camera-change', () => (changes += 1));
    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(2);
    expect(element.cameraState.pose.position).toEqual([
      expect.closeTo(2),
      expect.closeTo(-5.485281),
      expect.closeTo(12.485281)
    ]);
    Reflect.get(frame, 'setPose').call(frame, { position: [5, 6, 7], orientation: [0, 0, 1, 0] });
    await waitForAnimationFrames(2);
    expect(element.cameraState.pose.position).toEqual([
      expect.closeTo(5),
      expect.closeTo(14.485281),
      expect.closeTo(15.485281)
    ]);
    expect(changes).toBe(0);

    const beforeKey = element.cameraState;
    const key = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' });
    expect(element.dispatchEvent(key)).toBe(true);
    await waitForAnimationFrames(2);
    expect(element.cameraState).toEqual(beforeKey);
  });

  it('should expose independent read-only camera snapshots and synchronize user input to the orbit camera', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Camera input">
        <nve-scene-camera behavior="orbit" distance="30"></nve-scene-camera>
      </nve-scene>
    `);
    const camera = element.querySelector<SceneCamera>('nve-scene-camera');
    if (!camera) throw new Error('Expected orbit camera.');
    gpu.resolveNextDevice();
    await element.ready;
    const state = element.cameraState;
    (state.pose.position as Vec3)[0] = 12;
    expect(element.cameraState.pose.position[0]).not.toBe(12);
    expect(Object.getOwnPropertyDescriptor(Scene.prototype, 'cameraState')?.set).toBeUndefined();
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!canvas) throw new Error('Expected canvas.');
    const changes: CustomEvent[] = [];
    element.addEventListener('nve-scene-camera-change', event => changes.push(event as CustomEvent));
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: '+' }));
    await waitForAnimationFrames(2);
    expect(changes).toHaveLength(1);
    expect(changes[0]?.bubbles).toBe(true);
    expect(changes[0]?.composed).toBe(true);
    expect(changes[0]?.cancelable).toBe(false);
    expect(changes[0]?.detail).toMatchObject({
      source: 'keyboard',
      cameraState: { pose: { position: expect.any(Array), orientation: expect.any(Array) } }
    });
    required(changes[0], 'Expected camera change event.').detail.cameraState.pose.position[0] = 999;
    expect(element.cameraState.pose.position[0]).not.toBe(999);
    expect(camera.distance).toBeCloseTo(30 / 1.1);
  });

  it('should resolve an application-authoritative optical pose without allowing built-in input to mutate it', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Pose camera">
        <nve-scene-camera position="[1,2,3]" orientation="[0,0,0,2]" near="0.5" far="50"></nve-scene-camera>
      </nve-scene>
    `);
    const camera = element.querySelector<SceneCamera>('nve-scene-camera');
    if (!camera) throw new Error('Expected pose camera.');
    gpu.resolveNextDevice();
    await element.ready;
    expect(element.cameraState).toEqual({
      pose: { position: [1, 2, 3], orientation: [0, 0, 0, 1] },
      projection: { mode: 'perspective', verticalFieldOfView: Math.PI / 4, near: 0.5, far: 50 }
    });

    const before = element.cameraState;
    const changes: CustomEvent[] = [];
    element.addEventListener('nve-scene-camera-change', event => changes.push(event as CustomEvent));
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' }));
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!canvas) throw new Error('Expected canvas.');
    canvas.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 100 }));
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, buttons: 1, clientX: 0, clientY: 0, pointerId: 1 })
    );
    canvas.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, buttons: 1, clientX: 20, clientY: 10, pointerId: 1 })
    );
    canvas.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 20, clientY: 10, pointerId: 1 }));
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        buttons: 1,
        clientX: 0,
        clientY: 0,
        pointerId: 2,
        pointerType: 'touch'
      })
    );
    canvas.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        buttons: 1,
        clientX: 20,
        clientY: 10,
        pointerId: 2,
        pointerType: 'touch'
      })
    );
    await waitForAnimationFrames(2);
    expect(element.cameraState).toEqual(before);
    expect(changes).toHaveLength(0);
    expect(camera).toMatchObject({ position: [1, 2, 3], orientation: [0, 0, 0, 2] });

    camera.near = 50;
    await waitForAnimationFrames(2);
    expect(element.cameraState).toEqual(before);
    camera.near = 1;
    await waitForAnimationFrames(2);
    expect(element.cameraState.projection.near).toBe(1);
  });

  it('should compose a direct pose with one uniquely valid named frame and recover from duplicates', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Frame pose camera">
        <nve-scene-frame id="map" position="[5,0,0]">
          <nve-scene-frame
            name="robot"
            position="[5,0,0]"
            orientation="[0,0,0.70710678,0.70710678]"
          ></nve-scene-frame>
        </nve-scene-frame>
        <nve-scene-camera behavior="pose" frame=" robot " position="[1,0,0]"></nve-scene-camera>
      </nve-scene>
    `);
    const map = element.querySelector<SceneFrame>('#map');
    if (!map) throw new Error('Expected parent frame.');
    gpu.resolveNextDevice();
    await element.ready;
    expect(element.cameraState.pose.position).toEqual([expect.closeTo(10), expect.closeTo(1), expect.closeTo(0)]);
    expect(element.cameraState.pose.orientation).toEqual([
      expect.closeTo(0),
      expect.closeTo(0),
      expect.closeTo(Math.SQRT1_2),
      expect.closeTo(Math.SQRT1_2)
    ]);

    const resolved = element.cameraState;
    const duplicate = document.createElement('nve-scene-frame');
    duplicate.name = 'robot';
    element.append(duplicate);
    await waitForAnimationFrames(2);
    expect(element.cameraState).toEqual(resolved);
    duplicate.remove();
    await waitForAnimationFrames(2);
    expect(element.cameraState.pose.position).toEqual([expect.closeTo(10), expect.closeTo(1), expect.closeTo(0)]);

    map.setPose({ position: [8, 0, 0], orientation: [0, 0, 0, 1] });
    await waitForAnimationFrames(2);
    expect(element.cameraState.pose.position).toEqual([expect.closeTo(13), expect.closeTo(1), expect.closeTo(0)]);
  });

  it('conflicts pose ownership with orbit, follow, top, and another pose', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Pose camera conflicts">
        <nve-scene-frame name="robot"></nve-scene-frame>
        <nve-scene-camera behavior="pose"></nve-scene-camera>
        <nve-scene-camera behavior="pose"></nve-scene-camera>
        <nve-scene-camera behavior="orbit"></nve-scene-camera>
        <nve-scene-camera behavior="follow" frame="robot"></nve-scene-camera>
        <nve-scene-camera behavior="top"></nve-scene-camera>
      </nve-scene>
    `);
    const cameras = [...element.querySelectorAll<SceneCamera>('nve-scene-camera')];
    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(2);
    expect(cameras).toHaveLength(5);
    expect(cameras.every(camera => !sceneCameraController.isActive(camera))).toBe(true);
  });

  it('should make conflicting, invalid, and disabled camera behaviors inert until they recover', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Camera conflicts">
        <nve-scene-camera id="first" behavior="orbit"></nve-scene-camera>
        <nve-scene-camera id="second" behavior="orbit"></nve-scene-camera>
        <nve-scene-camera id="invalid" behavior="top" altitude="0"></nve-scene-camera>
      </nve-scene>
    `);
    const [first, second, invalid] = ['first', 'second', 'invalid'].map(id =>
      element.querySelector<SceneCamera>(`#${id}`)
    );
    if (!first || !second || !invalid) throw new Error('Expected camera behaviors.');
    const errors: string[] = [];
    element.addEventListener('nve-scene-error', event =>
      errors.push((event as CustomEvent<SceneErrorDetail>).detail.code)
    );
    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(3);
    expect(errors).toEqual(expect.arrayContaining(['camera-slot-conflict', 'camera-range']));
    expect(errors.filter(code => code === 'camera-slot-conflict')).toHaveLength(2);
    expect(sceneCameraController.isActive(first)).toBe(false);
    expect(sceneCameraController.isActive(second)).toBe(false);
    const before = element.cameraState;
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    await waitForAnimationFrames(3);
    expect(element.cameraState).toEqual(before);
    expect(errors.filter(code => code === 'camera-slot-conflict')).toHaveLength(2);
    second.setAttribute('disabled', '');
    await waitForAnimationFrames(2);
    expect(sceneCameraController.isActive(first)).toBe(true);
    const recovered = first.azimuth;
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    await waitForAnimationFrames(2);
    expect(first.azimuth).toBeCloseTo(recovered + Math.PI / 36);
    invalid.setAttribute('disabled', '');
    expect(element.cameraState.projection.mode).toBe('perspective');
  });

  it('should not consume camera keys that bubble from scene children', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Camera key target">
        <nve-scene-camera behavior="orbit"></nve-scene-camera><button type="button">Control</button>
      </nve-scene>
    `);
    const control = element.querySelector('button');
    if (!control) throw new Error('Expected child control.');
    gpu.resolveNextDevice();
    await element.ready;
    const before = element.cameraState;
    const childKey = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' });
    expect(control.dispatchEvent(childKey)).toBe(true);
    await waitForAnimationFrames(2);
    expect(element.cameraState).toEqual(before);

    const hostKey = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' });
    expect(element.dispatchEvent(hostKey)).toBe(false);
    await waitForAnimationFrames(2);
    expect(element.cameraState.pose.orientation).not.toEqual(before.pose.orientation);
  });

  it('should discard captured camera pointers across a reconnect', async () => {
    const gpu = configureFakeWebGPU();
    const { fixture, element } = await createScene(html`
      <nve-scene aria-label="Camera pointer reconnect"><nve-scene-camera behavior="orbit"></nve-scene-camera></nve-scene>
    `);
    gpu.resolveNextDevice();
    await element.ready;
    const firstCanvas = element.shadowRoot?.querySelector('canvas');
    if (!firstCanvas) throw new Error('Expected canvas.');
    firstCanvas.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 })
    );

    element.remove();
    fixture.append(element);
    await elementIsStable(element);
    await element.ready;
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!canvas) throw new Error('Expected reconnected canvas.');
    const before = element.cameraState;
    const move = new PointerEvent('pointermove', {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      clientX: 20,
      clientY: 10
    });
    expect(canvas.dispatchEvent(move)).toBe(true);
    await waitForAnimationFrames(2);
    expect(element.cameraState).toEqual(before);
  });

  it('should keep unresolved, duplicate, and invalid pose follows inert and recover when the frame becomes valid', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Follow resolution"><nve-scene-camera behavior="follow" frame="robot" follow-mode="pose"></nve-scene-camera></nve-scene>
    `);
    const errors: string[] = [];
    element.addEventListener('nve-scene-error', event =>
      errors.push((event as CustomEvent<SceneErrorDetail>).detail.code)
    );
    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(2);
    expect(errors).toContain('camera-frame-unresolved');
    const beforeUnresolvedCameraState = element.cameraState;
    const first = document.createElement('nve-scene-frame');
    const second = document.createElement('nve-scene-frame');
    first.name = 'robot';
    second.name = 'robot';
    element.append(first, second);
    await waitForAnimationFrames(2);
    expect(element.cameraState).toEqual(beforeUnresolvedCameraState);
    second.remove();
    Reflect.set(first, 'position', [3, 0, 0]);
    await waitForAnimationFrames(2);
    expect(element.cameraState.pose.position[0]).toBeCloseTo(3);

    const resolvedErrorCount = errors.filter(code => code === 'camera-frame-unresolved').length;
    Reflect.set(first, 'position', [0, 0]);
    await waitForAnimationFrames(2);
    expect(element.cameraState.pose.position[0]).toBeCloseTo(3);
    expect(errors.filter(code => code === 'camera-frame-unresolved')).toHaveLength(resolvedErrorCount + 1);

    Reflect.set(first, 'position', [5, 0, 0]);
    await waitForAnimationFrames(2);
    expect(element.cameraState.pose.position[0]).toBeCloseTo(5);
  });

  it('should avoid full rescans for owned attribute mutations while still updating named frame state', async () => {
    const mutationCallbacks: MutationCallback[] = [];
    const gpu = configureFakeWebGPU({
      createMutationObserver: callback => {
        mutationCallbacks.push(callback);
        return createManualMutationObserver();
      }
    });
    const { element } = await createScene(html`
      <nve-scene aria-label="Frame mutation"><nve-scene-frame id="frame" name="robot"></nve-scene-frame></nve-scene>
    `);
    const frame = element.querySelector<HTMLElement>('#frame');
    if (!frame) throw new Error('Expected frame.');
    gpu.resolveNextDevice();
    await element.ready;

    const queries = vi.spyOn(element, 'querySelectorAll');
    frame.setAttribute('name', 'rover');
    notifyMutation(mutationCallbacks[0], [
      createMutationRecord({ attributeName: 'name', target: frame, type: 'attributes' })
    ]);

    expect(queries).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(getNamedSceneFrameForTesting(element, 'rover')).toBe(frame));
    expect(getNamedSceneFrameForTesting(element, 'robot')).toBeUndefined();
  });

  it('should use full syncs for structural mutations and keep nested-scene ownership isolated', async () => {
    const mutationCallbacks: MutationCallback[] = [];
    const gpu = configureFakeWebGPU({
      createMutationObserver: callback => {
        mutationCallbacks.push(callback);
        return createManualMutationObserver();
      }
    });
    const { element: outer } = await createScene(html`
      <nve-scene id="outer" aria-label="Outer scene"><nve-scene id="inner" aria-label="Inner scene"></nve-scene></nve-scene>
    `);
    const inner = outer.querySelector<Scene>('#inner');
    if (!inner) throw new Error('Expected nested scene.');
    gpu.resolveNextDevice();
    await Promise.all([outer.ready, inner.ready]);

    const [outerMutations, innerMutations] = mutationCallbacks;
    const outerQueries = vi.spyOn(outer, 'querySelectorAll');
    const innerQueries = vi.spyOn(inner, 'querySelectorAll');

    const outerFrame = document.createElement('nve-scene-frame');
    outerFrame.setAttribute('name', 'outer-added');
    outer.append(outerFrame);
    notifyMutation(outerMutations, [createChildListMutation(outer, [outerFrame])]);

    await vi.waitFor(() => expect(getNamedSceneFrameForTesting(outer, 'outer-added')).toBe(outerFrame));
    expect(outerQueries).toHaveBeenCalled();

    outerQueries.mockClear();
    const innerFrame = document.createElement('nve-scene-frame');
    innerFrame.setAttribute('name', 'inner-added');
    inner.append(innerFrame);
    notifyMutation(outerMutations, [createChildListMutation(inner, [innerFrame])]);
    expect(outerQueries).not.toHaveBeenCalled();

    notifyMutation(innerMutations, [createChildListMutation(inner, [innerFrame])]);
    await vi.waitFor(() => expect(getNamedSceneFrameForTesting(inner, 'inner-added')).toBe(innerFrame));
    expect(innerQueries).toHaveBeenCalled();
    expect(getNamedSceneFrameForTesting(outer, 'inner-added')).toBeUndefined();
  });

  it('should ignore frame-shaped descendants until scene frame state is registered', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Deferred frame"></nve-scene>`);
    const pendingFrame = document.createElementNS('urn:nvidia-elements:test', 'nve-scene-frame');
    element.append(pendingFrame);
    expect(element.querySelectorAll('nve-scene-frame')).toHaveLength(1);

    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(2);

    expect(gpu.devices[0]?.submissions.length).toBeGreaterThan(0);
  });

  it('should apply camera keyboard, pointer, wheel, and touch sources without writing public inputs', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Camera controls"><nve-scene-camera behavior="orbit"></nve-scene-camera></nve-scene>
    `);
    gpu.resolveNextDevice();
    await element.ready;
    const canvas = element.shadowRoot?.querySelector('canvas');
    const camera = element.querySelector<SceneCamera>('nve-scene-camera');
    if (!canvas || !camera) throw new Error('Expected canvas and orbit camera.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));
    const sources: string[] = [];
    element.addEventListener('nve-scene-camera-change', event => sources.push((event as CustomEvent).detail.source));
    const initialTheta = camera.azimuth;
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    await waitForAnimationFrames(2);
    expect(camera.azimuth).toBeCloseTo(initialTheta + Math.PI / 36);
    canvas.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 100 }));
    await waitForAnimationFrames(2);
    expect(camera.distance).toBeCloseTo(12 * Math.exp(0.1));
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, buttons: 1, pointerId: 1, clientX: 10, clientY: 10 })
    );
    canvas.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        button: -1,
        buttons: 1,
        cancelable: true,
        pointerId: 1,
        clientX: 20,
        clientY: 10
      })
    );
    await waitForAnimationFrames(2);
    expect(camera.azimuth).toBeCloseTo(initialTheta + Math.PI / 36 - 0.05);
    canvas.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 20, clientY: 10 }));
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        buttons: 1,
        pointerId: 4,
        pointerType: 'touch',
        clientX: 10,
        clientY: 10
      })
    );
    canvas.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        button: -1,
        buttons: 1,
        cancelable: true,
        pointerId: 4,
        pointerType: 'touch',
        clientX: 20,
        clientY: 10
      })
    );
    canvas.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, pointerId: 4, pointerType: 'touch', clientX: 20, clientY: 10 })
    );
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        buttons: 1,
        pointerId: 2,
        pointerType: 'touch',
        clientX: 10,
        clientY: 10
      })
    );
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        buttons: 1,
        pointerId: 3,
        pointerType: 'touch',
        clientX: 20,
        clientY: 10
      })
    );
    canvas.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        button: -1,
        buttons: 1,
        cancelable: true,
        pointerId: 3,
        pointerType: 'touch',
        clientX: 30,
        clientY: 10
      })
    );
    await waitForAnimationFrames(2);
    expect(sources).toEqual(expect.arrayContaining(['keyboard', 'wheel', 'pointer', 'touch']));
    expect(camera.distance).toBeCloseTo((12 * Math.exp(0.1)) / 2);
    expect(element.getAttribute('camera-state')).toBeNull();
  });

  it('should retain the orbit pitch when a pointer drag would cross a pole', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Camera pole limit">
        <nve-scene-camera behavior="orbit" polar-angle="0.05"></nve-scene-camera>
      </nve-scene>
    `);
    gpu.resolveNextDevice();
    await element.ready;
    const canvas = element.shadowRoot?.querySelector('canvas');
    const camera = element.querySelector<SceneCamera>('nve-scene-camera');
    if (!canvas || !camera) throw new Error('Expected canvas and orbit camera.');

    canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientY: 20 }));
    canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientY: 0 }));
    await waitForAnimationFrames(2);

    expect(camera.polarAngle).toBe(0.05);
  });

  it('should pan the orbit camera with a right-button drag and suppress the canvas context menu', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Camera pan"><nve-scene-camera behavior="orbit"></nve-scene-camera></nve-scene>
    `);
    gpu.resolveNextDevice();
    await element.ready;
    const canvas = element.shadowRoot?.querySelector('canvas');
    const camera = element.querySelector<SceneCamera>('nve-scene-camera');
    if (!canvas || !camera) throw new Error('Expected canvas and orbit camera.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));
    const initial = { distance: camera.distance, target: [...camera.target] };
    const scale =
      (2 * initial.distance * Math.tan(camera.projection === 'perspective' ? camera.verticalFieldOfView / 2 : 0.5)) /
      100;
    const source: string[] = [];
    element.addEventListener('nve-scene-camera-change', event => source.push((event as CustomEvent).detail.source));

    const down = new PointerEvent('pointerdown', {
      bubbles: true,
      button: 2,
      buttons: 2,
      cancelable: true,
      clientX: 10,
      clientY: 10,
      pointerId: 1
    });
    const move = new PointerEvent('pointermove', {
      bubbles: true,
      button: -1,
      buttons: 2,
      cancelable: true,
      clientX: 30,
      clientY: 20,
      pointerId: 1
    });
    expect(canvas.dispatchEvent(down)).toBe(false);
    expect(canvas.dispatchEvent(move)).toBe(false);
    await waitForAnimationFrames(2);

    expect(camera.target[0]).toBeCloseTo(-20 * scale);
    expect(camera.target[1]).toBeCloseTo(10 * scale);
    expect(camera.distance).toBe(initial.distance);
    expect(source).toContain('pointer');

    canvas.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        button: 2,
        cancelable: true,
        clientX: 30,
        clientY: 20,
        pointerId: 1
      })
    );
    const verticalDown = new PointerEvent('pointerdown', {
      bubbles: true,
      button: 2,
      buttons: 2,
      cancelable: true,
      clientX: 30,
      clientY: 20,
      pointerId: 2,
      shiftKey: true
    });
    const verticalMove = new PointerEvent('pointermove', {
      bubbles: true,
      button: -1,
      buttons: 2,
      cancelable: true,
      clientX: 50,
      clientY: 30,
      pointerId: 2,
      shiftKey: true
    });
    expect(canvas.dispatchEvent(verticalDown)).toBe(false);
    expect(canvas.dispatchEvent(verticalMove)).toBe(false);
    await waitForAnimationFrames(2);
    expect(camera.target[0]).toBeCloseTo(-20 * scale);
    expect(camera.target[1]).toBeCloseTo(10 * scale);
    expect(camera.target[2]).toBeCloseTo(10 * scale);

    const verticalKey = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: 'ArrowUp',
      shiftKey: true
    });
    expect(element.dispatchEvent(verticalKey)).toBe(false);
    await waitForAnimationFrames(2);
    expect(camera.target[2]).toBeCloseTo(30 * scale);
    expect(
      element.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          ctrlKey: true,
          key: 'ArrowDown',
          shiftKey: true
        })
      )
    ).toBe(false);
    await waitForAnimationFrames(2);
    expect(camera.target[2]).toBeCloseTo(10 * scale);
    expect(source).toContain('keyboard');

    expect(
      canvas.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          button: 2,
          cancelable: true,
          clientX: 50,
          clientY: 30,
          pointerId: 2,
          shiftKey: true
        })
      )
    ).toBe(false);

    const contextMenu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    expect(canvas.dispatchEvent(contextMenu)).toBe(false);
  });

  it('should disable top camera orbit drag and apply ground-plane pointer and keyboard pans', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Top camera"><nve-scene-camera id="top" behavior="top" altitude="40" frustum-height="40"></nve-scene-camera></nve-scene>
    `);
    const top = element.querySelector<SceneCamera>('#top');
    if (!top) throw new Error('Expected top camera.');
    gpu.resolveNextDevice();
    await element.ready;
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!canvas) throw new Error('Expected canvas.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));
    expect(element.cameraState).toMatchObject({
      pose: { position: [0, 0, 40] },
      projection: { mode: 'orthographic', frustumHeight: 40, near: 0.01, far: 10_000 }
    });
    expect(
      canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10, pointerId: 1 }))
    ).toBe(true);
    expect(
      canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 20, clientY: 15, pointerId: 1 }))
    ).toBe(true);
    canvas.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 20, clientY: 15, pointerId: 1 }));
    await waitForAnimationFrames(2);
    expect(top.target).toEqual([0, 0, 0]);

    expect(
      canvas.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          button: 2,
          buttons: 2,
          cancelable: true,
          clientX: 10,
          clientY: 10,
          pointerId: 2
        })
      )
    ).toBe(false);
    expect(
      canvas.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          button: -1,
          buttons: 2,
          cancelable: true,
          clientX: 20,
          clientY: 15,
          pointerId: 2
        })
      )
    ).toBe(false);
    await waitForAnimationFrames(2);
    expect(top.target).toEqual([2, 4, 0]);
    expect(
      canvas.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          button: 2,
          cancelable: true,
          clientX: 20,
          clientY: 15,
          pointerId: 2
        })
      )
    ).toBe(false);
    expect(
      element.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowUp', shiftKey: true })
      )
    ).toBe(false);
    await waitForAnimationFrames(2);
    expect(top.target).toEqual([-6, 4, 0]);
    expect(
      element.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowDown', shiftKey: true })
      )
    ).toBe(false);
    await waitForAnimationFrames(2);
    expect(top.target).toEqual([2, 4, 0]);
    const key = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' });
    expect(element.dispatchEvent(key)).toBe(false);
    await waitForAnimationFrames(2);
    expect(top.target).toEqual([2, -4, 0]);
    for (const direction of ['ArrowRight', 'ArrowUp', 'ArrowDown']) {
      expect(
        element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: direction }))
      ).toBe(false);
      await waitForAnimationFrames(2);
    }
    expect(top.target).toEqual([2, 4, 0]);
    expect(
      element.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          ctrlKey: true,
          key: 'ArrowUp',
          shiftKey: true
        })
      )
    ).toBe(false);
    await waitForAnimationFrames(2);
    expect(top.target).toEqual([2, 4, 8]);
    top.altitude = 20;
    top.frustumHeight = 20;
    await waitForAnimationFrames(2);
    expect(element.cameraState).toMatchObject({
      pose: { position: [2, 4, 28] },
      projection: { frustumHeight: 20 }
    });
  });

  it('should preserve a followed target for Shift+Arrow and leave unhandled keys alone', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Follow orbit">
        <nve-scene-camera behavior="follow" frame="robot"></nve-scene-camera><nve-scene-camera behavior="orbit"></nve-scene-camera>
        <nve-scene-frame name="robot"></nve-scene-frame>
      </nve-scene>
    `);
    const frame = element.querySelector<HTMLElement>('nve-scene-frame');
    const orbit = element.querySelector<SceneCamera>('nve-scene-camera[behavior="orbit"]');
    if (!frame || !orbit) throw new Error('Expected frame and orbit camera.');
    Reflect.get(frame, 'setPose').call(frame, { position: [3, 4, 0], orientation: [0, 0, 0, 1] });
    gpu.resolveNextDevice();
    await element.ready;
    const before = { distance: orbit.distance, polarAngle: orbit.polarAngle };
    const shift = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft', shiftKey: true });
    expect(element.dispatchEvent(shift)).toBe(true);
    const vertical = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: 'ArrowUp',
      shiftKey: true
    });
    expect(element.dispatchEvent(vertical)).toBe(true);
    const unhandled = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'x' });
    expect(element.dispatchEvent(unhandled)).toBe(true);
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: '-' }));
    await waitForAnimationFrames(2);
    expect(orbit.target).toEqual([0, 0, 0]);
    expect(orbit.polarAngle).toBeCloseTo(before.polarAngle - Math.PI / 36);
    expect(orbit.distance).toBeCloseTo(before.distance * 1.1);
  });

  it('should resolve authoritative camera properties and preserve user changes across frames', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Declarative camera">
        <nve-scene-camera
          behavior="orbit"
          distance="20"
          polar-angle="0.5"
          azimuth="0"
          min-distance="2"
          max-distance="40"
        ></nve-scene-camera>
      </nve-scene>
    `);
    const camera = element.querySelector<SceneCamera>('nve-scene-camera');
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!camera || !canvas) throw new Error('Expected canvas and orbit camera.');
    gpu.resolveNextDevice();
    await element.ready;
    expect(camera).toMatchObject({ distance: 20, polarAngle: 0.5, azimuth: 0 });
    expect(element.cameraState).toMatchObject({
      pose: { position: [expect.closeTo(9.588511), 0, expect.closeTo(17.551651)] },
      projection: { mode: 'perspective', near: 0.01, far: 10_000 }
    });

    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    await waitForAnimationFrames(2);
    expect(camera.azimuth).toBeCloseTo(Math.PI / 36);
    await waitForAnimationFrames(2);
    expect(camera.azimuth).toBeCloseTo(Math.PI / 36);

    camera.distance = 6;
    await waitForAnimationFrames(2);
    expect(camera).toMatchObject({ distance: 6, polarAngle: 0.5, azimuth: Math.PI / 36 });

    camera.target = [1, 2, 3];
    camera.heading = 0.5;
    camera.distance = 7;
    camera.polarAngle = 0.75;
    camera.azimuth = 0.25;
    camera.projection = 'orthographic';
    camera.frustumHeight = 6;
    await waitForAnimationFrames(4);
    expect(camera).toMatchObject({
      target: [1, 2, 3],
      heading: 0.5,
      distance: 7,
      polarAngle: 0.75,
      azimuth: 0.25
    });
    expect(element.cameraState.projection).toEqual({
      mode: 'orthographic',
      frustumHeight: 6,
      near: 0.01,
      far: 10_000
    });

    canvas.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -100 }));
    await waitForAnimationFrames(2);
    expect(camera.distance).toBeCloseTo(7 * Math.exp(-0.1));
    expect(camera.frustumHeight).toBeCloseTo(6 * Math.exp(-0.1));

    camera.distance = 8;
    camera.azimuth = 0.5;
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    await waitForAnimationFrames(2);
    expect(camera.distance).toBe(8);
    expect(camera.azimuth).toBeCloseTo(0.5 + Math.PI / 36);
  });

  it('should keep the fallback camera static and leave camera input unconsumed', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Static fallback camera"></nve-scene>`);
    gpu.resolveNextDevice();
    await element.ready;
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!canvas) throw new Error('Expected canvas.');
    const initial = element.cameraState;

    const key = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft', shiftKey: true });
    expect(element.dispatchEvent(key)).toBe(true);
    const wheel = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 10 });
    expect(canvas.dispatchEvent(wheel)).toBe(true);
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, buttons: 1, clientX: 0, clientY: 0, pointerId: 1 })
    );
    const drag = new PointerEvent('pointermove', {
      bubbles: true,
      buttons: 1,
      cancelable: true,
      clientX: 20,
      clientY: 10,
      pointerId: 1
    });
    expect(canvas.dispatchEvent(drag)).toBe(true);
    canvas.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, buttons: 0, clientX: 20, clientY: 10, pointerId: 1 })
    );
    await waitForAnimationFrames(2);
    expect(element.cameraState).toEqual(initial);
  });

  it('should handle orbit wheel units and incomplete pointer gestures without consuming them', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Orbit camera input"><nve-scene-camera behavior="orbit"></nve-scene-camera></nve-scene>
    `);
    gpu.resolveNextDevice();
    await element.ready;
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!canvas) throw new Error('Expected canvas.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));

    const initial = element.cameraState;
    const shiftPan = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'ArrowLeft',
      shiftKey: true
    });
    expect(element.dispatchEvent(shiftPan)).toBe(false);
    await waitForAnimationFrames(2);
    expect(element.cameraState.pose.position).not.toEqual(initial.pose.position);

    const lineWheel = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 1,
      deltaMode: WheelEvent.DOM_DELTA_LINE
    });
    expect(canvas.dispatchEvent(lineWheel)).toBe(false);
    await waitForAnimationFrames(2);
    expect(element.cameraState.pose.position[2]).toBeCloseTo(initial.pose.position[2] * Math.exp(0.016));
    const pageWheel = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 1,
      deltaMode: WheelEvent.DOM_DELTA_PAGE
    });
    expect(canvas.dispatchEvent(pageWheel)).toBe(false);
    await waitForAnimationFrames(2);
    expect(element.cameraState.pose.position[2]).toBeCloseTo(initial.pose.position[2] * Math.exp(0.116));

    const unknownMove = new PointerEvent('pointermove', {
      bubbles: true,
      cancelable: true,
      pointerId: 9,
      clientX: 1,
      clientY: 1
    });
    expect(canvas.dispatchEvent(unknownMove)).toBe(true);
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 10, clientY: 10 })
    );
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerId: 2, pointerType: 'touch', clientX: 10, clientY: 10 })
    );
    const degeneratePinch = new PointerEvent('pointermove', {
      bubbles: true,
      cancelable: true,
      pointerId: 2,
      pointerType: 'touch',
      clientX: 10,
      clientY: 10
    });
    expect(canvas.dispatchEvent(degeneratePinch)).toBe(true);
    canvas.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 1 }));
    const zeroMove = new PointerEvent('pointermove', {
      bubbles: true,
      cancelable: true,
      pointerId: 2,
      pointerType: 'touch',
      clientX: 10,
      clientY: 10
    });
    expect(canvas.dispatchEvent(zeroMove)).toBe(true);
    canvas.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 2, clientX: 10, clientY: 10 }));
  });

  async function createScene(template: ReturnType<typeof html>): Promise<{ fixture: HTMLElement; element: Scene }> {
    const fixture = await createFixture(template);
    fixtures.push(fixture);
    const element = required(fixture.querySelector<Scene>(Scene.metadata.tag), 'Expected scene fixture.');
    await elementIsStable(element);
    return { fixture, element };
  }
});

interface FakeDevice extends SceneGPUDevice {
  readonly draws: Array<{ indexed?: boolean; vertexCount?: number }>;
  readonly renderPasses: unknown[];
  readonly submissions: unknown[][];
  lose(info: SceneGPUDeviceLostInfo): void;
}

function configureFakeWebGPU(
  options: {
    createMutationObserver?: ScenePlatform['createMutationObserver'];
    createResizeObserver?: ScenePlatform['createResizeObserver'];
    cancelAnimationFrame?: ScenePlatform['cancelAnimationFrame'];
    devicePixelRatio?: number;
    failCanvasContextAt?: number;
    now?: ScenePlatform['now'];
    requestAnimationFrame?: ScenePlatform['requestAnimationFrame'];
    yieldForPreparation?: ScenePlatform['yieldForPreparation'];
  } = {}
): {
  readonly contexts: SceneGPUCanvasContext[];
  readonly devices: FakeDevice[];
  resolveNextDevice(): void;
} {
  const contexts: SceneGPUCanvasContext[] = [];
  const devices: FakeDevice[] = [];
  const pendingDevices: Array<(device: SceneGPUDevice) => void> = [];
  configureSceneTesting({
    requestAdapter: async () => ({
      requestDevice: () => new Promise(resolve => pendingDevices.push(resolve))
    }),
    getPreferredCanvasFormat: () => 'bgra8unorm',
    getCanvasContext: () => {
      if (options.failCanvasContextAt === contexts.length + 1) return null;
      const context = createFakeContext();
      contexts.push(context);
      return context;
    },
    createMutationObserver: options.createMutationObserver ?? (callback => new MutationObserver(callback)),
    createResizeObserver: options.createResizeObserver ?? (callback => new ResizeObserver(callback)),
    cancelAnimationFrame: options.cancelAnimationFrame ?? (handle => globalThis.cancelAnimationFrame(handle)),
    getDevicePixelRatio: () => options.devicePixelRatio ?? 1,
    requestAnimationFrame: options.requestAnimationFrame ?? (callback => globalThis.requestAnimationFrame(callback)),
    ...(options.yieldForPreparation ? { yieldForPreparation: options.yieldForPreparation } : {}),
    ...(options.now ? { now: options.now } : {})
  });

  return {
    contexts,
    devices,
    resolveNextDevice() {
      const resolve = pendingDevices.shift();
      if (!resolve) {
        throw new Error('No Scene device request is pending.');
      }
      const device = createFakeDevice();
      devices.push(device);
      resolve(device);
    }
  };
}

function createFakeContext(): SceneGPUCanvasContext {
  return {
    configure: () => undefined,
    unconfigure: () => undefined,
    getCurrentTexture: () => ({ createView: () => ({}) })
  };
}

function createFakeDevice(): FakeDevice {
  let resolveLoss: (info: SceneGPUDeviceLostInfo) => void = () => undefined;
  const draws: Array<{ indexed?: boolean; vertexCount?: number }> = [];
  const renderPasses: unknown[] = [];
  const submissions: unknown[][] = [];
  return {
    lost: new Promise(resolve => (resolveLoss = resolve)),
    queue: {
      copyExternalImageToTexture: () => undefined,
      submit: commandBuffers => submissions.push([...commandBuffers]),
      writeBuffer: () => undefined,
      writeTexture: () => undefined
    },
    createBindGroup: () => ({}),
    createBuffer: () => ({ destroy: () => undefined }),
    createCommandEncoder: () => ({
      beginRenderPass: descriptor => {
        renderPasses.push(descriptor);
        return {
          draw: (vertexCount: number) => draws.push({ vertexCount }),
          drawIndexed: () => draws.push({ indexed: true }),
          end: () => undefined,
          setBindGroup: () => undefined,
          setIndexBuffer: () => undefined,
          setPipeline: () => undefined,
          setVertexBuffer: () => undefined
        };
      },
      finish: () => ({})
    }),
    createRenderPipeline: () => ({ getBindGroupLayout: () => ({}) }),
    createSampler: () => ({}),
    createShaderModule: () => ({}),
    createTexture: () => ({ createView: () => ({}), destroy: () => undefined }),
    destroy: () => undefined,
    pushErrorScope: () => undefined,
    popErrorScope: () => Promise.resolve(null),
    draws,
    renderPasses,
    submissions,
    lose: info => resolveLoss(info)
  };
}

function appendSlottedParagraph(element: Scene, options: { slot: string; id: string; text: string }): HTMLElement {
  const paragraph = document.createElement('p');
  paragraph.id = options.id;
  paragraph.slot = options.slot;
  paragraph.setAttribute('nve-text', 'body');
  paragraph.textContent = options.text;
  element.append(paragraph);
  return paragraph;
}

function createManualMutationObserver(): MutationObserver {
  return {
    disconnect: () => undefined,
    observe: () => undefined,
    takeRecords: () => []
  } as MutationObserver;
}

function notifyMutation(callback: MutationCallback | undefined, records: MutationRecord[]): void {
  callback?.(records, createManualMutationObserver());
}

function createManualResizeObserver(): ResizeObserver {
  return {
    disconnect: () => undefined,
    observe: () => undefined,
    unobserve: () => undefined
  };
}

function createMutationRecord(options: {
  attributeName?: string;
  target: Node;
  type: MutationRecordType;
}): MutationRecord {
  return {
    addedNodes: [] as unknown as NodeList,
    attributeName: options.attributeName ?? null,
    attributeNamespace: null,
    nextSibling: null,
    oldValue: null,
    previousSibling: null,
    removedNodes: [] as unknown as NodeList,
    target: options.target,
    type: options.type
  } as MutationRecord;
}

function createChildListMutation(target: Node, addedNodes: Node[]): MutationRecord {
  return {
    addedNodes: addedNodes as unknown as NodeList,
    attributeName: null,
    attributeNamespace: null,
    nextSibling: null,
    oldValue: null,
    previousSibling: null,
    removedNodes: [] as unknown as NodeList,
    target,
    type: 'childList'
  } as MutationRecord;
}

function createModel(id: string, shape: ScenePart['shape']): SceneModel {
  const model = document.createElement(SceneModel.metadata.tag) as SceneModel;
  const part = document.createElement(ScenePart.metadata.tag) as ScenePart;
  model.id = id;
  part.shape = shape;
  model.append(part);
  return model;
}

function setMarkerBytes(layer: HTMLElement): void {
  const bytes = new Uint8Array(MARKER.stride);
  writeMarker(bytes, 0, { position: [0, 0, 0] });
  const source = createMarkerSource({ bytes, count: 1 });
  Reflect.set(layer, 'source', source);
}

function setStreamBytes(layer: HTMLElement, count: number): void {
  const layout =
    layer.localName === 'nve-scene-triangles'
      ? TRIANGLE_VERTEX
      : layer.localName === 'nve-scene-lines'
        ? LINE_VERTEX
        : POINT;
  const bytes = new Uint8Array(layout.stride * count);
  for (let index = 0; index < count; index += 1) {
    writeStreamRecord(bytes, layer.localName, index);
  }
  const source =
    layer.localName === 'nve-scene-triangles'
      ? createTriangleVertexSource({ bytes, count })
      : layer.localName === 'nve-scene-lines'
        ? createLineVertexSource({ bytes, count })
        : createPointSource({ bytes, count });
  Reflect.set(layer, 'source', source);
}

function writeStreamRecord(bytes: Uint8Array, name: string, index: number): void {
  if (name === 'nve-scene-triangles') {
    writeTriangleVertex(bytes, index, { position: [0, 0, 0] });
    return;
  }
  if (name === 'nve-scene-lines') {
    writeLineVertex(bytes, index, { position: [index, 0, 0] });
    return;
  }
  writePoint(bytes, index, { position: [0, 0, 0] });
}

function renderedItems(render: { mock: { calls: readonly unknown[][] } }, start = 0): SceneRenderItem[] {
  return render.mock.calls.slice(start).flatMap(call => {
    const items = call[0];
    return Array.isArray(items) ? (items as SceneRenderItem[]) : [];
  });
}

async function waitForAnimationFrames(count: number): Promise<void> {
  for (let frame = 0; frame < count; frame += 1) {
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }
}

class ManualAnimationFrames {
  #callbacks = new Map<number, FrameRequestCallback>();
  #nextHandle = 1;

  get pendingCount(): number {
    return this.#callbacks.size;
  }

  request(callback: FrameRequestCallback): number {
    const handle = this.#nextHandle;
    this.#nextHandle += 1;
    this.#callbacks.set(handle, callback);
    return handle;
  }

  cancel(handle: number): void {
    this.#callbacks.delete(handle);
  }

  flush(): void {
    const callbacks = [...this.#callbacks.values()];
    this.#callbacks.clear();
    callbacks.forEach(callback => callback(performance.now()));
  }
}

async function drainSceneTicks(animation: ManualAnimationFrames, scene: Scene): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await Promise.resolve();
    await scene.updateComplete;
    if (animation.pendingCount === 0) {
      await Promise.resolve();
      if (animation.pendingCount === 0) return;
    }
    animation.flush();
  }
  throw new Error('Scene did not park within the expected number of animation frames.');
}
