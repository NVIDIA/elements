// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { identityMat4 } from '../math/mat4.js';
import { MarkerBoundsClassifier, MarkerBoundsIndex, type MarkerBounds } from './bounds.js';

describe(MarkerBoundsClassifier.name, () => {
  const classifier = new MarkerBoundsClassifier();
  const inside: MarkerBounds = {
    maximumX: 0.5,
    maximumY: 0.5,
    maximumZ: 0.75,
    minimumX: -0.5,
    minimumY: -0.5,
    minimumZ: 0.25
  };

  it('should conservatively classify local bounds against all WebGPU clip planes', () => {
    expect(classifier.classify(undefined, identityMat4(), identityMat4())).toBe('intersecting');
    expect(classifier.classify(null, identityMat4(), identityMat4())).toBe('outside');
    expect(classifier.classify(inside, identityMat4(), identityMat4())).toBe('inside');
    expect(classifier.classify({ ...inside, maximumX: 1.25, minimumX: 0.75 }, identityMat4(), identityMat4())).toBe(
      'intersecting'
    );
    expect(classifier.classify({ ...inside, maximumX: 2.5, minimumX: 1.5 }, identityMat4(), identityMat4())).toBe(
      'outside'
    );
    expect(classifier.classify({ ...inside, maximumZ: -0.25, minimumZ: -0.75 }, identityMat4(), identityMat4())).toBe(
      'outside'
    );
  });

  it('should include the owning frame transform in classification', () => {
    const frame = identityMat4();
    frame[12] = 2;
    expect(classifier.classify(inside, identityMat4(), frame)).toBe('outside');
    frame[12] = 0.75;
    expect(classifier.classify(inside, identityMat4(), frame)).toBe('intersecting');
  });
});

describe(MarkerBoundsIndex.name, () => {
  it('handles empty ranges without retaining stale block bounds', () => {
    const source = createSource(1);
    const index = new MarkerBoundsIndex();
    index.reset(0);
    index.updateBlocks({ ...source, count: 0, recordCount: 1, start: 0 });

    expect(index.getBounds(0, source)).toBeNull();
  });

  it('reads float-backed records and outline-only visibility', () => {
    const floats = new Float32Array(12);
    floats.set([4, 5, 6], 0);
    floats.set([-2, 3, -1], 7);
    const bytes = new Uint8Array(floats.buffer);
    bytes[47] = 1;
    const index = new MarkerBoundsIndex();
    index.reset(1);
    index.includeRecord(0, { bytes, floats, view: null });

    expect(index.getBounds(1, { bytes, floats, view: null })).toEqual({
      maximumX: 7,
      maximumY: 8,
      maximumZ: 9,
      minimumX: 1,
      minimumY: 2,
      minimumZ: 3
    });
  });

  it('ignores visible records when no readable numeric view is available', () => {
    const bytes = new Uint8Array(48);
    bytes[43] = 1;
    const source = { bytes, floats: null, view: null };
    const index = new MarkerBoundsIndex();
    index.reset(1);
    index.includeRecord(0, source);

    expect(index.getBounds(1, source)).toBeNull();
  });

  it('treats missing alpha bytes as invisible', () => {
    const noAlpha = { bytes: new Uint8Array(), floats: null, view: null };
    const missingOutline = { bytes: new Uint8Array(47), floats: null, view: null };
    const index = new MarkerBoundsIndex();

    index.reset(1);
    index.includeRecord(0, noAlpha);
    index.includeRecord(0, missingOutline);

    expect(index.getBounds(1, noAlpha)).toBeNull();
    expect(index.getBounds(1, missingOutline)).toBeNull();
  });

  it('ignores incomplete float-backed records', () => {
    const bytes = new Uint8Array(48);
    bytes[43] = 1;
    const source = { bytes, floats: new Float32Array(), view: null };
    const index = new MarkerBoundsIndex();

    index.reset(1);
    index.includeRecord(0, source);

    expect(index.getBounds(1, source)).toBeNull();
  });

  it('keeps records on either side of the 256-record block boundary', () => {
    const source = createSource(257);
    setRecord(source, { index: 255, position: 10, scale: 1 });
    setRecord(source, { index: 256, position: -10, scale: 2 });
    const index = new MarkerBoundsIndex();
    index.reset(257);
    setRecord(source, { index: 0, position: 100, scale: 1 });
    index.includeRecord(0, source);
    index.reset(257);
    index.includeRecord(255, source);
    index.includeRecord(256, source);

    expect(index.getBounds(257, source)).toEqual({
      maximumX: 11,
      maximumY: 11,
      maximumZ: 11,
      minimumX: -12,
      minimumY: -12,
      minimumZ: -12
    });
  });

  it('rebuilds every block touched by a cross-block update', () => {
    const source = createSource(512);
    setRecord(source, { index: 0, position: 1, scale: 1 });
    setRecord(source, { index: 255, position: 2, scale: 2 });
    setRecord(source, { index: 256, position: 3, scale: 3 });
    setRecord(source, { index: 511, position: 4, scale: 4 });
    const index = new MarkerBoundsIndex();
    index.reset(512);
    index.updateBlocks({ ...source, count: 2, recordCount: 512, start: 255 });
    expect(index.getBounds(512, source)).toEqual({
      maximumX: 8,
      maximumY: 8,
      maximumZ: 8,
      minimumX: 0,
      minimumY: 0,
      minimumZ: 0
    });
  });

  it('does not let later-block updates affect an earlier prefix query', () => {
    const source = createSource(512);
    setRecord(source, { index: 0, position: 1, scale: 1 });
    setRecord(source, { index: 256, position: 50, scale: 50 });
    const index = new MarkerBoundsIndex();
    index.reset(512);
    index.updateBlocks({ ...source, count: 512, recordCount: 512, start: 0 });
    setRecord(source, { index: 256, position: 100, scale: 100 });
    index.updateBlocks({ ...source, count: 1, recordCount: 512, start: 256 });

    expect(index.getBounds(1, source)).toEqual({
      maximumX: 2,
      maximumY: 2,
      maximumZ: 2,
      minimumX: 0,
      minimumY: 0,
      minimumZ: 0
    });
  });

  it('ignores invisible and invalid records', () => {
    const source = createSource(4);
    setRecord(source, { index: 0, position: 1, scale: 1, visible: false });
    setRecord(source, { index: 1, position: Number.NaN, scale: 1 });
    setRecord(source, { index: 2, position: 3, scale: 2 });
    setRecord(source, { index: 3, position: 8, scale: 1 });
    source.view.setFloat32(3 * 48 + 32, Number.POSITIVE_INFINITY, true);
    const index = new MarkerBoundsIndex();
    index.reset(3);
    index.updateBlocks({ ...source, count: 4, recordCount: 4, start: 0 });

    expect(index.getBounds(3, source)).toEqual({
      maximumX: 5,
      maximumY: 5,
      maximumZ: 5,
      minimumX: 1,
      minimumY: 1,
      minimumZ: 1
    });
  });

  it('clones block data independently', () => {
    const source = createSource(256);
    setRecord(source, { index: 0, position: 1, scale: 1 });
    const index = new MarkerBoundsIndex();
    index.reset(256);
    index.updateBlocks({ ...source, count: 1, recordCount: 256, start: 0 });
    const clone = index.clone();
    setRecord(source, { index: 0, position: 10, scale: 10 });
    index.updateBlocks({ ...source, count: 1, recordCount: 256, start: 0 });

    expect(clone.getBounds(256, source)?.maximumX).toBe(2);
    expect(index.getBounds(256, source)?.maximumX).toBe(20);
  });
});

function createSource(count: number): { bytes: Uint8Array; floats: Float32Array; view: DataView } {
  const bytes = new Uint8Array(count * 48);
  return { bytes, floats: new Float32Array(bytes.buffer), view: new DataView(bytes.buffer) };
}

function setRecord(
  source: { bytes: Uint8Array; view: DataView },
  options: { index: number; position: number; scale: number; visible?: boolean }
): void {
  const { index, position, scale, visible = true } = options;
  const offset = index * 48;
  source.view.setFloat32(offset, position, true);
  source.view.setFloat32(offset + 4, position, true);
  source.view.setFloat32(offset + 8, position, true);
  source.view.setFloat32(offset + 28, scale, true);
  source.view.setFloat32(offset + 32, scale, true);
  source.view.setFloat32(offset + 36, scale, true);
  source.bytes[offset + 43] = visible ? 255 : 0;
}
