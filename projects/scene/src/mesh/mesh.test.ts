// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { MESH_GEOMETRY, MESH_TEXTURE_WITHOUT_UVS } from '../errors.js';
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

const triangle = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);

describe(SceneMesh.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
  });

  it('exposes the exact marker layout and typed geometry properties', () => {
    const mesh = new SceneMesh();
    expect(SceneMesh.layout.name).toBe('nve.marker');
    mesh.positions = triangle;
    expect(mesh.positions).toBe(triangle);
    expect(mesh.hasAttribute('positions')).toBe(false);
    expect(mesh.color).toBe('#ffffff');
  });

  it('exposes optional geometry and texture properties and clears them', () => {
    const mesh = new SceneMesh();
    const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    const uvs = new Float32Array([0, 0, 1, 0, 0, 1]);
    const colors = new Float32Array(12).fill(1);
    const indices = new Uint32Array([0, 1, 2]);

    mesh.positions = triangle;
    mesh.normals = normals;
    mesh.uvs = uvs;
    mesh.colors = colors;
    mesh.indices = indices;

    expect(mesh.normals).toBe(normals);
    expect(mesh.uvs).toBe(uvs);
    expect(mesh.colors).toBe(colors);
    expect(mesh.indices).toBe(indices);

    mesh.normals = null;
    mesh.uvs = null;
    mesh.colors = null;
    mesh.indices = null;
    expect(mesh.normals).toBeNull();
    expect(mesh.uvs).toBeNull();
    expect(mesh.colors).toBeNull();
    expect(mesh.indices).toBeNull();

    if (typeof ImageBitmap === 'undefined') return;
    const texture = Object.create(ImageBitmap.prototype) as ImageBitmap;
    mesh.uvs = uvs;
    mesh.texture = texture;
    expect(mesh.texture).toBe(texture);
    mesh.texture = null;
    expect(mesh.texture).toBeNull();
  });

  it('accepts MarkerBuffer instances while preserving mesh geometry', () => {
    const mesh = new SceneMesh();
    const markers = new MarkerBuffer({ capacity: 2 });
    markers.add({ color: 'cyan', position: [0, 0, 1] });
    mesh.positions = triangle;
    mesh.instances = markers;

    expect(mesh.positions).toBe(triangle);
    expect(mesh.instances).toBe(markers);
    expect(takeMarkerLayerRenderData(mesh)).toMatchObject({ count: 1, ready: true });
    expect(getMeshRenderData(mesh).identityInstance).toBe(false);
  });

  it('rejects wrong geometry types synchronously', () => {
    expect(() => {
      new SceneMesh().positions = [] as never;
    }).toThrow(TypeError);
    expect(() => {
      new SceneMesh().indices = new Float32Array() as never;
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
    mesh.positions = new Float32Array(6);
    await elementIsStable(mesh);
    const error = details.find(event => event.detail.code === MESH_GEOMETRY);
    expect(error?.detail.severity).toBe('error');
    expect(error?.bubbles).toBe(true);
    expect(error?.composed).toBe(true);
    expect(error?.cancelable).toBe(false);
    expect(getMeshRenderData(mesh).ready).toBe(false);
    mesh.positions = triangle;
    await elementIsStable(mesh);
    expect(getMeshRenderData(mesh).geometryError).toBe(false);
    mesh.positions = new Float32Array(6);
    await elementIsStable(mesh);
    expect(details.filter(event => event.detail.code === MESH_GEOMETRY)).toHaveLength(2);
  });

  it('diagnoses every planar-array validation family and recovers each episode', () => {
    const mesh = new SceneMesh();
    const cases: Array<[string, () => void, () => void]> = [
      [
        'empty positions',
        () => {
          mesh.positions = new Float32Array();
        },
        () => {
          mesh.positions = triangle;
        }
      ],
      [
        'missing positions',
        () => {
          mesh.positions = null;
          mesh.normals = new Float32Array(3);
        },
        () => {
          mesh.normals = null;
          mesh.positions = triangle;
        }
      ],
      [
        'normal count',
        () => {
          mesh.normals = new Float32Array(3);
        },
        () => {
          mesh.normals = null;
        }
      ],
      [
        'normal nonfinite',
        () => {
          mesh.normals = new Float32Array(9).fill(Number.NaN);
        },
        () => {
          mesh.normals = null;
        }
      ],
      [
        'uv count',
        () => {
          mesh.uvs = new Float32Array(2);
        },
        () => {
          mesh.uvs = null;
        }
      ],
      [
        'uv nonfinite',
        () => {
          mesh.uvs = new Float32Array(6).fill(Number.NaN);
        },
        () => {
          mesh.uvs = null;
        }
      ],
      [
        'color count',
        () => {
          mesh.colors = new Float32Array(3);
        },
        () => {
          mesh.colors = null;
        }
      ],
      [
        'color nonfinite',
        () => {
          mesh.colors = new Float32Array(12).fill(Number.NaN);
        },
        () => {
          mesh.colors = null;
        }
      ],
      [
        'color range',
        () => {
          mesh.colors = new Float32Array(12).fill(2);
        },
        () => {
          mesh.colors = null;
        }
      ],
      [
        'index count',
        () => {
          mesh.indices = new Uint32Array([0, 1]);
        },
        () => {
          mesh.indices = null;
        }
      ],
      [
        'index range',
        () => {
          mesh.indices = new Uint32Array([0, 1, 9]);
        },
        () => {
          mesh.indices = null;
        }
      ]
    ];
    const events: string[] = [];
    mesh.addEventListener('nve-scene-error', event => events.push((event as CustomEvent).detail.code));
    mesh.positions = triangle;
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
    mesh.positions = new Float32Array(12);
    mesh.indices = new Uint32Array([0, 1, 2]);
    expect(getMeshRenderData(mesh).geometryError).toBe(false);
  });

  it('keeps topology stable for same-length position updates', () => {
    const mesh = new SceneMesh();
    mesh.positions = triangle;
    const initial = getMeshRenderData(mesh).topologyVersion;
    mesh.positions = new Float32Array(triangle);
    expect(getMeshRenderData(mesh).topologyVersion).toBe(initial);
    mesh.positions = new Float32Array(18);
    expect(getMeshRenderData(mesh).topologyVersion).toBeGreaterThan(initial);
  });

  it('tracks topology changes from UV and index sources and ignores repeated assignments', () => {
    const mesh = new SceneMesh();
    mesh.positions = triangle;
    const initial = getMeshTopologyVersion(mesh);
    mesh.positions = triangle;
    expect(getMeshTopologyVersion(mesh)).toBe(initial);
    mesh.uvs = new Float32Array(6);
    const withUvs = getMeshTopologyVersion(mesh);
    expect(withUvs).toBeGreaterThan(initial);
    mesh.uvs = new Float32Array(6);
    expect(getMeshTopologyVersion(mesh)).toBe(withUvs);
    mesh.indices = new Uint32Array([0, 1, 2]);
    expect(getMeshTopologyVersion(mesh)).toBeGreaterThan(withUvs);
    mesh.indices = null;
    expect(getMeshTopologyVersion(mesh)).toBeGreaterThan(withUvs);
  });

  it('invalidates topology when replacing indices with different same-length values', () => {
    const mesh = new SceneMesh();
    mesh.positions = triangle;
    mesh.normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    mesh.indices = new Uint32Array([0, 1, 2]);
    const indexed = getMeshTopologyVersion(mesh);

    const reordered = new Uint32Array([0, 2, 1]);
    mesh.indices = reordered;
    const replaced = getMeshTopologyVersion(mesh);
    expect(replaced).toBeGreaterThan(indexed);

    reordered[1] = 1;
    reordered[2] = 2;
    mesh.indices = reordered;

    expect(getMeshTopologyVersion(mesh)).toBeGreaterThan(replaced);
  });

  it('invalidates indexed topology when normals switch between supplied and generated modes', () => {
    const mesh = new SceneMesh();
    mesh.positions = triangle;
    mesh.indices = new Uint32Array([0, 1, 2]);
    const generated = getMeshTopologyVersion(mesh);

    mesh.normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    const supplied = getMeshTopologyVersion(mesh);
    expect(supplied).toBeGreaterThan(generated);

    mesh.normals = null;
    expect(getMeshTopologyVersion(mesh)).toBeGreaterThan(supplied);
  });

  it('warns and ignores textures without UVs, then clears the warning', () => {
    if (typeof ImageBitmap === 'undefined') return;
    const mesh = new SceneMesh();
    mesh.positions = triangle;
    const events: CustomEvent[] = [];
    mesh.addEventListener('nve-scene-error', event => events.push(event as CustomEvent));
    mesh.texture = Object.create(ImageBitmap.prototype) as ImageBitmap;
    expect(events.at(-1)?.detail).toMatchObject({ code: MESH_TEXTURE_WITHOUT_UVS, severity: 'warning' });
    expect(getMeshRenderData(mesh).texture).toBeNull();
    mesh.uvs = new Float32Array(6);
    expect(events.filter(event => event.detail.code === MESH_TEXTURE_WITHOUT_UVS)).toHaveLength(1);
    expect(getMeshRenderData(mesh).texture).not.toBeNull();
  });

  it('rejects invalid textures and falls back for invalid CSS colors', async () => {
    const mesh = new SceneMesh();
    expect(() => {
      mesh.texture = {} as ImageBitmap;
    }).toThrow(TypeError);
    fixture = await createFixture(html`<nve-scene-mesh color="var(--missing-color)"></nve-scene-mesh>`);
    const connected = fixture.querySelector(SceneMesh.metadata.tag) as SceneMesh;
    await elementIsStable(connected);
    expect(getMeshRenderData(connected).color).toEqual([1, 1, 1, 1]);
    connected.color = 'rgba(255, 0, 0, 0.5)';
    await elementIsStable(connected);
    expect(getMeshRenderData(connected).transparent).toBe(true);
  });

  it('does not use identity fallback when count is explicitly zero or children exist', () => {
    const mesh = new SceneMesh();
    mesh.positions = triangle;
    expect(getMeshRenderData(mesh).identityInstance).toBe(true);
    mesh.count = 0;
    expect(getMeshRenderData(mesh).identityInstance).toBe(false);
    mesh.count = undefined;
    mesh.append(document.createElement('nve-scene-marker'));
    expect(getMeshRenderData(mesh).identityInstance).toBe(false);
  });
});
