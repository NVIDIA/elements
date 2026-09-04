// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { MarkerInstanceBuffer } from './internal/instance-buffer.js';
import { LINE_VERTEX, MARKER, POINT } from './internal/layouts/built-ins.js';
import type { LayoutDescriptor } from './internal/layouts/define-layout.js';
import { writeLineVertex, writeMarker, writePoint } from './internal/layouts/helpers.js';
import { validateMeshGeometry, type MeshGeometryInput } from './internal/mesh/geometry.js';
import { mergeUploadRanges } from './internal/upload-ranges.js';
import { VertexStreamBuffer } from './internal/vertex-stream.js';
import { MarkerBuffer } from './internal/markers/buffer.js';
import { PointBuffer } from './internal/points/buffer.js';
import { replacePreparedMarkerSource, replacePreparedVertexSource } from './internal/prepared-record-source.js';

// Keep local CPU benchmarks in one entry point for agent discovery.
const runOptions = {
  iterations: 10,
  throws: true,
  time: 1_000,
  warmupTime: 250
} satisfies BenchRunOptions;
const MARKER_COUNT = 10_000;
const VERTEX_COUNT = 100_000;

describe('marker instance buffer', () => {
  for (const count of [1_000, MARKER_COUNT, 100_000]) {
    const source = createMarkers(count);
    test(`${count / 1_000}K replace`, async ({ bench }) => {
      await bench(`${count / 1_000}K replace`, () => {
        const buffer = new MarkerInstanceBuffer();
        buffer.replace(source);
        void buffer.getUploadBytes();
      }).run(runOptions);
    });
  }

  const source = createMarkers(MARKER_COUNT);

  for (const [name, count] of [
    ['1-record commit', 1],
    ['1% commit', MARKER_COUNT / 100],
    ['full commit', MARKER_COUNT]
  ] as const) {
    const buffer = new MarkerInstanceBuffer();
    buffer.replace(source);
    buffer.takeUploadRanges();
    test(name, async ({ bench }) => {
      await bench(name, () => {
        buffer.commit(0, count);
        void buffer.takeUploadRanges();
      }).run(runOptions);
    });
  }

  const buffer = new MarkerInstanceBuffer();
  buffer.replace(source);
  buffer.takeUploadRanges();
  test('cached transparency classification', async ({ bench }) => {
    await bench('cached transparency classification', () => {
      void buffer.hasPartialFaceAlpha(MARKER_COUNT);
      void buffer.hasPartialOutlineAlpha(MARKER_COUNT);
      void buffer.hasVisibleOutlineAlpha(MARKER_COUNT);
    }).run(runOptions);
  });
});

describe('marker replacement reuse', () => {
  const source = createMarkers(VERTEX_COUNT);
  const buffer = new MarkerInstanceBuffer();
  buffer.replace(source);
  test('100K same-capacity replace', async ({ bench }) => {
    await bench('100K same-capacity replace', () => {
      buffer.replace(source);
      void buffer.getUploadBytes();
    }).run(runOptions);
  });

  const commitBuffer = new MarkerInstanceBuffer();
  commitBuffer.replace(source);
  commitBuffer.takeUploadRanges();
  test('100K full commit reference', async ({ bench }) => {
    await bench('100K full commit reference', () => {
      commitBuffer.commit();
      void commitBuffer.takeUploadRanges();
    }).run(runOptions);
  });
});

describe('marker replacement classification churn', () => {
  const sources = [createMarkers(VERTEX_COUNT), createTransparentMarkers(VERTEX_COUNT)] as const;
  const buffer = new MarkerInstanceBuffer();
  let activeSource: 0 | 1 = 0;
  buffer.replace(sources[activeSource]);
  test('100K alternating transparency replace', async ({ bench }) => {
    await bench('100K alternating transparency replace', () => {
      activeSource = activeSource === 0 ? 1 : 0;
      buffer.replace(sources[activeSource]);
      void buffer.getUploadBytes();
    }).run(runOptions);
  });
});

describe('marker quaternion normalization', () => {
  for (const [name, source] of [
    ['100K normalized-unit replace', createMarkers(VERTEX_COUNT, [0.5, 0.5, 0.5, 0.5])],
    ['100K non-unit replace', createNonUnitMarkers(VERTEX_COUNT)]
  ] as const) {
    test(name, async ({ bench }) => {
      await bench(name, () => {
        const buffer = new MarkerInstanceBuffer();
        buffer.replace(source);
        void buffer.getUploadBytes();
      }).run(runOptions);
    });
  }
});

describe('replacement fan-out', () => {
  const source = createMarkers(MARKER_COUNT);
  for (const layerCount of [1, 3, 6]) {
    const buffers = Array.from({ length: layerCount }, () => new MarkerInstanceBuffer());
    test(`10K markers to ${layerCount} layer${layerCount === 1 ? '' : 's'}`, async ({ bench }) => {
      await bench(`10K markers to ${layerCount} layer${layerCount === 1 ? '' : 's'}`, () => {
        for (const buffer of buffers) buffer.replace(source);
      }).run(runOptions);
    });
  }
});

describe('prepared replacement fan-out', () => {
  const markerSource = new MarkerBuffer({ capacity: MARKER_COUNT });
  markerSource.bytes.set(createMarkers(MARKER_COUNT));
  markerSource.commit();
  const pointSource = new PointBuffer({ capacity: MARKER_COUNT });
  pointSource.bytes.set(createPoints(MARKER_COUNT));
  pointSource.commit();

  for (const layerCount of [1, 3, 6]) {
    const markerBuffers = Array.from({ length: layerCount }, () => new MarkerInstanceBuffer());
    test(`10K prepared markers to ${layerCount} layer${layerCount === 1 ? '' : 's'}`, async ({ bench }) => {
      await bench(`10K prepared markers to ${layerCount} layer${layerCount === 1 ? '' : 's'}`, () => {
        for (const buffer of markerBuffers) replacePreparedMarkerSource(buffer, markerSource);
      }).run(runOptions);
    });

    const vertexBuffers = Array.from({ length: layerCount }, () => new VertexStreamBuffer(POINT));
    test(`10K prepared points to ${layerCount} layer${layerCount === 1 ? '' : 's'}`, async ({ bench }) => {
      await bench(`10K prepared points to ${layerCount} layer${layerCount === 1 ? '' : 's'}`, () => {
        for (const buffer of vertexBuffers) replacePreparedVertexSource(buffer, pointSource, pointSource.count);
      }).run(runOptions);
    });
  }
});

describe('large prepared replacement fan-out', () => {
  const markerSource = new MarkerBuffer({ capacity: VERTEX_COUNT });
  markerSource.bytes.set(createMarkers(VERTEX_COUNT));
  markerSource.commit();
  const pointSource = new PointBuffer({ capacity: VERTEX_COUNT });
  pointSource.bytes.set(createPoints(VERTEX_COUNT));
  pointSource.commit();

  for (const layerCount of [1, 3, 6, 9]) {
    const markerBuffers = Array.from({ length: layerCount }, () => new MarkerInstanceBuffer());
    test(`100K prepared markers to ${layerCount} layer${layerCount === 1 ? '' : 's'}`, async ({ bench }) => {
      await bench(`100K prepared markers to ${layerCount} layer${layerCount === 1 ? '' : 's'}`, () => {
        for (const buffer of markerBuffers) replacePreparedMarkerSource(buffer, markerSource);
      }).run(runOptions);
    });

    const vertexBuffers = Array.from({ length: layerCount }, () => new VertexStreamBuffer(POINT));
    test(`100K prepared points to ${layerCount} layer${layerCount === 1 ? '' : 's'}`, async ({ bench }) => {
      await bench(`100K prepared points to ${layerCount} layer${layerCount === 1 ? '' : 's'}`, () => {
        for (const buffer of vertexBuffers) replacePreparedVertexSource(buffer, pointSource, pointSource.count);
      }).run(runOptions);
    });
  }
});

describe('marker source generation', () => {
  const helperSource = new Uint8Array(MARKER_COUNT * MARKER.stride);
  test('10K helper writes', async ({ bench }) => {
    await bench('10K helper writes', () => {
      for (let index = 0; index < MARKER_COUNT; index += 1) {
        writeMarker(helperSource, index, { position: [index % 100, Math.floor(index / 100), 0] });
      }
    }).run(runOptions);
  });

  const directSource = new Uint8Array(MARKER_COUNT * MARKER.stride);
  const directView = new DataView(directSource.buffer, directSource.byteOffset, directSource.byteLength);
  const positionOffset = fieldOffset(MARKER, 'position');
  test('10K direct writes', async ({ bench }) => {
    await bench('10K direct writes', () => {
      for (let index = 0; index < MARKER_COUNT; index += 1) {
        const offset = index * MARKER.stride + positionOffset;
        directView.setFloat32(offset, index % 100, true);
        directView.setFloat32(offset + 4, Math.floor(index / 100), true);
        directView.setFloat32(offset + 8, 0, true);
      }
    }).run(runOptions);
  });
});

describe('vertex stream buffer', () => {
  for (const [name, layout, source] of [
    ['points', POINT, createPoints(VERTEX_COUNT)],
    ['lines', LINE_VERTEX, createLines(VERTEX_COUNT)]
  ] as const) {
    test(`100K ${name} replace`, async ({ bench }) => {
      await bench(`100K ${name} replace`, () => {
        const stream = new VertexStreamBuffer(layout);
        stream.replace(source);
        void stream.getUploadBytes();
      }).run(runOptions);
    });

    for (const [mode, count] of [
      ['ranged', VERTEX_COUNT / 100],
      ['full', VERTEX_COUNT]
    ] as const) {
      const stream = new VertexStreamBuffer(layout);
      stream.replace(source);
      stream.takeUploadRanges();
      test(`100K ${name} ${mode} commit`, async ({ bench }) => {
        await bench(`100K ${name} ${mode} commit`, () => {
          stream.commit(0, count);
          void stream.takeUploadRanges();
        }).run(runOptions);
      });
    }
  }

  const source = createPoints(VERTEX_COUNT);
  const stream = new VertexStreamBuffer(POINT);
  stream.replace(source);
  stream.takeUploadRanges();
  test('cached stream transparency classification', async ({ bench }) => {
    await bench('cached stream transparency classification', () => {
      void stream.toRenderData({ consumeUploadRanges: false }).transparent;
    }).run(runOptions);
  });
});

describe('vertex stream replacement reuse', () => {
  for (const [name, layout, source] of [
    ['points', POINT, createPoints(VERTEX_COUNT)],
    ['lines', LINE_VERTEX, createLines(VERTEX_COUNT)]
  ] as const) {
    const stream = new VertexStreamBuffer(layout);
    stream.replace(source);
    test(`100K ${name} same-capacity replace`, async ({ bench }) => {
      await bench(`100K ${name} same-capacity replace`, () => {
        stream.replace(source);
        void stream.getUploadBytes();
      }).run(runOptions);
    });
  }
});

describe('vertex stream replacement classification churn', () => {
  const sources = [createPoints(VERTEX_COUNT), createPoints(VERTEX_COUNT, 0.5)] as const;
  const stream = new VertexStreamBuffer(POINT);
  let activeSource: 0 | 1 = 0;
  stream.replace(sources[activeSource]);
  test('100K points alternating opacity replace', async ({ bench }) => {
    await bench('100K points alternating opacity replace', () => {
      activeSource = activeSource === 0 ? 1 : 0;
      stream.replace(sources[activeSource]);
      void stream.getUploadBytes();
    }).run(runOptions);
  });
});

describe('dirty range merging', () => {
  for (const [name, ranges] of [
    ['1K adjacent ranges', createUploadRanges(1_000, 48, 48)],
    ['1K disjoint ranges', createUploadRanges(1_000, 64, 32)],
    ['1K overlapping ranges', createUploadRanges(1_000, 32, 96)]
  ] as const) {
    test(name, async ({ bench }) => {
      await bench(name, () => {
        void mergeUploadRanges(ranges);
      }).run(runOptions);
    });
  }
});

describe('mesh geometry validation', () => {
  const geometry = createIndexedGrid(256);
  test('256x256 indexed mesh', async ({ bench }) => {
    await bench('256x256 indexed mesh', () => {
      validateMeshGeometry(geometry);
    }).run(runOptions);
  });
});

function fieldOffset(layout: LayoutDescriptor, name: string): number {
  const field = layout.fields[name];
  if (!field) throw new Error(`Expected ${layout.name} to define ${name}.`);
  return field.offset;
}

function createMarkers(count: number, orientation: [number, number, number, number] = [0, 0, 0, 1]): Uint8Array {
  const source = new Uint8Array(count * MARKER.stride);
  for (let index = 0; index < count; index += 1) {
    writeMarker(source, index, { orientation, position: [index % 100, Math.floor(index / 100), 0] });
  }
  return source;
}

function createNonUnitMarkers(count: number): Uint8Array {
  const source = createMarkers(count);
  const view = new DataView(source.buffer, source.byteOffset, source.byteLength);
  const orientationWOffset = fieldOffset(MARKER, 'orientation') + 12;
  for (let index = 0; index < count; index += 1) {
    view.setFloat32(index * MARKER.stride + orientationWOffset, 2, true);
  }
  return source;
}

function createTransparentMarkers(count: number): Uint8Array {
  const source = createMarkers(count);
  for (let index = 0; index < count; index += 1) {
    const offset = index * MARKER.stride;
    source[offset + fieldOffset(MARKER, 'color') + 3] = 128;
    source[offset + fieldOffset(MARKER, 'outline-color') + 3] = 128;
  }
  return source;
}

function createPoints(count: number, alpha = 1): Uint8Array {
  const source = new Uint8Array(count * POINT.stride);
  for (let index = 0; index < count; index += 1) {
    writePoint(source, index, { color: [1, 1, 1, alpha], position: [index % 1_000, Math.floor(index / 1_000), 0] });
  }
  return source;
}

function createLines(count: number): Uint8Array {
  const source = new Uint8Array(count * LINE_VERTEX.stride);
  for (let index = 0; index < count; index += 1) {
    writeLineVertex(source, index, { position: [index % 1_000, Math.floor(index / 1_000), 0], width: 1 });
  }
  return source;
}

function createIndexedGrid(size: number): MeshGeometryInput {
  const side = size + 1;
  const positions = new Float32Array(side * side * 3);
  for (let row = 0; row < side; row += 1) {
    for (let column = 0; column < side; column += 1) {
      const offset = (row * side + column) * 3;
      positions[offset] = column;
      positions[offset + 1] = row;
    }
  }
  const indices = new Uint32Array(size * size * 6);
  let offset = 0;
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const topLeft = row * side + column;
      indices.set([topLeft, topLeft + side, topLeft + 1, topLeft + 1, topLeft + side, topLeft + side + 1], offset);
      offset += 6;
    }
  }
  return { colors: null, indices, normals: null, positions, uvs: null };
}

function createUploadRanges(count: number, offsetStep: number, size: number): Array<{ offset: number; size: number }> {
  return Array.from({ length: count }, (_, index) => ({ offset: index * offsetStep, size }));
}
