// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { LabelSceneController } from './scene-controller.js';

describe('label scene controller', () => {
  it('retains discovered labels without creating slots before the overlay is available', () => {
    const host = document.createElement('nve-scene');
    const label = document.createElement('nve-scene-label');
    label.append(document.createElement('button'));
    host.append(label);
    const controller = new LabelSceneController(host, () => undefined, vi.fn());
    const removed = vi.fn();

    controller.refresh();
    controller.syncSlots(removed);

    expect(controller.labels).toEqual([label]);
    expect(controller.getSlot(label)).toBeUndefined();
    expect(removed).not.toHaveBeenCalled();
  });
});
