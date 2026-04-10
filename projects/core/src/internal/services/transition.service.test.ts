// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it } from 'vitest';
import { TransitionService } from './transition.service.js';

describe('TransitionService', () => {
  afterEach(() => {
    globalThis.document.documentElement.removeAttribute('nve-transition');
  });

  it('should append base speculation rules if nve-transition="auto" is on the root HTML element', async () => {
    globalThis.document.documentElement.setAttribute('nve-transition', 'auto');

    TransitionService.enable();
    expect(globalThis.document.querySelector('#nve-speculationrules')).toBeTruthy();

    TransitionService.disable();
    expect(globalThis.document.querySelector('#nve-speculationrules')).toBeFalsy();
  });

  it('should append base speculation rules if nve-transition="auto" is dynamically appended to HTML element', async () => {
    TransitionService.enable();
    expect(globalThis.document.querySelector('#nve-speculationrules')).toBeFalsy();

    globalThis.document.documentElement.setAttribute('nve-transition', 'auto');
    await new Promise(r => setTimeout(() => r(null)));
    expect(globalThis.document.querySelector('#nve-speculationrules')).toBeTruthy();

    globalThis.document.documentElement.removeAttribute('nve-transition');
    await new Promise(r => setTimeout(() => r(null)));
    expect(globalThis.document.querySelector('#nve-speculationrules')).toBeFalsy();
  });

  it('should not throw when disable() is called without prior enable()', () => {
    expect(() => TransitionService.disable()).not.toThrow();
  });

  it('should not add speculation rules when nve-transition="manual"', () => {
    globalThis.document.documentElement.setAttribute('nve-transition', 'manual');
    TransitionService.enable();
    expect(globalThis.document.querySelector('#nve-speculationrules')).toBeFalsy();
    TransitionService.disable();
  });

  it('should not orphan observers when enable() is called twice', async () => {
    globalThis.document.documentElement.setAttribute('nve-transition', 'auto');

    TransitionService.enable();
    TransitionService.enable();
    expect(globalThis.document.querySelector('#nve-speculationrules')).toBeTruthy();

    TransitionService.disable();
    expect(globalThis.document.querySelector('#nve-speculationrules')).toBeFalsy();
  });
});
