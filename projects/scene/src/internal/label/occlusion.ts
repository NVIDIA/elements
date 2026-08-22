// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type LabelPixelVisibility = 'geometry-in-front' | 'label-visible' | 'unavailable';
export type LabelPointerDecision = 'allow' | 'block';

/** Pointer-only occlusion state. It never changes keyboard or accessibility state. */
export class LabelOcclusionTracker {
  #blockedPointerIds = new Set<number>();
  #consecutiveVisible = 0;
  #consecutiveZero = 0;
  #occluded = false;
  #textureMode = false;

  get occluded(): boolean {
    return this.#textureMode && this.#occluded;
  }

  get pointerEnabled(): boolean {
    return !this.occluded;
  }

  get needsSample(): boolean {
    return this.#textureMode && this.#consecutiveZero < 2 && this.#consecutiveVisible < 2;
  }

  /** Overlay mode has no depth gating and must not keep the reflected state. */
  setTextureMode(textureMode: boolean): void {
    if (textureMode === this.#textureMode) return;
    this.#textureMode = textureMode;
    this.#consecutiveVisible = 0;
    this.#consecutiveZero = 0;
    if (!textureMode) {
      this.#occluded = false;
      this.#blockedPointerIds.clear();
    }
  }

  /** Applies the required two-result hysteresis to completed occlusion samples. */
  recordOcclusionSamples(passingSamples: number): boolean {
    if (!this.#textureMode || !Number.isFinite(passingSamples) || passingSamples < 0) return this.occluded;
    if (passingSamples === 0) {
      this.#consecutiveZero += 1;
      this.#consecutiveVisible = 0;
      if (this.#consecutiveZero >= 2) this.#occluded = true;
    } else {
      this.#consecutiveVisible += 1;
      this.#consecutiveZero = 0;
      if (this.#consecutiveVisible >= 2) this.#occluded = false;
    }
    return this.occluded;
  }

  /**
   * Performs the click-time partial-occlusion decision. Missing readback favors
   * the label, because silently losing input is worse than a false positive.
   */
  handlePointerEvent(options: {
    readonly pointerId: number;
    readonly type: 'pointerdown' | 'pointerup' | 'click' | 'pointercancel';
    readonly visibility?: LabelPixelVisibility;
  }): LabelPointerDecision {
    if (!this.#textureMode) return 'allow';
    switch (options.type) {
      case 'pointerdown':
        if (options.visibility === 'geometry-in-front') {
          this.#blockedPointerIds.add(options.pointerId);
          return 'block';
        }
        return 'allow';
      case 'pointerup':
        return this.#blockedPointerIds.has(options.pointerId) ? 'block' : 'allow';
      case 'click': {
        const blocked = this.#blockedPointerIds.delete(options.pointerId);
        return blocked ? 'block' : 'allow';
      }
      case 'pointercancel':
        this.#blockedPointerIds.delete(options.pointerId);
        return 'allow';
    }
  }
}
