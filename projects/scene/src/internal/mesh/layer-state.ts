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
  readonly heightfield?: HeightfieldMeshData;
  readonly shading?: MeshShading;
}

export interface HeightfieldMeshData {
  readonly colors: Uint8Array | null;
  readonly columns: number;
  readonly heights: Float32Array;
  readonly origin: readonly [number, number];
  readonly rows: number;
  readonly spacing: number;
}

type MeshShading = 'lit' | 'unlit';

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
  readonly heightfield?: HeightfieldMeshData;
  readonly indices: Uint32Array | null;
  readonly normals: Float32Array | null;
  readonly positions: Float32Array | null;
  readonly texture: ImageBitmap | null;
  readonly topologyVersion: number;
  readonly uvs: Float32Array | null;
  readonly version: number;
  readonly shading?: MeshShading;
}

interface MeshState {
  positions: Float32Array | null;
  normals: Float32Array | null;
  uvs: Float32Array | null;
  colors: Float32Array | null;
  indices: Uint32Array | null;
  topologyIndices: Uint32Array | null;
  indexedFlatNormals: boolean;
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
    topologyIndices: null,
    indexedFlatNormals: false,
    texture: null,
    color: [1, 1, 1, 1],
    version: 0,
    topologyVersion: 0,
    topologyKey: createTopologyKey({ positions: null, indices: null, uvs: null }),
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
  const ready = !options.geometryError && (!!options.positions?.length || options.heightfield !== undefined);
  return {
    bytes: null,
    uploadRanges: [],
    transparent: meshIsTransparent(options, texture),
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
    identityInstance: ready && options.identityInstance,
    ...(options.heightfield ? { heightfield: options.heightfield } : {}),
    shading: options.shading ?? 'lit'
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
  const next = getNextGeometry(state, name, value);
  const topology = getTopologySnapshot(next);
  state[name] = value as never;
  if (previous !== value || (name === 'indices' && !sameIndices(state.topologyIndices, next.indices))) {
    state.version += 1;
  }
  if (topologyHasChanged(state, topology)) {
    state.topologyVersion += 1;
    state.topologyKey = topology.key;
    state.indexedFlatNormals = topology.indexedFlatNormals;
    state.topologyIndices = topology.indices;
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

function meshIsTransparent(options: ConstructedMeshRenderDataOptions, texture: ImageBitmap | null): boolean {
  if (texture !== null || options.color[3] < 1) return true;
  return hasTransparentVertexColor(options.colors) || hasTransparentHeightfieldColor(options.heightfield?.colors);
}

function hasTransparentHeightfieldColor(colors: Uint8Array | null | undefined): boolean {
  if (!colors) return false;
  for (let index = 3; index < colors.length; index += 4) {
    if (colors[index]! < 255) return true;
  }
  return false;
}

function getNextGeometry(
  state: MeshState,
  name: 'positions' | 'normals' | 'uvs' | 'colors' | 'indices',
  value: unknown
): Pick<MeshState, 'positions' | 'normals' | 'uvs' | 'indices'> {
  return {
    positions: name === 'positions' ? (value as Float32Array | null) : state.positions,
    normals: name === 'normals' ? (value as Float32Array | null) : state.normals,
    uvs: name === 'uvs' ? (value as Float32Array | null) : state.uvs,
    indices: name === 'indices' ? (value as Uint32Array | null) : state.indices
  };
}

function getTopologySnapshot(input: Pick<MeshState, 'positions' | 'normals' | 'uvs' | 'indices'>): {
  readonly indexedFlatNormals: boolean;
  readonly indices: Uint32Array | null;
  readonly key: string;
} {
  return {
    indexedFlatNormals: usesIndexedFlatNormals(input.indices, input.normals),
    indices: cloneIndices(input.indices),
    key: createTopologyKey(input)
  };
}

function topologyHasChanged(
  state: MeshState,
  topology: { readonly indexedFlatNormals: boolean; readonly indices: Uint32Array | null; readonly key: string }
): boolean {
  return (
    state.topologyKey !== topology.key ||
    state.indexedFlatNormals !== topology.indexedFlatNormals ||
    !sameIndices(state.topologyIndices, topology.indices)
  );
}

function usesIndexedFlatNormals(indices: Uint32Array | null, normals: Float32Array | null): boolean {
  return indices !== null && normals === null;
}

function sameIndices(previous: Uint32Array | null, next: Uint32Array | null): boolean {
  if (previous === next) return true;
  if (previous === null || next === null || previous.length !== next.length) return false;
  for (let index = 0; index < previous.length; index += 1) {
    if (previous[index] !== next[index]) return false;
  }
  return true;
}

function cloneIndices(indices: Uint32Array | null): Uint32Array | null {
  return indices === null ? null : new Uint32Array(indices);
}
