// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface LabelTextureSize {
  readonly height: number;
  readonly width: number;
}

export interface LabelTextureOperations<Texture> {
  copy(texture: Texture, size: LabelTextureSize): void;
  create(size: LabelTextureSize): Texture;
  destroy(texture: Texture): void;
}

export type LabelTextureUpdate<Texture> =
  | { readonly kind: 'idle'; readonly texture: Texture | undefined }
  | { readonly kind: 'frozen'; readonly texture: Texture | undefined }
  | { readonly kind: 'copied'; readonly texture: Texture }
  | { readonly kind: 'retry'; readonly texture: Texture | undefined }
  | { readonly kind: 'fallback'; readonly warning: boolean };

/**
 * Per-label texture lifetime and capture state for one scene connection cycle.
 * It contains no DOM or GPU assumptions, so Scene can feed it genuine browser
 * capture operations while unit tests exercise its transition rules directly.
 */
export class LabelTextureController<Texture> {
  #consecutiveFailures = 0;
  #dirty = true;
  #disposed = false;
  #fallback = false;
  #focused = false;
  #lastGood: Texture | undefined;
  #pendingRetirement: Texture[] = [];
  #scheduledRetirement = new Set<Texture>();
  #size: LabelTextureSize | undefined;

  constructor(private readonly operations: LabelTextureOperations<Texture>) {}

  get fallback(): boolean {
    return this.#fallback;
  }

  get texture(): Texture | undefined {
    return this.#lastGood;
  }

  get needsCapture(): boolean {
    return this.#dirty && !this.#focused && !this.#fallback && !this.#disposed;
  }

  /** Marks content dirty. A failed copy retries only after this next opportunity. */
  markDirty(): void {
    if (!this.#disposed && !this.#fallback) this.#dirty = true;
  }

  /** Updates the device-pixel allocation size and schedules a replacement when valid. */
  setSize(size: LabelTextureSize): void {
    if (!isTextureSize(size)) {
      this.#size = undefined;
      return;
    }
    if (!sameSize(this.#size, size)) {
      this.#size = { width: size.width, height: size.height };
      this.markDirty();
    }
  }

  /** Freezes a last-good image while focus is inside; blur forces a fresh copy. */
  setFocused(focused: boolean): void {
    if (this.#focused === focused || this.#disposed || this.#fallback) return;
    this.#focused = focused;
    if (!focused) this.#dirty = true;
  }

  /** Attempts one due copy, preserving the last-good texture for transient failures. */
  update(): LabelTextureUpdate<Texture> {
    if (this.#fallback || this.#disposed) return { kind: 'fallback', warning: false };
    if (this.#focused) return { kind: 'frozen', texture: this.#lastGood };
    if (!this.#dirty || !this.#size) return { kind: 'idle', texture: this.#lastGood };

    this.#dirty = false;
    return this.#copyTexture();
  }

  #copyTexture(): LabelTextureUpdate<Texture> {
    let replacement: Texture | undefined;
    try {
      replacement = this.operations.create(this.#size!);
      this.operations.copy(replacement, this.#size!);
    } catch {
      return this.#handleCopyFailure(replacement);
    }

    this.#consecutiveFailures = 0;
    const oldTexture = this.#lastGood;
    this.#lastGood = replacement;
    if (oldTexture !== undefined) this.#pendingRetirement.push(oldTexture);
    return { kind: 'copied', texture: replacement };
  }

  #handleCopyFailure(replacement: Texture | undefined): LabelTextureUpdate<Texture> {
    if (replacement !== undefined) this.operations.destroy(replacement);
    this.#consecutiveFailures += 1;
    if (this.#consecutiveFailures === 3) {
      this.#fallback = true;
      if (this.#lastGood !== undefined) this.#pendingRetirement.push(this.#lastGood);
      this.#lastGood = undefined;
      return { kind: 'fallback', warning: true };
    }
    return { kind: 'retry', texture: this.#lastGood };
  }

  /**
   * Defers replaced textures until the frame that last referenced them has
   * completed. Scene calls this immediately after its single queue submission.
   */
  retireAfterSubmission(completion: PromiseLike<void>): void {
    const retired = this.#pendingRetirement.splice(0);
    if (retired.length === 0) return;
    retired.forEach(texture => this.#scheduledRetirement.add(texture));
    void Promise.resolve(completion).then(
      () => this.#destroyScheduled(retired),
      () => this.#destroyScheduled(retired)
    );
  }

  /** Releases all controller-owned textures when the connection cycle ends. */
  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    if (this.#lastGood !== undefined) this.operations.destroy(this.#lastGood);
    this.#lastGood = undefined;
    for (const texture of this.#pendingRetirement) this.operations.destroy(texture);
    this.#pendingRetirement = [];
    for (const texture of this.#scheduledRetirement) this.operations.destroy(texture);
    this.#scheduledRetirement.clear();
  }

  #destroyScheduled(textures: readonly Texture[]): void {
    for (const texture of textures) {
      if (this.#scheduledRetirement.delete(texture)) this.operations.destroy(texture);
    }
  }
}

function isTextureSize(size: LabelTextureSize): boolean {
  return Number.isInteger(size.width) && Number.isInteger(size.height) && size.width > 0 && size.height > 0;
}

function sameSize(left: LabelTextureSize | undefined, right: LabelTextureSize): boolean {
  return left?.width === right.width && left.height === right.height;
}
