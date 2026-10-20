// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { compileBodyGeometry } from './geometry.js';
import { compileShapes } from './compile.js';
import type { SceneBodyGeometry, SceneBodyGroupNode, SceneBodyNode } from './types.js';
import { MAX_GEOMETRY_BYTES } from './limits.js';

const triangle = () => ({ positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]) });

describe('body geometry capture', () => {
  it('preserves the existing primitive batching result', () => {
    const nodes: SceneBodyGeometry = [
      { type: 'cone', color: '#4080c0', position: [1, 2, 3], scale: [2, 3, 4], orientation: [0, 0, 1, 0] }
    ];
    expect(compileBodyGeometry(nodes)).toEqual(compileShapes(nodes.flatMap(node => (node.type ? [node] : []))));
  });

  it('composes nested transforms and allows repeated names', () => {
    const nodes: SceneBodyGeometry = [
      {
        name: 'link',
        position: [10, 0, 0],
        scale: [2, 3, 4],
        children: [{ name: 'link', position: [0, 1, 0], geometry: triangle() }]
      }
    ];
    const compiled = compileBodyGeometry(nodes);
    expect(compiled.positions).toEqual(new Float32Array([10, 3, 0, 12, 3, 0, 10, 6, 0]));
    expect(compiled.normals).toEqual(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]));
  });

  it('captures transforms and reverses triangle winding for mirrored scale', () => {
    const scale: [number, number, number] = [-2, 1, 1];
    const source = triangle();
    const nodes: SceneBodyGeometry = [{ scale, geometry: source }];
    const compiled = compileBodyGeometry(nodes);
    expect(compiled.positions).toEqual(new Float32Array([0, 0, 0, -2, 0, 0, 0, 1, 0]));
    expect(compiled.indices).toEqual(new Uint32Array([0, 2, 1]));
    scale[0] = 2;
    source.positions[3] = 4;
    expect(compiled.positions[3]).toBe(-2);
    expect(compileBodyGeometry(nodes).positions[3]).toBe(8);
  });

  it('transforms supplied normals with the inverse transpose', () => {
    const normal = Math.SQRT1_2;
    const compiled = compileBodyGeometry([
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

  it('retains the body Float32 position limit without changing producer geometry', () => {
    const source = triangle();
    const original = source.positions.slice();
    expect(() => compileBodyGeometry([{ position: [1e100, 0, 0], geometry: source }])).toThrow(
      'body positions must fit the finite Float32 range.'
    );
    expect(source.positions).toEqual(original);
  });

  it('preserves UVs and per-vertex colors and combines a mesh base color', () => {
    const uvs = new Float32Array([0, 0, 1, 0, 0, 1]);
    const compiled = compileBodyGeometry([
      { color: '#ff0000', geometry: { ...triangle(), uvs, colors: new Float32Array(12).fill(1) } }
    ]);
    expect(compiled.uvs).toEqual(uvs);
    expect(compiled.colors).toEqual(new Float32Array([1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1]));
    uvs.fill(0);
    expect(compiled.uvs?.[2]).toBe(1);
  });

  it('rejects cyclic hierarchies and excessive node counts', () => {
    const children: SceneBodyNode[] = [];
    const root: SceneBodyGroupNode = { children };
    children.push(root);
    expect(() => compileBodyGeometry([root])).toThrow(RangeError);
    expect(() => compileBodyGeometry(new Array<SceneBodyNode>(65_537).fill({ type: 'cube' }))).toThrow(RangeError);
  });

  it('applies each node color independently in linear light while preserving alpha and signed zero', () => {
    const colors = new Float32Array([0.25, 0.5, 0.75, 0.8, 0.25, 0.5, 0.75, 0.8, -0, 0, 1, 0]);
    const geometry = { ...triangle(), colors };
    const compiled = compileBodyGeometry([
      { geometry, color: [0.7, 0.5, 0.2, 0.8] },
      { geometry, color: [1, 1, 1, 1] }
    ]);
    const mixed = [0.16327014565467834, 0.2369668185710907, 0.13957345485687256, 0.6399999856948853];

    expect(compiled.colors.subarray(0, 8)).toEqual(new Float32Array([...mixed, ...mixed]));
    expect(compiled.colors.subarray(8, 12)).toEqual(new Float32Array([-0, 0, 0.2, 0]));
    expect(compiled.colors.subarray(12)).toEqual(colors);
  });

  it('bounds expanded geometry before allocation', () => {
    const indices = new Uint32Array(Math.ceil(MAX_GEOMETRY_BYTES / 48));
    expect(() => compileBodyGeometry([{ geometry: { ...triangle(), indices } }])).toThrow('allocation limit');
  });

  it('rejects conflicting input kinds and singular transforms', () => {
    const conflicting = { type: 'cube' as const, geometry: triangle() };
    // @ts-expect-error Conflicting kinds must fail at the type boundary as well as runtime.
    expect(() => compileBodyGeometry([conflicting])).toThrow(TypeError);
    // @ts-expect-error Transforms use position, orientation, and scale only.
    const matrixNode: SceneBodyNode = { matrix: new Float32Array(16), type: 'cube' };
    expect(matrixNode.type).toBe('cube');
    expect(() => compileBodyGeometry([{ scale: [0, 1, 1], geometry: triangle() }])).toThrow(RangeError);
    expect(() => compileBodyGeometry([{ geometry: { positions: new Float32Array([NaN, 0, 0]) } }])).toThrow(RangeError);
  });
});
