// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { SceneCamera, sceneCameraController, type SceneCameraBehavior } from './camera.js';
import './define.js';

describe(SceneCamera.metadata.tag, () => {
  const fixtures: HTMLElement[] = [];

  afterEach(() => {
    fixtures.forEach(removeFixture);
    fixtures.length = 0;
    vi.restoreAllMocks();
  });

  it('defaults to a static pose behavior', async () => {
    const camera = await createCamera();
    expect(customElements.get(SceneCamera.metadata.tag)).toBe(SceneCamera);
    expect(sceneCameraController.getContribution(camera)).toEqual({
      fields: ['pose', 'projection'],
      frame: '',
      kind: 'pose',
      pose: { position: [0, 0, 0], orientation: [0, 0, 0, 1] },
      projection: { mode: 'perspective', fovy: Math.PI / 4, near: 0.01, far: 10_000 }
    });
    expect(camera.behavior).toBe('pose');

    camera.setAttribute('behavior', 'unsupported');
    await elementIsStable(camera);
    expect(camera.behavior).toBe('pose');
  });

  it('configures follow and top contributions without changing elements', async () => {
    const camera = await createCamera('follow');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(sceneCameraController.getContribution(camera)).toBeNull();

    camera.frame = ' robot ';
    camera.mode = 'pose';
    await elementIsStable(camera);
    expect(sceneCameraController.getContribution(camera)).toEqual({
      fields: ['target.position', 'target.heading'],
      frame: 'robot',
      kind: 'follow',
      mode: 'pose'
    });

    camera.behavior = 'top';
    await elementIsStable(camera);
    expect(sceneCameraController.getContribution(camera)).toEqual({
      fields: ['target.position', 'target.heading', 'offset.distance', 'offset.phi', 'offset.theta', 'projection'],
      height: 40,
      kind: 'top',
      projection: { mode: 'ortho', frustumHeight: 40, near: 0.01, far: 10_000 },
      target: { position: [0, 0, 0], heading: 0 }
    });
  });

  it('validates the orbit pose and limits and restores defaults after attributes are removed', async () => {
    const camera = await createCamera('orbit');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    camera.setAttribute('distance', '4');
    camera.setAttribute('phi', '0.5');
    camera.setAttribute('theta', '1');
    camera.setAttribute('min-distance', '4');
    camera.setAttribute('max-distance', '4');
    await elementIsStable(camera);
    expect(sceneCameraController.getContribution(camera)).toMatchObject({
      distance: 4,
      maxDistance: 4,
      minDistance: 4,
      phi: 0.5,
      projection: { mode: 'perspective', fovy: Math.PI / 4, near: 0.01, far: 10_000 },
      target: { position: [0, 0, 0], heading: 0 },
      theta: 1
    });

    camera.setAttribute('min-distance', 'invalid');
    await elementIsStable(camera);
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    camera.minDistance = -1;
    await elementIsStable(camera);
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    camera.minDistance = 5;
    camera.maxDistance = 4;
    await elementIsStable(camera);
    expect(sceneCameraController.getContribution(camera)).toBeNull();

    camera.minDistance = 0.5;
    camera.maxDistance = 200;
    camera.distance = 0;
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    camera.distance = 12;
    camera.phi = Math.PI + 1;
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    camera.phi = Math.PI / 4;
    camera.theta = Number.NaN;
    expect(sceneCameraController.getContribution(camera)).toBeNull();

    camera.removeAttribute('distance');
    camera.removeAttribute('phi');
    camera.removeAttribute('theta');
    camera.removeAttribute('min-distance');
    camera.removeAttribute('max-distance');
    await elementIsStable(camera);
    expect(sceneCameraController.getContribution(camera)).toMatchObject({
      distance: 12,
      maxDistance: 200,
      minDistance: 0.5,
      phi: Math.PI / 4,
      projection: { mode: 'perspective', fovy: Math.PI / 4, near: 0.01, far: 10_000 },
      target: { position: [0, 0, 0], heading: 0 },
      theta: -Math.PI / 2
    });
  });

  it('validates authoritative orbit target and projection properties', async () => {
    const camera = await createCamera('orbit');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    camera.setAttribute('projection', 'ortho');
    await elementIsStable(camera);
    expect(camera.projection).toBe('ortho');
    camera.setAttribute('projection', 'unsupported');
    await elementIsStable(camera);
    expect(camera.projection).toBe('perspective');
    camera.target = [1, 2, 3];
    camera.heading = 0.25;
    camera.projection = 'ortho';
    camera.frustumHeight = 8;
    expect(sceneCameraController.getContribution(camera)).toMatchObject({
      projection: { mode: 'ortho', frustumHeight: 8, near: 0.01, far: 10_000 },
      target: { position: [1, 2, 3], heading: 0.25 }
    });

    Reflect.set(camera, 'target', [1, 2]);
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    Reflect.set(camera, 'target', [1, 2, Number.NaN]);
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    camera.target = [1, 2, 3];
    camera.heading = Number.NaN;
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    camera.heading = 0;
    camera.frustumHeight = 0;
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    camera.projection = 'perspective';
    camera.fovy = Math.PI;
    expect(sceneCameraController.getContribution(camera)).toBeNull();
  });

  it('validates follow configuration and frame resolution', async () => {
    const camera = await createCamera('follow');
    const errors: CustomEvent[] = [];
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    camera.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent));
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    expect(errors[0]?.detail).toMatchObject({ code: 'camera-frame-unresolved', element: camera });

    camera.frame = 'robot';
    camera.setAttribute('mode', 'unsupported');
    await elementIsStable(camera);
    expect(camera.mode).toBe('position');
    expect(sceneCameraController.getContribution(camera)?.fields).toEqual(['target.position']);
    camera.setAttribute('mode', 'pose');
    await elementIsStable(camera);
    expect(camera.mode).toBe('pose');
    camera.removeAttribute('mode');
    await elementIsStable(camera);
    expect(camera.mode).toBe('position');

    sceneCameraController.setFrameResolved(camera, false);
    expect(sceneCameraController.isActive(camera)).toBe(false);
    sceneCameraController.setFrameResolved(camera, true);
    expect(sceneCameraController.isActive(camera)).toBe(true);
  });

  it('validates top height and recovers by property', async () => {
    const camera = await createCamera('top');
    const errors: CustomEvent[] = [];
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    camera.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent));
    camera.height = Number.NaN;
    await elementIsStable(camera);
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    expect(errors[0]?.detail).toMatchObject({ code: 'camera-range', element: camera });
    camera.height = -1;
    await elementIsStable(camera);
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    camera.height = 12;
    await elementIsStable(camera);
    expect(sceneCameraController.getContribution(camera)).toMatchObject({ height: 12, kind: 'top' });
  });

  it('normalizes direct pose quaternions and validates clipping', async () => {
    const camera = await createCamera('pose');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    camera.position = [1, 2, 3];
    camera.orientation = [0, 0, 0, 2];
    camera.near = 0.5;
    camera.far = 50;
    expect(sceneCameraController.getContribution(camera)).toEqual({
      fields: ['pose', 'projection'],
      frame: '',
      kind: 'pose',
      pose: { position: [1, 2, 3], orientation: [0, 0, 0, 1] },
      projection: { mode: 'perspective', fovy: Math.PI / 4, near: 0.5, far: 50 }
    });

    camera.orientation = [0, 0, 0, 0];
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    camera.orientation = [0, 0, 0, 1];
    camera.near = 0;
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    camera.near = 10;
    camera.far = 10;
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    camera.far = 100;
    expect(sceneCameraController.getContribution(camera)?.kind).toBe('pose');
  });

  it('treats disabled as a presence attribute for every behavior', async () => {
    const camera = await createCamera('follow');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sceneCameraController.getContribution(camera);
    camera.setAttribute('disabled', 'false');
    await elementIsStable(camera);
    expect(camera.disabled).toBe(true);
    expect(sceneCameraController.getContribution(camera)).toBeNull();

    camera.behavior = 'top';
    camera.removeAttribute('disabled');
    await elementIsStable(camera);
    expect(camera.disabled).toBe(false);
    expect(sceneCameraController.getContribution(camera)?.kind).toBe('top');
  });

  it('clears inactive diagnostics when behavior changes', async () => {
    const camera = await createCamera('top');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    camera.height = 0;
    expect(sceneCameraController.getContribution(camera)).toBeNull();
    expect(sceneCameraController.isActive(camera)).toBe(false);

    camera.behavior = 'orbit';
    expect(sceneCameraController.getContribution(camera)?.kind).toBe('orbit');
    expect(sceneCameraController.isActive(camera)).toBe(true);

    camera.behavior = 'follow';
    camera.frame = 'robot';
    expect(sceneCameraController.getContribution(camera)?.kind).toBe('follow');
    sceneCameraController.setFrameResolved(camera, false);
    expect(sceneCameraController.isActive(camera)).toBe(false);

    camera.behavior = 'top';
    camera.height = 20;
    expect(sceneCameraController.getContribution(camera)?.kind).toBe('top');
    expect(sceneCameraController.isActive(camera)).toBe(true);
  });

  it('reports and clears a scene-owned field conflict', async () => {
    const camera = await createCamera();
    const errors: CustomEvent[] = [];
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    camera.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent));
    sceneCameraController.setConflict(camera, true);
    expect(sceneCameraController.isActive(camera)).toBe(false);
    expect(errors[0]?.detail).toMatchObject({ code: 'camera-slot-conflict', element: camera, severity: 'error' });
    sceneCameraController.setConflict(camera, false);
    expect(sceneCameraController.isActive(camera)).toBe(true);
  });

  async function createCamera(behavior?: SceneCameraBehavior): Promise<SceneCamera> {
    const template =
      behavior === undefined
        ? html`<nve-scene-camera></nve-scene-camera>`
        : html`<nve-scene-camera behavior=${behavior}></nve-scene-camera>`;
    const fixture = await createFixture(template);
    fixtures.push(fixture);
    const camera = fixture.querySelector<SceneCamera>(SceneCamera.metadata.tag);
    if (!camera) throw new Error('Expected scene camera.');
    await elementIsStable(camera);
    return camera;
  }
});
