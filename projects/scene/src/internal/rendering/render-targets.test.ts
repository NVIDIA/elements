// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { RenderTargets, type OitResources } from './render-targets.js';
import type {
  SceneGPUBindGroup,
  SceneGPUDevice,
  SceneGPUDeviceLostInfo,
  SceneGPUQuerySet,
  SceneGPURenderPass,
  SceneGPURenderPipeline,
  SceneGPUTexture,
  SceneGPUTextureView
} from '../gpu/platform.js';

describe(RenderTargets.name, () => {
  it('returns no resources before initialization and ignores unsupported draw passes', () => {
    const targets = new RenderTargets();

    expect(targets.getDepthView()).toBeNull();
    expect(targets.getOitResources()).toBeUndefined();
    expect(() => targets.drawComposite({ end: () => undefined }, createOitResources())).not.toThrow();
  });

  it('creates, reuses, invalidates, and draws with initialized resources', () => {
    const pipeline: SceneGPURenderPipeline = { getBindGroupLayout: () => ({}) };
    const bindGroup: SceneGPUBindGroup = {};
    const textures: SceneGPUTexture[] = [];
    const createTexture = vi.fn(() => {
      const texture: SceneGPUTexture = { createView: () => ({}), destroy: vi.fn() };
      textures.push(texture);
      return texture;
    });
    const device: SceneGPUDevice = {
      createBindGroup: () => bindGroup,
      createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
      createRenderPipeline: () => pipeline,
      createShaderModule: () => ({}),
      createTexture,
      destroy: () => undefined,
      lost: new Promise<SceneGPUDeviceLostInfo>(() => undefined),
      queue: { submit: () => undefined }
    };
    const canvas = document.createElement('canvas');
    canvas.width = 20;
    canvas.height = 10;
    const targets = new RenderTargets();
    targets.initialize(canvas, device, 'bgra8unorm');

    const depthView = targets.getDepthView();
    const oit = targets.getOitResources();
    expect(depthView).not.toBeNull();
    expect(oit).toMatchObject({ bindGroup });
    expect(targets.getDepthView()).not.toBeNull();
    expect(targets.getOitResources()).toEqual(oit);
    expect(createTexture).toHaveBeenCalledTimes(3);

    const pass: SceneGPURenderPass = {
      draw: vi.fn(),
      end: () => undefined,
      setBindGroup: vi.fn(),
      setPipeline: vi.fn()
    };
    targets.drawComposite(pass, oit!);
    expect(pass.setPipeline).toHaveBeenCalledWith(pipeline);
    expect(pass.setBindGroup).toHaveBeenCalledWith(0, bindGroup);
    expect(pass.draw).toHaveBeenCalledWith(3);

    targets.invalidateSize();
    expect(textures.every(texture => vi.mocked(texture.destroy!).mock.calls.length === 1)).toBe(true);
    expect(targets.getDepthView()).not.toBeNull();
    expect(targets.getOitResources()).toBeDefined();
    expect(createTexture).toHaveBeenCalledTimes(6);

    targets.disconnect();
    expect(targets.getDepthView()).toBeNull();
    expect(targets.getOitResources()).toBeUndefined();
  });

  it('includes optional depth and query attachments only when supplied', () => {
    const targets = new RenderTargets();
    const colorView: SceneGPUTextureView = {};
    const depthView: SceneGPUTextureView = {};
    const occlusionQuerySet: SceneGPUQuerySet = {};
    const oit = createOitResources();

    expect(
      targets.createOpaquePassDescriptor({ clearColor: { r: 0, g: 0, b: 0, a: 1 }, colorView, depthView: null })
    ).not.toHaveProperty('depthStencilAttachment');
    expect(
      targets.createOpaquePassDescriptor({
        clearColor: { r: 0, g: 0, b: 0, a: 1 },
        colorView,
        depthView,
        occlusionQuerySet
      })
    ).toMatchObject({ depthStencilAttachment: { view: depthView }, occlusionQuerySet });

    expect(targets.createOitPassDescriptor(oit, null)).not.toHaveProperty('depthStencilAttachment');
    expect(targets.createOitPassDescriptor(oit, depthView)).toMatchObject({
      depthStencilAttachment: { view: depthView }
    });

    expect(targets.createCompositePassDescriptor({ colorView, depthView: null })).not.toHaveProperty(
      'depthStencilAttachment'
    );
    expect(targets.createCompositePassDescriptor({ colorView, depthView, occlusionQuerySet })).toMatchObject({
      depthStencilAttachment: { view: depthView },
      occlusionQuerySet
    });
  });
});

function createOitResources(): OitResources {
  const texture: SceneGPUTexture = { createView: () => ({}) };
  return { accumulation: texture, bindGroup: {}, revealage: texture };
}
