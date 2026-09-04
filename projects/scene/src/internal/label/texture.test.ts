// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi, type Mock } from 'vitest';
import { LabelTextureController, type LabelTextureOperations } from './texture.js';

describe(LabelTextureController.name, () => {
  it('copies dirty content, freezes the last-good texture while focused, and refreshes after blur', () => {
    const operations = createOperations();
    const controller = new LabelTextureController(operations);
    controller.setSize({ width: 20, height: 10 });

    expect(controller.update()).toEqual({ kind: 'copied', texture: 'texture-1' });
    controller.markDirty();
    controller.setFocused(true);
    expect(controller.update()).toEqual({ kind: 'frozen', texture: 'texture-1' });
    expect(operations.copy).toHaveBeenCalledTimes(1);

    controller.setFocused(false);
    expect(controller.update()).toEqual({ kind: 'copied', texture: 'texture-2' });
  });

  it('keeps overlay behavior while focused before any good image exists', () => {
    const controller = new LabelTextureController(createOperations());
    controller.setSize({ width: 20, height: 10 });
    controller.setFocused(true);

    expect(controller.update()).toEqual({ kind: 'frozen', texture: undefined });
  });

  it('keeps the last-good texture after a failed copy and waits for another dirty opportunity', () => {
    const operations = createOperations();
    const controller = new LabelTextureController(operations);
    controller.setSize({ width: 20, height: 10 });
    controller.update();
    operations.copy.mockImplementationOnce(() => {
      throw new Error('tainted canvas');
    });
    controller.markDirty();

    expect(controller.update()).toEqual({ kind: 'retry', texture: 'texture-1' });
    expect(controller.update()).toEqual({ kind: 'idle', texture: 'texture-1' });
    expect(operations.destroy).toHaveBeenCalledWith('texture-2');
  });

  it('falls back once after three consecutive failures in one connection cycle', () => {
    const operations = createOperations({ failCopies: true });
    const controller = new LabelTextureController(operations);
    controller.setSize({ width: 20, height: 10 });

    expect(controller.update()).toEqual({ kind: 'retry', texture: undefined });
    controller.markDirty();
    expect(controller.update()).toEqual({ kind: 'retry', texture: undefined });
    controller.markDirty();
    expect(controller.update()).toEqual({ kind: 'fallback', warning: true });
    expect(controller.update()).toEqual({ kind: 'fallback', warning: false });
    expect(controller.fallback).toBe(true);
  });

  it('retires its last-good texture after the fallback frame completes', async () => {
    const operations = createOperations();
    const controller = new LabelTextureController(operations);
    controller.setSize({ width: 20, height: 10 });
    controller.update();
    operations.copy.mockImplementation(() => {
      throw new Error('capture unavailable');
    });
    controller.markDirty();
    controller.update();
    controller.markDirty();
    controller.update();
    controller.markDirty();

    expect(controller.update()).toEqual({ kind: 'fallback', warning: true });
    expect(controller.texture).toBeUndefined();
    let complete!: () => void;
    controller.retireAfterSubmission(new Promise<void>(resolve => (complete = resolve)));
    expect(operations.destroy).not.toHaveBeenCalledWith('texture-1');
    complete();
    await Promise.resolve();
    expect(operations.destroy.mock.calls.filter(([texture]) => texture === 'texture-1')).toHaveLength(1);
  });

  it('destroys a resized previous texture only after the final referencing submission completes', async () => {
    const operations = createOperations();
    const controller = new LabelTextureController(operations);
    controller.setSize({ width: 20, height: 10 });
    controller.update();
    controller.setSize({ width: 40, height: 20 });
    controller.update();
    expect(controller.hasPendingRetirement).toBe(true);
    let complete!: () => void;
    controller.retireAfterSubmission(new Promise<void>(resolve => (complete = resolve)));
    expect(controller.hasPendingRetirement).toBe(false);

    expect(operations.destroy).not.toHaveBeenCalledWith('texture-1');
    complete();
    await Promise.resolve();
    expect(operations.destroy).toHaveBeenCalledWith('texture-1');
  });

  it('rejects invalid sizes without allocating and disposes all owned textures', () => {
    const operations = createOperations();
    const controller = new LabelTextureController(operations);
    controller.setSize({ width: 0, height: 10 });
    expect(controller.update()).toEqual({ kind: 'idle', texture: undefined });
    controller.setSize({ width: 20, height: 10 });
    controller.update();
    controller.dispose();
    controller.dispose();

    expect(operations.destroy).toHaveBeenCalledTimes(1);
    expect(operations.destroy).toHaveBeenCalledWith('texture-1');
  });

  it('does not destroy a scheduled retired texture twice when the connection ends first', async () => {
    const operations = createOperations();
    const controller = new LabelTextureController(operations);
    controller.setSize({ width: 20, height: 10 });
    controller.update();
    controller.setSize({ width: 40, height: 20 });
    controller.update();
    let complete!: () => void;
    controller.retireAfterSubmission(new Promise<void>(resolve => (complete = resolve)));
    controller.dispose();
    complete();
    await Promise.resolve();

    expect(operations.destroy.mock.calls.filter(([texture]) => texture === 'texture-1')).toHaveLength(1);
  });
});

function createOperations(options: { readonly failCopies?: boolean } = {}): {
  copy: Mock<(texture: string, size: { height: number; width: number }) => void>;
  create: Mock<(size: { height: number; width: number }) => string>;
  destroy: Mock<(texture: string) => void>;
} {
  let number = 0;
  return {
    create: vi.fn(() => `texture-${++number}`),
    copy: vi.fn(() => {
      if (options.failCopies) throw new Error('capture unavailable');
    }),
    destroy: vi.fn()
  };
}
