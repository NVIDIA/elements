// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from 'vitest';
import {
  getElementFeatureId,
  registerElementFeatureId,
  sceneFeatureIdConverter,
  setElementFeatureId
} from './element-feature-id.js';

function element() {
  const host = Object.assign(document.createElement('div'), { requestUpdate: vi.fn() });
  registerElementFeatureId(host);
  return host;
}
describe('element feature IDs', () => {
  it('publishes zero and the maximum unsigned identity, and clears invalid attributes', () => {
    const host = element();
    setElementFeatureId(host, sceneFeatureIdConverter.fromAttribute(' 0 '));
    expect(getElementFeatureId(host)).toBe(0);
    setElementFeatureId(host, sceneFeatureIdConverter.fromAttribute('4294967295'));
    expect(getElementFeatureId(host)).toBe(0xffffffff);
    for (const attribute of ['', '-1', '1.5', '1e2', '4294967296']) {
      setElementFeatureId(host, sceneFeatureIdConverter.fromAttribute(attribute));
      expect(getElementFeatureId(host)).toBeUndefined();
    }
    expect(sceneFeatureIdConverter.fromAttribute(null)).toBeUndefined();
  });

  it('rejects invalid property assignments without replacing the accepted ID or issuing an update', () => {
    const host = element();
    setElementFeatureId(host, 7);
    host.requestUpdate.mockClear();
    for (const value of [-1, 0.5, NaN, Infinity, 0x100000000]) expect(() => setElementFeatureId(host, value)).toThrow();
    expect(getElementFeatureId(host)).toBe(7);
    expect(host.requestUpdate).not.toHaveBeenCalled();
    setElementFeatureId(host, 7);
    expect(host.requestUpdate).not.toHaveBeenCalled();
    setElementFeatureId(host, undefined);
    expect(host.requestUpdate).toHaveBeenCalledWith('featureId', 7);
  });
});
