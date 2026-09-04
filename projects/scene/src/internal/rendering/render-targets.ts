// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  type SceneGPUBindGroup,
  type SceneGPUDevice,
  type SceneGPURenderPass,
  type SceneGPURenderPipeline,
  type SceneGPUTexture
} from '../gpu/platform.js';
import { createOitCompositePipeline, OIT_ACCUMULATION_FORMAT, OIT_REVEALAGE_FORMAT } from './transparency.js';

const TEXTURE_BINDING = 0x04;
const TEXTURE_RENDER_ATTACHMENT = 0x10;

export interface LinearColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

export interface OitResources {
  readonly accumulation: SceneGPUTexture;
  readonly bindGroup: SceneGPUBindGroup;
  readonly revealage: SceneGPUTexture;
}

interface RenderTargetDevice extends SceneGPUDevice {
  createBindGroup(descriptor: unknown): SceneGPUBindGroup;
  createRenderPipeline(descriptor: unknown): SceneGPURenderPipeline;
  createShaderModule(descriptor: unknown): unknown;
  createTexture(descriptor: unknown): SceneGPUTexture;
}

interface CompositePass extends SceneGPURenderPass {
  draw(vertexCount: number): void;
  setBindGroup(index: number, bindGroup: SceneGPUBindGroup): void;
  setPipeline(pipeline: SceneGPURenderPipeline): void;
}

export class RenderTargets {
  #canvas?: HTMLCanvasElement;
  #depthSize = '';
  #depthTexture?: SceneGPUTexture;
  #device?: RenderTargetDevice;
  #oitAccumulationTexture?: SceneGPUTexture;
  #oitBindGroup?: SceneGPUBindGroup;
  #oitCompositePipeline?: SceneGPURenderPipeline;
  #oitRevealageTexture?: SceneGPUTexture;
  #oitSize = '';

  initialize(canvas: HTMLCanvasElement, device: SceneGPUDevice, format: string): void {
    this.disconnect();
    if (!supportsRenderTargets(device)) return;
    this.#canvas = canvas;
    this.#device = device;
    this.#oitCompositePipeline = createOitCompositePipeline(device, format);
  }

  invalidateSize(): void {
    this.#destroyDepthTexture();
    this.#destroyOitTargets();
  }

  disconnect(): void {
    this.invalidateSize();
    this.#canvas = undefined;
    this.#device = undefined;
    this.#oitCompositePipeline = undefined;
  }

  getDepthView(): unknown | null {
    const device = this.#device;
    const canvas = this.#canvas;
    if (!device || !canvas) return null;
    const size = `${canvas.width}x${canvas.height}`;
    if (!this.#depthTexture || this.#depthSize !== size) {
      this.#destroyDepthTexture();
      this.#depthTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: 'depth24plus',
        usage: TEXTURE_RENDER_ATTACHMENT
      });
      this.#depthSize = size;
    }
    return this.#depthTexture.createView();
  }

  getOitResources(): OitResources | undefined {
    const device = this.#device;
    const canvas = this.#canvas;
    const pipeline = this.#oitCompositePipeline;
    if (!device || !canvas || !pipeline) return undefined;
    const size = `${canvas.width}x${canvas.height}`;
    if (!this.#oitAccumulationTexture || !this.#oitRevealageTexture || this.#oitSize !== size) {
      this.#destroyOitTargets();
      this.#oitAccumulationTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: OIT_ACCUMULATION_FORMAT,
        usage: TEXTURE_RENDER_ATTACHMENT | TEXTURE_BINDING
      });
      this.#oitRevealageTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: OIT_REVEALAGE_FORMAT,
        usage: TEXTURE_RENDER_ATTACHMENT | TEXTURE_BINDING
      });
      this.#oitBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: this.#oitAccumulationTexture.createView() },
          { binding: 1, resource: this.#oitRevealageTexture.createView() }
        ]
      });
      this.#oitSize = size;
    }
    if (!this.#oitAccumulationTexture || !this.#oitRevealageTexture || !this.#oitBindGroup) return undefined;
    return {
      accumulation: this.#oitAccumulationTexture,
      bindGroup: this.#oitBindGroup,
      revealage: this.#oitRevealageTexture
    };
  }

  createOpaquePassDescriptor(options: {
    readonly clearColor: LinearColor;
    readonly colorView: unknown;
    readonly depthView: unknown | null;
    readonly occlusionQuerySet?: unknown;
  }): unknown {
    const descriptor: Record<string, unknown> = {
      colorAttachments: [
        {
          view: options.colorView,
          clearValue: options.clearColor,
          loadOp: 'clear',
          storeOp: 'store'
        }
      ]
    };
    if (options.depthView) {
      descriptor.depthStencilAttachment = {
        view: options.depthView,
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'store'
      };
    }
    if (options.occlusionQuerySet) descriptor.occlusionQuerySet = options.occlusionQuerySet;
    return descriptor;
  }

  createOitPassDescriptor(oit: OitResources, depthView: unknown | null): unknown {
    const descriptor: Record<string, unknown> = {
      colorAttachments: [
        {
          view: oit.accumulation.createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store'
        },
        {
          view: oit.revealage.createView(),
          clearValue: { r: 1, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store'
        }
      ]
    };
    if (depthView) {
      descriptor.depthStencilAttachment = {
        view: depthView,
        depthLoadOp: 'load',
        depthStoreOp: 'store'
      };
    }
    return descriptor;
  }

  createCompositePassDescriptor(options: {
    readonly colorView: unknown;
    readonly depthView: unknown | null;
    readonly occlusionQuerySet?: unknown;
  }): unknown {
    const descriptor: Record<string, unknown> = {
      colorAttachments: [{ view: options.colorView, loadOp: 'load', storeOp: 'store' }]
    };
    if (options.depthView) {
      descriptor.depthStencilAttachment = {
        view: options.depthView,
        depthLoadOp: 'load',
        depthStoreOp: 'store'
      };
    }
    if (options.occlusionQuerySet) descriptor.occlusionQuerySet = options.occlusionQuerySet;
    return descriptor;
  }

  drawComposite(pass: SceneGPURenderPass, oit: OitResources): void {
    const pipeline = this.#oitCompositePipeline;
    if (!pipeline || !supportsCompositePass(pass)) return;
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, oit.bindGroup);
    pass.draw(3);
  }

  #destroyDepthTexture(): void {
    this.#depthTexture?.destroy?.();
    this.#depthTexture = undefined;
    this.#depthSize = '';
  }

  #destroyOitTargets(): void {
    this.#oitAccumulationTexture?.destroy?.();
    this.#oitRevealageTexture?.destroy?.();
    this.#oitAccumulationTexture = undefined;
    this.#oitRevealageTexture = undefined;
    this.#oitBindGroup = undefined;
    this.#oitSize = '';
  }
}

function supportsRenderTargets(device: SceneGPUDevice): device is RenderTargetDevice {
  return (
    typeof device.createBindGroup === 'function' &&
    typeof device.createRenderPipeline === 'function' &&
    typeof device.createShaderModule === 'function' &&
    typeof device.createTexture === 'function'
  );
}

function supportsCompositePass(pass: SceneGPURenderPass): pass is CompositePass {
  return (
    typeof pass.draw === 'function' && typeof pass.setBindGroup === 'function' && typeof pass.setPipeline === 'function'
  );
}
