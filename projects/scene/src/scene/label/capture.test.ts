// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  copyLabelElementImage,
  findLabelCaptureCopySignature,
  getLabelCaptureCapabilities,
  runLabelCaptureProbe,
  type LabelCaptureCopySignature,
  type LabelCaptureProbe
} from './capture.js';
import { resetLabelCaptureCapabilitiesForTesting } from '../../internal/testing.js';

describe('label capture capability cache', () => {
  afterEach(() => resetLabelCaptureCapabilitiesForTesting());

  it('caches the complete successful result per realm and device identity', async () => {
    const realm = {};
    const device = {};
    const probe = createProbe({ realm, device });

    await expect(getLabelCaptureCapabilities(probe)).resolves.toEqual({
      available: true,
      copySignature: 'current-dictionaries'
    });
    await expect(getLabelCaptureCapabilities(probe)).resolves.toEqual({
      available: true,
      copySignature: 'current-dictionaries'
    });
    expect(probe.verifyLayoutSubtreeSlotCapture).toHaveBeenCalledTimes(1);
    expect(probe.verifyMutationPaint).toHaveBeenCalledTimes(1);
  });

  it('does not reuse a result for another realm or recovered device object', async () => {
    const realm = {};
    const first = createProbe({ realm, device: {} });
    const second = createProbe({ realm, device: {} });
    const third = createProbe({ realm: {}, device: {} });

    await Promise.all([
      getLabelCaptureCapabilities(first),
      getLabelCaptureCapabilities(second),
      getLabelCaptureCapabilities(third)
    ]);

    expect(first.verifyLayoutSubtreeSlotCapture).toHaveBeenCalledOnce();
    expect(second.verifyLayoutSubtreeSlotCapture).toHaveBeenCalledOnce();
    expect(third.verifyLayoutSubtreeSlotCapture).toHaveBeenCalledOnce();
  });

  it('silently converts a failed prerequisite or thrown probe into overlay availability', async () => {
    const failed = createProbe({ realm: {}, device: {}, layout: false });
    const thrown = createProbe({ realm: {}, device: {}, transform: new Error('experimental API failed') });

    await expect(runLabelCaptureProbe(failed)).resolves.toEqual({ available: false });
    await expect(getLabelCaptureCapabilities(thrown)).resolves.toEqual({ available: false });
    expect(failed.verifyCopy).not.toHaveBeenCalled();
  });

  it('fails closed when a captured control cannot retain focus', async () => {
    const probe = createProbe({ realm: {}, device: {} });
    probe.verifyFocus.mockReturnValue(false);

    await expect(runLabelCaptureProbe(probe)).resolves.toEqual({ available: false });
    expect(probe.verifyTransform).not.toHaveBeenCalled();
  });

  it('tries the Chrome 151 dictionary signature before compatibility overloads', async () => {
    const verify = vi.fn((signature: LabelCaptureCopySignature) => signature === 'source-crop-destination');

    await expect(findLabelCaptureCopySignature(verify)).resolves.toBe('source-crop-destination');
    expect(verify.mock.calls.map(([signature]) => signature)).toEqual([
      'current-dictionaries',
      'source-destination',
      'source-size-destination',
      'source-crop-destination'
    ]);
  });

  it('invokes each documented experimental copy overload explicitly', () => {
    const copy = vi.fn();
    const source = {};
    const destination = {};
    const operation = { copy, source, destination, width: 12, height: 7 };

    copyLabelElementImage('current-dictionaries', operation);
    copyLabelElementImage('source-destination', operation);
    copyLabelElementImage('source-size-destination', operation);
    copyLabelElementImage('source-crop-destination', operation);
    copyLabelElementImage('source-crop-size-destination', operation);

    expect(copy.mock.calls).toEqual([
      [{ source }, { destination, width: 12, height: 7 }],
      [source, destination],
      [source, 12, 7, destination],
      [source, 0, 0, 12, 7, destination],
      [source, 0, 0, 12, 7, 12, 7, destination]
    ]);
  });

  it('uses Chrome 151 source and destination dictionaries with an optional source crop', () => {
    const copy = vi.fn();
    const source = {};
    const destination = {};

    copyLabelElementImage('current-dictionaries', {
      copy,
      source,
      destination,
      width: 12,
      height: 7,
      sourceCrop: { x: 2, y: 3, width: 6, height: 4 }
    });

    expect(copy).toHaveBeenCalledWith(
      { source, sx: 2, sy: 3, swidth: 6, sheight: 4 },
      { destination, width: 12, height: 7 }
    );
  });
});

function createProbe(options: {
  readonly device: object;
  readonly layout?: boolean;
  readonly realm: object;
  readonly transform?: boolean | Error;
}): LabelCaptureProbe & {
  verifyCopy: ReturnType<typeof vi.fn>;
  verifyLayoutSubtreeSlotCapture: ReturnType<typeof vi.fn>;
  verifyMutationPaint: ReturnType<typeof vi.fn>;
  verifyFocus: ReturnType<typeof vi.fn>;
} {
  const transform = options.transform ?? true;
  return {
    realm: options.realm,
    device: options.device,
    verifyLayoutSubtreeSlotCapture: vi.fn(() => options.layout ?? true),
    verifyCopy: vi.fn((signature: LabelCaptureCopySignature) => signature === 'current-dictionaries'),
    verifyMutationPaint: vi.fn(() => true),
    verifyFocus: vi.fn(() => true),
    verifyTransform: vi.fn(() => {
      if (transform instanceof Error) throw transform;
      return transform;
    })
  };
}
