// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { notifyOwningBodyPart, observeBodyParts } from './part-notifications.js';

describe('body part notifications', () => {
  it('notifies only the direct registered parent and follows reparenting', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    const part = document.createElement('div');
    const firstListener = vi.fn();
    const secondListener = vi.fn();
    observeBodyParts(first, firstListener);
    observeBodyParts(second, secondListener);
    first.append(part);
    notifyOwningBodyPart(part);
    expect(firstListener).toHaveBeenCalledOnce();
    expect(secondListener).not.toHaveBeenCalled();
    second.append(part);
    notifyOwningBodyPart(part);
    expect(firstListener).toHaveBeenCalledOnce();
    expect(secondListener).toHaveBeenCalledOnce();
    part.remove();
    expect(() => notifyOwningBodyPart(part)).not.toThrow();
  });

  it('does not notify through wrappers and replaces a previous callback', () => {
    const body = document.createElement('div');
    const wrapper = document.createElement('div');
    const part = document.createElement('div');
    const previous = vi.fn();
    const current = vi.fn();
    observeBodyParts(body, previous);
    observeBodyParts(body, current);
    body.append(wrapper);
    wrapper.append(part);
    notifyOwningBodyPart(part);
    expect(previous).not.toHaveBeenCalled();
    expect(current).not.toHaveBeenCalled();
    notifyOwningBodyPart(wrapper);
    expect(current).toHaveBeenCalledOnce();
  });
});
