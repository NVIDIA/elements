// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { SceneContent } from '../internal/composition/scene/content.js';
import { getNamedSceneFrame, isFrameChainValid } from '../internal/composition/frame/state.js';
import { configureSceneTesting, resetSceneTesting } from '../internal/testing/scene.js';
import type { SceneBody } from '../body/body.js';
import type { SceneErrorDetail } from '../index.js';
import './define.js';
import '../model/define.js';

function graph() {
  const scene = document.createElement('nve-scene');
  const model = document.createElement('nve-scene-model');
  const bodies = ['base', 'arm', 'tool'].map(name => {
    const body = document.createElement('nve-scene-body');
    body.name = name;
    body.geometry = [{ type: 'cube' }];
    return body;
  });
  const joint = document.createElement('nve-scene-joint');
  joint.name = 'arm';
  joint.parent = 'base';
  joint.child = 'arm';
  joint.type = 'prismatic';
  joint.value = 2;
  model.name = 'robot';
  model.append(joint, ...bodies);
  scene.append(model);
  const errors: SceneErrorDetail[] = [];
  scene.addEventListener('nve-scene-error', event => errors.push(event.detail));
  const content = new SceneContent(scene);
  const resolve = () => {
    content.refresh();
    content.resolveFrames();
  };
  resolve();
  return { scene, model, bodies, joint, content, errors, resolve };
}

describe('body connections', () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    resetSceneTesting();
    vi.restoreAllMocks();
  });

  it('separates joint and body names and composes model placement independently of DOM order', () => {
    const { scene, model, bodies, joint, resolve } = graph();
    model.position = [10, 0, 0];
    model.orientation = [0, 0, 0, 1];
    resolve();
    expect(getNamedSceneFrame(scene, 'robot/arm')).toBe(bodies[1]);
    expect(model.joints.get('arm')).toBe(joint);
    expect(bodies[1]!.getWorldMatrix()[12]).toBe(12);
    expect(bodies[0]!.getWorldMatrix()[12]).toBe(10);
    joint.value = 4;
    expect(bodies[1]!.getWorldMatrix()[12]).toBe(14);
    model.prepend(bodies[1]!);
    resolve();
    expect(bodies[1]!.getWorldMatrix()[12]).toBe(14);
  });

  it.each(['missing', 'non-body', 'outside/body', 'base'])(
    'rejects child %s without hiding independent bodies',
    child => {
      const { model, joint, bodies, errors, resolve } = graph();
      const frame = document.createElement('nve-scene-frame');
      frame.name = 'non-body';
      model.append(frame);
      joint.child = child;
      resolve();
      expect(isFrameChainValid(joint)).toBe(false);
      expect(isFrameChainValid(bodies[2]!)).toBe(true);
      expect(errors).toContainEqual(expect.objectContaining({ code: 'joint-connection', element: joint }));
      joint.child = 'arm';
      resolve();
      expect(isFrameChainValid(bodies[1]!)).toBe(true);
    }
  );

  it('suppresses a child with a missing parent and recovers when that parent arrives or returns', () => {
    const { model, bodies, joint, resolve } = graph();
    joint.parent = 'late';
    resolve();
    expect(() => bodies[1]!.getWorldMatrix()).toThrow();
    const late = document.createElement('nve-scene-body');
    late.name = 'late';
    model.append(late);
    resolve();
    expect(bodies[1]!.getWorldMatrix()[12]).toBe(2);
    late.remove();
    resolve();
    expect(() => bodies[1]!.getWorldMatrix()).toThrow();
    model.append(late);
    resolve();
    expect(bodies[1]!.getWorldMatrix()[12]).toBe(2);
  });

  it('rejects multiple incoming joints, including an invalid competing connection, and recovers on removal', () => {
    const { model, bodies, joint, resolve } = graph();
    const other = document.createElement('nve-scene-joint');
    other.parent = 'missing';
    other.child = 'arm';
    model.append(other);
    resolve();
    expect(isFrameChainValid(joint)).toBe(false);
    expect(isFrameChainValid(bodies[1]!)).toBe(false);
    other.remove();
    resolve();
    expect(bodies[1]!.getWorldMatrix()[12]).toBe(2);
  });

  it('rejects cycles and propagates invalidity through downstream bodies', () => {
    const { model, bodies, joint, resolve } = graph();
    const closing = document.createElement('nve-scene-joint');
    closing.parent = 'arm';
    closing.child = 'base';
    const downstream = document.createElement('nve-scene-joint');
    downstream.parent = 'arm';
    downstream.child = 'tool';
    model.append(closing, downstream);
    resolve();
    for (const body of bodies) expect(isFrameChainValid(body)).toBe(false);
    closing.remove();
    resolve();
    expect(isFrameChainValid(joint)).toBe(true);
    for (const body of bodies) expect(isFrameChainValid(body)).toBe(true);
  });

  it('rejects competing child frame authority and duplicate body names', () => {
    const { bodies, model, resolve } = graph();
    bodies[1]!.frame = 'base';
    resolve();
    expect(isFrameChainValid(bodies[1]!)).toBe(false);
    bodies[1]!.frame = null;
    resolve();
    expect(bodies[1]!.getWorldMatrix()[12]).toBe(2);
    const duplicate = document.createElement('nve-scene-body');
    duplicate.name = 'base';
    model.append(duplicate);
    resolve();
    expect(isFrameChainValid(bodies[1]!)).toBe(false);
    duplicate.remove();
    resolve();
    expect(bodies[1]!.getWorldMatrix()[12]).toBe(2);
  });

  it('suppresses ambiguous child bodies instead of moving them to the model root', () => {
    const { model, bodies, resolve } = graph();
    const duplicate = document.createElement('nve-scene-body');
    duplicate.name = 'arm';
    model.append(duplicate);
    resolve();
    expect(isFrameChainValid(bodies[1]!)).toBe(false);
    expect(isFrameChainValid(duplicate)).toBe(false);
    expect(isFrameChainValid(bodies[2]!)).toBe(true);
    duplicate.remove();
    resolve();
    expect(bodies[1]!.getWorldMatrix()[12]).toBe(2);
  });

  it('does not connect bodies across enclosing model scopes or nested scenes', () => {
    const { model, joint, bodies, resolve } = graph();
    const nested = document.createElement('nve-scene-model');
    model.append(nested);
    nested.append(joint);
    resolve();
    expect(isFrameChainValid(joint)).toBe(false);
    model.append(joint);
    const otherScene = document.createElement('nve-scene');
    model.append(otherScene);
    otherScene.append(bodies[0]!);
    resolve();
    expect(isFrameChainValid(joint)).toBe(false);
  });

  it('keeps empty bodies in the transform graph without submitting geometry', () => {
    const { model, bodies, content, resolve } = graph();
    for (const body of bodies) body.geometry = [];
    resolve();
    expect(content.compileRenderItems()).toEqual([]);
    expect(bodies[1]!.getWorldMatrix()[12]).toBe(2);
    bodies[1]!.geometry = [{ type: 'cube' }];
    expect(content.compileRenderItems().map(item => item.layer)).toEqual([bodies[1]]);
    model.joints.set('arm', 3);
    expect(content.compileRenderItems()[0]!.frameMatrix[12]).toBe(3);
  });

  it('keeps empty body frames available to sensors and point queries before a GPU exists', async () => {
    configureSceneTesting({ requestAdapter: async () => null });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fixture = await createFixture(html`<nve-scene aria-label="Rigid bodies">
      <nve-scene-model name="robot" position="[10,0,0]">
        <nve-scene-body name="base"></nve-scene-body>
        <nve-scene-body name="tool"></nve-scene-body>
        <nve-scene-joint name="lift" parent="base" child="tool" type="prismatic" axis="[0,0,1]" value="2"></nve-scene-joint>
        <nve-scene-frame name="sensor" frame="tool" position="[0,1,0]"></nve-scene-frame>
      </nve-scene-model>
    </nve-scene>`);
    const body = fixture.querySelector<SceneBody>('nve-scene-body[name="tool"]')!;
    await elementIsStable(body);
    await vi.waitFor(() => expect(body.getWorldPoint([0, 0, 1])).toEqual([10, 0, 3]));
    expect(body.getLocalPoint([10, 0, 3])).toEqual([0, 0, 1]);
    expect(fixture.querySelector('nve-scene-frame')!.getWorldPoint([0, 0, 0])).toEqual([10, 1, 2]);
    const joint = fixture.querySelector('nve-scene-joint')!;
    joint.setAttribute('parent', 'missing');
    await elementIsStable(joint);
    await vi.waitFor(() => expect(body.getWorldPoint([0, 0, 0])).toBeNull());
    joint.setAttribute('parent', 'base');
    await elementIsStable(joint);
    await vi.waitFor(() => expect(body.getWorldPoint([0, 0, 1])).toEqual([10, 0, 3]));
    body.remove();
    expect(body.getWorldPoint([0, 0, 0])).toBeNull();
  });
});
