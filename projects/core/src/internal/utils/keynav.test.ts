// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLightDismiss, onKeys } from '@nvidia-elements/core/internal';

describe('onKeys', () => {
  it('should call function when a single key is pressed', async () => {
    const fn = vi.fn();
    onKeys(['Enter'], new KeyboardEvent('keydown', { code: 'Enter' }), fn);
    expect(fn).toBeCalledTimes(1);
  });

  it('should not call function when a non listed key is pressed', async () => {
    const fn = vi.fn();
    onKeys(['Space'], new KeyboardEvent('keydown', { code: 'Enter' }), fn);
    expect(fn).toBeCalledTimes(0);
  });

  it('should call function when multiple possible keys are pressed', async () => {
    const fn = vi.fn();
    onKeys(['Enter', 'Space'], new KeyboardEvent('keydown', { code: 'Enter' }), fn);
    onKeys(['Enter', 'Space'], new KeyboardEvent('keydown', { code: 'Space' }), fn);
    onKeys(['Enter', 'Space'], new KeyboardEvent('keydown', { code: 'Shift' }), fn);
    expect(fn).toBeCalledTimes(2);
  });
});

describe('createLightDismiss', () => {
  function createMockElement(bounds: { left: number; right: number; top: number; bottom: number }) {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => ({ ...bounds, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) });
    document.body.appendChild(element);
    return element;
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should call fn on pointerup outside element bounds', () => {
    const element = createMockElement({ left: 10, right: 100, top: 10, bottom: 100 });
    const focusElement = createMockElement({ left: 10, right: 100, top: 10, bottom: 100 });
    const fn = vi.fn();

    createLightDismiss({ element, focusElement }, fn);
    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 200, clientY: 200 }));

    expect(fn).toBeCalledTimes(1);
  });

  it('should not call fn on pointerup inside element bounds', () => {
    const element = createMockElement({ left: 10, right: 100, top: 10, bottom: 100 });
    const focusElement = createMockElement({ left: 10, right: 100, top: 10, bottom: 100 });
    const fn = vi.fn();

    createLightDismiss({ element, focusElement }, fn);
    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 50, clientY: 50 }));

    expect(fn).toBeCalledTimes(0);
  });

  it('should call fn on escape keydown', () => {
    const element = createMockElement({ left: 10, right: 100, top: 10, bottom: 100 });
    const focusElement = createMockElement({ left: 10, right: 100, top: 10, bottom: 100 });
    const fn = vi.fn();

    createLightDismiss({ element, focusElement }, fn);
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));

    expect(fn).toBeCalledTimes(1);
  });

  it('should not call fn when element is hidden (pointerup)', () => {
    const element = createMockElement({ left: 10, right: 100, top: 10, bottom: 100 });
    const focusElement = createMockElement({ left: 10, right: 100, top: 10, bottom: 100 });
    const fn = vi.fn();

    element.hidden = true;
    createLightDismiss({ element, focusElement }, fn);
    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 200, clientY: 200 }));

    expect(fn).toBeCalledTimes(0);
  });

  it('should not call fn when element is hidden (keydown)', () => {
    const element = createMockElement({ left: 10, right: 100, top: 10, bottom: 100 });
    const focusElement = createMockElement({ left: 10, right: 100, top: 10, bottom: 100 });
    const fn = vi.fn();

    element.hidden = true;
    createLightDismiss({ element, focusElement }, fn);
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));

    expect(fn).toBeCalledTimes(0);
  });

  it('should not call fn after signal is aborted', () => {
    const element = createMockElement({ left: 10, right: 100, top: 10, bottom: 100 });
    const focusElement = createMockElement({ left: 10, right: 100, top: 10, bottom: 100 });
    const fn = vi.fn();
    const controller = new AbortController();

    createLightDismiss({ element, focusElement, signal: controller.signal }, fn);
    controller.abort();

    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 200, clientY: 200 }));
    element.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));

    expect(fn).toBeCalledTimes(0);
  });
});
