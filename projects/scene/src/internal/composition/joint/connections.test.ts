// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureJointConnections, reportJointConnections } from './connections.js';
import { updateFrameRegistry } from '../frame/registry.js';
import { hasFrameConstraintFailure } from '../frame/constraints.js';

function graph() {
  const scene = document.createElement('nve-scene');
  const base = document.createElement('nve-scene-body');
  const tip = document.createElement('nve-scene-body');
  base.setAttribute('name', 'base');
  tip.setAttribute('name', 'tip');
  const joint = Object.assign(document.createElement('nve-scene-joint'), { parent: 'base', child: 'tip' });
  scene.append(base, tip, joint);
  const frames = [joint, tip, base];
  updateFrameRegistry(scene, frames, []);
  const messages: string[] = [];
  scene.addEventListener('nve-scene-error', event => {
    if (event.detail.code === 'joint-connection') messages.push(event.detail.message);
  });
  return { scene, base, tip, joint, frames, messages };
}

describe('joint connection capture', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('connects bodies independently of DOM order and reports later graph invalidation', () => {
    const { scene, base, tip, joint, frames, messages } = graph();
    const connections = captureJointConnections(scene, frames);
    expect(connections.parents.get(joint)).toBe(base);
    expect(connections.parents.get(tip)).toBe(joint);
    reportJointConnections(connections, connections.parents);
    expect(hasFrameConstraintFailure(joint)).toBe(false);
    const rejected = new Map(connections.parents);
    rejected.set(tip, null);
    reportJointConnections(connections, rejected);
    expect(hasFrameConstraintFailure(joint)).toBe(true);
    expect(messages).toEqual(['The joint connection belongs to a frame cycle.']);
    reportJointConnections(connections, connections.parents);
    expect(hasFrameConstraintFailure(joint)).toBe(false);
  });

  it.each(['missing', 'tip', 'other/base', ''])('keeps children unresolved for invalid parent %j', parent => {
    const { scene, tip, joint, frames } = graph();
    joint.parent = parent;
    const connections = captureJointConnections(scene, frames);
    expect(connections.parents.get(joint)).toBeNull();
    expect(connections.parents.get(tip)).toBeNull();
  });

  it('rejects competing incoming joints and explicit child frame overrides', () => {
    const { scene, tip, joint, frames, messages } = graph();
    const competing = Object.assign(document.createElement('nve-scene-joint'), { parent: 'base', child: 'tip' });
    scene.append(competing);
    const connections = captureJointConnections(scene, [...frames, competing]);
    expect(connections.parents.get(tip)).toBeNull();
    expect(connections.parents.get(joint)).toBeNull();
    expect(connections.parents.get(competing)).toBeNull();
    reportJointConnections(connections, connections.parents);
    expect(messages).toEqual([
      'The child body has more than one incoming joint.',
      'The child body has more than one incoming joint.'
    ]);
    Object.assign(tip, { frame: 'base' });
    expect(captureJointConnections(scene, frames).parents.get(tip)).toBeNull();
  });

  it.each([
    { parent: 'missing', child: 'tip', message: 'The parent name must identify a body in this joint scope.' },
    { parent: 'base', child: 'missing', message: 'The child name must identify a body in this joint scope.' },
    { parent: 'tip', child: 'tip', message: 'A joint must connect two distinct bodies.' }
  ])('explains the invalid connection from $parent to $child', ({ parent, child, message }) => {
    const { scene, joint, frames, messages } = graph();
    Object.assign(joint, { parent, child });
    const connections = captureJointConnections(scene, frames);
    reportJointConnections(connections, connections.parents);
    expect(messages).toEqual([message]);
  });

  it.each(['base', 'tip'])('explains an ambiguous endpoint named %s', name => {
    const { scene, frames, messages } = graph();
    const duplicate = document.createElement('nve-scene-body');
    duplicate.setAttribute('name', name);
    scene.append(duplicate);
    const candidates = [...frames, duplicate];
    updateFrameRegistry(scene, candidates, []);
    const connections = captureJointConnections(scene, candidates);
    reportJointConnections(connections, connections.parents);
    const endpoint = name === 'base' ? 'parent' : 'child';
    expect(messages).toEqual([`The ${endpoint} name identifies more than one frame in this joint scope.`]);
  });

  it('explains a conflicting child frame reference', () => {
    const { scene, tip, frames, messages } = graph();
    Object.assign(tip, { frame: 'base' });
    const connections = captureJointConnections(scene, frames);
    reportJointConnections(connections, connections.parents);
    expect(messages).toEqual(['A joint child body cannot also declare a frame reference.']);
  });

  it('suppresses all ambiguous child candidates until the duplicate disappears', () => {
    const { scene, tip, joint, frames } = graph();
    const duplicate = document.createElement('nve-scene-body');
    duplicate.setAttribute('name', 'tip');
    scene.append(duplicate);
    updateFrameRegistry(scene, [...frames, duplicate], []);
    const ambiguous = captureJointConnections(scene, [...frames, duplicate]);
    expect(ambiguous.parents.get(tip)).toBeNull();
    expect(ambiguous.parents.get(duplicate)).toBeNull();
    duplicate.remove();
    updateFrameRegistry(scene, frames, []);
    expect(captureJointConnections(scene, frames).parents.get(tip)).toBe(joint);
  });
});
