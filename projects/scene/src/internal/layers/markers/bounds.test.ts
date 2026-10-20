// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { identityMat4 } from '../../math/mat4.js';
import type { Vec3 } from '../../math/types.js';
import { scaledEnclosingRadius } from '../../math/bounds.js';
import { PRIMITIVE_ENCLOSING_RADII } from '../../math/primitive-bounds.js';
import { MarkerBoundsClassifier, MarkerBoundsIndex, type MarkerBounds } from './bounds.js';

/** The arrow's unit radius, root three, multiplies each record's largest absolute scale. */
const UNIT_RADIUS = Math.sqrt(3);
const radius = (scale: number) => UNIT_RADIUS * scale;

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

  it('keeps empty and unknown bounds policies outside matrix validation', () => {
    const invalid = new Float32Array(0);
    expect(classifier.classify(undefined, invalid, invalid)).toBe('intersecting');
    expect(classifier.classify(null, invalid, invalid)).toBe('outside');
    expect(() => classifier.classify(inside, invalid, identityMat4())).toThrow(RangeError);
    expect(() => classifier.classify(inside, identityMat4(), invalid)).toThrow(RangeError);
  });

  it('recovers from rejected transforms without retaining a previous classification', () => {
    const invalid = identityMat4();
    invalid[0] = NaN;
    expect(() => classifier.classify(inside, invalid, identityMat4())).toThrow(RangeError);
    expect(classifier.classify(inside, identityMat4(), identityMat4())).toBe('inside');
    const frame = identityMat4();
    frame[12] = -3;
    expect(classifier.classify(inside, identityMat4(), frame)).toBe('outside');
    expect(classifier.classify(inside, identityMat4(), identityMat4())).toBe('inside');
  });
});

describe(MarkerBoundsIndex.name, () => {
  it('matches the shared enclosing radius for every primitive on both record paths', () => {
    const scales: Vec3[] = [
      [1, 1, 1],
      [0.125, 0.125, 2],
      [-3, 0.5, 0]
    ];
    for (const unitRadius of Object.values(PRIMITIVE_ENCLOSING_RADII)) {
      for (const [scaleX, scaleY, scaleZ] of scales) {
        const expected = scaledEnclosingRadius(unitRadius, scaleX, scaleY, scaleZ);
        const source = createSource(256);
        source.floats.set([scaleX, scaleY, scaleZ], 7);
        source.bytes[43] = 255;
        const index = new MarkerBoundsIndex(unitRadius);
        index.reset(256);
        index.includeRecordValues(0, 0, 0, 0, Math.max(Math.abs(scaleX), Math.abs(scaleY), Math.abs(scaleZ)));

        expect(index.getBounds(256, source)?.maximumX).toBe(expected);
        expect(index.getBounds(1, source)?.maximumX).toBe(expected);
        expect(index.clone().getBounds(256, source)?.maximumX).toBe(expected);
      }
    }
  });

  it('handles empty ranges without retaining stale block bounds', () => {
    const source = createSource(1);
    const index = new MarkerBoundsIndex(UNIT_RADIUS);
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
    const index = new MarkerBoundsIndex(UNIT_RADIUS);
    index.reset(1);
    index.includeRecord(0, { bytes, floats, view: null });

    expect(index.getBounds(1, { bytes, floats, view: null })).toEqual({
      maximumX: 4 + radius(3),
      maximumY: 5 + radius(3),
      maximumZ: 6 + radius(3),
      minimumX: 4 - radius(3),
      minimumY: 5 - radius(3),
      minimumZ: 6 - radius(3)
    });
  });

  it('ignores visible records when no readable numeric view is available', () => {
    const bytes = new Uint8Array(48);
    bytes[43] = 1;
    const source = { bytes, floats: null, view: null };
    const index = new MarkerBoundsIndex(UNIT_RADIUS);
    index.reset(1);
    index.includeRecord(0, source);

    expect(index.getBounds(1, source)).toBeNull();
  });

  it('treats missing alpha bytes as invisible', () => {
    const noAlpha = { bytes: new Uint8Array(), floats: null, view: null };
    const missingOutline = { bytes: new Uint8Array(47), floats: null, view: null };
    const index = new MarkerBoundsIndex(UNIT_RADIUS);

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
    const index = new MarkerBoundsIndex(UNIT_RADIUS);

    index.reset(1);
    index.includeRecord(0, source);

    expect(index.getBounds(1, source)).toBeNull();
  });

  it('keeps records on either side of the 256-record block boundary', () => {
    const source = createSource(257);
    setRecord(source, { index: 255, position: 10, scale: 1 });
    setRecord(source, { index: 256, position: -10, scale: 2 });
    const index = new MarkerBoundsIndex(UNIT_RADIUS);
    index.reset(257);
    setRecord(source, { index: 0, position: 100, scale: 1 });
    index.includeRecord(0, source);
    index.reset(257);
    index.includeRecord(255, source);
    index.includeRecord(256, source);

    expect(index.getBounds(257, source)).toEqual({
      maximumX: 10 + radius(1),
      maximumY: 10 + radius(1),
      maximumZ: 10 + radius(1),
      minimumX: -10 - radius(2),
      minimumY: -10 - radius(2),
      minimumZ: -10 - radius(2)
    });
  });

  it('rebuilds every block touched by a cross-block update', () => {
    const source = createSource(512);
    setRecord(source, { index: 0, position: 1, scale: 1 });
    setRecord(source, { index: 255, position: 2, scale: 2 });
    setRecord(source, { index: 256, position: 3, scale: 3 });
    setRecord(source, { index: 511, position: 4, scale: 4 });
    const index = new MarkerBoundsIndex(UNIT_RADIUS);
    index.reset(512);
    index.updateBlocks({ ...source, count: 2, recordCount: 512, start: 255 });
    expect(index.getBounds(512, source)).toEqual({
      maximumX: 4 + radius(4),
      maximumY: 4 + radius(4),
      maximumZ: 4 + radius(4),
      minimumX: 4 - radius(4),
      minimumY: 4 - radius(4),
      minimumZ: 4 - radius(4)
    });
  });

  it('does not let later-block updates affect an earlier prefix query', () => {
    const source = createSource(512);
    setRecord(source, { index: 0, position: 1, scale: 1 });
    setRecord(source, { index: 256, position: 50, scale: 50 });
    const index = new MarkerBoundsIndex(UNIT_RADIUS);
    index.reset(512);
    index.updateBlocks({ ...source, count: 512, recordCount: 512, start: 0 });
    setRecord(source, { index: 256, position: 100, scale: 100 });
    index.updateBlocks({ ...source, count: 1, recordCount: 512, start: 256 });

    expect(index.getBounds(1, source)).toEqual({
      maximumX: 1 + radius(1),
      maximumY: 1 + radius(1),
      maximumZ: 1 + radius(1),
      minimumX: 1 - radius(1),
      minimumY: 1 - radius(1),
      minimumZ: 1 - radius(1)
    });
  });

  it('ignores invisible and invalid records', () => {
    const source = createSource(4);
    setRecord(source, { index: 0, position: 1, scale: 1, visible: false });
    setRecord(source, { index: 1, position: Number.NaN, scale: 1 });
    setRecord(source, { index: 2, position: 3, scale: 2 });
    setRecord(source, { index: 3, position: 8, scale: 1 });
    source.view.setFloat32(3 * 48 + 32, Number.POSITIVE_INFINITY, true);
    const index = new MarkerBoundsIndex(UNIT_RADIUS);
    index.reset(3);
    index.updateBlocks({ ...source, count: 4, recordCount: 4, start: 0 });

    expect(index.getBounds(3, source)).toEqual({
      maximumX: 3 + radius(2),
      maximumY: 3 + radius(2),
      maximumZ: 3 + radius(2),
      minimumX: 3 - radius(2),
      minimumY: 3 - radius(2),
      minimumZ: 3 - radius(2)
    });
  });

  it('clones block data independently', () => {
    const source = createSource(256);
    setRecord(source, { index: 0, position: 1, scale: 1 });
    const index = new MarkerBoundsIndex(UNIT_RADIUS);
    index.reset(256);
    index.updateBlocks({ ...source, count: 1, recordCount: 256, start: 0 });
    const clone = index.clone();
    setRecord(source, { index: 0, position: 10, scale: 10 });
    index.updateBlocks({ ...source, count: 1, recordCount: 256, start: 0 });

    expect(clone.getBounds(256, source)?.maximumX).toBe(1 + radius(1));
    expect(index.getBounds(256, source)?.maximumX).toBe(10 + radius(10));
  });

  it('shrinks cached ancestors when a former extreme becomes invisible', () => {
    const source = createSource(1_280);
    setRecord(source, { index: 0, position: 0, scale: 1 });
    setRecord(source, { index: 1_024, position: 100, scale: 10 });
    const index = new MarkerBoundsIndex(UNIT_RADIUS);
    index.reset(1_280);
    index.updateBlocks({ ...source, count: 1_280, recordCount: 1_280, start: 0 });
    expect(index.getBounds(1_280, source)?.maximumX).toBe(100 + radius(10));

    setRecord(source, { index: 1_024, position: 100, scale: 10, visible: false });
    index.updateBlocks({ ...source, count: 1, recordCount: 1_280, start: 1_024 });
    expect(index.getBounds(1_280, source)?.maximumX).toBe(radius(1));
    setRecord(source, { index: 0, position: 0, scale: 1, visible: false });
    index.updateBlocks({ ...source, count: 1, recordCount: 1_280, start: 0 });
    expect(index.getBounds(1_280, source)).toBeNull();
  });

  it('keeps later extremes out of aligned and unaligned prefixes', () => {
    const source = createSource(1_281);
    setRecord(source, { index: 0, position: 0, scale: 1 });
    setRecord(source, { index: 767, position: 10, scale: 1 });
    setRecord(source, { index: 768, position: 100, scale: 1 });
    setRecord(source, { index: 1_280, position: 1_000, scale: 1 });
    const index = new MarkerBoundsIndex(UNIT_RADIUS);
    index.reset(1_281);
    index.updateBlocks({ ...source, count: 1_281, recordCount: 1_281, start: 0 });

    expect(index.getBounds(767, source)?.maximumX).toBe(radius(1));
    expect(index.getBounds(768, source)?.maximumX).toBe(10 + radius(1));
    expect(index.getBounds(769, source)?.maximumX).toBe(100 + radius(1));
    expect(index.getBounds(1_280, source)?.maximumX).toBe(100 + radius(1));
    expect(index.getBounds(1_281, source)?.maximumX).toBe(1_000 + radius(1));
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
