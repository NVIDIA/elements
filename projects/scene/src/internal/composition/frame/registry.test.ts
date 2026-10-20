// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getElementName,
  getNameScope,
  resolveFrameName,
  resolveJointName,
  updateFrameRegistry,
  validateFrameName
} from './registry.js';
import { hasFrameConstraintFailure } from './constraints.js';

function member(tag: string, name: string): HTMLElement {
  const element = document.createElement(tag);
  element.setAttribute('name', name);
  return element;
}

describe('scene name registry', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('normalizes authored names and lets properties take precedence over attributes', () => {
    const frame = member('div', ' attribute ');
    expect(getElementName(frame)).toBe('attribute');
    Object.assign(frame, { name: ' property ' });
    expect(getElementName(frame)).toBe('property');
    frame.setAttribute('name', 'ignored');
    expect(getElementName(frame)).toBe('property');
  });

  it('separates joint names from frames and resolves nested qualified model paths', () => {
    const scene = document.createElement('nve-scene');
    const outer = member('nve-scene-model', 'robot');
    const inner = member('nve-scene-model', 'arm');
    const body = member('nve-scene-body', 'elbow');
    const joint = member('nve-scene-joint', 'elbow');
    scene.append(outer);
    outer.append(inner);
    inner.append(body, joint);
    updateFrameRegistry(scene, [outer, inner, body, joint], []);
    expect(getNameScope(outer, scene)).toBe(scene);
    expect(getNameScope(inner, scene)).toBe(outer);
    expect(getNameScope(body, scene)).toBe(inner);
    expect(resolveFrameName(scene, ' robot / arm / elbow ')).toBe(body);
    expect(resolveJointName(scene, 'robot/arm/elbow')).toBe(joint);
    expect(resolveFrameName(scene, 'elbow', joint)).toBe(body);
    expect(resolveJointName(scene, 'elbow', body)).toBe(joint);
    expect(resolveFrameName(scene, 'elbow')).toBeUndefined();
    expect(resolveFrameName(document.createElement('nve-scene'), 'robot')).toBeUndefined();
  });

  it('lets duplicate local names shadow outer names and recovers after removal or renaming', () => {
    const scene = document.createElement('nve-scene');
    const outer = member('nve-scene-frame', 'anchor');
    const model = member('nve-scene-model', 'arm');
    const first = member('nve-scene-frame', 'anchor');
    const second = member('nve-scene-frame', 'anchor');
    scene.append(outer, model);
    model.append(first, second);
    updateFrameRegistry(scene, [outer, model, first, second], []);
    expect(resolveFrameName(scene, 'anchor', first)).toBeUndefined();
    expect(resolveFrameName(scene, 'anchor')).toBe(outer);
    second.setAttribute('name', 'other');
    updateFrameRegistry(scene, [outer, model, first, second], []);
    expect(resolveFrameName(scene, 'anchor', second)).toBe(first);
    first.remove();
    updateFrameRegistry(scene, [outer, model, second], []);
    expect(resolveFrameName(scene, 'anchor', second)).toBe(outer);
  });

  it('invalidates anonymous models addressed externally and recovers when named', () => {
    const scene = document.createElement('nve-scene');
    const model = member('nve-scene-model', '');
    const tip = member('nve-scene-frame', 'tcp');
    const reference = Object.assign(document.createElement('div'), { frame: 'arm/tcp' });
    scene.append(model, reference);
    model.append(tip);
    updateFrameRegistry(scene, [model, tip], [reference]);
    expect(hasFrameConstraintFailure(model)).toBe(true);
    expect(resolveFrameName(scene, 'tcp', tip)).toBe(tip);
    model.setAttribute('name', 'arm');
    updateFrameRegistry(scene, [model, tip], [reference]);
    expect(hasFrameConstraintFailure(model)).toBe(false);
    expect(resolveFrameName(scene, 'arm/tcp')).toBe(tip);
  });

  it('rejects bare scope separators and clears their constraint after correction', () => {
    const frame = member('nve-scene-frame', 'arm/tcp');
    validateFrameName(frame);
    expect(hasFrameConstraintFailure(frame)).toBe(true);
    frame.setAttribute('name', 'tcp');
    validateFrameName(frame);
    expect(hasFrameConstraintFailure(frame)).toBe(false);
  });
});
