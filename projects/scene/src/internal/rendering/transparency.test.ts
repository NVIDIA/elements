// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from 'vitest';
import { createGpu } from '../../../test/rendering.js';
import {
  createOitCompositePipeline,
  oitTargetStates,
  OIT_ACCUMULATION_FORMAT,
  OIT_REVEALAGE_FORMAT
} from './transparency.js';

describe('weighted transparency', () => {
  it('adds weighted fragments and multiplies remaining coverage in separate attachments', () => {
    const targets = oitTargetStates();
    expect(targets.map(target => target.format)).toEqual([OIT_ACCUMULATION_FORMAT, OIT_REVEALAGE_FORMAT]);
    expect(targets[0]?.blend).toMatchObject({ color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' } });
    expect(targets[1]?.blend).toMatchObject({
      color: { srcFactor: 'zero', dstFactor: 'one-minus-src', operation: 'add' }
    });
    expect(oitTargetStates()).not.toBe(targets);
    expect(oitTargetStates()[0]).not.toBe(targets[0]);
  });
  it('composites premultiplied color to the requested canvas without replacing depth', () => {
    const { device } = createGpu();
    createOitCompositePipeline(device, 'bgra8unorm');
    const descriptor = vi.mocked(device.createRenderPipeline).mock.calls[0]![0];
    expect(descriptor.fragment?.targets[0]?.format).toBe('bgra8unorm');
    expect(descriptor.fragment?.targets[0]?.blend).toMatchObject({ color: { dstFactor: 'one-minus-src-alpha' } });
    expect(descriptor.depthStencil).toEqual({
      format: 'depth24plus',
      depthWriteEnabled: false,
      depthCompare: 'always'
    });
    const code = vi.mocked(device.createShaderModule).mock.calls[0]![0].code;
    expect(code).toContain('if (opacity <= 0.0) { discard; }');
    expect(code).toContain('accumulation != accumulation');
    expect(code).toContain('max(accumulation.a, 1e-5)');
  });
});
