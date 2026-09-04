// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { BenchRunOptions } from 'vitest';
import { afterAll, describe, test } from 'vitest';
import { MarkerInstanceBuffer } from './internal/instance-buffer.js';
import { LINE_VERTEX, MARKER, POINT } from './internal/layouts/built-ins.js';
import { getFieldOffset } from './internal/layouts/define-layout.js';
import { writeLineVertex, writeMarker, writePoint } from './internal/layouts/helpers.js';
import { validateMeshGeometry, type MeshGeometryInput } from './internal/mesh/geometry.js';
import {
  continueMeshGeometryPreparation,
  prepareMeshGeometry,
  processMeshGeometry
} from './internal/mesh/processing.js';
import { createLabelGlyphRun, prepareLabelGlyphRun } from './internal/labels/glyph-run.js';
import { getLabelFontAtlas } from './internal/font/atlas.js';
import { compileHeightfield, prepareHeightfield } from './internal/heightfield/compile.js';
import type { PreparationContext } from './internal/preparation.js';
import { mergeUploadRanges } from './internal/upload-ranges.js';
import { VertexStreamBuffer } from './internal/vertex-stream.js';
import { MarkerBuffer } from './internal/markers/buffer.js';
import { LineVertexBuffer } from './internal/lines/buffer.js';
import { PointBuffer } from './internal/points/buffer.js';
import { TriangleVertexBuffer } from './internal/triangles/buffer.js';
import { replacePreparedMarkerSource, replacePreparedVertexSource } from './internal/prepared-record-source.js';
import { compileMarker, registerMarkerState } from './internal/markers/state.js';
import { compileParts } from './internal/model/compile.js';
import { CameraRuntime } from './internal/camera/runtime.js';
import { SceneModel } from './model/model.js';
import { ScenePart } from './model/part.js';
import { SceneCamera } from './camera/camera.js';
import type { Scene } from './scene/scene.js';
import { SceneContent } from './internal/scene/content.js';
import { registerMarkerLayer } from './internal/markers/layer-state.js';
import {
  registerSceneFeatureIdLayer,
  resolveSceneFeatureId,
  setSceneFeatureIds,
  takeSceneFeatureIdSnapshot
} from './internal/feature-ids.js';
import './camera/define.js';
import './model/define.js';
import './scene/define.js';

// Keep local CPU benchmarks in one entry point for agent discovery.
const runOptions = {
  iterations: 10,
  throws: true,
  time: 1_000,
  warmupTime: 250
} satisfies BenchRunOptions;
const MARKER_COUNT = 10_000;
const VERTEX_COUNT = 100_000;
const FEATURE_ID_COUNT = 1_000_000;

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

describe('declarative marker compilation', () => {
  const markers = createDeclarativeMarkers(1_000);

  test('1K total markers', async ({ bench }) => {
    await bench('1K total markers', () => {
      for (const marker of markers) void compileMarker(marker);
    }).run(runOptions);
  });

  test('one dirty marker in a 1K layer', async ({ bench }) => {
    const marker = markers[500]!;
    let position = 0;
    await bench('one dirty marker in a 1K layer', () => {
      position += 1;
      Reflect.set(marker, 'position', [position, 0, 0]);
      void compileMarker(marker);
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
  const markerSource = createMarkerBuffer(MARKER_COUNT);
  const pointSource = createPointBuffer(MARKER_COUNT);

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
  const markerSource = createMarkerBuffer(VERTEX_COUNT);
  const pointSource = createPointBuffer(VERTEX_COUNT);

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
  const positionOffset = getFieldOffset(MARKER, 'position');
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

describe('mutable vertex buffer source generation', () => {
  for (const [name, count, createBuffer] of [
    ['points', VERTEX_COUNT, () => new PointBuffer({ capacity: VERTEX_COUNT })],
    ['triangle vertices', 30_000, () => new TriangleVertexBuffer({ capacity: 30_000 })],
    ['line vertices', VERTEX_COUNT, () => new LineVertexBuffer({ capacity: VERTEX_COUNT })]
  ] as const) {
    test(`${formatCount(count)} ${name} sequential writes`, async ({ bench }) => {
      await bench(`${formatCount(count)} ${name} sequential writes`, () => {
        const buffer = createBuffer();
        for (let index = 0; index < count; index += 1) {
          buffer.set(index, { position: [index % 1_000, Math.floor(index / 1_000), 0] });
        }
        return buffer.count;
      }).run(runOptions);
    });
  }
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

describe('derived content preparation', () => {
  const atlas = getLabelFontAtlas();
  const context: PreparationContext = { isCurrent: () => true, yield: () => Promise.resolve() };
  for (const count of [1_000, 10_000]) {
    const texts = Array.from({ length: count }, (_, index) => `label-${String(index).padStart(6, '0')}`);
    test(`${count / 1_000}K label glyph run reference`, async ({ bench }) => {
      await bench(`${count / 1_000}K label glyph run reference`, () => createLabelGlyphRun(texts, count, atlas)).run(
        runOptions
      );
    });
    test(`${count / 1_000}K label preparation candidate`, async ({ bench }) => {
      await bench(`${count / 1_000}K label preparation candidate`, () =>
        prepareLabelGlyphRun({ atlas, context, count, texts })
      ).run(runOptions);
    });
  }

  const mesh = createIndexedGrid(256);
  test('256x256 indexed flat mesh reference', async ({ bench }) => {
    await bench('256x256 indexed flat mesh reference', () => processMeshGeometry(mesh)).run(runOptions);
  });
  test('256x256 indexed flat mesh preparation candidate', async ({ bench }) => {
    await bench('256x256 indexed flat mesh preparation candidate', () => prepareMeshGeometry(mesh, context)).run(
      runOptions
    );
  });

  const heightfield = createHeightfieldGrid(256);
  test('256x256 heightfield fallback reference', async ({ bench }) => {
    await bench('256x256 heightfield fallback reference', () => compileHeightfield(heightfield)).run(runOptions);
  });
  test('256x256 heightfield fallback preparation candidate', async ({ bench }) => {
    await bench('256x256 heightfield fallback preparation candidate', async () => {
      const compiled = await prepareHeightfield(heightfield, context);
      if (compiled) await continueMeshGeometryPreparation({ ...compiled, uvs: null }, context);
    }).run(runOptions);
  });
});

describe('record publication contracts', () => {
  for (const count of [1, 100, 1_000] as const) {
    const source = createMarkers(count);
    const buffer = new MarkerInstanceBuffer();
    buffer.replace(source);
    buffer.takeUploadRanges();
    test(`${count} count change`, async ({ bench }) => {
      let active: number = count;
      await bench(`${count} count change`, () => {
        active = active === count ? Math.max(0, count - 1) : count;
        buffer.commit(0, 1);
        buffer.setSourceCount(active);
        void buffer.takeUploadRanges();
      }).run(runOptions);
    });
  }

  test('100K partial publication crossing a dirty range', async ({ bench }) => {
    const source = createMarkers(VERTEX_COUNT);
    const buffer = new MarkerInstanceBuffer();
    buffer.replace(source);
    buffer.takeUploadRanges();
    await bench('100K partial publication crossing a dirty range', () => {
      buffer.commit(VERTEX_COUNT / 2 - 1, 3);
      void buffer.takeUploadRanges();
    }).run(runOptions);
  });

  test('100K prepared sharing across six consumers', async ({ bench }) => {
    const source = createMarkerBuffer(VERTEX_COUNT);
    const buffers = Array.from({ length: 6 }, () => new MarkerInstanceBuffer());
    await bench('100K prepared sharing across six consumers', () => {
      for (const buffer of buffers) replacePreparedMarkerSource(buffer, source);
    }).run(runOptions);
  });
});

describe('scene layer tracking', () => {
  for (const layerCount of [10, 100, 1_000] as const) {
    const host = document.createElement('nve-scene');
    const layers = Array.from({ length: layerCount }, () => document.createElement('nve-scene-cubes'));
    for (const layer of layers) {
      registerMarkerLayer(layer, 'cube');
      host.append(layer);
    }
    const content = new SceneContent(host);
    content.refresh();
    content.trackChanges();
    test(`${layerCount} layers unchanged tracking`, async ({ bench }) => {
      await bench(`${layerCount} layers unchanged tracking`, () => {
        void content.trackChanges();
      }).run(runOptions);
    });
  }
});

describe('feature identity', () => {
  const layer = document.createElement('div');
  const source = new Uint32Array(FEATURE_ID_COUNT);
  for (let index = 0; index < source.length; index += 1) source[index] = index;
  registerSceneFeatureIdLayer(layer);

  test('1M uint32 raw copy reference', async ({ bench }) => {
    await bench('1M uint32 raw copy reference', () => new Uint32Array(source).length).run(runOptions);
  });

  test('1M uint32 feature snapshot', async ({ bench }) => {
    await bench('1M uint32 feature snapshot', () => setSceneFeatureIds(layer, source)).run(runOptions);
  });

  setSceneFeatureIds(layer, source);
  const snapshot = takeSceneFeatureIdSnapshot(layer, FEATURE_ID_COUNT);
  test('1M direct typed-array lookup reference', async ({ bench }) => {
    await bench('1M direct typed-array lookup reference', () => {
      let total = 0;
      for (let index = 0; index < source.length; index += 1) total += source[index]!;
      return total;
    }).run(runOptions);
  });

  test('1M direct feature lookup', async ({ bench }) => {
    await bench('1M direct feature lookup', () => {
      let total = 0;
      for (let index = 0; index < source.length; index += 1) total += resolveSceneFeatureId(snapshot, index) ?? 0;
      return total;
    }).run(runOptions);
  });
});

describe('camera contribution comparison', () => {
  const scenes: Scene[] = [];

  afterAll(() => {
    for (const scene of scenes) scene.remove();
  });

  for (const count of [1, 100, 1_000] as const) {
    const host = document.createElement('nve-scene') as Scene;
    const cameras = Array.from(
      { length: count },
      () => document.createElement(SceneCamera.metadata.tag) as SceneCamera
    );
    cameras.forEach(camera => host.append(camera));
    const runtime = new CameraRuntime({
      host,
      requestRender: () => undefined,
      shouldIgnoreInput: () => false
    });
    runtime.trackChanges();
    runtime.resolve();
    scenes.push(host);
    test(`${count} camera runtime unchanged track/resolve`, async ({ bench }) => {
      await bench(`${count} camera runtime unchanged track/resolve`, () => {
        runtime.trackChanges();
        runtime.resolve();
      }).run(runOptions);
    });
  }
});

describe('model edits', () => {
  for (const count of [1, 100, 1_000] as const) {
    const parts = createModelParts(count);
    test(`${count} direct compileParts`, async ({ bench }) => {
      await bench(`${count} direct compileParts`, () => {
        void compileParts(parts);
      }).run(runOptions);
    });

    const model = document.createElement(SceneModel.metadata.tag) as SceneModel;
    test(`${count} bulk assignment`, async ({ bench }) => {
      await bench(`${count} bulk assignment`, () => {
        model.parts = parts;
      }).run(runOptions);
    });

    const declarativeModel = document.createElement(SceneModel.metadata.tag) as SceneModel;
    const declarativeParts = Array.from(
      { length: count },
      () => document.createElement(ScenePart.metadata.tag) as ScenePart
    );
    declarativeModel.append(...declarativeParts);
    test(`${count} declarative edit`, async ({ bench }) => {
      let position = 0;
      await bench(`${count} declarative edit`, () => {
        position += 1;
        declarativeParts[0]!.position = [position, 0, 0];
      }).run(runOptions);
    });
  }
});

function formatCount(count: number): string {
  return count >= 1_000 ? `${count / 1_000}K` : String(count);
}

function createMarkers(count: number, orientation: [number, number, number, number] = [0, 0, 0, 1]): Uint8Array {
  const source = new Uint8Array(count * MARKER.stride);
  for (let index = 0; index < count; index += 1) {
    writeMarker(source, index, { orientation, position: [index % 100, Math.floor(index / 100), 0] });
  }
  return source;
}

function createDeclarativeMarkers(count: number): readonly HTMLElement[] {
  const layer = document.createElement('nve-scene-cubes');
  const markers = Array.from({ length: count }, () => {
    const marker = document.createElement('nve-scene-marker');
    registerMarkerState(marker);
    return marker;
  });
  layer.append(...markers);
  for (const marker of markers) void compileMarker(marker);
  return markers;
}

function createMarkerBuffer(count: number): MarkerBuffer {
  const source = new MarkerBuffer({ capacity: count });
  for (let index = 0; index < count; index += 1) {
    source.set(index, { position: [index % 100, Math.floor(index / 100), 0] });
  }
  return source;
}

function createPointBuffer(count: number): PointBuffer {
  const source = new PointBuffer({ capacity: count });
  for (let index = 0; index < count; index += 1) {
    source.set(index, { position: [index % 1_000, Math.floor(index / 1_000), 0] });
  }
  return source;
}

function createNonUnitMarkers(count: number): Uint8Array {
  const source = createMarkers(count);
  const view = new DataView(source.buffer, source.byteOffset, source.byteLength);
  const orientationWOffset = getFieldOffset(MARKER, 'orientation') + 12;
  for (let index = 0; index < count; index += 1) {
    view.setFloat32(index * MARKER.stride + orientationWOffset, 2, true);
  }
  return source;
}

function createTransparentMarkers(count: number): Uint8Array {
  const source = createMarkers(count);
  for (let index = 0; index < count; index += 1) {
    const offset = index * MARKER.stride;
    source[offset + getFieldOffset(MARKER, 'color') + 3] = 128;
    source[offset + getFieldOffset(MARKER, 'outline-color') + 3] = 128;
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

function createHeightfieldGrid(size: number) {
  return { columns: size, heights: new Float32Array(size * size), rows: size, spacing: 1 };
}

function createUploadRanges(count: number, offsetStep: number, size: number): Array<{ offset: number; size: number }> {
  return Array.from({ length: count }, (_, index) => ({ offset: index * offsetStep, size }));
}

function createModelParts(count: number): Array<{ shape: 'cube'; position: [number, number, number] }> {
  return Array.from({ length: count }, (_, index) => ({
    position: [index % 100, Math.floor(index / 100), 0] as [number, number, number],
    shape: 'cube' as const
  }));
}
