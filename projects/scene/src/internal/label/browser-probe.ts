// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { copyLabelElementImage, type LabelCaptureCopySignature } from './capture.js';
import type { SceneGPUDevice } from '../gpu/platform.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_MAP_READ = 0x01;
const TEXTURE_COPY_DST = 0x02;
const TEXTURE_COPY_SRC = 0x01;
const TEXTURE_RENDER_ATTACHMENT = 0x10;
const TEXTURE_BINDING = 0x04;

/** Verifies that a browser capture copy writes a known opaque magenta source pixel. */
// eslint-disable-next-line max-statements, complexity -- Browser capability verification must fail closed at each hardware boundary.
export async function verifyLabelBrowserCopy(options: {
  readonly device: SceneGPUDevice;
  readonly signature: LabelCaptureCopySignature;
  readonly slot: HTMLSlotElement;
}): Promise<boolean> {
  const { device, signature, slot } = options;
  if (!device.createTexture || !device.createBuffer) return false;
  const copy = Reflect.get(device.queue, 'copyElementImageToTexture');
  if (typeof copy !== 'function') return false;
  const texture = device.createTexture({
    format: 'rgba8unorm-srgb',
    size: { height: 2, width: 2 },
    usage: TEXTURE_COPY_SRC | TEXTURE_COPY_DST | TEXTURE_BINDING | TEXTURE_RENDER_ATTACHMENT
  });
  const buffer = device.createBuffer({ size: 256, usage: BUFFER_COPY_DST | BUFFER_MAP_READ });
  try {
    copyLabelElementImage(signature, {
      copy: (...arguments_) => Reflect.apply(copy, device.queue, arguments_),
      destination: { texture },
      height: 2,
      source: slot,
      width: 2
    });
    const encoder = device.createCommandEncoder();
    if (!encoder.copyTextureToBuffer || !buffer.mapAsync || !buffer.getMappedRange || !buffer.unmap) return false;
    encoder.copyTextureToBuffer(
      { origin: { x: 0, y: 0 }, texture },
      { buffer, bytesPerRow: 256 },
      { height: 2, width: 2 }
    );
    device.queue.submit([encoder.finish()]);
    await buffer.mapAsync(BUFFER_MAP_READ, 0, 256);
    const pixel = new Uint8Array(buffer.getMappedRange(), 0, 4);
    return (
      pixel[0] !== undefined &&
      pixel[2] !== undefined &&
      pixel[3] !== undefined &&
      pixel[0] > 180 &&
      pixel[2] > 180 &&
      pixel[3] > 180
    );
  } catch {
    return false;
  } finally {
    buffer.unmap?.();
    buffer.destroy();
    texture.destroy?.();
  }
}
