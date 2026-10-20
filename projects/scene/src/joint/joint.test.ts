// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { html } from 'lit';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { SceneContent } from '../internal/composition/scene/content.js';
import { isFrameChainValid } from '../internal/composition/frame/state.js';
import { configureSceneTesting, resetSceneTesting } from '../internal/testing/scene.js';
import { SceneJoint, type SceneJointType } from './index.js';
import type { SceneErrorDetail, ScenePose, Vec3 } from '../index.js';
import './define.js';
import '../frame/define.js';
import '../body/define.js';

function composition() {
  const scene = document.createElement('nve-scene');
  const joint = document.createElement('nve-scene-joint');
  joint.name = 'drive';
  const body = document.createElement('nve-scene-body');
  body.geometry = [{ kind: 'cube' }];
  joint.append(body);
  const unrelated = document.createElement('nve-scene-body');
  unrelated.geometry = [{ kind: 'cube' }];
  scene.append(joint, unrelated);
  const errors: SceneErrorDetail[] = [];
  scene.addEventListener('nve-scene-error', event => errors.push(event.detail));
  const content = new SceneContent(scene);
  return {
    scene,
    joint,
    body,
    unrelated,
    errors,
    content,
    resolve() {
      content.refresh();
      content.resolveFrames();
    }
  };
}

function expectPose(actual: ScenePose, expected: ScenePose) {
  actual.position.forEach((value, index) => expect(value).toBeCloseTo(expected.position[index]!, 6));
  actual.orientation.forEach((value, index) => expect(value).toBeCloseTo(expected.orientation[index]!, 6));
}

describe(SceneJoint.metadata.tag, () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    resetSceneTesting();
    vi.restoreAllMocks();
  });

  it.each<{ axis: Vec3; expected: Vec3 }>([
    { axis: [2, 0, 0], expected: [Math.SQRT1_2, 0, 0] },
    { axis: [0, 3, 0], expected: [0, Math.SQRT1_2, 0] },
    { axis: [0, 0, 4], expected: [0, 0, Math.SQRT1_2] },
    { axis: [1, 1, 0], expected: [0.5, 0.5, 0] },
    { axis: [Number.MAX_VALUE, Number.MAX_VALUE, 0], expected: [0.5, 0.5, 0] }
  ])('normalizes $axis and rotates synchronously', ({ axis, expected }) => {
    const joint = document.createElement('nve-scene-joint');
    joint.axis = axis;
    joint.value = Math.PI / 2;
    expectPose(joint.pose, { position: [0, 0, 0], orientation: [...expected, Math.SQRT1_2] });
  });

  it('composes a non-identity origin before rotational and prismatic motion', async () => {
    fixture = await createFixture(
      html`<nve-scene-joint position="[3,4,5]" orientation="[0,0,0.7071067811865476,0.7071067811865476]"></nve-scene-joint>`
    );
    const joint = fixture.querySelector('nve-scene-joint')!;
    await elementIsStable(joint);
    joint.type = 'prismatic';
    joint.value = 2;
    expectPose(joint.pose, { position: [3, 6, 5], orientation: [0, 0, Math.SQRT1_2, Math.SQRT1_2] });
    joint.type = 'revolute';
    joint.value = Math.PI / 2;
    expectPose(joint.pose, { position: [3, 4, 5], orientation: [0.5, 0.5, 0.5, 0.5] });
    joint.type = 'fixed';
    joint.axis = [0, 0, 0];
    joint.value = 100;
    expectPose(joint.pose, { position: [3, 4, 5], orientation: [0, 0, Math.SQRT1_2, Math.SQRT1_2] });
  });

  it('calibrates values and applies continuous motion past a full turn', () => {
    const joint = document.createElement('nve-scene-joint');
    joint.type = 'prismatic';
    joint.offset = 0.5;
    joint.scale = -2;
    joint.value = 1;
    expect(joint.pose.position).toEqual([-1.5, 0, 0]);
    joint.type = 'continuous';
    joint.axis = [0, 0, 1];
    joint.offset = 0;
    joint.scale = 1;
    joint.lower = 10;
    joint.upper = -10;
    joint.value = (5 * Math.PI) / 2;
    expectPose(joint.pose, { position: [0, 0, 0], orientation: [0, 0, -Math.SQRT1_2, -Math.SQRT1_2] });
  });

  it('reports each limit crossing while applying values and keeping reversed limits valid', () => {
    const { joint, errors, content, resolve } = composition();
    joint.type = 'prismatic';
    joint.lower = -1;
    joint.upper = 1;
    resolve();
    for (const value of [2, 3, 0, 2, -2]) joint.value = value;
    expect(errors.filter(error => error.code === 'joint-limit')).toHaveLength(3);
    expect(joint.pose.position).toEqual([-2, 0, 0]);
    expect(isFrameChainValid(joint)).toBe(true);
    expect(content.compileRenderItems()).toHaveLength(2);
    joint.lower = 2;
    joint.value = 50;
    expect(errors.filter(error => error.code === 'joint-limit')).toHaveLength(4);
    expect(joint.pose.position).toEqual([50, 0, 0]);
  });

  it('synchronously mimics calibrated values and rejects a second mimic level', () => {
    const { scene, joint, resolve, errors } = composition();
    joint.type = 'prismatic';
    joint.scale = 2;
    joint.offset = 0.5;
    const follower = document.createElement('nve-scene-joint');
    follower.name = 'follower';
    follower.type = 'prismatic';
    follower.mimic = 'drive';
    follower.mimicMultiplier = -2;
    follower.mimicOffset = 1;
    scene.append(follower);
    resolve();
    joint.mimic = '  ';
    resolve();
    joint.value = 1;
    expect(follower.pose.position).toEqual([-4, 0, 0]);
    follower.value = 99;
    expect(follower.pose.position).toEqual([-4, 0, 0]);
    joint.value = 2;
    expect(follower.pose.position).toEqual([-8, 0, 0]);
    joint.mimic = 'missing';
    resolve();
    expect(isFrameChainValid(follower)).toBe(false);
    expect(errors).toContainEqual(expect.objectContaining({ code: 'joint-mimic', element: follower }));
    joint.mimic = null;
    resolve();
    expect(follower.pose.position).toEqual([-8, 0, 0]);
    joint.remove();
    resolve();
    expect(isFrameChainValid(follower)).toBe(false);
  });

  it('rejects missing, non-joint, self, and cross-scene targets and resolves a late target', () => {
    const { scene, joint, unrelated, content, errors, resolve } = composition();
    joint.mimic = 'late';
    resolve();
    expect(content.compileRenderItems().map(item => item.layer)).toEqual([unrelated]);
    const target = document.createElement('nve-scene-joint');
    target.name = 'late';
    scene.append(target);
    resolve();
    expect(isFrameChainValid(joint)).toBe(true);
    const other = document.createElement('nve-scene');
    scene.append(other);
    other.append(target);
    resolve();
    expect(isFrameChainValid(joint)).toBe(false);
    const frame = document.createElement('nve-scene-frame');
    frame.name = 'late';
    scene.append(frame);
    resolve();
    expect(isFrameChainValid(joint)).toBe(false);
    joint.mimic = 'drive';
    resolve();
    expect(isFrameChainValid(joint)).toBe(false);
    expect(errors.some(error => error.code === 'joint-mimic')).toBe(true);
  });

  it.each(['type', 'axis', 'value', 'lower', 'upper', 'offset', 'scale', 'mimicMultiplier', 'mimicOffset'] as const)(
    'invalidates only the affected chain for an invalid %s and recovers',
    key => {
      const { joint, body, unrelated, errors, content, resolve } = composition();
      resolve();
      const invalidAtDiagnostic: boolean[] = [];
      joint.addEventListener('nve-scene-error', () => invalidAtDiagnostic.push(!isFrameChainValid(body)));
      Reflect.set(joint, key, key === 'type' ? 'spherical' : key === 'axis' ? [0, 0, 0] : Infinity);
      expect(isFrameChainValid(body)).toBe(false);
      expect(invalidAtDiagnostic).toEqual([true]);
      expect(() => joint.getWorldMatrix()).toThrow();
      expect(content.compileRenderItems().map(item => item.layer)).toEqual([unrelated]);
      expect(errors).toContainEqual(
        expect.objectContaining({
          code: key === 'type' ? 'joint-type' : key === 'axis' ? 'joint-axis' : 'joint-value',
          element: joint
        })
      );
      Reflect.set(joint, key, key === 'type' ? 'revolute' : key === 'axis' ? [1, 0, 0] : 0);
      expect(isFrameChainValid(body)).toBe(true);
      expect(content.compileRenderItems()).toHaveLength(2);
    }
  );

  it.each([{ axis: [NaN, 0, 0] }, { axis: [Infinity, 0, 0] }, { axis: [1, undefined, 0] }])(
    'rejects a non-finite axis $axis without hiding unrelated content',
    ({ axis }) => {
      const { joint, unrelated, content, errors, resolve } = composition();
      resolve();
      Reflect.set(joint, 'axis', axis);
      expect(errors).toContainEqual(expect.objectContaining({ code: 'joint-axis', element: joint }));
      expect(isFrameChainValid(joint)).toBe(false);
      expect(content.compileRenderItems().map(item => item.layer)).toEqual([unrelated]);
    }
  );

  it('keeps a synchronous correction made by a diagnostic listener and updates mimic dependents', () => {
    const { scene, joint, resolve } = composition();
    const follower = document.createElement('nve-scene-joint');
    joint.type = 'prismatic';
    follower.type = 'prismatic';
    follower.mimic = 'drive';
    scene.append(follower);
    resolve();
    joint.addEventListener('nve-scene-error', event => {
      if (event.detail.code === 'joint-value') joint.value = 2;
    });
    joint.value = Infinity;
    expect(joint.pose.position).toEqual([2, 0, 0]);
    expect(follower.pose.position).toEqual([2, 0, 0]);
  });

  it('stores values under explicit authority and restores motion on release', () => {
    const joint = document.createElement('nve-scene-joint');
    joint.type = 'prismatic';
    joint.setPose({ position: [4, 5, 6], orientation: [0, 0, 0, 1] });
    joint.value = 2;
    joint.offset = 1;
    expect(joint.pose.position).toEqual([4, 5, 6]);
    expect(joint.value).toBe(2);
    joint.setPose(null);
    expect(joint.pose.position).toEqual([3, 0, 0]);
  });

  it('matches a flat three-joint chain to nested frames driven by precomputed poses', async () => {
    configureSceneTesting({ requestAdapter: async () => null });
    fixture = await createFixture(html`<nve-scene aria-label="Kinematics">
      <nve-scene-joint name="j3" frame="j2" axis="[0,1,0]" position="[0,0,3]"></nve-scene-joint>
      <nve-scene-joint name="j2" frame="j1" axis="[0,1,0]" position="[0,0,2]"></nve-scene-joint>
      <nve-scene-joint name="j1" axis="[0,0,1]" position="[1,0,0]"></nve-scene-joint>
      <nve-scene-frame id="f1"><nve-scene-frame id="f2"><nve-scene-frame id="f3"></nve-scene-frame></nve-scene-frame></nve-scene-frame>
    </nve-scene>`);
    const scene = fixture.querySelector('nve-scene')!;
    const joints = [...scene.querySelectorAll('nve-scene-joint')];
    await Promise.all(joints.map(joint => elementIsStable(joint)));
    for (const joint of joints) joint.value = Math.PI / 2;
    const poses: ScenePose[] = [
      { position: [1, 0, 0], orientation: [0, 0, Math.SQRT1_2, Math.SQRT1_2] },
      { position: [0, 0, 2], orientation: [0, Math.SQRT1_2, 0, Math.SQRT1_2] },
      { position: [0, 0, 3], orientation: [0, Math.SQRT1_2, 0, Math.SQRT1_2] }
    ];
    const frames = [...scene.querySelectorAll('nve-scene-frame')];
    frames.forEach((frame, index) => frame.setPose(poses[index]!));
    joints[0]!
      .getWorldMatrix()
      .forEach((value, index) => expect(value).toBeCloseTo(frames[2]!.getWorldMatrix()[index]!, 5));
    expectTypeOf<SceneJoint['type']>().toEqualTypeOf<SceneJointType>();
    expectTypeOf<SceneJoint['value']>().toEqualTypeOf<number>();
    expectTypeOf<SceneJoint['frame']>().toEqualTypeOf<string | null>();
  });
});
