// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Vec3 } from './types.js';

export type PrimitiveKind = 'arrow' | 'cone' | 'cube' | 'cylinder' | 'pyramid' | 'sphere';
export type UnitPrimitiveKind = Exclude<PrimitiveKind, 'arrow'>;

export interface PrimitiveGeometry {
  readonly vertices: Float32Array;
  readonly indices: Uint32Array;
  readonly triangleCount: number;
}

const RADIAL_SEGMENTS = 32;

const CUBE_FACES: ReadonlyArray<{ normal: Vec3; corners: Vec3[] }> = [
  {
    normal: [1, 0, 0],
    corners: [
      [0.5, -0.5, -0.5],
      [0.5, 0.5, -0.5],
      [0.5, 0.5, 0.5],
      [0.5, -0.5, 0.5]
    ]
  },
  {
    normal: [-1, 0, 0],
    corners: [
      [-0.5, 0.5, -0.5],
      [-0.5, -0.5, -0.5],
      [-0.5, -0.5, 0.5],
      [-0.5, 0.5, 0.5]
    ]
  },
  {
    normal: [0, 1, 0],
    corners: [
      [0.5, 0.5, -0.5],
      [-0.5, 0.5, -0.5],
      [-0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5]
    ]
  },
  {
    normal: [0, -1, 0],
    corners: [
      [-0.5, -0.5, -0.5],
      [0.5, -0.5, -0.5],
      [0.5, -0.5, 0.5],
      [-0.5, -0.5, 0.5]
    ]
  },
  {
    normal: [0, 0, 1],
    corners: [
      [-0.5, -0.5, 0.5],
      [0.5, -0.5, 0.5],
      [0.5, 0.5, 0.5],
      [-0.5, 0.5, 0.5]
    ]
  },
  {
    normal: [0, 0, -1],
    corners: [
      [-0.5, 0.5, -0.5],
      [0.5, 0.5, -0.5],
      [0.5, -0.5, -0.5],
      [-0.5, -0.5, -0.5]
    ]
  }
];

const ICOSAHEDRON_FACES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 11, 5],
  [0, 5, 1],
  [0, 1, 7],
  [0, 7, 10],
  [0, 10, 11],
  [1, 5, 9],
  [5, 11, 4],
  [11, 10, 2],
  [10, 7, 6],
  [7, 1, 8],
  [3, 9, 4],
  [3, 4, 2],
  [3, 2, 6],
  [3, 6, 8],
  [3, 8, 9],
  [4, 9, 5],
  [2, 4, 11],
  [6, 2, 10],
  [8, 6, 7],
  [9, 8, 1]
];

const PYRAMID_BASE: readonly Vec3[] = [
  [-0.5, -0.5, -0.5],
  [0.5, -0.5, -0.5],
  [0.5, 0.5, -0.5],
  [-0.5, 0.5, -0.5]
];
const PYRAMID_NORMAL = 1 / Math.sqrt(5);
const PYRAMID_SIDE_FACES: ReadonlyArray<{ readonly first: Vec3; readonly normal: Vec3; readonly second: Vec3 }> = [
  { first: PYRAMID_BASE[0]!, second: PYRAMID_BASE[1]!, normal: [0, -2 * PYRAMID_NORMAL, PYRAMID_NORMAL] },
  { first: PYRAMID_BASE[1]!, second: PYRAMID_BASE[2]!, normal: [2 * PYRAMID_NORMAL, 0, PYRAMID_NORMAL] },
  { first: PYRAMID_BASE[2]!, second: PYRAMID_BASE[3]!, normal: [0, 2 * PYRAMID_NORMAL, PYRAMID_NORMAL] },
  { first: PYRAMID_BASE[3]!, second: PYRAMID_BASE[0]!, normal: [-2 * PYRAMID_NORMAL, 0, PYRAMID_NORMAL] }
];
const PYRAMID_BOTTOM_CORNERS: readonly Vec3[] = [
  PYRAMID_BASE[0]!,
  PYRAMID_BASE[3]!,
  PYRAMID_BASE[2]!,
  PYRAMID_BASE[1]!
];

export function createPrimitiveGeometry(kind: PrimitiveKind): PrimitiveGeometry {
  switch (kind) {
    case 'arrow':
      return mergeGeometry(
        createCylinderGeometry({ radius: 0.04, bottom: 0, top: 0.75 }),
        createConeGeometry({ radius: 0.1, bottom: 0.75, top: 1 })
      );
    case 'cone':
    case 'cube':
    case 'cylinder':
    case 'pyramid':
    case 'sphere':
      return createUnitPrimitiveGeometry(kind);
    default: {
      const exhaustiveCheck: never = kind;
      throw new TypeError(`Unsupported primitive: ${exhaustiveCheck}`);
    }
  }
}

/** Shared marker/model unit tessellators. Their bytes are marker-compatible. */
export function createUnitPrimitiveGeometry(kind: UnitPrimitiveKind): PrimitiveGeometry {
  switch (kind) {
    case 'cone':
      return createConeGeometry({ radius: 0.5, bottom: -0.5, top: 0.5 });
    case 'cube':
      return createCubeGeometry();
    case 'cylinder':
      return createCylinderGeometry({ radius: 0.5, bottom: -0.5, top: 0.5 });
    case 'pyramid':
      return createPyramidGeometry();
    case 'sphere':
      return createSphereGeometry();
    default: {
      const exhaustiveCheck: never = kind;
      throw new TypeError(`Unsupported unit primitive: ${exhaustiveCheck}`);
    }
  }
}

function createPyramidGeometry(): PrimitiveGeometry {
  const builder = new GeometryBuilder();
  const apex: Vec3 = [0, 0, 0.5];
  PYRAMID_SIDE_FACES.forEach(face => appendTriangleFace(builder, face, apex));
  const bottomStart = builder.vertexCount;
  PYRAMID_BOTTOM_CORNERS.forEach(corner => builder.vertex(corner, [0, 0, -1]));
  builder.quad(bottomStart);
  return builder.build();
}

function createCubeGeometry(): PrimitiveGeometry {
  const builder = new GeometryBuilder();
  for (const face of CUBE_FACES) {
    const start = builder.vertexCount;
    face.corners.forEach(corner => builder.vertex(corner, face.normal));
    builder.quad(start);
  }
  return builder.build();
}

function createSphereGeometry(): PrimitiveGeometry {
  const ratio = (1 + Math.sqrt(5)) / 2;
  const seedPositions: Vec3[] = [
    [-1, ratio, 0],
    [1, ratio, 0],
    [-1, -ratio, 0],
    [1, -ratio, 0],
    [0, -1, ratio],
    [0, 1, ratio],
    [0, -1, -ratio],
    [0, 1, -ratio],
    [ratio, 0, -1],
    [ratio, 0, 1],
    [-ratio, 0, -1],
    [-ratio, 0, 1]
  ];
  const positions = seedPositions.map(position => scaleToRadius(position, 0.5));
  let faces = ICOSAHEDRON_FACES.map(face => [...face] as [number, number, number]);
  for (let subdivision = 0; subdivision < 2; subdivision += 1) {
    faces = subdivideFaces(positions, faces);
  }
  const builder = new GeometryBuilder();
  positions.forEach(position => builder.vertex(position, scaleToRadius(position, 1)));
  faces.forEach(face => builder.triangle(...face));
  return builder.build();
}

function createCylinderGeometry(options: { radius: number; bottom: number; top: number }): PrimitiveGeometry {
  const builder = new GeometryBuilder();
  const sideStart = builder.vertexCount;
  for (let segment = 0; segment < RADIAL_SEGMENTS; segment += 1) {
    const angle = (segment / RADIAL_SEGMENTS) * Math.PI * 2;
    const normal: Vec3 = [Math.cos(angle), Math.sin(angle), 0];
    builder.vertex([normal[0] * options.radius, normal[1] * options.radius, options.bottom], normal);
    builder.vertex([normal[0] * options.radius, normal[1] * options.radius, options.top], normal);
  }
  for (let segment = 0; segment < RADIAL_SEGMENTS; segment += 1) {
    const current = sideStart + segment * 2;
    const next = sideStart + ((segment + 1) % RADIAL_SEGMENTS) * 2;
    builder.triangle(current, next, next + 1);
    builder.triangle(current, next + 1, current + 1);
  }
  appendCap(builder, { radius: options.radius, z: options.bottom, normal: [0, 0, -1] });
  appendCap(builder, { radius: options.radius, z: options.top, normal: [0, 0, 1] });
  return builder.build();
}

function createConeGeometry(options: { radius: number; bottom: number; top: number }): PrimitiveGeometry {
  const builder = new GeometryBuilder();
  for (let segment = 0; segment < RADIAL_SEGMENTS; segment += 1) {
    const angle = (segment / RADIAL_SEGMENTS) * Math.PI * 2;
    const nextAngle = ((segment + 1) / RADIAL_SEGMENTS) * Math.PI * 2;
    const current: Vec3 = [Math.cos(angle) * options.radius, Math.sin(angle) * options.radius, options.bottom];
    const next: Vec3 = [Math.cos(nextAngle) * options.radius, Math.sin(nextAngle) * options.radius, options.bottom];
    const apex: Vec3 = [0, 0, options.top];
    const normal = triangleNormal(current, next, apex);
    const start = builder.vertexCount;
    builder.vertex(current, normal);
    builder.vertex(next, normal);
    builder.vertex(apex, normal);
    builder.triangle(start, start + 1, start + 2);
  }
  appendCap(builder, { radius: options.radius, z: options.bottom, normal: [0, 0, -1] });
  return builder.build();
}

function appendTriangleFace(
  builder: GeometryBuilder,
  face: { readonly first: Vec3; readonly normal: Vec3; readonly second: Vec3 },
  apex: Vec3
): void {
  const start = builder.vertexCount;
  builder.vertex(face.first, face.normal);
  builder.vertex(face.second, face.normal);
  builder.vertex(apex, face.normal);
  builder.triangle(start, start + 1, start + 2);
}

function appendCap(builder: GeometryBuilder, options: { radius: number; z: number; normal: Vec3 }): void {
  const center = builder.vertexCount;
  builder.vertex([0, 0, options.z], options.normal);
  const ring = builder.vertexCount;
  for (let segment = 0; segment < RADIAL_SEGMENTS; segment += 1) {
    const angle = (segment / RADIAL_SEGMENTS) * Math.PI * 2;
    builder.vertex([Math.cos(angle) * options.radius, Math.sin(angle) * options.radius, options.z], options.normal);
  }
  for (let segment = 0; segment < RADIAL_SEGMENTS; segment += 1) {
    const current = ring + segment;
    const next = ring + ((segment + 1) % RADIAL_SEGMENTS);
    if (options.normal[2] > 0) {
      builder.triangle(center, current, next);
    } else {
      builder.triangle(center, next, current);
    }
  }
}

function subdivideFaces(positions: Vec3[], faces: Array<[number, number, number]>): Array<[number, number, number]> {
  const midpointCache = new Map<string, number>();
  const nextFaces: Array<[number, number, number]> = [];
  for (const [a, b, c] of faces) {
    const ab = getMidpoint({ positions, cache: midpointCache, left: a, right: b });
    const bc = getMidpoint({ positions, cache: midpointCache, left: b, right: c });
    const ca = getMidpoint({ positions, cache: midpointCache, left: c, right: a });
    nextFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
  }
  return nextFaces;
}

function getMidpoint(options: { positions: Vec3[]; cache: Map<string, number>; left: number; right: number }): number {
  const key = options.left < options.right ? `${options.left}:${options.right}` : `${options.right}:${options.left}`;
  const cached = options.cache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const a = options.positions[options.left] as Vec3;
  const b = options.positions[options.right] as Vec3;
  const midpoint: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const index = options.positions.push(scaleToRadius(midpoint, 0.5)) - 1;
  options.cache.set(key, index);
  return index;
}

function mergeGeometry(...geometries: PrimitiveGeometry[]): PrimitiveGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  for (const geometry of geometries) {
    const vertexOffset = vertices.length / 6;
    vertices.push(...geometry.vertices);
    indices.push(...[...geometry.indices].map(index => index + vertexOffset));
  }
  return { vertices: new Float32Array(vertices), indices: new Uint32Array(indices), triangleCount: indices.length / 3 };
}

function scaleToRadius(vector: Vec3, radius: number): Vec3 {
  const length = Math.hypot(...vector);
  return [(vector[0] / length) * radius, (vector[1] / length) * radius, (vector[2] / length) * radius];
}

function triangleNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const ab: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  return scaleToRadius(
    [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]],
    1
  );
}

class GeometryBuilder {
  readonly #indices: number[] = [];
  readonly #vertices: number[] = [];

  get vertexCount(): number {
    return this.#vertices.length / 6;
  }

  vertex(position: Vec3, normal: Vec3): void {
    this.#vertices.push(...position, ...normal);
  }

  triangle(a: number, b: number, c: number): void {
    this.#indices.push(a, b, c);
  }

  quad(start: number): void {
    this.triangle(start, start + 1, start + 2);
    this.triangle(start, start + 2, start + 3);
  }

  build(): PrimitiveGeometry {
    return {
      vertices: new Float32Array(this.#vertices),
      indices: new Uint32Array(this.#indices),
      triangleCount: this.#indices.length / 3
    };
  }
}
