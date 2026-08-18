// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** The experimental overload selected for `GPUQueue.copyElementImageToTexture`. */
export type LabelCaptureCopySignature =
  | 'current-dictionaries'
  | 'source-destination'
  | 'source-size-destination'
  | 'source-crop-destination'
  | 'source-crop-size-destination';

/** A complete, browser-verified capability result. A failure is intentionally non-diagnostic. */
export type LabelCaptureCapabilities =
  | { readonly available: true; readonly copySignature: LabelCaptureCopySignature }
  | { readonly available: false };

export interface LabelCaptureProbe {
  /** Browser realm containing the canvas and layout subtree under test. */
  readonly realm: object;
  /** The current shared device. A recovered device creates a separate cache entry. */
  readonly device: object;
  /** Verifies the `layoutsubtree` property and a capturable immediate child slot. */
  verifyLayoutSubtreeSlotCapture(): boolean | PromiseLike<boolean>;
  /** Performs a real copy using the selected overload and verifies its result. */
  verifyCopy(signature: LabelCaptureCopySignature): boolean | PromiseLike<boolean>;
  /** Verifies that a content mutation produces the canvas `paint` event. */
  verifyMutationPaint(): boolean | PromiseLike<boolean>;
  /** Verifies focus and control selection remain available through the captured slot. */
  verifyFocus(): boolean | PromiseLike<boolean>;
  /** Reruns the recorded F5 manual-transform regression. */
  verifyTransform(): boolean | PromiseLike<boolean>;
}

export interface LabelElementImageCopy {
  readonly copy: (...arguments_: readonly unknown[]) => void;
  readonly destination: object;
  readonly height: number;
  readonly sourceCrop?: { readonly height: number; readonly width: number; readonly x: number; readonly y: number };
  readonly source: object;
  readonly width: number;
}

const copySignatures: readonly LabelCaptureCopySignature[] = [
  'current-dictionaries',
  'source-destination',
  'source-size-destination',
  'source-crop-destination',
  'source-crop-size-destination'
];

let capabilityCache = new WeakMap<object, WeakMap<object, Promise<LabelCaptureCapabilities>>>();

/**
 * Gets the complete feature result once per browser realm and device identity.
 *
 * A rejected probe becomes an unavailable result: HTML-in-Canvas is a
 * progressive enhancement and must never make the overlay unavailable.
 */
export function getLabelCaptureCapabilities(probe: LabelCaptureProbe): Promise<LabelCaptureCapabilities> {
  let deviceCache = capabilityCache.get(probe.realm);
  if (!deviceCache) {
    deviceCache = new WeakMap<object, Promise<LabelCaptureCapabilities>>();
    capabilityCache.set(probe.realm, deviceCache);
  }
  const cached = deviceCache.get(probe.device);
  if (cached) return cached;

  const result = runLabelCaptureProbe(probe).catch(() => ({ available: false }) as const);
  deviceCache.set(probe.device, result);
  return result;
}

/** Runs the complete probe without caching it. This is useful for the T3 browser regression. */
export async function runLabelCaptureProbe(probe: LabelCaptureProbe): Promise<LabelCaptureCapabilities> {
  if (!(await probe.verifyLayoutSubtreeSlotCapture())) {
    return { available: false };
  }
  const copySignature = await findLabelCaptureCopySignature(probe.verifyCopy);
  if (
    !copySignature ||
    !(await probe.verifyMutationPaint()) ||
    !(await probe.verifyFocus()) ||
    !(await probe.verifyTransform())
  ) {
    return { available: false };
  }
  return { available: true, copySignature };
}

/** Tries only the known experimental overloads, retaining the first verified winner. */
export async function findLabelCaptureCopySignature(
  verify: (signature: LabelCaptureCopySignature) => boolean | PromiseLike<boolean>
): Promise<LabelCaptureCopySignature | undefined> {
  for (const signature of copySignatures) {
    try {
      if (await verify(signature)) return signature;
    } catch {
      // Experimental revisions can reject an overload mismatch.
    }
  }
  return undefined;
}

/** Invokes one known experimental overload without guessing from function arity. */
export function copyLabelElementImage(signature: LabelCaptureCopySignature, operation: LabelElementImageCopy): void {
  const { copy, destination, height, source, sourceCrop, width } = operation;
  switch (signature) {
    case 'current-dictionaries': {
      const sourceDictionary = sourceCrop
        ? { source, sx: sourceCrop.x, sy: sourceCrop.y, swidth: sourceCrop.width, sheight: sourceCrop.height }
        : { source };
      copy(sourceDictionary, { destination, width, height });
      return;
    }
    case 'source-destination':
      copy(source, destination);
      return;
    case 'source-size-destination':
      copy(source, width, height, destination);
      return;
    case 'source-crop-destination':
      copy(source, 0, 0, width, height, destination);
      return;
    case 'source-crop-size-destination':
      copy(source, 0, 0, width, height, width, height, destination);
  }
}

const LABEL_CAPTURE_RESET = Symbol.for('nve.scene.label-capture.reset');

function resetLabelCaptureCapabilities(): void {
  capabilityCache = new WeakMap<object, WeakMap<object, Promise<LabelCaptureCapabilities>>>();
}

Reflect.set(globalThis, LABEL_CAPTURE_RESET, resetLabelCaptureCapabilities);
