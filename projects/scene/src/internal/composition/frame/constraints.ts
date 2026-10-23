// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { notifyOwningScene } from '../scene/notifications.js';

interface ConstraintTarget {
  constraintValid: boolean;
}
const targets = new WeakMap<HTMLElement, ConstraintTarget>();

/** Shares cached input validity with the existing frame state, outside matrix evaluation. */
export function bindFrameConstraints(element: HTMLElement, state: ConstraintTarget): void {
  state.constraintValid = !invalid.has(element);
  targets.set(element, state);
}

const invalid = new WeakMap<HTMLElement, Set<string>>();

/** Valid pose capture must preserve independent input failures. */
export function setFrameConstraint(element: HTMLElement, code: string, valid: boolean): void {
  const failures = invalid.get(element);
  const wasValid = !failures;
  if (valid) {
    if (!failures?.delete(code)) return;
    if (failures.size === 0) invalid.delete(element);
  } else {
    if (failures?.has(code)) return;
    if (failures) failures.add(code);
    else invalid.set(element, new Set([code]));
  }
  const state = targets.get(element);
  const isValid = !invalid.has(element);
  if (state) state.constraintValid = isValid;
  notifyOwningScene(element, isValid === wasValid ? 'render' : 'frame-validity');
}

export function hasFrameConstraintFailure(element: HTMLElement): boolean {
  return invalid.has(element);
}
