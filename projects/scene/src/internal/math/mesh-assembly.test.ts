// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { MeshAssembly, type MeshAssemblyPart, type MeshAttributeSpan } from './mesh-assembly.js';
import { identityPreciseMat4 } from './mat4.js';
import { PreparedRGBAModulation } from '../color/modulation.js';

describe(MeshAssembly.name, () => {
  it('plans and assembles empty geometry with an explicit optional UV output', () => {
    const assembly = new MeshAssembly([]);
    expect([assembly.vertexCount, assembly.indexCount, assembly.byteLength]).toEqual([0, 0, 0]);
    expect(assembly.assemble()).toEqual({
      positions: new Float32Array(),
      normals: new Float32Array(),
      colors: new Float32Array(),
      indices: new Uint32Array()
    });
    expect(new MeshAssembly([], { includeUvs: true }).assemble().uvs).toEqual(new Float32Array());
  });

  it('accepts empty attribute spans without shifting the next part', () => {
    const empty: MeshAttributeSpan = { values: [], offset: 0, stride: 0 };
    const part = trianglePart({ vertexCount: 0, positions: empty, normals: empty, colors: empty, uvs: empty });
    const result = new MeshAssembly([part, trianglePart()], { includeUvs: true }).assemble();
    expect(result.positions).toEqual(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]));
    expect(result.indices).toEqual(new Uint32Array([0, 1, 2]));
    expect(result.uvs).toEqual(new Float32Array(6));
  });

  it('reports exact counts and byte sizes before reading vertex values or allocating output', () => {
    const positions = {
      length: 9,
      get 0(): number {
        throw new Error('Planning must not read vertex data.');
      }
    };
    const part = trianglePart({ positions: { values: positions, offset: 0, stride: 3 } });
    const assembly = new MeshAssembly([part, part]);
    expect([assembly.vertexCount, assembly.indexCount, assembly.byteLength]).toEqual([6, 6, 264]);
    expect(new MeshAssembly([part, part], { includeUvs: true }).byteLength).toBe(312);
  });

  it('combines interleaved and planar attributes while rebasing reflected indexed triangles', () => {
    const records = new Float32Array([
      99, 9, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 8, 9, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0.5, 1, 0, 8, 9, 0, 1, 0, 0, 0, 1, 0,
      0, 1, 0, 0, 1, 8
    ]);
    const interleaved = trianglePart({
      positions: { values: records, offset: 2, stride: 14 },
      normals: { values: records, offset: 5, stride: 14 },
      colors: { values: records, offset: 8, stride: 14 },
      uvs: { values: records, offset: 12, stride: 14 }
    });
    const planar = trianglePart({
      normals: { values: [1, 1, 0], offset: 0, stride: 0 },
      indices: new Uint32Array([2, 0, 1]),
      matrix: new Float64Array([-2, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0.5, 0, 10, -3, 7, 1])
    });
    const result = new MeshAssembly([interleaved, planar], { includeUvs: true }).assemble();

    expect(result.positions).toEqual(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 10, -3, 7, 8, -3, 7, 11, 0, 7]));
    expect(result.indices).toEqual(new Uint32Array([0, 1, 2, 5, 4, 3]));
    expect(result.normals.subarray(0, 9)).toEqual(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]));
    for (let offset = 9; offset < 18; offset += 3) {
      expect(result.normals[offset]).toBeCloseTo(-Math.SQRT1_2, 6);
      expect(result.normals[offset + 1]).toBeCloseTo(Math.SQRT1_2, 6);
      expect(result.normals[offset + 2]).toBe(0);
    }
    expect(result.colors).toEqual(
      new Float32Array([1, 0, 0, 1, 0, 1, 0, 0.5, 0, 0, 1, 0, ...Array<number>(12).fill(1)])
    );
    expect(result.uvs).toEqual(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]));
  });

  it('preserves direct colors and applies prepared linear-light modulation without losing signed zero', () => {
    const colors = new Float32Array([-0, 0.5, 0.75, 0.8]);
    const direct = trianglePart({ colors: { values: colors, offset: 0, stride: 0 } });
    const modulated = {
      ...direct,
      modulation: new PreparedRGBAModulation([0.7, 0.5, 0.2, 0.8]),
      uvs: { values: [-0, 0.25], offset: 0, stride: 0 }
    };
    const result = new MeshAssembly([direct, modulated], { includeUvs: true }).assemble();
    for (let vertex = 0; vertex < 3; vertex += 1) {
      expect(result.colors.subarray(vertex * 4, vertex * 4 + 4)).toEqual(colors);
      expect(result.colors.subarray(12 + vertex * 4, 16 + vertex * 4)).toEqual(
        new Float32Array([-0, 0.2369668185710907, 0.13957345485687256, 0.6399999856948853])
      );
    }
    expect(result.uvs?.subarray(6)).toEqual(new Float32Array([-0, 0.25, -0, 0.25, -0, 0.25]));
    expect(colors).toEqual(new Float32Array([-0, 0.5, 0.75, 0.8]));
  });

  it('returns independent storage on each assembly without mutating sources', () => {
    const part = trianglePart({ indices: new Uint32Array([0, 1, 2]) });
    const positions = Array.from(part.positions.values);
    const assembly = new MeshAssembly([part]);
    const first = assembly.assemble();
    const before = first.positions.slice();
    first.positions.fill(-1);
    first.normals.fill(-1);
    first.colors.fill(-1);
    first.indices.fill(0);
    const next = assembly.assemble();
    expect(next.positions).toEqual(before);
    expect(next.indices).toEqual(new Uint32Array([0, 1, 2]));
    expect(Array.from(part.positions.values)).toEqual(positions);
    for (const attribute of ['positions', 'normals', 'colors', 'indices'] as const) {
      expect(first[attribute].buffer).not.toBe(next[attribute].buffer);
    }
  });

  it('retains unused vertices and repeated indices and handles mirrored nonindexed triangles', () => {
    const matrix = identityPreciseMat4();
    matrix[0] = -1;
    const result = new MeshAssembly([
      trianglePart({ indices: new Uint32Array([2, 2, 2]) }),
      trianglePart({ matrix })
    ]).assemble();
    expect(result.positions.length).toBe(18);
    expect(result.indices).toEqual(new Uint32Array([2, 2, 2, 3, 5, 4]));
  });

  it('keeps transformed normals perpendicular to tangents when the matrix needs pivoting', () => {
    const matrix = identityPreciseMat4();
    matrix.set([1e-15, 1, 0, 0, 1, 1, 0, 0]);
    const result = new MeshAssembly([
      trianglePart({ matrix, normals: { values: [1, 0, 0], offset: 0, stride: 0 } })
    ]).assemble();
    expect(result.normals[0]).toBeCloseTo(-Math.SQRT1_2, 6);
    expect(result.normals[1]).toBeCloseTo(Math.SQRT1_2, 6);
    expect(result.normals[0]! + result.normals[1]!).toBeCloseTo(0, 6);
  });

  it('uses the existing positive-Z fallback for zero normals', () => {
    const result = new MeshAssembly([
      trianglePart({ normals: { values: [0, 0, 0], offset: 0, stride: 0 } })
    ]).assemble();
    expect(result.normals).toEqual(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]));
  });

  it.each([0, 1, 2])('leaves Float32 position overflow policy for axis %i with the caller', axis => {
    const matrix = identityPreciseMat4();
    matrix[12 + axis] = 1e100;
    const part = trianglePart({ matrix });
    const assembly = new MeshAssembly([part]);
    expect(assembly.assemble().positions[axis]).toBe(Number.POSITIVE_INFINITY);
    const failure = new RangeError('Caller-specific position limit.');
    let failures = 0;
    expect(() =>
      assembly.assemble({
        onPositionOverflow: () => {
          failures += 1;
          throw failure;
        }
      })
    ).toThrow(failure);
    expect(failures).toBe(1);
    expect(part.positions.values[0]).toBe(0);
  });

  it('rejects an oversized index address space before allocating arrays or reading matrices', () => {
    let reads = 0;
    const part = trianglePart({
      vertexCount: 0xffff_ffff,
      positions: { values: { length: 0xffff_ffff * 3 }, offset: 0, stride: 3 }
    });
    Object.defineProperty(part, 'matrix', {
      get: () => {
        reads += 1;
        return identityPreciseMat4();
      }
    });
    const assembly = new MeshAssembly([part, part]);
    expect(assembly.vertexCount).toBe(0xffff_ffff * 2);
    expect(() => assembly.assemble()).toThrow('indexed allocation limit');
    expect(reads).toBe(0);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid vertex count %s',
    vertexCount => {
      expect(() => new MeshAssembly([trianglePart({ vertexCount })])).toThrow(RangeError);
    }
  );

  it('rejects incomplete indexed and nonindexed triangles', () => {
    expect(() => new MeshAssembly([trianglePart({ vertexCount: 2 })])).toThrow('triangle triples');
    expect(() => new MeshAssembly([trianglePart({ indices: new Uint32Array(2) })])).toThrow('triangle triples');
  });

  it.each([
    { offset: -1, stride: 3 },
    { offset: 0.5, stride: 3 },
    { offset: 0, stride: -1 },
    { offset: 0, stride: 2 },
    { offset: 0, stride: 3.5 },
    { offset: Number.MAX_SAFE_INTEGER, stride: 0 },
    { offset: 0, stride: Number.MAX_SAFE_INTEGER }
  ])('rejects invalid or overflowing spans %o', span => {
    const part = trianglePart();
    expect(() => new MeshAssembly([{ ...part, positions: { ...part.positions, ...span } }])).toThrow(RangeError);
  });

  it('rejects source spans that cannot cover the selected vertex count', () => {
    const part = trianglePart();
    expect(() => new MeshAssembly([{ ...part, normals: { values: [], offset: 0, stride: 0 } }])).toThrow(
      'source storage'
    );
    expect(() => new MeshAssembly([{ ...part, colors: { values: [1, 1, 1], offset: 0, stride: 0 } }])).toThrow(
      'source storage'
    );
    expect(() => new MeshAssembly([{ ...part, uvs: { values: [0], offset: 0, stride: 0 } }])).toThrow('source storage');
  });
});

function trianglePart(overrides: Partial<MeshAssemblyPart> = {}): MeshAssemblyPart {
  const positions: MeshAttributeSpan = { values: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), offset: 0, stride: 3 };
  return {
    positions,
    normals: { values: [0, 0, 1], offset: 0, stride: 0 },
    colors: { values: [1, 1, 1, 1], offset: 0, stride: 0 },
    indices: null,
    vertexCount: 3,
    matrix: identityPreciseMat4(),
    ...overrides
  };
}
