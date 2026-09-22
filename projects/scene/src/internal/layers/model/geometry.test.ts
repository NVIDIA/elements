// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { compileModelGeometry } from './geometry.js';
import { compileParts } from './compile.js';
import type { SceneModelGeometry, SceneModelGroupNode, SceneModelNode } from './types.js';
import { identityMat4 } from '../../math/mat4.js';
import { MAX_MODEL_BYTES } from './limits.js';

const triangle = () => ({ positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]) });

describe('model geometry capture', () => {
  it('preserves the existing primitive batching result', () => {
    const nodes: SceneModelGeometry = [
      { shape: 'cone', color: '#4080c0', position: [1, 2, 3], scale: [2, 3, 4], orientation: [0, 0, 1, 0] }
    ];
    expect(compileModelGeometry(nodes)).toEqual(compileParts(nodes.flatMap(node => (node.shape ? [node] : []))));
  });

  it('composes nested transforms and allows repeated names', () => {
    const nodes: SceneModelGeometry = [
      {
        name: 'link',
        position: [10, 0, 0],
        scale: [2, 3, 4],
        children: [{ name: 'link', position: [0, 1, 0], geometry: triangle() }]
      }
    ];
    const compiled = compileModelGeometry(nodes);
    expect(compiled.positions).toEqual(new Float32Array([10, 3, 0, 12, 3, 0, 10, 6, 0]));
    expect(compiled.normals).toEqual(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]));
  });

  it('captures affine matrices and reverses triangle winding for mirrored transforms', () => {
    const matrix = identityMat4();
    matrix[0] = -2;
    matrix[4] = 1;
    const source = triangle();
    const nodes: SceneModelGeometry = [{ matrix, geometry: source }];
    const compiled = compileModelGeometry(nodes);
    expect(compiled.positions).toEqual(new Float32Array([0, 0, 0, -2, 0, 0, 1, 1, 0]));
    expect(compiled.indices).toEqual(new Uint32Array([0, 2, 1]));
    matrix[0] = 2;
    source.positions[3] = 4;
    expect(compiled.positions[3]).toBe(-2);
    expect(compileModelGeometry(nodes).positions[3]).toBe(8);
  });

  it('transforms supplied normals with the inverse transpose', () => {
    const normal = Math.SQRT1_2;
    const compiled = compileModelGeometry([
      {
        scale: [2, 1, 1],
        geometry: {
          ...triangle(),
          normals: new Float32Array([normal, normal, 0, normal, normal, 0, normal, normal, 0])
        }
      }
    ]);
    expect(compiled.normals[0]).toBeCloseTo(1 / Math.sqrt(5));
    expect(compiled.normals[1]).toBeCloseTo(2 / Math.sqrt(5));
  });

  it('keeps supplied normals perpendicular to tangents when a matrix needs pivoting', () => {
    const compiled = compileModelGeometry([
      {
        matrix: new Float32Array([1e-15, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        geometry: { ...triangle(), normals: new Float32Array([1, 0, 0, 1, 0, 0, 1, 0, 0]) }
      }
    ]);

    expect(compiled.normals[0]).toBeCloseTo(-Math.SQRT1_2, 6);
    expect(compiled.normals[1]).toBeCloseTo(Math.SQRT1_2, 6);
    expect(compiled.normals[0]! + compiled.normals[1]!).toBeCloseTo(0, 6);
  });

  it('preserves UVs and per-vertex colors and combines a mesh base color', () => {
    const uvs = new Float32Array([0, 0, 1, 0, 0, 1]);
    const compiled = compileModelGeometry([
      { color: '#ff0000', geometry: { ...triangle(), uvs, colors: new Float32Array(12).fill(1) } }
    ]);
    expect(compiled.uvs).toEqual(uvs);
    expect(compiled.colors).toEqual(new Float32Array([1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1]));
    uvs.fill(0);
    expect(compiled.uvs?.[2]).toBe(1);
  });

  it('rejects cyclic hierarchies and excessive node counts', () => {
    const children: SceneModelNode[] = [];
    const root: SceneModelGroupNode = { children };
    children.push(root);
    expect(() => compileModelGeometry([root])).toThrow(RangeError);
    expect(() => compileModelGeometry(new Array<SceneModelNode>(65_537).fill({ shape: 'cube' }))).toThrow(RangeError);
  });

  it('applies each node color independently in linear light while preserving alpha and signed zero', () => {
    const colors = new Float32Array([0.25, 0.5, 0.75, 0.8, 0.25, 0.5, 0.75, 0.8, -0, 0, 1, 0]);
    const geometry = { ...triangle(), colors };
    const compiled = compileModelGeometry([
      { geometry, color: [0.7, 0.5, 0.2, 0.8] },
      { geometry, color: [1, 1, 1, 1] }
    ]);
    const mixed = [0.16327014565467834, 0.2369668185710907, 0.13957345485687256, 0.6399999856948853];

    expect(compiled.colors.subarray(0, 8)).toEqual(new Float32Array([...mixed, ...mixed]));
    expect(compiled.colors.subarray(8, 12)).toEqual(new Float32Array([-0, 0, 0.2, 0]));
    expect(compiled.colors.subarray(12)).toEqual(colors);
  });

  it('bounds expanded geometry before allocation', () => {
    const indices = new Uint32Array(Math.ceil(MAX_MODEL_BYTES / 48));
    expect(() => compileModelGeometry([{ geometry: { ...triangle(), indices } }])).toThrow('allocation limit');
  });

  it('rejects conflicting input kinds, matrix/TRS combinations, and singular transforms', () => {
    const conflicting = { shape: 'cube' as const, geometry: triangle() };
    // @ts-expect-error Conflicting kinds must fail at the type boundary as well as runtime.
    expect(() => compileModelGeometry([conflicting])).toThrow(TypeError);
    const conflictingTransform = { matrix: identityMat4(), position: [0, 0, 0] as const, shape: 'cube' as const };
    // @ts-expect-error Matrix and TRS are mutually exclusive.
    expect(() => compileModelGeometry([conflictingTransform])).toThrow(TypeError);
    expect(() => compileModelGeometry([{ matrix: new Float32Array(16), geometry: triangle() }])).toThrow(RangeError);
    expect(() => compileModelGeometry([{ geometry: { positions: new Float32Array([NaN, 0, 0]) } }])).toThrow(
      RangeError
    );
  });
});
