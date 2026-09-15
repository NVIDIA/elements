// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LabelBuffer } from './buffer.js';

describe('label buffer', () => {
  it('sets and clears identities through initializers and handles', () => {
    const labels = new LabelBuffer({ capacity: 1 });
    const label = labels.add({ featureId: 1842, text: 'Pump' });

    expect(label.featureId).toBe(1842);
    label.featureId = 2710;
    expect(label.featureId).toBe(2710);
    labels.set(0, { text: 'Valve' });
    expect(label.featureId).toBeUndefined();
  });
});
