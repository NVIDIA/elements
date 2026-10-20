// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { SceneModel, type SceneModelBodies, type SceneModelJoints } from './index.js';
import { CameraController } from '../internal/composition/camera/camera.controller.js';
import { SceneContent } from '../internal/composition/scene/content.js';
import { getNamedSceneFrame, isFrameChainValid } from '../internal/composition/frame/state.js';
import { takeBodyLayerRenderData } from '../internal/layers/body/layer-state.js';
import { PreparedRGBAModulation } from '../internal/color/modulation.js';
import { resolveSceneColor } from '../internal/color/color.js';
import { configureSceneTesting, resetSceneTesting } from '../internal/testing/scene.js';
import type { SceneErrorDetail } from '../index.js';
import './define.js';
import '../joint/define.js';
import '../body/define.js';
import '../camera/define.js';
import '../points/define.js';

function composition() {
  const scene = document.createElement('nve-scene');
  const content = new SceneContent(scene);
  const errors: SceneErrorDetail[] = [];
  scene.addEventListener('nve-scene-error', event => errors.push(event.detail));
  const unrelated = document.createElement('nve-scene-body');
  unrelated.geometry = [{ type: 'cube' }];
  scene.append(unrelated);
  return {
    scene,
    content,
    errors,
    unrelated,
    resolve() {
      content.refresh();
      content.resolveFrames();
    }
  };
}

function arm(name: string) {
  const model = document.createElement('nve-scene-model');
  model.name = name;
  const joint = document.createElement('nve-scene-joint');
  joint.name = 'shoulder';
  joint.type = 'prismatic';
  const tip = document.createElement('nve-scene-frame');
  tip.name = 'tcp';
  tip.frame = 'driven';
  joint.parent = 'base';
  joint.child = 'driven';
  const base = document.createElement('nve-scene-body');
  base.name = 'base';
  const driven = document.createElement('nve-scene-body');
  driven.name = 'driven';
  const body = document.createElement('nve-scene-body');
  body.frame = 'tcp';
  body.geometry = [{ type: 'cube' }];
  model.append(base, driven, joint, tip, body);
  return { model, joint, tip, body };
}

describe(SceneModel.metadata.tag, () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    resetSceneTesting();
    vi.restoreAllMocks();
  });

  it('isolates identical internal names and exposes qualified references to outside layers', () => {
    const { scene, content, errors, resolve } = composition();
    const first = arm('armA');
    const second = arm('armB');
    scene.append(first.model, second.model);
    first.model.joints.set('shoulder', 2);
    second.model.joints.set('shoulder', 5);
    const outside = document.createElement('nve-scene-points');
    outside.frame = 'armB/tcp';
    scene.append(outside);
    resolve();
    expect(first.tip.getWorldMatrix()[12]).toBe(2);
    expect(second.tip.getWorldMatrix()[12]).toBe(5);
    expect(getNamedSceneFrame(scene, 'tcp')).toBeUndefined();
    expect(getNamedSceneFrame(scene, 'armB/tcp')).toBe(second.tip);
    expect(content.compileRenderItems().find(item => item.layer === outside)?.frameMatrix[12]).toBe(5);
    expect(errors.filter(error => error.code === 'frame-name-duplicate')).toHaveLength(0);
    const follower = document.createElement('nve-scene-joint');
    follower.type = 'prismatic';
    follower.name = 'follower';
    follower.mimic = 'shoulder';
    follower.parent = 'base';
    follower.child = 'follower-body';
    const followerBody = document.createElement('nve-scene-body');
    followerBody.name = 'follower-body';
    first.model.append(followerBody, follower);
    resolve();
    first.model.joints.set('shoulder', 3);
    expect(follower.pose.position[0]).toBe(3);
    expect(second.tip.getWorldMatrix()[12]).toBe(5);
    follower.mimic = 'armB/shoulder';
    resolve();
    expect(isFrameChainValid(follower)).toBe(false);
    expect(errors).toContainEqual(expect.objectContaining({ code: 'joint-mimic', element: follower }));
    follower.mimic = 'shoulder';
    resolve();
    expect(follower.pose.position[0]).toBe(3);
  });

  it('walks outward through nested scopes and lets local names shadow outer names', () => {
    const { scene, resolve } = composition();
    const outer = arm('outer');
    const inner = arm('inner');
    outer.model.append(inner.model);
    scene.append(outer.model);
    const reference = document.createElement('nve-scene-frame');
    reference.frame = 'anchor';
    inner.model.append(reference);
    const anchor = document.createElement('nve-scene-frame');
    anchor.name = 'anchor';
    anchor.position = [4, 0, 0];
    anchor.orientation = [0, 0, 0, 1];
    outer.model.append(anchor);
    resolve();
    expect(reference.getWorldMatrix()[12]).toBe(4);
    expect(getNamedSceneFrame(scene, 'outer/inner/tcp')).toBe(inner.tip);
    expect(getNamedSceneFrame(scene, ' outer / inner / tcp ')).toBe(inner.tip);
    const local = document.createElement('nve-scene-frame');
    local.name = 'anchor';
    local.position = [7, 0, 0];
    local.orientation = [0, 0, 0, 1];
    inner.model.append(local);
    resolve();
    expect(reference.getWorldMatrix()[12]).toBe(7);
    expect(outer.model.joints.names()).toEqual(['shoulder']);
  });

  it('updates the joint view on membership changes and resets only non-mimic inputs', () => {
    const { scene, resolve } = composition();
    const entity = arm('arm');
    scene.append(entity.model);
    resolve();
    const view = entity.model.joints;
    expect(Object.isFrozen(view)).toBe(true);
    expect(view.has('shoulder')).toBe(true);
    expect(view.get('shoulder')).toBe(entity.joint);
    view.set('shoulder', 2);
    expect(view.values()).toEqual({ shoulder: 2 });
    const follower = document.createElement('nve-scene-joint');
    follower.name = 'follower';
    follower.mimic = 'shoulder';
    follower.value = 9;
    entity.model.append(follower);
    resolve();
    expect(view.names()).toEqual(['shoulder', 'follower']);
    view.reset();
    expect(entity.joint.value).toBe(0);
    expect(follower.value).toBe(9);
    follower.remove();
    expect(view.has('follower')).toBe(false);
    expect(view.names()).toEqual(['shoulder']);
    expectTypeOf<SceneModel['joints']>().toEqualTypeOf<SceneModelJoints>();
    expectTypeOf<Extract<keyof SceneModel, 'src' | 'description' | 'source'>>().toEqualTypeOf<never>();
  });

  it('assigns a record of joint values and reports unknown names without skipping known joints', () => {
    const { scene, errors, resolve } = composition();
    const entity = arm('arm');
    const follower = document.createElement('nve-scene-joint');
    follower.name = 'follower';
    follower.mimic = 'shoulder';
    entity.model.append(follower);
    scene.append(entity.model);
    resolve();
    const view = entity.model.joints;
    view.set({ shoulder: 1, follower: 5 });
    expect(view.values()).toEqual({ shoulder: 1, follower: 5 });
    view.set({ ' shoulder ': 3, missing: 4 });
    expect(entity.joint.value).toBe(3);
    expect(errors).toContainEqual(expect.objectContaining({ code: 'model-joint', element: entity.model }));
    expect(isFrameChainValid(entity.body)).toBe(false);
    view.set(view.values());
    expect(isFrameChainValid(entity.body)).toBe(true);
    expectTypeOf(view.set).toBeCallableWith({ shoulder: 1 });
    expectTypeOf(view.set).toBeCallableWith('shoulder', 1);
  });

  it('views bodies named in its own frame scope and follows membership changes', () => {
    const entity = arm('arm');
    const view = entity.model.bodies;
    expect(Object.isFrozen(view)).toBe(true);
    expect(view.names()).toEqual(['base', 'driven']);
    expect(view.get('base')).toBe(entity.model.querySelector('nve-scene-body'));
    expect(view.get(' driven ')?.name).toBe('driven');
    expect(view.has('tcp')).toBe(false);
    const nested = document.createElement('nve-scene-model');
    nested.name = 'gripper';
    const jaw = document.createElement('nve-scene-body');
    jaw.name = 'jaw';
    nested.append(jaw);
    entity.model.append(nested);
    expect(view.has('jaw')).toBe(false);
    expect(nested.bodies.get('jaw')).toBe(jaw);
    const shadow = document.createElement('nve-scene-frame');
    shadow.name = 'base';
    entity.model.append(shadow);
    expect(view.get('base')).toBeUndefined();
    shadow.remove();
    jaw.name = 'tool';
    entity.model.append(jaw);
    expect(view.names()).toEqual(['base', 'driven', 'tool']);
    jaw.remove();
    expect(view.has('tool')).toBe(false);
    expectTypeOf<SceneModel['bodies']>().toEqualTypeOf<SceneModelBodies>();
  });

  it('reports unknown joints on the model, invalidates its chain, and recovers on a valid access', () => {
    const { scene, content, unrelated, errors, resolve } = composition();
    const entity = arm('arm');
    scene.append(entity.model);
    resolve();
    entity.model.joints.set('missing', 1);
    expect(errors).toContainEqual(expect.objectContaining({ code: 'model-joint', element: entity.model }));
    expect(isFrameChainValid(entity.body)).toBe(false);
    expect(
      content
        .compileRenderItems()

        .map(item => item.layer)
    ).toEqual([unrelated]);
    entity.model.joints.set('shoulder', 1);
    expect(isFrameChainValid(entity.body)).toBe(true);
  });

  it('rejects slash in bare names and scoped duplicates while unrelated content renders', () => {
    const { scene, content, unrelated, errors, resolve } = composition();
    const entity = arm('arm');
    scene.append(entity.model);
    entity.joint.name = 'bad/name';
    resolve();
    expect(errors).toContainEqual(expect.objectContaining({ code: 'frame-name', element: entity.joint }));
    expect(isFrameChainValid(entity.joint)).toBe(false);
    expect(
      content
        .compileRenderItems()

        .map(item => item.layer)
    ).toEqual([unrelated]);
    entity.joint.name = 'shoulder';
    const duplicate = document.createElement('nve-scene-joint');
    duplicate.name = 'shoulder';
    duplicate.parent = 'base';
    duplicate.child = 'driven';
    entity.model.append(duplicate);
    resolve();
    expect(errors.filter(error => error.code === 'frame-name-duplicate')).toHaveLength(2);
    expect(isFrameChainValid(entity.tip)).toBe(false);
    expect(
      content
        .compileRenderItems()

        .map(item => item.layer)
    ).toEqual([unrelated]);
    duplicate.remove();
    resolve();
    expect(isFrameChainValid(entity.tip)).toBe(true);
  });

  it('permits anonymous entities until an outside qualified reference addresses their member', () => {
    const { scene, content, unrelated, errors, resolve } = composition();
    const entity = arm('');
    scene.append(entity.model);
    resolve();
    expect(isFrameChainValid(entity.body)).toBe(true);
    const outside = document.createElement('nve-scene-body');
    outside.geometry = [{ type: 'cube' }];
    outside.frame = 'arm/tcp';
    scene.append(outside);
    resolve();
    expect(errors).toContainEqual(expect.objectContaining({ code: 'model-name', element: entity.model }));
    expect(isFrameChainValid(entity.body)).toBe(false);
    expect(
      content
        .compileRenderItems()

        .map(item => item.layer)
    ).toEqual([unrelated]);
    resolve();
    expect(errors.filter(error => error.code === 'model-name')).toHaveLength(1);
    outside.frame = null;
    resolve();
    expect(isFrameChainValid(entity.body)).toBe(true);
    outside.frame = 'arm/tcp';
    resolve();
    expect(errors.filter(error => error.code === 'model-name')).toHaveLength(2);
    entity.model.name = 'arm';
    resolve();
    expect(isFrameChainValid(entity.body)).toBe(true);
    expect(isFrameChainValid(outside)).toBe(true);
  });

  it('composes nested model tint with body tint without changing captured geometry', () => {
    const { scene } = composition();
    const outer = arm('outer');
    const inner = arm('inner');
    outer.model.append(inner.model);
    scene.append(outer.model);
    outer.model.tint = '#808080';
    inner.model.tint = '#76b900';
    inner.body.tint = '#e8eaed';
    const before = takeBodyLayerRenderData(inner.body);
    const expected = resolveSceneColor('#e8eaed');
    new PreparedRGBAModulation(resolveSceneColor('#808080')).writeColor(expected, 0, expected, 0);
    new PreparedRGBAModulation(resolveSceneColor('#76b900')).writeColor(expected, 0, expected, 0);
    before.color.forEach((value, index) => expect(value).toBeCloseTo(expected[index]!, 6));
    outer.model.tint = '#ffffff';
    const after = takeBodyLayerRenderData(inner.body);
    expect(after.positions).toBe(before.positions);
    expect(after.topologyVersion).toBe(before.topologyVersion);
  });

  it('rejects and corrects an invalid bare frame name without a model or GPU registry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fixture = await createFixture(html`<nve-scene-frame name="bad/name"></nve-scene-frame>`);
    const frame = fixture.querySelector('nve-scene-frame')!;
    await elementIsStable(frame);
    expect(isFrameChainValid(frame)).toBe(false);
    expect(() => frame.getWorldMatrix()).toThrow();
    frame.name = 'corrected';
    await elementIsStable(frame);
    expect(isFrameChainValid(frame)).toBe(true);
    expect(frame.getWorldMatrix()[15]).toBe(1);
  });

  it('refreshes named body collisions after attribute changes before a GPU exists', async () => {
    configureSceneTesting({ requestAdapter: async () => null });
    const log = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fixture = await createFixture(html`<nve-scene aria-label="Named body scope"><nve-scene-model name="arm">
      <nve-scene-frame name="tip"></nve-scene-frame><nve-scene-body name="tip"></nve-scene-body>
    </nve-scene-model></nve-scene>`);
    const scene = fixture.querySelector('nve-scene')!;
    await vi.waitFor(() =>
      expect(log).toHaveBeenCalledWith(expect.stringContaining('[frame-name-duplicate]'), expect.anything())
    );
    expect(getNamedSceneFrame(scene, 'arm/tip')).toBeUndefined();
    scene.querySelector('nve-scene-body')!.removeAttribute('name');
    await vi.waitFor(() => expect(getNamedSceneFrame(scene, 'arm/tip')).toBe(scene.querySelector('nve-scene-frame')));
  });

  it('resolves a qualified camera target and model references before a GPU exists', async () => {
    configureSceneTesting({ requestAdapter: async () => null });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fixture = await createFixture(html`<nve-scene aria-label="Models">
      <nve-scene-model name="arm"><nve-scene-body name="base"></nve-scene-body><nve-scene-body name="driven"></nve-scene-body><nve-scene-joint name="shoulder" parent="base" child="driven" type="prismatic" value="3"></nve-scene-joint><nve-scene-frame name="tcp" frame="driven"></nve-scene-frame></nve-scene-model>
      <nve-scene-camera behavior="follow" frame="arm/tcp"></nve-scene-camera><nve-scene-camera behavior="orbit"></nve-scene-camera>
    </nve-scene>`);
    const scene = fixture.querySelector('nve-scene')!;
    await elementIsStable(scene);
    const model = scene.querySelector('nve-scene-model')!;
    await elementIsStable(model);
    await vi.waitFor(() => expect(model.querySelector('nve-scene-frame')!.getWorldMatrix()[12]).toBe(3));
    expect(getNamedSceneFrame(scene, 'arm/tcp')).toBe(model.querySelector('nve-scene-frame'));
    const camera = scene.querySelector('nve-scene-camera')!;
    scene.querySelectorAll('nve-scene-camera')[1]!.remove();
    camera.behavior = 'pose';
    camera.position = [0, 0, 1];
    camera.orientation = [0, 0, 0, 1];
    const runtime = new CameraController({ host: scene, requestRender: () => {} });
    runtime.resolve();
    expect(runtime.state.pose.position).toEqual([3, 0, 1]);
    model.append(camera);
    camera.frame = 'tcp';
    runtime.resolve();
    expect(runtime.state.pose.position).toEqual([3, 0, 1]);
  });
});
