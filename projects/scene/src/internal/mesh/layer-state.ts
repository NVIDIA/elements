// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MESH_GEOMETRY, MESH_TEXTURE_WITHOUT_UVS } from '../../errors.js';
import { parseCSSColor } from '../color.js';
import { DiagnosticEpisodes } from '../diagnostic-episodes.js';
import { getLayerInstances, getLayerCount } from '../markers/layer-state.js';
import type { RGBA } from '../types.js';
import { validateMeshGeometry, type MeshGeometryInput } from './geometry.js';
import { createTopologyKey } from './processing.js';
import { notifyOwningScene } from '../label/notifications.js';

export interface MeshRenderData {
  readonly bytes: Uint8Array | null;
  readonly uploadRanges: readonly { readonly offset: number; readonly size: number }[];
  readonly transparent: boolean;
  readonly ready: boolean;
  readonly positions: Float32Array | null;
  readonly normals: Float32Array | null;
  readonly uvs: Float32Array | null;
  readonly colors: Float32Array | null;
  readonly indices: Uint32Array | null;
  readonly texture: ImageBitmap | null;
  readonly color: RGBA;
  readonly version: number;
  readonly topologyVersion: number;
  readonly geometryError: boolean;
  readonly identityInstance: boolean;
}

/**
 * The internal planar mesh input shared by authored meshes and geometry
 * constructors. It intentionally mirrors the renderer boundary rather than a
 * public element API.
 */
interface ConstructedMeshRenderDataOptions {
  readonly color: RGBA;
  readonly colors: Float32Array | null;
  readonly geometryError: boolean;
  readonly identityInstance: boolean;
  readonly indices: Uint32Array | null;
  readonly normals: Float32Array | null;
  readonly positions: Float32Array | null;
  readonly texture: ImageBitmap | null;
  readonly topologyVersion: number;
  readonly uvs: Float32Array | null;
  readonly version: number;
}

interface MeshState {
  positions: Float32Array | null;
  normals: Float32Array | null;
  uvs: Float32Array | null;
  colors: Float32Array | null;
  indices: Uint32Array | null;
  texture: ImageBitmap | null;
  color: RGBA;
  version: number;
  topologyVersion: number;
  topologyKey: string;
  geometryError: boolean;
  episodes: DiagnosticEpisodes;
  observer?: MutationObserver;
}

const states = new WeakMap<HTMLElement, MeshState>();

export function registerMeshLayer(mesh: HTMLElement): void {
  states.set(mesh, {
    positions: null,
    normals: null,
    uvs: null,
    colors: null,
    indices: null,
    texture: null,
    color: [1, 1, 1, 1],
    version: 0,
    topologyVersion: 0,
    topologyKey: '0/0/none',
    geometryError: false,
    episodes: new DiagnosticEpisodes()
  });
}

export function connectMeshLayer(mesh: HTMLElement): void {
  const state = getState(mesh);
  state.observer = new MutationObserver(() => validateMesh(mesh));
  state.observer.observe(mesh, { childList: true, subtree: false });
  validateMesh(mesh);
}

export function disconnectMeshLayer(mesh: HTMLElement): void {
  getState(mesh).observer?.disconnect();
}

export function getMeshRenderData(mesh: HTMLElement): MeshRenderData {
  const state = getState(mesh);
  const markerSource = getLayerInstances(mesh);
  const markerCount = getLayerCount(mesh);
  const hasMarkers = mesh.children.length > 0;
  return createConstructedMeshRenderData({
    color: state.color,
    colors: state.colors,
    geometryError: state.geometryError,
    identityInstance: markerSource === null && !hasMarkers && markerCount === undefined,
    indices: state.indices,
    normals: state.normals,
    positions: state.positions,
    texture: state.texture,
    topologyVersion: state.topologyVersion,
    uvs: state.uvs,
    version: state.version
  });
}

/**
 * Produces one renderer snapshot for mesh-like geometry constructed by an
 * internal layer. Callers own validation and versioning; this boundary keeps
 * the renderer-facing readiness, identity, texture, and alpha rules uniform.
 */
export function createConstructedMeshRenderData(options: ConstructedMeshRenderDataOptions): MeshRenderData {
  const texture = options.uvs ? options.texture : null;
  const ready = !options.geometryError && !!options.positions?.length;
  return {
    bytes: null,
    uploadRanges: [],
    transparent: texture !== null || options.color[3] < 1 || hasTransparentVertexColor(options.colors),
    ready,
    positions: options.positions,
    normals: options.normals,
    uvs: options.uvs,
    colors: options.colors,
    indices: options.indices,
    texture,
    color: [...options.color] as RGBA,
    version: options.version,
    topologyVersion: options.topologyVersion,
    geometryError: options.geometryError,
    identityInstance: ready && options.identityInstance
  };
}

export function getMeshLayerVersion(mesh: HTMLElement): number {
  return getState(mesh).version;
}
export function isMeshLayerRegistered(mesh: HTMLElement): boolean {
  return states.has(mesh);
}
export function takeMeshLayerRenderData(mesh: HTMLElement): MeshRenderData {
  return getMeshRenderData(mesh);
}
export function getMeshTopologyVersion(mesh: HTMLElement): number {
  return getState(mesh).topologyVersion;
}

export function setMeshGeometryProperty(
  mesh: HTMLElement,
  name: 'positions' | 'normals' | 'uvs' | 'colors' | 'indices',
  value: unknown
): void {
  const state = getState(mesh);
  if (value !== null && !(value instanceof (name === 'indices' ? Uint32Array : Float32Array))) {
    throw new TypeError(`${name} must be the specified typed array or null.`);
  }
  const previous = state[name];
  state[name] = value as never;
  if (previous !== value) {
    state.version += 1;
    if (
      createTopologyKey({
        positions: name === 'positions' ? (value as Float32Array | null) : state.positions,
        indices: name === 'indices' ? (value as Uint32Array | null) : state.indices,
        uvs: name === 'uvs' ? (value as Float32Array | null) : state.uvs
      }) !== state.topologyKey
    ) {
      state.topologyVersion += 1;
      state.topologyKey = createTopologyKey({ positions: state.positions, indices: state.indices, uvs: state.uvs });
    }
  }
  validateMesh(mesh);
}

export function setMeshTexture(mesh: HTMLElement, value: ImageBitmap | null): void {
  if (value !== null && !(typeof ImageBitmap !== 'undefined' && value instanceof ImageBitmap))
    throw new TypeError('texture must be an ImageBitmap or null.');
  const state = getState(mesh);
  state.texture = value;
  state.version += 1;
  validateMesh(mesh);
}

export function setMeshColor(mesh: HTMLElement, source: string): void {
  const color = parseCSSColor(source);
  const state = getState(mesh);
  if (!color) {
    state.color = [1, 1, 1, 1];
    notifyOwningScene(mesh);
    return;
  }
  state.color = color;
  state.version += 1;
  notifyOwningScene(mesh);
}

function validateMesh(mesh: HTMLElement): void {
  const state = getState(mesh);
  const input: MeshGeometryInput = {
    positions: state.positions,
    normals: state.normals,
    uvs: state.uvs,
    colors: state.colors,
    indices: state.indices
  };
  let invalid = false;
  try {
    validateMeshGeometry(input);
  } catch {
    invalid = true;
  }
  state.geometryError = invalid;
  state.episodes.update({
    element: mesh,
    code: MESH_GEOMETRY,
    active: invalid,
    message: 'Mesh geometry arrays are invalid.',
    severity: 'error'
  });
  state.episodes.update({
    element: mesh,
    code: MESH_TEXTURE_WITHOUT_UVS,
    active: !!state.texture && !state.uvs,
    message: 'Mesh texture ignored because UVs are absent.',
    severity: 'warning'
  });
  notifyOwningScene(mesh);
}

function getState(mesh: HTMLElement): MeshState {
  const state = states.get(mesh);
  if (!state) throw new TypeError('Element is not a registered scene mesh.');
  return state;
}

function hasTransparentVertexColor(colors: Float32Array | null): boolean {
  if (colors === null) return false;
  for (let index = 3; index < colors.length; index += 4) {
    if (colors[index]! < 1) return true;
  }
  return false;
}
