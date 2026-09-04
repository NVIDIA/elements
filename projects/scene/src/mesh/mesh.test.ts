// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { MESH_GEOMETRY, MESH_TEXTURE_CAPTURE, MESH_TEXTURE_WITHOUT_UVS } from '../errors.js';
import {
  getMeshLayerVersion,
  getMeshRenderData,
  getMeshTopologyVersion,
  isMeshLayerRegistered,
  takeMeshLayerRenderData
} from '../internal/mesh/layer-state.js';
import { takeMarkerLayerRenderData } from '../internal/markers/layer-state.js';
import { MarkerBuffer } from '../internal/markers/buffer.js';
import { SceneMesh } from './mesh.js';
import '@nvidia-elements/scene/mesh/define.js';
import { restoreScenePlatform, scenePlatform } from '../internal/gpu/platform.js';

const triangle = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);

describe(SceneMesh.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    restoreScenePlatform();
  });

  it('exposes the exact marker layout and typed geometry property', () => {
    const mesh = new SceneMesh();
    expect(SceneMesh.layout.name).toBe('nve.marker');
    mesh.publishGeometry({ attribute: 'positions', source: triangle });
    expect(mesh.geometry?.positions).toBe(triangle);
    expect(mesh.hasAttribute('geometry')).toBe(false);
    expect(mesh.color).toBe('#ffffff');
  });

  it('exposes optional geometry properties and clears them', () => {
    const mesh = new SceneMesh();
    const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    const uvs = new Float32Array([0, 0, 1, 0, 0, 1]);
    const colors = new Float32Array(12).fill(1);
    const indices = new Uint32Array([0, 1, 2]);

    mesh.publishGeometry({ attribute: 'positions', source: triangle });
    mesh.publishGeometry({ attribute: 'normals', source: normals });
    mesh.publishGeometry({ attribute: 'uvs', source: uvs });
    mesh.publishGeometry({ attribute: 'colors', source: colors });
    mesh.publishGeometry({ attribute: 'indices', source: indices });

    expect(mesh.geometry?.normals).toBe(normals);
    expect(mesh.geometry?.uvs).toBe(uvs);
    expect(mesh.geometry?.colors).toBe(colors);
    expect(mesh.geometry?.indices).toBe(indices);

    mesh.publishGeometry({ attribute: 'normals', source: null });
    mesh.publishGeometry({ attribute: 'uvs', source: null });
    mesh.publishGeometry({ attribute: 'colors', source: null });
    mesh.publishGeometry({ attribute: 'indices', source: null });
    expect(mesh.geometry?.normals).toBeUndefined();
    expect(mesh.geometry?.uvs).toBeUndefined();
    expect(mesh.geometry?.colors).toBeUndefined();
    expect(mesh.geometry?.indices).toBeUndefined();
  });

  it('accepts MarkerBuffer instances while preserving mesh geometry', () => {
    const mesh = new SceneMesh();
    const markers = new MarkerBuffer({ capacity: 2 });
    markers.add({ color: 'cyan', position: [0, 0, 1] });
    mesh.publishGeometry({ attribute: 'positions', source: triangle });
    mesh.source = markers;

    expect(mesh.geometry?.positions).toBe(triangle);
    expect(mesh.source).toBe(markers);
    expect(takeMarkerLayerRenderData(mesh)).toMatchObject({ count: 1, ready: true });
    expect(getMeshRenderData(mesh).identityInstance).toBe(false);
  });

  it('captures a complete geometry replacement without retaining producer arrays', () => {
    const mesh = new SceneMesh();
    const positions = new Float32Array([0, 0, 0, 2, 0, 0, 0, 2, 0, 2, 2, 0]);
    const indices = new Uint32Array([0, 1, 2, 1, 3, 2]);
    mesh.geometry = { indices, positions };
    const published = getMeshRenderData(mesh);
    expect(published).toMatchObject({ colors: null, normals: null, ready: true, uvs: null });
    expect(published.positions).not.toBe(positions);
    expect(published.indices).not.toBe(indices);
    positions[0] = 99;
    indices[0] = 3;
    expect(getMeshRenderData(mesh).positions?.[0]).toBe(0);
    expect(getMeshRenderData(mesh).indices?.[0]).toBe(0);

    mesh.geometry = null;
    expect(getMeshRenderData(mesh)).toMatchObject({ positions: null, ready: false });
  });

  it('treats reassignment of reused geometry arrays as full attribute updates', () => {
    const mesh = new SceneMesh();
    const positions = new Float32Array(triangle);
    const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    const uvs = new Float32Array([0, 0, 1, 0, 0, 1]);
    const colors = new Float32Array(12).fill(1);
    const indices = new Uint32Array([0, 1, 2]);
    mesh.geometry = { colors, indices, normals, positions, uvs };
    takeMeshLayerRenderData(mesh);

    positions[0] = 0.25;
    normals[0] = 0.5;
    uvs[0] = 0.25;
    colors[3] = 0.5;
    indices.set([0, 2, 1]);
    mesh.publishGeometry({ attribute: 'positions', source: positions });
    mesh.publishGeometry({ attribute: 'normals', source: normals });
    mesh.publishGeometry({ attribute: 'uvs', source: uvs });
    mesh.publishGeometry({ attribute: 'colors', source: colors });
    mesh.publishGeometry({ attribute: 'indices', source: indices });
    const rendered = takeMeshLayerRenderData(mesh);

    expect(rendered.positions?.[0]).toBe(0.25);
    expect(rendered.normals?.[0]).toBe(0.5);
    expect(rendered.uvs?.[0]).toBe(0.25);
    expect(rendered.colors?.[3]).toBe(0.5);
    expect(rendered.indices).toEqual(indices);
  });

  it('publishes reused producer ranges and keeps uncommitted edits out of snapshots', () => {
    const mesh = new SceneMesh();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 0, 0, 3, 0, 0, 2, 1, 0]);
    const normals = new Float32Array(18).fill(1);
    const colors = new Float32Array(24).fill(1);
    mesh.geometry = { colors, normals, positions };
    takeMeshLayerRenderData(mesh);

    positions[0] = 4;
    mesh.publishGeometry({ attribute: 'positions', count: 1, start: 0 });
    positions[3] = 5;
    mesh.publishGeometry({ attribute: 'positions', count: 1, start: 1 });
    positions[6] = 99;
    colors[7] = 0.5;
    mesh.publishGeometry({ attribute: 'colors', count: 1, start: 1 });
    const published = takeMeshLayerRenderData(mesh);

    expect(published.positions?.slice(0, 7)).toEqual(new Float32Array([4, 0, 0, 5, 0, 0, 0]));
    expect(published.colors?.[7]).toBe(0.5);
    expect(published.geometryUploadRanges).toEqual([
      { attribute: 'positions', offset: 0, size: 24 },
      { attribute: 'colors', offset: 16, size: 16 }
    ]);
    expect(takeMeshLayerRenderData(mesh).geometryUploadRanges).toEqual([]);
  });

  it('rejects invalid geometry publications without changing the committed snapshot', () => {
    const mesh = new SceneMesh();
    const positions = new Float32Array(triangle);
    mesh.publishGeometry({ attribute: 'positions', source: positions });
    const committed = getMeshRenderData(mesh).positions;
    positions[0] = Number.NaN;

    expect(() => mesh.publishGeometry({ attribute: 'positions', count: 1 })).toThrow(RangeError);
    expect(getMeshRenderData(mesh).positions).toEqual(committed);
    expect(() => mesh.publishGeometry({ attribute: 'positions', count: 2, start: 2 })).toThrow(RangeError);
    expect(() => mesh.publishGeometry({ attribute: 'normals' })).toThrow(
      expect.objectContaining({ name: 'InvalidStateError' })
    );
  });

  it('treats published index edits as topology changes', () => {
    const mesh = new SceneMesh();
    const positions = new Float32Array(12);
    const normals = new Float32Array(12);
    const indices = new Uint32Array([0, 1, 2]);
    mesh.geometry = { indices, normals, positions };
    const topology = getMeshTopologyVersion(mesh);
    indices[1] = 2;
    indices[2] = 1;

    mesh.publishGeometry({ attribute: 'indices' });

    expect(getMeshTopologyVersion(mesh)).toBeGreaterThan(topology);
    expect(getMeshRenderData(mesh).indices).toEqual(indices);
  });

  it('makes an invalid complete geometry inert and recovers atomically', () => {
    const mesh = new SceneMesh();
    mesh.geometry = { indices: new Uint32Array([0, 1, 9]), positions: triangle };
    expect(getMeshRenderData(mesh)).toMatchObject({ geometryError: true, ready: false });
    mesh.geometry = { positions: triangle };
    expect(getMeshRenderData(mesh)).toMatchObject({ geometryError: false, indices: null, ready: true });
  });

  it('reports malformed complete geometry without throwing or retaining partial input', () => {
    const mesh = new SceneMesh();
    const errors: CustomEvent[] = [];
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mesh.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent));

    expect(() => {
      mesh.geometry = { positions: [] } as never;
    }).not.toThrow();
    expect(mesh.geometry).toBeNull();
    expect(getMeshRenderData(mesh)).toMatchObject({ geometryError: true, positions: null, ready: false });
    expect(errors.at(-1)?.detail.code).toBe(MESH_GEOMETRY);

    expect(() => {
      mesh.geometry = 1 as never;
    }).not.toThrow();

    mesh.geometry = { positions: triangle };
    expect(getMeshRenderData(mesh)).toMatchObject({ geometryError: false, ready: true });
  });

  it('rejects wrong geometry types synchronously', () => {
    expect(() => {
      new SceneMesh().publishGeometry({ attribute: 'positions', source: [] as never });
    }).toThrow(TypeError);
    expect(() => {
      new SceneMesh().publishGeometry({ attribute: 'indices', source: new Float32Array() } as never);
    }).toThrow(TypeError);
    expect(() => getMeshRenderData(document.createElement('div'))).toThrow(TypeError);
    expect(() => getMeshLayerVersion(document.createElement('div'))).toThrow(TypeError);
  });

  it('exposes registration, versions, and render snapshots for a mesh', () => {
    const mesh = new SceneMesh();
    expect(isMeshLayerRegistered(mesh)).toBe(true);
    expect(getMeshLayerVersion(mesh)).toBe(0);
    expect(getMeshTopologyVersion(mesh)).toBe(0);
    expect(takeMeshLayerRenderData(mesh)).toMatchObject({
      ready: false,
      geometryError: false,
      identityInstance: false
    });
  });

  it('reports invalid geometry with composed noncancelable errors and recovers', async () => {
    fixture = await createFixture(html`<nve-scene-mesh></nve-scene-mesh>`);
    const mesh = fixture.querySelector(SceneMesh.metadata.tag) as SceneMesh;
    const details: CustomEvent[] = [];
    fixture.addEventListener('nve-scene-error', event => details.push(event as CustomEvent));
    mesh.publishGeometry({ attribute: 'positions', source: new Float32Array(6) });
    await elementIsStable(mesh);
    const error = details.find(event => event.detail.code === MESH_GEOMETRY);
    expect(error?.detail.severity).toBe('error');
    expect(error?.bubbles).toBe(true);
    expect(error?.composed).toBe(true);
    expect(error?.cancelable).toBe(false);
    expect(getMeshRenderData(mesh).ready).toBe(false);
    mesh.publishGeometry({ attribute: 'positions', source: triangle });
    await elementIsStable(mesh);
    expect(getMeshRenderData(mesh).geometryError).toBe(false);
    mesh.publishGeometry({ attribute: 'positions', source: new Float32Array(6) });
    await elementIsStable(mesh);
    expect(details.filter(event => event.detail.code === MESH_GEOMETRY)).toHaveLength(2);
  });

  it('diagnoses every planar-array validation family and recovers each episode', () => {
    const mesh = new SceneMesh();
    const cases: Array<[string, () => void, () => void]> = [
      [
        'empty positions',
        () => {
          mesh.publishGeometry({ attribute: 'positions', source: new Float32Array() });
        },
        () => {
          mesh.publishGeometry({ attribute: 'positions', source: triangle });
        }
      ],
      [
        'missing positions',
        () => {
          mesh.publishGeometry({ attribute: 'positions', source: null });
          mesh.publishGeometry({ attribute: 'normals', source: new Float32Array(3) });
        },
        () => {
          mesh.publishGeometry({ attribute: 'normals', source: null });
          mesh.publishGeometry({ attribute: 'positions', source: triangle });
        }
      ],
      [
        'normal count',
        () => {
          mesh.publishGeometry({ attribute: 'normals', source: new Float32Array(3) });
        },
        () => {
          mesh.publishGeometry({ attribute: 'normals', source: null });
        }
      ],
      [
        'normal nonfinite',
        () => {
          mesh.publishGeometry({ attribute: 'normals', source: new Float32Array(9).fill(Number.NaN) });
        },
        () => {
          mesh.publishGeometry({ attribute: 'normals', source: null });
        }
      ],
      [
        'uv count',
        () => {
          mesh.publishGeometry({ attribute: 'uvs', source: new Float32Array(2) });
        },
        () => {
          mesh.publishGeometry({ attribute: 'uvs', source: null });
        }
      ],
      [
        'uv nonfinite',
        () => {
          mesh.publishGeometry({ attribute: 'uvs', source: new Float32Array(6).fill(Number.NaN) });
        },
        () => {
          mesh.publishGeometry({ attribute: 'uvs', source: null });
        }
      ],
      [
        'color count',
        () => {
          mesh.publishGeometry({ attribute: 'colors', source: new Float32Array(3) });
        },
        () => {
          mesh.publishGeometry({ attribute: 'colors', source: null });
        }
      ],
      [
        'color nonfinite',
        () => {
          mesh.publishGeometry({ attribute: 'colors', source: new Float32Array(12).fill(Number.NaN) });
        },
        () => {
          mesh.publishGeometry({ attribute: 'colors', source: null });
        }
      ],
      [
        'color range',
        () => {
          mesh.publishGeometry({ attribute: 'colors', source: new Float32Array(12).fill(2) });
        },
        () => {
          mesh.publishGeometry({ attribute: 'colors', source: null });
        }
      ],
      [
        'index count',
        () => {
          mesh.publishGeometry({ attribute: 'indices', source: new Uint32Array([0, 1]) });
        },
        () => {
          mesh.publishGeometry({ attribute: 'indices', source: null });
        }
      ],
      [
        'index range',
        () => {
          mesh.publishGeometry({ attribute: 'indices', source: new Uint32Array([0, 1, 9]) });
        },
        () => {
          mesh.publishGeometry({ attribute: 'indices', source: null });
        }
      ]
    ];
    const events: string[] = [];
    mesh.addEventListener('nve-scene-error', event => events.push((event as CustomEvent).detail.code));
    mesh.publishGeometry({ attribute: 'positions', source: triangle });
    for (const [, invalidate, recover] of cases) {
      invalidate();
      expect(getMeshRenderData(mesh).geometryError).toBe(true);
      recover();
      expect(getMeshRenderData(mesh).geometryError).toBe(false);
    }
    expect(events.filter(code => code === MESH_GEOMETRY)).toHaveLength(cases.length);
  });

  it('accepts indexed positions that do not form a nonindexed triple', () => {
    const mesh = new SceneMesh();
    mesh.publishGeometry({ attribute: 'positions', source: new Float32Array(12) });
    mesh.publishGeometry({ attribute: 'indices', source: new Uint32Array([0, 1, 2]) });
    expect(getMeshRenderData(mesh).geometryError).toBe(false);
  });

  it('keeps topology stable for same-length position updates', () => {
    const mesh = new SceneMesh();
    mesh.publishGeometry({ attribute: 'positions', source: triangle });
    const initial = getMeshRenderData(mesh).topologyVersion;
    mesh.publishGeometry({ attribute: 'positions', source: new Float32Array(triangle) });
    expect(getMeshRenderData(mesh).topologyVersion).toBe(initial);
    mesh.publishGeometry({ attribute: 'positions', source: new Float32Array(18) });
    expect(getMeshRenderData(mesh).topologyVersion).toBeGreaterThan(initial);
  });

  it('tracks topology changes from UV and index sources and ignores repeated assignments', () => {
    const mesh = new SceneMesh();
    mesh.publishGeometry({ attribute: 'positions', source: triangle });
    const initial = getMeshTopologyVersion(mesh);
    mesh.publishGeometry({ attribute: 'positions', source: triangle });
    expect(getMeshTopologyVersion(mesh)).toBe(initial);
    mesh.publishGeometry({ attribute: 'uvs', source: new Float32Array(6) });
    const withUvs = getMeshTopologyVersion(mesh);
    expect(withUvs).toBeGreaterThan(initial);
    mesh.publishGeometry({ attribute: 'uvs', source: new Float32Array(6) });
    expect(getMeshTopologyVersion(mesh)).toBe(withUvs);
    mesh.publishGeometry({ attribute: 'indices', source: new Uint32Array([0, 1, 2]) });
    expect(getMeshTopologyVersion(mesh)).toBeGreaterThan(withUvs);
    mesh.publishGeometry({ attribute: 'indices', source: null });
    expect(getMeshTopologyVersion(mesh)).toBeGreaterThan(withUvs);
  });

  it('invalidates topology when replacing indices with different same-length values', () => {
    const mesh = new SceneMesh();
    mesh.publishGeometry({ attribute: 'positions', source: triangle });
    mesh.publishGeometry({ attribute: 'normals', source: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]) });
    mesh.publishGeometry({ attribute: 'indices', source: new Uint32Array([0, 1, 2]) });
    const indexed = getMeshTopologyVersion(mesh);

    const reordered = new Uint32Array([0, 2, 1]);
    mesh.publishGeometry({ attribute: 'indices', source: reordered });
    const replaced = getMeshTopologyVersion(mesh);
    expect(replaced).toBeGreaterThan(indexed);

    reordered[1] = 1;
    reordered[2] = 2;
    mesh.publishGeometry({ attribute: 'indices', source: reordered });

    expect(getMeshTopologyVersion(mesh)).toBeGreaterThan(replaced);
  });

  it('invalidates indexed topology when normals switch between supplied and generated modes', () => {
    const mesh = new SceneMesh();
    mesh.publishGeometry({ attribute: 'positions', source: triangle });
    mesh.publishGeometry({ attribute: 'indices', source: new Uint32Array([0, 1, 2]) });
    const generated = getMeshTopologyVersion(mesh);

    mesh.publishGeometry({ attribute: 'normals', source: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]) });
    const supplied = getMeshTopologyVersion(mesh);
    expect(supplied).toBeGreaterThan(generated);

    mesh.publishGeometry({ attribute: 'normals', source: null });
    expect(getMeshTopologyVersion(mesh)).toBeGreaterThan(supplied);
  });

  it('warns and ignores textures without UVs, then clears the warning', async () => {
    if (typeof ImageBitmap === 'undefined') return;
    const mesh = new SceneMesh();
    mesh.publishGeometry({ attribute: 'positions', source: triangle });
    const events: CustomEvent[] = [];
    mesh.addEventListener('nve-scene-error', event => events.push(event as CustomEvent));
    const texture = Object.assign(Object.create(ImageBitmap.prototype), { close: vi.fn() }) as ImageBitmap;
    scenePlatform.captureImageBitmap = () => Promise.resolve(texture);
    await mesh.setTexture(Object.create(ImageBitmap.prototype) as ImageBitmap);
    expect(events.at(-1)?.detail).toMatchObject({ code: MESH_TEXTURE_WITHOUT_UVS, severity: 'warning' });
    expect(getMeshRenderData(mesh).texture).toBeNull();
    mesh.publishGeometry({ attribute: 'uvs', source: new Float32Array(6) });
    expect(events.filter(event => event.detail.code === MESH_TEXTURE_WITHOUT_UVS)).toHaveLength(1);
    expect(getMeshRenderData(mesh).texture).not.toBeNull();
  });

  it('rejects invalid texture sources and falls back for invalid CSS colors', async () => {
    const mesh = new SceneMesh();
    await expect(mesh.setTexture({} as ImageBitmap)).rejects.toThrow(TypeError);
    fixture = await createFixture(html`<nve-scene-mesh color="var(--missing-color)"></nve-scene-mesh>`);
    const connected = fixture.querySelector(SceneMesh.metadata.tag) as SceneMesh;
    await elementIsStable(connected);
    expect(getMeshRenderData(connected).color).toEqual([1, 1, 1, 1]);
    connected.color = 'rgba(255, 0, 0, 0.5)';
    await elementIsStable(connected);
    expect(getMeshRenderData(connected).transparent).toBe(true);
  });

  it('captures owned textures with newest-request-wins cleanup', async () => {
    if (typeof ImageBitmap === 'undefined') return;
    const mesh = new SceneMesh();
    mesh.geometry = { positions: triangle, uvs: new Float32Array(6) };
    const source = Object.create(ImageBitmap.prototype) as ImageBitmap;
    const firstCapture = deferred<ImageBitmap>();
    const secondCapture = deferred<ImageBitmap>();
    const firstOwned = Object.assign(Object.create(ImageBitmap.prototype), { close: vi.fn() }) as ImageBitmap;
    const secondOwned = Object.assign(Object.create(ImageBitmap.prototype), { close: vi.fn() }) as ImageBitmap;
    scenePlatform.captureImageBitmap = vi
      .fn()
      .mockReturnValueOnce(firstCapture.promise)
      .mockReturnValueOnce(secondCapture.promise);

    const first = mesh.setTexture(source);
    const second = mesh.setTexture(source);
    secondCapture.resolve(secondOwned);
    await expect(second).resolves.toEqual({ status: 'applied' });
    firstCapture.resolve(firstOwned);
    await expect(first).resolves.toEqual({ status: 'superseded' });
    expect(firstOwned.close).toHaveBeenCalledOnce();
    expect(getMeshRenderData(mesh).texture).toBe(secondOwned);

    await expect(mesh.setTexture(null)).resolves.toEqual({ status: 'applied' });
    expect(secondOwned.close).toHaveBeenCalledOnce();
    expect(getMeshRenderData(mesh).texture).toBeNull();

    scenePlatform.captureImageBitmap = () => Promise.reject(new Error('capture failed'));
    const errors: string[] = [];
    mesh.addEventListener('nve-scene-error', event => errors.push((event as CustomEvent).detail.code));
    await expect(mesh.setTexture(source)).resolves.toEqual({ status: 'failed' });
    expect(getMeshRenderData(mesh)).toMatchObject({ geometryError: true, ready: false });
    expect(errors).toContain(MESH_TEXTURE_CAPTURE);
  });

  it('lets clear supersede capture without closing caller-owned inputs', async () => {
    if (typeof ImageBitmap === 'undefined') return;
    const mesh = new SceneMesh();
    mesh.geometry = { positions: triangle, uvs: new Float32Array(6) };
    const source = Object.assign(Object.create(ImageBitmap.prototype), { close: vi.fn() }) as ImageBitmap;
    const capture = deferred<ImageBitmap>();
    const obsolete = Object.assign(Object.create(ImageBitmap.prototype), { close: vi.fn() }) as ImageBitmap;
    scenePlatform.captureImageBitmap = () => capture.promise;

    const pending = mesh.setTexture(source);
    await expect(mesh.setTexture(null)).resolves.toEqual({ status: 'applied' });
    capture.resolve(obsolete);

    await expect(pending).resolves.toEqual({ status: 'superseded' });
    expect(obsolete.close).toHaveBeenCalledOnce();
    expect(source.close).not.toHaveBeenCalled();
    expect(getMeshRenderData(mesh).texture).toBeNull();
  });

  it('does not use identity fallback when count is explicitly zero or children exist', () => {
    const mesh = new SceneMesh();
    mesh.publishGeometry({ attribute: 'positions', source: triangle });
    expect(getMeshRenderData(mesh).identityInstance).toBe(true);
    mesh.countLimit = 0;
    expect(getMeshRenderData(mesh).identityInstance).toBe(false);
    mesh.countLimit = undefined;
    mesh.append(document.createElement('nve-scene-marker'));
    expect(getMeshRenderData(mesh).identityInstance).toBe(false);
  });
});

function deferred<T>(): { promise: Promise<T>; resolve(value: T): void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(settle => {
    resolve = settle;
  });
  return { promise, resolve };
}
