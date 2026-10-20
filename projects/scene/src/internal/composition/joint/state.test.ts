// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { disconnectJoint, getJointMimicValue, publishJointValue, refreshSceneJoints, registerJoint } from './state.js';
import { updateFrameRegistry } from '../frame/registry.js';

function joint(name: string): HTMLElement {
  const element = document.createElement('nve-scene-joint');
  element.setAttribute('name', name);
  return element;
}

describe('joint mimic subscriptions', () => {
  it('publishes effective values and null failures, then unsubscribes disconnected dependents', () => {
    const scene = document.createElement('nve-scene');
    const source = joint('source');
    const follower = joint('follower');
    const refresh = vi.fn();
    registerJoint(source, vi.fn(), () => null);
    registerJoint(follower, refresh, () => 'source');
    scene.append(source, follower);
    updateFrameRegistry(scene, [source, follower], []);
    publishJointValue(source, 2);
    expect(getJointMimicValue(follower)).toBe(2);
    publishJointValue(source, null);
    expect(refresh).toHaveBeenCalledOnce();
    expect(getJointMimicValue(follower)).toBeNull();
    disconnectJoint(follower);
    publishJointValue(source, 3);
    expect(refresh).toHaveBeenCalledOnce();
    expect(getJointMimicValue(follower)).toBe(3);
    source.remove();
    disconnectJoint(source);
    expect(refresh).toHaveBeenCalledTimes(2);
    expect(getJointMimicValue(follower)).toBeNull();
  });

  it('rejects self references, mimic chains, and qualified references into sibling models', () => {
    const scene = document.createElement('nve-scene');
    const first = document.createElement('nve-scene-model');
    const second = document.createElement('nve-scene-model');
    first.setAttribute('name', 'first');
    second.setAttribute('name', 'second');
    const source = joint('source');
    const follower = joint('follower');
    const chained = joint('chained');
    const self = joint('self');
    const external = joint('external');
    registerJoint(source, vi.fn(), () => null);
    registerJoint(follower, vi.fn(), () => 'source');
    registerJoint(chained, vi.fn(), () => 'follower');
    registerJoint(self, vi.fn(), () => 'self');
    registerJoint(external, vi.fn(), () => 'first/source');
    scene.append(first, second);
    first.append(source, follower, chained, self);
    second.append(external);
    updateFrameRegistry(scene, [first, second, source, follower, chained, self, external], []);
    publishJointValue(source, 4);
    expect(getJointMimicValue(follower)).toBe(4);
    expect(getJointMimicValue(chained)).toBeNull();
    expect(getJointMimicValue(self)).toBeNull();
    expect(getJointMimicValue(external)).toBeNull();
  });

  it('refreshes bindings after registry edits but leaves unchanged bindings cached', () => {
    const scene = document.createElement('nve-scene');
    const source = joint('source');
    const follower = joint('follower');
    const refresh = vi.fn(() => getJointMimicValue(follower));
    registerJoint(
      source,
      () => {
        getJointMimicValue(source);
      },
      () => null
    );
    registerJoint(follower, refresh, () => 'source');
    scene.append(source, follower);
    updateFrameRegistry(scene, [source, follower], []);
    refreshSceneJoints(scene, [source, follower]);
    expect(refresh).toHaveBeenCalledOnce();
    refreshSceneJoints(scene, [source, follower]);
    expect(refresh).toHaveBeenCalledOnce();
    source.setAttribute('name', 'renamed');
    updateFrameRegistry(scene, [source, follower], []);
    refreshSceneJoints(scene, [source, follower]);
    expect(refresh).toHaveBeenCalledTimes(2);
    expect(getJointMimicValue(follower)).toBeNull();
  });
});
