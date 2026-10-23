// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  supportsSceneGPUDrawPass,
  type SceneGPUBindGroup,
  type SceneGPUBindGroupDescriptor,
  type SceneGPUDevice,
  type SceneGPURenderPass,
  type SceneGPURenderPassDescriptor,
  type SceneGPURenderPipelineDevice,
  type SceneGPURenderPipeline,
  type SceneGPUTexture,
  type SceneGPUTextureView,
  type SceneGPUQuerySet
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
  readonly accumulationView: SceneGPUTextureView;
  readonly bindGroup: SceneGPUBindGroup;
  readonly revealage: SceneGPUTexture;
  readonly revealageView: SceneGPUTextureView;
}

interface SizedTarget<T> {
  readonly height: number;
  readonly value: T;
  readonly width: number;
}

interface RenderTargetDevice extends SceneGPURenderPipelineDevice {
  createBindGroup(descriptor: SceneGPUBindGroupDescriptor): SceneGPUBindGroup;
  createTexture(descriptor: Parameters<NonNullable<SceneGPUDevice['createTexture']>>[0]): SceneGPUTexture;
}

export class RenderTargets {
  #canvas?: HTMLCanvasElement;
  #depth?: SizedTarget<{ readonly texture: SceneGPUTexture; readonly view: SceneGPUTextureView }>;
  #device?: RenderTargetDevice;
  #oit?: SizedTarget<OitResources>;
  #oitCompositePipeline?: SceneGPURenderPipeline;

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

  getDepthView(): SceneGPUTextureView | null {
    const device = this.#device;
    const canvas = this.#canvas;
    if (!device || !canvas) return null;
    const { height, width } = canvas;
    if (!isSized(this.#depth, width, height)) {
      this.#destroyDepthTexture();
      const texture = device.createTexture({
        size: [width, height],
        format: 'depth24plus',
        usage: TEXTURE_RENDER_ATTACHMENT
      });
      this.#depth = { height, value: { texture, view: texture.createView() }, width };
    }
    return this.#depth.value.view;
  }

  getOitResources(): OitResources | undefined {
    const device = this.#device;
    const canvas = this.#canvas;
    const pipeline = this.#oitCompositePipeline;
    if (!device || !canvas || !pipeline) return undefined;
    const { height, width } = canvas;
    if (!isSized(this.#oit, width, height)) {
      this.#destroyOitTargets();
      const accumulation = device.createTexture({
        size: [width, height],
        format: OIT_ACCUMULATION_FORMAT,
        usage: TEXTURE_RENDER_ATTACHMENT | TEXTURE_BINDING
      });
      const revealage = device.createTexture({
        size: [width, height],
        format: OIT_REVEALAGE_FORMAT,
        usage: TEXTURE_RENDER_ATTACHMENT | TEXTURE_BINDING
      });
      const accumulationView = accumulation.createView();
      const revealageView = revealage.createView();
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: accumulationView },
          { binding: 1, resource: revealageView }
        ]
      });
      this.#oit = { height, value: { accumulation, accumulationView, bindGroup, revealage, revealageView }, width };
    }
    return this.#oit.value;
  }

  createOitPassDescriptor(oit: OitResources, depthView: SceneGPUTextureView | null): SceneGPURenderPassDescriptor {
    const descriptor: {
      colorAttachments: readonly [
        {
          readonly clearValue: LinearColor;
          readonly loadOp: 'clear';
          readonly storeOp: 'store';
          readonly view: SceneGPUTextureView;
        },
        {
          readonly clearValue: LinearColor;
          readonly loadOp: 'clear';
          readonly storeOp: 'store';
          readonly view: SceneGPUTextureView;
        }
      ];
      depthStencilAttachment?: SceneGPURenderPassDescriptor['depthStencilAttachment'];
    } = {
      colorAttachments: [
        {
          view: oit.accumulationView,
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store'
        },
        {
          view: oit.revealageView,
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
    readonly colorView: SceneGPUTextureView;
    readonly depthView: SceneGPUTextureView | null;
    readonly occlusionQuerySet?: SceneGPUQuerySet;
  }): SceneGPURenderPassDescriptor {
    const descriptor: {
      colorAttachments: readonly [
        { readonly loadOp: 'load'; readonly storeOp: 'store'; readonly view: SceneGPUTextureView }
      ];
      depthStencilAttachment?: SceneGPURenderPassDescriptor['depthStencilAttachment'];
      occlusionQuerySet?: SceneGPUQuerySet;
    } = {
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
    if (!pipeline || !supportsSceneGPUDrawPass(pass)) return;
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, oit.bindGroup);
    pass.draw(3);
  }

  #destroyDepthTexture(): void {
    this.#depth?.value.texture.destroy?.();
    this.#depth = undefined;
  }

  #destroyOitTargets(): void {
    this.#oit?.value.accumulation.destroy?.();
    this.#oit?.value.revealage.destroy?.();
    this.#oit = undefined;
  }
}

function isSized<T>(target: SizedTarget<T> | undefined, width: number, height: number): target is SizedTarget<T> {
  return target?.width === width && target.height === height;
}

function supportsRenderTargets(device: SceneGPUDevice): device is RenderTargetDevice {
  return (
    typeof device.createBindGroup === 'function' &&
    typeof device.createRenderPipeline === 'function' &&
    typeof device.createShaderModule === 'function' &&
    typeof device.createTexture === 'function'
  );
}
