// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { bindFrameConstraints, hasFrameConstraintFailure, setFrameConstraint } from './constraints.js';
import { registerSceneRenderNotifications } from '../scene/notifications.js';

describe('frame constraints', () => {
  it('retains independent failures across binding and partial recovery', () => {
    const element = document.createElement('div');
    setFrameConstraint(element, 'pose', false);
    const state = { constraintValid: true };
    bindFrameConstraints(element, state);
    expect(state.constraintValid).toBe(false);
    setFrameConstraint(element, 'connection', false);
    setFrameConstraint(element, 'pose', true);
    expect(hasFrameConstraintFailure(element)).toBe(true);
    expect(state.constraintValid).toBe(false);
    setFrameConstraint(element, 'connection', true);
    expect(hasFrameConstraintFailure(element)).toBe(false);
    expect(state.constraintValid).toBe(true);
  });

  it('notifies only on changed failures and keeps element state isolated', () => {
    const scene = document.createElement('nve-scene');
    const first = document.createElement('div');
    const second = document.createElement('div');
    scene.append(first, second);
    const notify = vi.fn();
    const release = registerSceneRenderNotifications(scene, notify);
    setFrameConstraint(first, 'pose', true);
    setFrameConstraint(first, 'pose', false);
    setFrameConstraint(first, 'pose', false);
    expect(notify).toHaveBeenCalledExactlyOnceWith(first, 'render');
    expect(hasFrameConstraintFailure(second)).toBe(false);
    setFrameConstraint(first, 'pose', true);
    setFrameConstraint(first, 'pose', true);
    expect(notify).toHaveBeenCalledTimes(2);
    release();
  });
});
