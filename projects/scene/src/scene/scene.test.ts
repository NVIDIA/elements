// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { sceneCameraController, type SceneCamera } from '../camera/camera.js';
import { LINE_VERTEX, MARKER, POINT, TRI_VERTEX } from '../internal/layouts/built-ins.js';
import { writeLineVertex, writeMarker, writePoint, writeTriVertex } from '../internal/layouts/helpers.js';
import { takeHeightfieldLayerRenderData } from '../internal/heightfield-layer-state.js';
import { takeModelLayerRenderData } from '../internal/model-layer-state.js';
import { type ScenePickResult } from './pick/routing.js';
import { SceneRenderer, type SceneRenderItem } from './rendering/renderer.js';
import { SceneModel } from '../model/model.js';
import { ScenePart } from '../model/part.js';
import {
  configureSceneLabelTesting,
  configureSceneTesting,
  getNamedSceneFrameForTesting,
  getSceneMeshUploadSnapshotForTesting,
  getSceneTestingSnapshot,
  resetSceneTesting,
  setScenePickDriverForTesting,
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
import '../label/define.js';
import '../marker/define.js';
import '../mesh/define.js';
import '../model/define.js';
import '../points/define.js';
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

    element.setAttribute('stale-after', '250');
    await elementIsStable(element);
    expect(element.staleAfter).toBe(250);
    element.removeAttribute('stale-after');
    await elementIsStable(element);
    expect(element.staleAfter).toBe(1_000);

    await waitForAnimationFrames(3);
    const idleSubmissions = gpu.devices[0]?.submissions.length;
    await waitForAnimationFrames(3);
    expect(gpu.devices[0]?.submissions).toHaveLength(idleSubmissions ?? 0);
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
    `);
    fixtures.push(fixture);
    const scenes = [...fixture.querySelectorAll<Scene>(Scene.metadata.tag)];
    await Promise.all(scenes.map(elementIsStable));

    gpu.resolveNextDevice();
    await Promise.all(scenes.map(scene => scene.ready));

    expect(getSceneTestingSnapshot().requestDeviceCount).toBe(1);
    expect(gpu.contexts).toHaveLength(2);
    expect(scenes.map(scene => globalThis.getComputedStyle(scene).backgroundColor)).toEqual([
      'rgb(255, 0, 0)',
      'rgb(0, 0, 255)'
    ]);
    expect(gpu.devices[0]?.renderPasses).toEqual([
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
    const triangles = element.querySelector<HTMLElement>('#triangles');
    const cubes = element.querySelector<HTMLElement>('#cubes');
    const points = element.querySelector<HTMLElement>('#points');
    const lines = element.querySelector<HTMLElement>('#lines');
    setStreamBytes(triangles, 3, 'vertices');
    setMarkerBytes(cubes);
    setStreamBytes(points, 1, 'instances');
    setStreamBytes(lines, 3, 'vertices');

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
    Reflect.set(identity, 'positions', meshTriangle);
    Reflect.set(instanced, 'positions', meshTriangle);
    Reflect.set(instanced, 'count', 0);
    Reflect.set(invalid, 'positions', new Float32Array(6));

    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(4);
    const initialDraws = gpu.devices[0]?.draws.length ?? 0;
    expect(initialDraws).toBeGreaterThan(0);

    identity.hidden = true;
    Reflect.set(identity, 'positions', new Float32Array([0, 0, 0, 2, 0, 0, 0, 2, 0]));
    await waitForAnimationFrames(2);
    identity.hidden = false;
    await waitForAnimationFrames(2);
    expect(gpu.devices[0]?.draws.length).toBeGreaterThan(initialDraws);

    instanced.remove();
    await waitForAnimationFrames(2);
    expect(gpu.devices[0]?.draws.length).toBeGreaterThan(initialDraws);
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
    const frame = outer.querySelector<HTMLElement>('#terrain-frame');
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
    expect(initialData.positions).toHaveLength(12);
    expect(getSceneMeshUploadSnapshotForTesting(outer)).toEqual({ rebuilds: 1, uploads: 0 });
    expect(getSceneMeshUploadSnapshotForTesting(inner)).toEqual({ rebuilds: 1, uploads: 0 });

    // The heightfield is a mesh render item at frame-local identity; Scene
    // supplies the ancestor frame matrix rather than altering terrain data.
    const expectedFrameMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 3, 4, 1]);
    expect(frame.getWorldMatrix()).toEqual(expectedFrameMatrix);
    expect(terrainItem).toMatchObject({
      data: { identityInstance: true },
      frameMatrix: expectedFrameMatrix,
      instances: undefined,
      layer: terrain,
      type: 'mesh'
    });

    let callCount = render.mock.calls.length;
    terrain.hidden = true;
    await waitForAnimationFrames(2);
    expect(getSceneMeshUploadSnapshotForTesting(outer)).toEqual({ rebuilds: 1, uploads: 0 });
    expect(takeHeightfieldLayerRenderData(terrain).positions).toBe(initialData.positions);
    expect(renderedItems(render, callCount).some(item => item.layer === terrain)).toBe(false);

    callCount = render.mock.calls.length;
    terrain.hidden = false;
    frame.hidden = true;
    await waitForAnimationFrames(2);
    expect(getSceneMeshUploadSnapshotForTesting(outer)).toEqual({ rebuilds: 1, uploads: 0 });
    expect(takeHeightfieldLayerRenderData(terrain).positions).toBe(initialData.positions);
    expect(renderedItems(render, callCount).some(item => item.layer === terrain)).toBe(false);

    frame.hidden = false;
    await waitForAnimationFrames(2);
    expect(getSceneMeshUploadSnapshotForTesting(outer)).toEqual({ rebuilds: 2, uploads: 0 });
    expect(getSceneMeshUploadSnapshotForTesting(inner)).toEqual({ rebuilds: 1, uploads: 0 });
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
    const frame = outer.querySelector<HTMLElement>('#model-frame');
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
      frameMatrix: expectedFrameMatrix,
      instances: { count: 0 },
      layer: identity,
      type: 'mesh'
    });
    expect(instancedItem).toMatchObject({
      data: { identityInstance: false },
      frameMatrix: expectedFrameMatrix,
      instances: { count: 1 },
      layer: instanced,
      type: 'mesh'
    });
    expect(takeModelLayerRenderData(identity).positions?.length).toBeGreaterThan(0);
    expect(getSceneMeshUploadSnapshotForTesting(outer)).toEqual({ rebuilds: 2, uploads: 0 });
    expect(getSceneMeshUploadSnapshotForTesting(inner)).toEqual({ rebuilds: 1, uploads: 0 });

    const identityPart = identity.querySelector<HTMLElement>(ScenePart.metadata.tag);
    if (!identityPart) throw new Error('Expected a declarative model part.');
    identityPart.setAttribute('position', '[1,0,0]');
    await waitForAnimationFrames(2);
    expect(getSceneMeshUploadSnapshotForTesting(outer)).toEqual({ rebuilds: 3, uploads: 0 });

    Reflect.set(identity, 'parts', [{ shape: 'cube', position: [1, 0, 0] }]);
    await waitForAnimationFrames(2);
    expect(Reflect.get(identity, 'parts')).not.toBeNull();
    expect(getSceneMeshUploadSnapshotForTesting(outer)).toEqual({ rebuilds: 4, uploads: 0 });

    let callCount = render.mock.calls.length;
    identity.hidden = true;
    await waitForAnimationFrames(2);
    expect(renderedItems(render, callCount).some(item => item.layer === identity)).toBe(false);
    expect(getSceneMeshUploadSnapshotForTesting(outer)).toEqual({ rebuilds: 4, uploads: 0 });

    callCount = render.mock.calls.length;
    identity.hidden = false;
    frame.hidden = true;
    await waitForAnimationFrames(2);
    expect(renderedItems(render, callCount).some(item => item.layer === identity || item.layer === instanced)).toBe(
      false
    );
    expect(getSceneMeshUploadSnapshotForTesting(outer)).toEqual({ rebuilds: 4, uploads: 0 });

    marker.setAttribute('position', '[3,0,0]');
    await waitForAnimationFrames(2);
    expect(getSceneMeshUploadSnapshotForTesting(outer)).toEqual({ rebuilds: 4, uploads: 0 });

    frame.hidden = false;
    await waitForAnimationFrames(2);
    expect(getSceneMeshUploadSnapshotForTesting(outer)).toEqual({ rebuilds: 6, uploads: 0 });
    expect(getSceneMeshUploadSnapshotForTesting(inner)).toEqual({ rebuilds: 1, uploads: 0 });
    expect(
      renderedItems(render)
        .filter(item => item.layer === instanced)
        .at(-1)
    ).toMatchObject({ instances: { uploadRanges: [expect.anything()] } });
  });

  it('should assign only direct fallback children across nested scene boundaries', async () => {
    const gpu = configureFakeWebGPU();
    const { fixture } = await createScene(html`<nve-scene id="outer" aria-label="Outer scene"></nve-scene>`);
    const outer = fixture.querySelector<Scene>('#outer');
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

  it('should order synthetic pointer results, dispatch a single routed click, and keep programmatic picks silent', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Pick scene"><nve-scene-cubes><nve-scene-marker tabindex="0"></nve-scene-marker></nve-scene-cubes></nve-scene>
    `);
    const marker = element.querySelector<HTMLElement>('nve-scene-marker');
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!marker || !canvas) throw new Error('Expected a marker and canvas.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    const pending: Array<(hit: ScenePickResult | null) => void> = [];
    setScenePickDriverForTesting(element, () => new Promise(resolve => pending.push(resolve)));
    gpu.resolveNextDevice();
    await element.ready;

    const events: string[] = [];
    element.addEventListener('pointerdown', event => events.push(`down:${event.target === marker}`));
    element.addEventListener('click', event => events.push(`click:${event.target === marker}`));
    let pickEvents = 0;
    element.addEventListener('nve-scene-pick', () => (pickEvents += 1));
    const programmatic = element.pick(20, 20);
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    pending.shift()?.({
      layer: marker.parentElement as HTMLElement,
      marker,
      instanceIndex: 0,
      worldPosition: [1, 2, 3]
    });
    await expect(programmatic).resolves.toMatchObject({ element: marker, instanceIndex: 0, worldPosition: [1, 2, 3] });
    expect(events).toEqual([]);

    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true, clientX: 10, clientY: 10, pointerId: 4 })
    );
    canvas.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 15, clientY: 15, pointerId: 5 })
    );
    canvas.dispatchEvent(
      new PointerEvent('click', { bubbles: true, composed: true, clientX: 10, clientY: 10, pointerId: 4 })
    );
    await vi.waitFor(() => expect(pending).toHaveLength(3));
    const hit: ScenePickResult = {
      layer: marker.parentElement as HTMLElement,
      marker,
      instanceIndex: 0,
      worldPosition: [1, 2, 3]
    };
    pending.pop()?.(hit);
    await Promise.resolve();
    expect(events).toEqual([]);
    pending.shift()?.(hit);
    pending.shift()?.(hit);
    await vi.waitFor(() => expect(events).toEqual(['down:true', 'click:true']));
    expect(pickEvents).toBe(0);
  });

  it('should stop canvas bubbles at the shadow boundary while routing one synthetic ancestor click', async () => {
    const gpu = configureFakeWebGPU();
    const { fixture, element } = await createScene(html`
      <div id="ancestor"><nve-scene aria-label="Pick scene"><nve-scene-cubes><nve-scene-marker></nve-scene-marker></nve-scene-cubes></nve-scene></div>
    `);
    const ancestor = fixture.querySelector<HTMLElement>('#ancestor');
    const marker = element.querySelector<HTMLElement>('nve-scene-marker');
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!ancestor || !marker || !canvas) throw new Error('Expected scene interaction targets.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    setScenePickDriverForTesting(element, () =>
      Promise.resolve({
        layer: marker.parentElement as HTMLElement,
        marker,
        instanceIndex: 0,
        worldPosition: [0, 0, 0]
      })
    );
    gpu.resolveNextDevice();
    await element.ready;

    const captures: EventTarget[] = [];
    const bubbles: EventTarget[] = [];
    ancestor.addEventListener(
      'click',
      event => {
        if (event.target) captures.push(event.target);
      },
      true
    );
    ancestor.addEventListener('click', event => {
      if (event.target) bubbles.push(event.target);
    });
    canvas.dispatchEvent(new PointerEvent('click', { bubbles: true, composed: true, clientX: 10, clientY: 10 }));

    await vi.waitFor(() => expect(bubbles).toEqual([marker]));
    // DOM capture reaches light-DOM ancestors before a shadow-canvas listener can stop the original event.
    expect(captures).toEqual([element, marker]);
  });

  it('should discard stale hover results and expose buffer authored hover events', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(
      html`<nve-scene aria-label="Pick scene"><nve-scene-cubes></nve-scene-cubes></nve-scene>`
    );
    const layer = element.querySelector<HTMLElement>('nve-scene-cubes');
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!layer || !canvas) throw new Error('Expected a layer and canvas.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    const pending: Array<(hit: ScenePickResult | null) => void> = [];
    setScenePickDriverForTesting(element, () => new Promise(resolve => pending.push(resolve)));
    gpu.resolveNextDevice();
    await element.ready;
    const events: string[] = [];
    layer.addEventListener('nve-scene-pickenter', () => events.push('enter'));
    layer.addEventListener('nve-scene-pickleave', () => events.push('leave'));

    canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 20, clientY: 20 }));
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending.shift()?.({ layer, instanceIndex: 2, worldPosition: [0, 0, 0] });
    await Promise.resolve();
    expect(events).toEqual([]);
    pending.shift()?.({ layer, instanceIndex: 2, worldPosition: [0, 0, 0] });
    await vi.waitFor(() => expect(events).toEqual(['enter']));
  });

  it('should discard stale hover source events and cross buffer instances in one layer', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(
      html`<nve-scene aria-label="Pick scene"><nve-scene-cubes></nve-scene-cubes></nve-scene>`
    );
    const layer = element.querySelector<HTMLElement>('nve-scene-cubes');
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!layer || !canvas) throw new Error('Expected a layer and canvas.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    const pending: Array<(hit: ScenePickResult | null) => void> = [];
    setScenePickDriverForTesting(element, () => new Promise(resolve => pending.push(resolve)));
    gpu.resolveNextDevice();
    await element.ready;
    const events: string[] = [];
    layer.addEventListener('nve-scene-pickenter', event =>
      events.push(`enter:${(event as CustomEvent<ScenePickResult>).detail.instanceIndex}`)
    );
    layer.addEventListener('nve-scene-pickleave', event =>
      events.push(`leave:${(event as CustomEvent<ScenePickResult>).detail.instanceIndex}`)
    );

    canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 1, clientY: 1 }));
    canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 2, clientY: 2 }));
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending[0]?.({ layer, instanceIndex: 0, worldPosition: [0, 0, 0] });
    await Promise.resolve();
    expect(events).toEqual([]);
    pending[1]?.({ layer, instanceIndex: 0, worldPosition: [0, 0, 0] });
    await vi.waitFor(() => expect(events).toEqual(['enter:0']));

    canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 3, clientY: 3 }));
    await vi.waitFor(() => expect(pending).toHaveLength(3));
    pending[2]?.({ layer, instanceIndex: 1, worldPosition: [0, 0, 0] });
    await vi.waitFor(() => expect(events).toEqual(['enter:0', 'leave:0', 'enter:1']));
  });

  it('should reject in-flight picks with the scene cycle error after disconnect or device loss', async () => {
    const gpu = configureFakeWebGPU();
    const { fixture, element } = await createScene(html`<nve-scene aria-label="Pick scene"></nve-scene>`);
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!canvas) throw new Error('Expected a canvas.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    const pending: Array<(hit: ScenePickResult | null) => void> = [];
    setScenePickDriverForTesting(element, () => new Promise(resolve => pending.push(resolve)));
    gpu.resolveNextDevice();
    await element.ready;

    const disconnected = element.pick(1, 1);
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    element.remove();
    pending[0]?.(null);
    await expect(disconnected).rejects.toMatchObject({ name: 'AbortError' });

    fixture.append(element);
    await elementIsStable(element);
    await element.ready;
    const lost = element.pick(1, 1);
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    gpu.devices[0]?.lose({ message: 'pick loss', reason: 'unknown' });
    pending[1]?.(null);
    await expect(lost).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('should activate a named focusable marker with Enter and Space without GPU readback', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Keyboard pick scene"><nve-scene-cubes><nve-scene-marker tabindex="0" aria-label="Select cube"></nve-scene-marker></nve-scene-cubes></nve-scene>
    `);
    const marker = element.querySelector<HTMLElement>('nve-scene-marker');
    if (!marker) throw new Error('Expected a marker.');
    gpu.resolveNextDevice();
    await element.ready;
    const clicks: PointerEvent[] = [];
    marker.addEventListener('click', event => clicks.push(event as PointerEvent));

    marker.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
    marker.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));

    expect(clicks).toHaveLength(2);
    expect(clicks.every(event => !event.isTrusted && event.bubbles && event.composed && event.cancelable)).toBe(true);
  });

  it('should route buffer clicks and misses exactly once, including the custom pick detail', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(
      html`<nve-scene aria-label="Pick scene"><nve-scene-cubes></nve-scene-cubes></nve-scene>`
    );
    const layer = element.querySelector<HTMLElement>('nve-scene-cubes');
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!layer || !canvas) throw new Error('Expected a layer and canvas.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    const pending: Array<(hit: ScenePickResult | null) => void> = [];
    setScenePickDriverForTesting(element, () => new Promise(resolve => pending.push(resolve)));
    gpu.resolveNextDevice();
    await element.ready;

    const events: string[] = [];
    let detail: CustomEvent<unknown> | undefined;
    element.addEventListener('click', event => events.push(event.target === layer ? 'layer' : 'scene'));
    layer.addEventListener('nve-scene-pick', event => {
      events.push('pick');
      detail = event as CustomEvent<unknown>;
    });
    canvas.dispatchEvent(new PointerEvent('click', { bubbles: true, composed: true, clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new PointerEvent('click', { bubbles: true, composed: true, clientX: 20, clientY: 20 }));
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending[0]?.({ layer, instanceIndex: 4, worldPosition: [4, 5, 6] });
    pending[1]?.(null);
    await vi.waitFor(() => expect(events).toEqual(['layer', 'pick', 'scene']));
    expect(detail?.bubbles).toBe(true);
    expect(detail?.composed).toBe(true);
    expect(detail?.cancelable).toBe(false);
    expect(detail?.detail).toMatchObject({ element: layer, instanceIndex: 4, worldPosition: [4, 5, 6] });
  });

  it('should dispatch marker hover crossings and pointer metadata, and ignore rejected picks', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Hover scene">
        <nve-scene-cubes><nve-scene-marker tabindex="0"></nve-scene-marker></nve-scene-cubes>
      </nve-scene>
    `);
    const layer = element.querySelector<HTMLElement>('nve-scene-cubes');
    const marker = element.querySelector<HTMLElement>('nve-scene-marker');
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!layer || !marker || !canvas) throw new Error('Expected hover targets.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    const pending: Array<{ resolve: (hit: ScenePickResult | null) => void; reject: (reason: unknown) => void }> = [];
    setScenePickDriverForTesting(
      element,
      () =>
        new Promise((resolve, reject) => {
          pending.push({ reject, resolve });
        })
    );
    gpu.resolveNextDevice();
    await element.ready;
    const events: string[] = [];
    marker.addEventListener('pointerenter', event => {
      events.push(`enter:${event.pointerId}:${event.clientX}:${event.buttons}`);
    });
    marker.addEventListener('pointerleave', () => events.push('leave'));

    canvas.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        composed: true,
        clientX: 4,
        clientY: 5,
        pointerId: 9,
        buttons: 1
      })
    );
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    pending[0]?.resolve({ layer, marker, instanceIndex: 0, worldPosition: [0, 0, 0] });
    await vi.waitFor(() => expect(events).toEqual(['enter:9:4:1']));

    canvas.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 7, clientY: 8, pointerId: 10 })
    );
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending[1]?.resolve({ layer, instanceIndex: 0, worldPosition: [0, 0, 0] });
    await vi.waitFor(() => expect(events).toEqual(['enter:9:4:1', 'leave']));

    canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 10, clientY: 10 }));
    await vi.waitFor(() => expect(pending).toHaveLength(3));
    pending[2]?.reject(new Error('readback failed'));
    await Promise.resolve();
    expect(events).toEqual(['enter:9:4:1', 'leave']);
  });

  it('should validate pick coordinates and reject disconnected calls', async () => {
    const scene = new Scene();
    expect(() => scene.pick(Number.NaN, 0)).toThrow(RangeError);
    expect(() => scene.pick(0, Number.POSITIVE_INFINITY)).toThrow(RangeError);
    await expect(scene.pick(0, 0)).rejects.toMatchObject({ name: 'InvalidStateError' });
  });

  it('should resolve follow camera state for scrubbed named frame poses without a change event', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Follow camera">
        <nve-scene-camera behavior="follow" frame="robot" mode="pose"></nve-scene-camera>
        <nve-scene-frame name="robot"></nve-scene-frame>
      </nve-scene>
    `);
    const frame = element.querySelector<HTMLElement>('nve-scene-frame');
    if (!frame) throw new Error('Expected frame.');
    Reflect.get(frame, 'setTransform').call(frame, { stamp: 1, position: [2, 3, 4], orientation: [0, 0, 0, 1] });
    Reflect.get(frame, 'setTransform').call(frame, { stamp: 2, position: [5, 6, 7], orientation: [0, 0, 1, 0] });
    let changes = 0;
    element.addEventListener('nve-scene-camerachange', () => (changes += 1));
    gpu.resolveNextDevice();
    await element.ready;
    element.time = 1;
    await waitForAnimationFrames(2);
    expect(element.cameraState.target).toEqual({ position: [2, 3, 4], heading: 0 });
    element.time = 2;
    await waitForAnimationFrames(2);
    expect(element.cameraState.target.position).toEqual([5, 6, 7]);
    expect(Math.abs(element.cameraState.target.heading)).toBeCloseTo(Math.PI, 5);
    expect(changes).toBe(0);
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
    state.offset.distance = 12;
    expect(element.cameraState.offset.distance).toBe(30);
    expect(Object.getOwnPropertyDescriptor(Scene.prototype, 'cameraState')?.set).toBeUndefined();
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!canvas) throw new Error('Expected canvas.');
    const changes: CustomEvent[] = [];
    element.addEventListener('nve-scene-camerachange', event => changes.push(event as CustomEvent));
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: '+' }));
    await waitForAnimationFrames(2);
    expect(changes).toHaveLength(1);
    expect(changes[0]?.bubbles).toBe(true);
    expect(changes[0]?.composed).toBe(true);
    expect(changes[0]?.cancelable).toBe(false);
    expect(changes[0]?.detail).toMatchObject({ source: 'keyboard', cameraState: { offset: { distance: 30 / 1.1 } } });
    expect(camera.distance).toBeCloseTo(30 / 1.1);
  });

  it('should make conflicting, invalid, and disabled camera behaviors inert until they recover', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Camera conflicts">
        <nve-scene-camera id="first" behavior="orbit"></nve-scene-camera>
        <nve-scene-camera id="second" behavior="orbit"></nve-scene-camera>
        <nve-scene-camera id="invalid" behavior="top" height="0"></nve-scene-camera>
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
    const before = element.cameraState.offset.theta;
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    await waitForAnimationFrames(3);
    expect(element.cameraState.offset.theta).toBeCloseTo(before + Math.PI / 36);
    expect(errors.filter(code => code === 'camera-slot-conflict')).toHaveLength(2);
    second.setAttribute('disabled', '');
    await waitForAnimationFrames(2);
    expect(sceneCameraController.isActive(first)).toBe(true);
    const recovered = element.cameraState.offset.theta;
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    await waitForAnimationFrames(2);
    expect(element.cameraState.offset.theta).toBeCloseTo(recovered + Math.PI / 36);
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
    expect(element.cameraState.offset.theta).toBeCloseTo(before.offset.theta + Math.PI / 36);
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

  it('should keep unresolved or duplicate follows inert and recover when the frame becomes unique', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Follow resolution"><nve-scene-camera behavior="follow" frame="robot"></nve-scene-camera></nve-scene>
    `);
    const errors: string[] = [];
    element.addEventListener('nve-scene-error', event =>
      errors.push((event as CustomEvent<SceneErrorDetail>).detail.code)
    );
    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(2);
    expect(errors).toContain('camera-frame-unresolved');
    const first = document.createElement('nve-scene-frame');
    const second = document.createElement('nve-scene-frame');
    first.name = 'robot';
    second.name = 'robot';
    element.append(first, second);
    await waitForAnimationFrames(2);
    expect(element.cameraState.target.position).toEqual([0, 0, 0]);
    second.remove();
    Reflect.get(first, 'setTransform').call(first, { stamp: 1, position: [3, 0, 0], orientation: [0, 0, 0, 1] });
    await waitForAnimationFrames(2);
    expect(element.cameraState.target.position).toEqual([3, 0, 0]);
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
    mutationCallbacks[0]?.([createMutationRecord({ attributeName: 'name', target: frame, type: 'attributes' })]);

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
    outerMutations?.([createChildListMutation(outer, [outerFrame])]);

    await vi.waitFor(() => expect(getNamedSceneFrameForTesting(outer, 'outer-added')).toBe(outerFrame));
    expect(outerQueries).toHaveBeenCalled();

    outerQueries.mockClear();
    const innerFrame = document.createElement('nve-scene-frame');
    innerFrame.setAttribute('name', 'inner-added');
    inner.append(innerFrame);
    outerMutations?.([createChildListMutation(inner, [innerFrame])]);
    expect(outerQueries).not.toHaveBeenCalled();

    innerMutations?.([createChildListMutation(inner, [innerFrame])]);
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
    if (!canvas) throw new Error('Expected canvas.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));
    const sources: string[] = [];
    element.addEventListener('nve-scene-camerachange', event => sources.push((event as CustomEvent).detail.source));
    const initialTheta = element.cameraState.offset.theta;
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    await waitForAnimationFrames(2);
    expect(element.cameraState.offset.theta).toBeCloseTo(initialTheta + Math.PI / 36);
    canvas.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 100 }));
    await waitForAnimationFrames(2);
    expect(element.cameraState.offset.distance).toBeCloseTo(12 * Math.exp(0.1));
    canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 20, clientY: 10 }));
    await waitForAnimationFrames(2);
    expect(element.cameraState.offset.theta).toBeCloseTo(initialTheta + Math.PI / 36 - 0.05);
    canvas.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 20, clientY: 10 }));
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerId: 2, pointerType: 'touch', clientX: 10, clientY: 10 })
    );
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerId: 3, pointerType: 'touch', clientX: 20, clientY: 10 })
    );
    canvas.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, pointerId: 3, pointerType: 'touch', clientX: 30, clientY: 10 })
    );
    await waitForAnimationFrames(2);
    expect(sources).toEqual(expect.arrayContaining(['keyboard', 'wheel', 'pointer', 'touch']));
    expect(element.cameraState.offset.distance).toBeCloseTo((12 * Math.exp(0.1)) / 2);
    expect(element.getAttribute('camera-state')).toBeNull();
  });

  it('should pan the orbit camera with a right-button drag and suppress the canvas context menu', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Camera pan"><nve-scene-camera behavior="orbit"></nve-scene-camera></nve-scene>
    `);
    gpu.resolveNextDevice();
    await element.ready;
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!canvas) throw new Error('Expected canvas.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));
    const initial = element.cameraState;
    const scale =
      (2 *
        initial.offset.distance *
        Math.tan(initial.projection.mode === 'perspective' ? initial.projection.fovy / 2 : 0.5)) /
      100;
    const source: string[] = [];
    element.addEventListener('nve-scene-camerachange', event => source.push((event as CustomEvent).detail.source));

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

    expect(element.cameraState.target.position[0]).toBeCloseTo(-20 * scale);
    expect(element.cameraState.target.position[1]).toBeCloseTo(10 * scale);
    expect(element.cameraState.offset).toEqual(initial.offset);
    expect(source).toContain('pointer');
    const contextMenu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    expect(canvas.dispatchEvent(contextMenu)).toBe(false);
  });

  it('should apply top camera state and ground-plane pointer and keyboard pans', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Top camera"><nve-scene-camera id="top" behavior="top" height="40"></nve-scene-camera></nve-scene>
    `);
    const top = element.querySelector<SceneCamera>('#top');
    if (!top) throw new Error('Expected top camera.');
    gpu.resolveNextDevice();
    await element.ready;
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!canvas) throw new Error('Expected canvas.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));
    expect(element.cameraState).toMatchObject({
      offset: { distance: 40, phi: 0, theta: 0 },
      projection: { mode: 'ortho', frustumHeight: 40 }
    });
    canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10, pointerId: 1 }));
    canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 20, clientY: 15, pointerId: 1 }));
    await waitForAnimationFrames(2);
    expect(element.cameraState.target.position).toEqual([-4, 2, 0]);
    expect(top.target).toEqual([-4, 2, 0]);
    const key = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' });
    expect(element.dispatchEvent(key)).toBe(false);
    await waitForAnimationFrames(2);
    expect(element.cameraState.target.position).toEqual([-4, -6, 0]);
    expect(top.target).toEqual([-4, -6, 0]);
    for (const direction of ['ArrowRight', 'ArrowUp', 'ArrowDown']) {
      expect(
        element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: direction }))
      ).toBe(false);
      await waitForAnimationFrames(2);
    }
    expect(element.cameraState.target.position).toEqual([-4, 2, 0]);
    Reflect.set(top, 'height', 20);
    await waitForAnimationFrames(2);
    expect(element.cameraState).toMatchObject({ offset: { distance: 20 }, projection: { frustumHeight: 20 } });
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
    Reflect.get(frame, 'setTransform').call(frame, { stamp: 1, position: [3, 4, 0], orientation: [0, 0, 0, 1] });
    gpu.resolveNextDevice();
    await element.ready;
    const before = element.cameraState;
    const shift = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft', shiftKey: true });
    expect(element.dispatchEvent(shift)).toBe(true);
    const unhandled = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'x' });
    expect(element.dispatchEvent(unhandled)).toBe(true);
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: '-' }));
    await waitForAnimationFrames(2);
    expect(element.cameraState.target.position).toEqual([3, 4, 0]);
    expect(element.cameraState.offset.phi).toBeCloseTo(before.offset.phi - Math.PI / 36);
    expect(element.cameraState.offset.distance).toBeCloseTo(before.offset.distance * 1.1);
    expect(orbit.phi).toBeCloseTo(before.offset.phi - Math.PI / 36);
    expect(orbit.distance).toBeCloseTo(before.offset.distance * 1.1);
  });

  it('should resolve authoritative camera properties and preserve user changes across frames', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Declarative camera">
        <nve-scene-camera
          behavior="orbit"
          distance="20"
          phi="0.5"
          theta="0"
          min-distance="2"
          max-distance="40"
        ></nve-scene-camera>
      </nve-scene>
    `);
    const camera = element.querySelector<SceneCamera>('nve-scene-camera');
    if (!camera) throw new Error('Expected orbit camera.');
    gpu.resolveNextDevice();
    await element.ready;
    expect(element.cameraState.offset).toEqual({ distance: 20, phi: 0.5, theta: 0 });

    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    await waitForAnimationFrames(2);
    expect(element.cameraState.offset.theta).toBeCloseTo(Math.PI / 36);
    expect(camera.theta).toBeCloseTo(Math.PI / 36);
    await waitForAnimationFrames(2);
    expect(element.cameraState.offset.theta).toBeCloseTo(Math.PI / 36);

    camera.distance = 6;
    await waitForAnimationFrames(2);
    expect(element.cameraState.offset).toEqual({ distance: 6, phi: 0.5, theta: Math.PI / 36 });

    camera.target = [1, 2, 3];
    camera.heading = 0.5;
    camera.distance = 7;
    camera.phi = 0.75;
    camera.theta = 0.25;
    camera.projection = 'ortho';
    camera.frustumHeight = 6;
    await waitForAnimationFrames(4);
    expect(element.cameraState.target).toEqual({ position: [1, 2, 3], heading: 0.5 });
    expect(element.cameraState.offset).toEqual({ distance: 7, phi: 0.75, theta: 0.25 });
    expect(element.cameraState.projection).toEqual({ mode: 'ortho', frustumHeight: 6 });

    camera.distance = 8;
    camera.theta = 0.5;
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    await waitForAnimationFrames(2);
    expect(element.cameraState.offset.distance).toBe(8);
    expect(element.cameraState.offset.theta).toBeCloseTo(0.5 + Math.PI / 36);
    expect(camera.theta).toBeCloseTo(0.5 + Math.PI / 36);
  });

  it('should handle fallback camera pan, wheel units, and incomplete pointer gestures without consuming them', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Fallback camera"></nve-scene>`);
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
    expect(element.cameraState.target.position).not.toEqual(initial.target.position);

    const lineWheel = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 1,
      deltaMode: WheelEvent.DOM_DELTA_LINE
    });
    expect(canvas.dispatchEvent(lineWheel)).toBe(false);
    await waitForAnimationFrames(2);
    expect(element.cameraState.offset.distance).toBeCloseTo(initial.offset.distance * Math.exp(0.016));
    const pageWheel = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 1,
      deltaMode: WheelEvent.DOM_DELTA_PAGE
    });
    expect(canvas.dispatchEvent(pageWheel)).toBe(false);
    await waitForAnimationFrames(2);
    expect(element.cameraState.offset.distance).toBeCloseTo(initial.offset.distance * Math.exp(0.116));

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

  it('should validate and reflect scene clock and stale-after property updates', () => {
    const scene = new Scene();
    expect(scene.staleAfter).toBe(1_000);
    expect(() => (scene.staleAfter = -1)).toThrow(RangeError);
    expect(() => (scene.staleAfter = Number.NaN)).toThrow(RangeError);
    expect(() => (scene.staleAfter = '100' as unknown as number)).toThrow(TypeError);
    scene.staleAfter = 500;
    expect(scene.staleAfter).toBe(500);

    expect(scene.time).toBe('live');
    expect(() => (scene.time = 'paused' as unknown as 'live')).toThrow(TypeError);
    expect(() => (scene.time = Number.POSITIVE_INFINITY)).toThrow(RangeError);
    scene.time = 12.5;
    expect(scene.time).toBe(12.5);
    scene.time = 'live';
    expect(scene.time).toBe('live');
  });

  // eslint-disable-next-line complexity -- One recovery sequence proves independent label validation episodes.
  it('should retain direct valid labels in overlay slots and recover every label contract', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Labels"></nve-scene>`);
    const label = createLabel();
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    element.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent<SceneErrorDetail>));
    element.append(label);
    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(2);

    const overlay = element.shadowRoot?.querySelector('.overlay');
    expect(overlay?.querySelector('slot')?.assignedElements()).toEqual([label]);
    expect(label.parentElement).toBe(element);
    expect(label.hasAttribute('occluded')).toBe(false);

    label.setAttribute('frame', 'missing');
    await waitForAnimationFrames(2);
    expect(errors.map(event => event.detail.code)).toContain('label-frame-unresolved');
    expect(errors.every(event => event.detail.severity === 'error')).toBe(true);
    expect(errors.every(event => event.bubbles && event.composed && !event.cancelable)).toBe(true);
    expect(overlay?.querySelector('slot')).toBeNull();
    const frame = document.createElement('nve-scene-frame');
    frame.name = 'missing';
    element.append(frame);
    await waitForAnimationFrames(2);
    expect(errors.filter(event => event.detail.code === 'label-frame-unresolved')).toHaveLength(1);
    expect(label.hasAttribute('stale')).toBe(true);
    frame.setAttribute('position', '[0,0,0]');
    await waitForAnimationFrames(2);
    expect(label.hasAttribute('stale')).toBe(false);
    label.removeAttribute('frame');
    await waitForAnimationFrames(2);

    label.append('invalid text');
    await waitForAnimationFrames(2);
    expect(errors.map(event => event.detail.code)).toContain('label-child-count');
    expect(overlay?.querySelector('slot')).toBeNull();
    label.lastChild?.remove();
    await waitForAnimationFrames(2);
    expect(overlay?.querySelector('slot')?.assignedElements()).toEqual([label]);
    const child = label.firstElementChild as HTMLElement;
    child.style.display = 'none';
    await waitForAnimationFrames(2);
    expect(errors.map(event => event.detail.code)).toContain('label-child-boxless');
    child.style.display = 'block';
    await waitForAnimationFrames(2);
    expect(overlay?.querySelector('slot')?.assignedElements()).toEqual([label]);
  });

  it('should isolate nested labels while preserving their accessibility DOM and direct-slot ownership', async () => {
    const gpu = configureFakeWebGPU();
    const { element: outer } = await createScene(html`<nve-scene aria-label="Outer"></nve-scene>`);
    const inner = document.createElement('nve-scene');
    inner.setAttribute('aria-label', 'Inner');
    const outerLabel = createLabel();
    const innerLabel = createLabel();
    outer.append(outerLabel, inner);
    inner.append(innerLabel);
    gpu.resolveNextDevice();
    await Promise.all([outer.ready, (inner as Scene).ready]);
    await waitForAnimationFrames(2);

    expect(outer.shadowRoot?.querySelector('.overlay slot')?.assignedElements()).toEqual([outerLabel]);
    expect(inner.shadowRoot?.querySelector('.overlay slot')?.assignedElements()).toEqual([innerLabel]);
    expect(innerLabel.parentElement).toBe(inner);
    expect(innerLabel.querySelector('button')).not.toBeNull();
  });

  it('keeps offscreen label DOM focusable while disabling only pointer input and clearing occlusion', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(
      html`<nve-scene aria-label="Offscreen label" style="width: 100px;height:100px"></nve-scene>`
    );
    const label = createLabel();
    label.setAttribute('position', '[10000,0,0]');
    label.setAttribute('occluded', '');
    element.append(label);
    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(2);

    const slot = element.shadowRoot?.querySelector<HTMLSlotElement>('.overlay slot');
    const button = label.querySelector('button');
    if (!slot || !button) throw new Error('Expected an offscreen label slot and its button.');
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(slot.style.opacity).toBe('0');
    expect(slot.style.pointerEvents).toBe('none');
    expect(slot.style.display).not.toBe('none');
    expect(label.hasAttribute('occluded')).toBe(false);
  });

  it('loads the optional label runtime when a direct label is appended after Scene readiness', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Late label"></nve-scene>`);
    gpu.resolveNextDevice();
    await element.ready;
    const label = createLabel();
    mockLabelBox(element, label.firstElementChild as HTMLElement);
    const copies: HTMLSlotElement[] = [];
    configureSceneLabelTesting(element, {
      captureCapabilities: { available: true, copySignature: 'current-dictionaries' },
      copy: ({ slot }) => copies.push(slot)
    });

    element.append(label);

    await vi.waitFor(() => expect(copies.length).toBeGreaterThan(0));
    expect(copies[0]?.parentElement).toBe(element.shadowRoot?.querySelector('canvas'));
  });

  it('should recapture promoted labels for label-content attribute and text mutations', async () => {
    const mutationCallbacks: MutationCallback[] = [];
    const gpu = configureFakeWebGPU({
      createMutationObserver: callback => {
        mutationCallbacks.push(callback);
        return createManualMutationObserver();
      }
    });
    const { element } = await createScene(html`<nve-scene aria-label="Label mutations"></nve-scene>`);
    const label = createLabel();
    const child = label.firstElementChild as HTMLElement;
    const text = child.firstChild;
    if (!(text instanceof Text)) throw new Error('Expected label text content.');
    mockLabelBox(element, child);
    element.append(label);
    const copies: HTMLSlotElement[] = [];
    configureSceneLabelTesting(element, {
      captureCapabilities: { available: true, copySignature: 'current-dictionaries' },
      copy: ({ slot }) => copies.push(slot)
    });
    gpu.resolveNextDevice();
    await element.ready;
    mutationCallbacks[0]?.([createChildListMutation(element, [label])]);
    await vi.waitFor(() => expect(copies.length).toBeGreaterThan(0));

    copies.length = 0;
    child.setAttribute('data-state', 'changed');
    text.textContent = 'Updated robot';
    mutationCallbacks[0]?.([
      createMutationRecord({ attributeName: 'data-state', target: child, type: 'attributes' }),
      createMutationRecord({ target: text, type: 'characterData' })
    ]);

    await vi.waitFor(() => expect(copies.length).toBeGreaterThan(0));
    expect(copies.at(-1)?.assignedElements()[0]).toBe(label);
  });

  it('should recapture a promoted label after internal child content childList mutations', async () => {
    const mutationCallbacks: MutationCallback[] = [];
    const gpu = configureFakeWebGPU({
      createMutationObserver: callback => {
        mutationCallbacks.push(callback);
        return createManualMutationObserver();
      }
    });
    const { element } = await createScene(html`<nve-scene aria-label="Label childList mutations"></nve-scene>`);
    const label = createLabel();
    const child = label.firstElementChild as HTMLElement;
    mockLabelBox(element, child);
    element.append(label);
    const copies: HTMLSlotElement[] = [];
    configureSceneLabelTesting(element, {
      captureCapabilities: { available: true, copySignature: 'current-dictionaries' },
      copy: ({ slot }) => copies.push(slot)
    });
    gpu.resolveNextDevice();
    await element.ready;
    mutationCallbacks[0]?.([createChildListMutation(element, [label])]);
    await vi.waitFor(() => expect(copies.length).toBeGreaterThan(0));

    copies.length = 0;
    const detail = document.createElement('span');
    detail.textContent = 'Updated detail';
    child.append(detail);
    mutationCallbacks[0]?.([createChildListMutation(child, [detail])]);

    await vi.waitFor(() => expect(copies.length).toBeGreaterThan(0));
    expect(copies.at(-1)?.assignedElements()[0]).toBe(label);
  });

  it('does not treat an authored probe-looking attribute as an internal label exclusion', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Authored probe attribute"></nve-scene>`);
    const label = createLabel();
    label.setAttribute('data-nve-label-probe', '');
    element.append(label);
    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(2);

    expect(element.shadowRoot?.querySelector<HTMLSlotElement>('.overlay slot')?.assignedElements()).toEqual([label]);
  });

  it('keeps overlay label projection and validation active when WebGPU initialization fails', async () => {
    configureSceneTesting({ requestAdapter: async () => undefined });
    const { element } = await createScene(
      html`<nve-scene aria-label="Overlay without WebGPU" style="width:100px;height:100px"></nve-scene>`
    );
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    const label = createLabel();
    const child = label.firstElementChild as HTMLElement;
    vi.spyOn(child, 'offsetWidth', 'get').mockReturnValue(20);
    vi.spyOn(child, 'offsetHeight', 'get').mockReturnValue(10);
    element.append(label);

    await vi.waitFor(() => expect(element.shadowRoot?.querySelector('.fallback')?.hasAttribute('hidden')).toBe(false));
    await waitForAnimationFrames(2);
    const slot = element.shadowRoot?.querySelector<HTMLSlotElement>('.overlay slot');
    expect(slot?.assignedElements()).toEqual([label]);
    expect(slot?.style.transform).toBe('translate(40px, 45px)');
    label.append('invalid');
    await waitForAnimationFrames(2);
    expect(element.shadowRoot?.querySelector('.overlay slot')).toBeNull();
  });

  it('contains a lazy-runtime import failure in the overlay and retries after a later label mutation', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Retry label runtime"></nve-scene>`);
    gpu.resolveNextDevice();
    await element.ready;
    const label = createLabel();
    mockLabelBox(element, label.firstElementChild as HTMLElement);
    const failedLoad = vi.fn(() => Promise.reject(new Error('optional label runtime unavailable')));
    configureSceneLabelTesting(element, { loadRuntime: failedLoad });
    element.append(label);

    await vi.waitFor(() => expect(failedLoad).toHaveBeenCalledOnce());
    expect(element.shadowRoot?.querySelector<HTMLSlotElement>('.overlay slot')?.assignedElements()).toEqual([label]);

    const copies: HTMLSlotElement[] = [];
    configureSceneLabelTesting(element, {
      captureCapabilities: { available: true, copySignature: 'current-dictionaries' },
      copy: ({ slot }) => copies.push(slot)
    });
    label.setAttribute('offset', '[1,0]');

    await vi.waitFor(() => expect(copies.length).toBeGreaterThan(0));
  });

  it('promotes a captured label only after its slot is an immediate canvas child', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Texture labels"></nve-scene>`);
    const label = createLabel();
    const child = label.firstElementChild as HTMLElement;
    mockLabelBox(element, child);
    element.append(label);
    const copies: HTMLSlotElement[] = [];
    configureSceneLabelTesting(element, {
      captureCapabilities: { available: true, copySignature: 'current-dictionaries' },
      copy: ({ slot }) => copies.push(slot)
    });
    gpu.resolveNextDevice();
    await element.ready;
    await vi.waitFor(() => expect(copies.length).toBeGreaterThan(0));

    const canvas = element.shadowRoot?.querySelector('canvas');
    const overlay = element.shadowRoot?.querySelector('.overlay');
    expect(canvas).toBeDefined();
    expect(copies.every(slot => slot.parentElement === canvas)).toBe(true);
    expect(copies.every(slot => slot.assignedElements()[0] === label)).toBe(true);
    expect(canvas?.hasAttribute('aria-hidden')).toBe(false);
    expect(label.querySelector('button')).not.toBeNull();
    expect(overlay?.querySelector('slot')).toBeNull();
    child.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    child.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    child.focus();
    document.dispatchEvent(new Event('selectionchange'));
    canvas?.dispatchEvent(new Event('paint'));
    child.blur();

    expect(overlay?.querySelector('slot')).toBeNull();
  });

  it('retires a promoted label when it becomes hidden or is removed', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Retired texture label"></nve-scene>`);
    const label = createLabel();
    mockLabelBox(element, label.firstElementChild as HTMLElement);
    element.append(label);
    configureSceneLabelTesting(element, {
      captureCapabilities: { available: true, copySignature: 'current-dictionaries' },
      copy: () => undefined
    });
    gpu.resolveNextDevice();
    await element.ready;
    const canvas = element.shadowRoot?.querySelector('canvas');
    const overlay = element.shadowRoot?.querySelector('.overlay');
    await vi.waitFor(() => expect(canvas?.querySelector('slot')?.assignedElements()).toEqual([label]));

    label.hidden = true;
    await vi.waitFor(() => expect(canvas?.querySelector('slot')).toBeNull());
    expect(overlay?.querySelector('slot')).toBeNull();
    expect(canvas?.getAttribute('aria-hidden')).toBe('true');

    label.hidden = false;
    await vi.waitFor(() => expect(canvas?.querySelector('slot')?.assignedElements()).toEqual([label]));
    label.remove();
    await vi.waitFor(() => expect(canvas?.querySelector('slot')).toBeNull());
    expect(canvas?.getAttribute('aria-hidden')).toBe('true');
  });

  it('fails closed to the overlay when native label copy is unavailable', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Unavailable native label copy"></nve-scene>`);
    const label = createLabel();
    mockLabelBox(element, label.firstElementChild as HTMLElement);
    element.append(label);
    configureSceneLabelTesting(element, {
      captureCapabilities: { available: true, copySignature: 'current-dictionaries' }
    });
    const warnings: CustomEvent<SceneErrorDetail>[] = [];
    element.addEventListener('nve-scene-error', event => warnings.push(event as CustomEvent<SceneErrorDetail>));
    gpu.resolveNextDevice();
    await element.ready;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      label.invalidate();
      await waitForAnimationFrames(2);
    }
    await vi.waitFor(() => expect(warnings.some(event => event.detail.code === 'label-texture-fallback')).toBe(true));
    expect(element.shadowRoot?.querySelector<HTMLSlotElement>('.overlay slot')?.assignedElements()).toEqual([label]);
    expect(element.shadowRoot?.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps focused first capture and repeated failures in the overlay with one warning episode', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Texture fallback"></nve-scene>`);
    const label = createLabel();
    const child = label.firstElementChild as HTMLElement;
    mockLabelBox(element, child);
    element.append(label);
    const warnings: CustomEvent<SceneErrorDetail>[] = [];
    element.addEventListener('nve-scene-error', event => warnings.push(event as CustomEvent<SceneErrorDetail>));
    configureSceneLabelTesting(element, {
      captureCapabilities: { available: true, copySignature: 'current-dictionaries' },
      copy: () => {
        throw new Error('copy rejected');
      }
    });
    child.focus();
    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(2);
    const overlay = element.shadowRoot?.querySelector('.overlay');
    expect(overlay?.querySelector('slot')?.assignedElements()).toEqual([label]);
    child.blur();
    label.invalidate();
    await waitForAnimationFrames(6);
    const fallbackWarnings = warnings.filter(event => event.detail.code === 'label-texture-fallback');
    expect(fallbackWarnings).toHaveLength(1);
    expect(fallbackWarnings[0]?.detail.severity).toBe('warning');
    expect(overlay?.querySelector('slot')?.assignedElements()).toEqual([label]);
  });

  it('restores a promoted label to the accessible overlay on device loss and promotes again after recovery', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Texture recovery"></nve-scene>`);
    const label = createLabel();
    mockLabelBox(element, label.firstElementChild as HTMLElement);
    element.append(label);
    configureSceneLabelTesting(element, {
      captureCapabilities: { available: true, copySignature: 'current-dictionaries' },
      copy: () => undefined
    });
    gpu.resolveNextDevice();
    await element.ready;
    const canvas = element.shadowRoot?.querySelector('canvas');
    const overlay = element.shadowRoot?.querySelector('.overlay');
    await vi.waitFor(() => expect(canvas?.querySelector('slot')?.assignedElements()).toEqual([label]));
    gpu.devices[0]?.lose({ message: 'label loss', reason: 'unknown' });
    await vi.waitFor(() => expect(overlay?.querySelector('slot')?.assignedElements()).toEqual([label]));
    expect(canvas?.getAttribute('aria-hidden')).toBe('true');
    await vi.waitFor(() => expect(getSceneTestingSnapshot().requestDeviceCount).toBe(2));
    gpu.resolveNextDevice();
    await element.ready;
    await vi.waitFor(() => expect(canvas?.querySelector('slot')?.assignedElements()).toEqual([label]));
  });

  it('prefetches texture label pixels, favors an unavailable cache, and routes only geometry-in-front input', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`
      <nve-scene aria-label="Texture pointer"><nve-scene-cubes><nve-scene-marker></nve-scene-marker></nve-scene-cubes></nve-scene>
    `);
    const label = createLabel();
    const button = label.firstElementChild as HTMLButtonElement;
    mockLabelBox(element, button);
    element.append(label);
    const prefetches: Array<readonly [number, number]> = [];
    const geometry: { current: { depth: number; id: number } | undefined } = { current: undefined };
    configureSceneLabelTesting(element, {
      captureCapabilities: { available: true, copySignature: 'current-dictionaries' },
      copy: () => undefined,
      getGeometryPixel: () => geometry.current,
      prefetchGeometryPixel: (x, y) => prefetches.push([x, y])
    });
    const marker = element.querySelector<HTMLElement>('nve-scene-marker');
    const canvas = element.shadowRoot?.querySelector('canvas');
    if (!marker || !canvas) throw new Error('Expected texture pointer targets.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    const pending: Array<(hit: ScenePickResult | null) => void> = [];
    setScenePickDriverForTesting(element, () => new Promise(resolve => pending.push(resolve)));
    gpu.resolveNextDevice();
    await element.ready;
    await vi.waitFor(() => expect(canvas.querySelector('slot')?.assignedElements()).toEqual([label]));

    let nativeClicks = 0;
    button.addEventListener('click', () => (nativeClicks += 1));
    button.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 10, clientY: 10 }));
    expect(prefetches).toHaveLength(1);
    expect(
      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, composed: true, clientX: 10, clientY: 10, pointerId: 7 })
      )
    ).toBe(true);
    expect(
      button.dispatchEvent(
        new PointerEvent('click', {
          bubbles: true,
          cancelable: true,
          composed: true,
          clientX: 10,
          clientY: 10,
          pointerId: 7
        })
      )
    ).toBe(true);
    expect(nativeClicks).toBe(1);
    expect(pending).toHaveLength(0);

    geometry.current = { depth: 0, id: 1 };
    const events: string[] = [];
    marker.addEventListener('pointerdown', event => events.push(`down:${event.pointerId}`));
    marker.addEventListener('pointerup', () => events.push('up'));
    marker.addEventListener('click', () => events.push('click'));
    expect(
      button.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          composed: true,
          clientX: 10,
          clientY: 10,
          pointerId: 8
        })
      )
    ).toBe(false);
    canvas.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: 10,
        clientY: 10,
        pointerId: 8
      })
    );
    canvas.dispatchEvent(
      new PointerEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: 10,
        clientY: 10,
        pointerId: 8
      })
    );
    await vi.waitFor(() => expect(pending).toHaveLength(3));
    pending.forEach(resolve =>
      resolve({ layer: marker.parentElement as HTMLElement, marker, instanceIndex: 0, worldPosition: [0, 0, 0] })
    );
    await vi.waitFor(() => expect(events).toEqual(['down:8', 'up', 'click']));
    await waitForAnimationFrames(2);
    expect(pending).toHaveLength(3);
    expect(nativeClicks).toBe(1);

    button.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: 10,
        clientY: 10,
        pointerId: 9
      })
    );
    canvas.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, composed: true, pointerId: 9 }));
    canvas.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true, pointerId: 9 }));
    expect(pending).toHaveLength(3);
  });

  it('keeps wrapper labels inert and recovers zero and multiple child labels without reparenting', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Label structure"></nve-scene>`);
    const wrapper = document.createElement('div');
    const nested = createLabel();
    const empty = document.createElement('nve-scene-label');
    const multiple = createLabel();
    multiple.append(document.createElement('span'));
    wrapper.append(nested);
    element.append(wrapper, empty, multiple);
    const codes: string[] = [];
    element.addEventListener('nve-scene-error', event =>
      codes.push((event as CustomEvent<SceneErrorDetail>).detail.code)
    );
    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(2);
    expect(codes).toContain('label-parent');
    expect(codes.filter(code => code === 'label-child-count')).toHaveLength(2);
    expect(nested.parentElement).toBe(wrapper);
    empty.append(document.createElement('button'));
    multiple.lastElementChild?.remove();
    await waitForAnimationFrames(2);
    const slots = [...(element.shadowRoot?.querySelectorAll<HTMLSlotElement>('.overlay slot') ?? [])];
    expect(slots.flatMap(slot => slot.assignedElements())).toEqual([empty, multiple]);
  });

  it('writes projected DOM transforms for every label anchor and offset', async () => {
    const gpu = configureFakeWebGPU();
    const { element } = await createScene(html`<nve-scene aria-label="Anchored labels"></nve-scene>`);
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    const anchors = [
      'top-left',
      'top',
      'top-right',
      'left',
      'center',
      'right',
      'bottom-left',
      'bottom',
      'bottom-right'
    ];
    const labels = anchors.map(anchor => {
      const label = createLabel();
      label.setAttribute('anchor', anchor);
      label.setAttribute('offset', '[3,-2]');
      const child = label.firstElementChild as HTMLElement;
      vi.spyOn(child, 'offsetWidth', 'get').mockReturnValue(20);
      vi.spyOn(child, 'offsetHeight', 'get').mockReturnValue(10);
      return label;
    });
    element.append(...labels);
    gpu.resolveNextDevice();
    await element.ready;
    await waitForAnimationFrames(2);
    const slots = [...(element.shadowRoot?.querySelectorAll<HTMLSlotElement>('.overlay slot') ?? [])];
    expect(slots).toHaveLength(9);
    expect(slots.map(slot => slot.style.transform)).toEqual([
      'translate(53px, 48px)',
      'translate(43px, 48px)',
      'translate(33px, 48px)',
      'translate(53px, 43px)',
      'translate(43px, 43px)',
      'translate(33px, 43px)',
      'translate(53px, 38px)',
      'translate(43px, 38px)',
      'translate(33px, 38px)'
    ]);
  });

  async function createScene(template: ReturnType<typeof html>): Promise<{ fixture: HTMLElement; element: Scene }> {
    const fixture = await createFixture(template);
    fixtures.push(fixture);
    const element = fixture.querySelector<Scene>(Scene.metadata.tag);
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
    devicePixelRatio?: number;
    failCanvasContextAt?: number;
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
      if (options.failCanvasContextAt === contexts.length + 1) return undefined;
      const context = createFakeContext();
      contexts.push(context);
      return context;
    },
    createMutationObserver: options.createMutationObserver ?? (callback => new MutationObserver(callback)),
    createResizeObserver: options.createResizeObserver ?? (callback => new ResizeObserver(callback)),
    getDevicePixelRatio: () => options.devicePixelRatio ?? 1
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

function appendSlottedParagraph(element: Scene, options: { slot: string; id: string; text: string }): void {
  const paragraph = document.createElement('p');
  paragraph.id = options.id;
  paragraph.slot = options.slot;
  paragraph.setAttribute('nve-text', 'body');
  paragraph.textContent = options.text;
  element.append(paragraph);
}

function createLabel(options: { frame?: string } = {}): HTMLElement {
  const label = document.createElement('nve-scene-label');
  if (options.frame) label.setAttribute('frame', options.frame);
  const content = document.createElement('button');
  content.type = 'button';
  content.textContent = 'Robot';
  label.append(content);
  return label;
}

function createManualMutationObserver(): MutationObserver {
  return {
    disconnect: () => undefined,
    observe: () => undefined,
    takeRecords: () => []
  } as MutationObserver;
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

function mockLabelBox(scene: Scene, child: HTMLElement): void {
  vi.spyOn(scene, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
  vi.spyOn(child, 'offsetWidth', 'get').mockReturnValue(20);
  vi.spyOn(child, 'offsetHeight', 'get').mockReturnValue(10);
}

function createModel(id: string, shape: ScenePart['shape']): SceneModel {
  const model = document.createElement(SceneModel.metadata.tag) as SceneModel;
  const part = document.createElement(ScenePart.metadata.tag) as ScenePart;
  model.id = id;
  part.shape = shape;
  model.append(part);
  return model;
}

function setMarkerBytes(layer: HTMLElement | null): void {
  if (!layer) {
    throw new Error('Expected marker layer.');
  }
  const bytes = new Uint8Array(MARKER.stride);
  writeMarker(bytes, 0, { position: [0, 0, 0] });
  Reflect.set(layer, 'instances', bytes);
}

function setStreamBytes(layer: HTMLElement | null, count: number, property: 'instances' | 'vertices'): void {
  if (!layer) {
    throw new Error('Expected stream layer.');
  }
  const layout =
    layer.localName === 'nve-scene-triangles'
      ? TRI_VERTEX
      : layer.localName === 'nve-scene-lines'
        ? LINE_VERTEX
        : POINT;
  const bytes = new Uint8Array(layout.stride * count);
  for (let index = 0; index < count; index += 1) {
    writeStreamRecord(bytes, layer.localName, index);
  }
  Reflect.set(layer, property, bytes);
}

function writeStreamRecord(bytes: Uint8Array, name: string, index: number): void {
  if (name === 'nve-scene-triangles') {
    writeTriVertex(bytes, index, { position: [0, 0, 0] });
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
