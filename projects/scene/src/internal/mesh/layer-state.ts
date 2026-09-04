// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MESH_GEOMETRY, MESH_TEXTURE_CAPTURE, MESH_TEXTURE_WITHOUT_UVS } from '../../errors.js';
import { parseCSSColor } from '../color.js';
import { DiagnosticEpisodes } from '../diagnostic-episodes.js';
import { getLayerInstances, getLayerCount } from '../markers/layer-state.js';
import type { RGBA } from '../types.js';
import { validateMeshGeometry, type MeshGeometryInput } from './geometry.js';
import { createTopologyKey } from './processing.js';
import { notifyOwningScene } from '../scene/notifications.js';
import { scenePlatform } from '../gpu/platform.js';
import { mergeUploadRanges } from '../upload-ranges.js';

export type MeshGeometryAttribute = 'positions' | 'normals' | 'uvs' | 'colors' | 'indices';

interface MeshGeometryUploadRange {
  readonly attribute: MeshGeometryAttribute;
  readonly offset: number;
  readonly size: number;
}

interface MeshGeometryPublication {
  readonly attribute: MeshGeometryAttribute;
  readonly count?: number;
  readonly source: Float32Array | Uint32Array | null;
  readonly start?: number;
}

type MeshGeometryAttributeVersions = Readonly<Record<MeshGeometryAttribute, number>>;

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
  readonly geometryUploadRanges: readonly MeshGeometryUploadRange[];
  readonly geometryVersions: MeshGeometryAttributeVersions;
  readonly identityInstance: boolean;
  readonly heightfield?: HeightfieldMeshData;
  readonly shading?: MeshShading;
}

export type SceneTextureCaptureResult =
  | { readonly status: 'applied' }
  | { readonly status: 'failed' }
  | { readonly status: 'superseded' };

interface MeshGeometryReplacement {
  readonly colors: Float32Array | null;
  readonly indices: Uint32Array | null;
  readonly normals: Float32Array | null;
  readonly positions: Float32Array | null;
  readonly uvs: Float32Array | null;
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
  readonly geometryUploadRanges?: readonly MeshGeometryUploadRange[];
  readonly geometryVersions?: MeshGeometryAttributeVersions;
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
  readonly attributeVersions: Record<MeshGeometryAttribute, number>;
  positions: Float32Array | null;
  normals: Float32Array | null;
  uvs: Float32Array | null;
  colors: Float32Array | null;
  indices: Uint32Array | null;
  topologyIndices: Uint32Array | null;
  indexedFlatNormals: boolean;
  texture: ImageBitmap | null;
  textureError: boolean;
  textureOwned: boolean;
  textureRequest: number;
  color: RGBA;
  version: number;
  topologyVersion: number;
  topologyKey: string;
  geometryError: boolean;
  episodes: DiagnosticEpisodes;
  observer?: MutationObserver;
  pendingGeometryUploads: MeshGeometryUploadRange[];
}

interface PreparedGeometryPublication {
  readonly attribute: MeshGeometryAttribute;
  readonly byteOffset: number;
  readonly byteSize: number;
  readonly candidate: Float32Array | Uint32Array;
  readonly geometry: MeshGeometryReplacement;
  readonly recordCount: number;
}

interface GeometryReplacementUpdate {
  readonly captured: MeshGeometryReplacement;
  readonly changedAttributes: readonly MeshGeometryAttribute[];
  readonly invalid: boolean;
  readonly state: MeshState;
}

const states = new WeakMap<HTMLElement, MeshState>();

export function registerMeshLayer(mesh: HTMLElement): void {
  states.set(mesh, {
    attributeVersions: createAttributeVersions(),
    positions: null,
    normals: null,
    uvs: null,
    colors: null,
    indices: null,
    topologyIndices: null,
    indexedFlatNormals: false,
    texture: null,
    textureError: false,
    textureOwned: false,
    textureRequest: 0,
    color: [1, 1, 1, 1],
    version: 0,
    topologyVersion: 0,
    topologyKey: createTopologyKey({ positions: null, indices: null, uvs: null }),
    geometryError: false,
    episodes: new DiagnosticEpisodes(),
    pendingGeometryUploads: []
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
  return createMeshRenderData(mesh, false);
}

function createMeshRenderData(mesh: HTMLElement, consumeUploads: boolean): MeshRenderData {
  const state = getState(mesh);
  const markerSource = getLayerInstances(mesh);
  const markerCount = getLayerCount(mesh);
  const hasMarkers = mesh.children.length > 0;
  return createConstructedMeshRenderData({
    color: state.color,
    colors: state.colors,
    geometryError: state.geometryError || state.textureError,
    geometryUploadRanges: takeGeometryUploadRanges(state, consumeUploads),
    geometryVersions: { ...state.attributeVersions },
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
    geometryUploadRanges: options.geometryUploadRanges ?? [],
    geometryVersions: options.geometryVersions ?? createAttributeVersions(),
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
  return createMeshRenderData(mesh, true);
}
export function getMeshTopologyVersion(mesh: HTMLElement): number {
  return getState(mesh).topologyVersion;
}

export function setMeshGeometryProperty(mesh: HTMLElement, name: MeshGeometryAttribute, value: unknown): void {
  const state = getState(mesh);
  if (value !== null && !(value instanceof (name === 'indices' ? Uint32Array : Float32Array))) {
    throw new TypeError(`${name} must be the specified typed array or null.`);
  }
  const next = getNextGeometry(state, name, value);
  replaceMeshGeometryAttributes(
    mesh,
    { ...next, colors: name === 'colors' ? (value as Float32Array | null) : state.colors },
    [name]
  );
}

/** Validates and captures one complete mesh geometry generation. */
export function replaceMeshGeometry(mesh: HTMLElement, input: unknown): void {
  replaceMeshGeometryAttributes(mesh, input, MESH_GEOMETRY_ATTRIBUTES);
}

/** Captures one producer range after validating the complete resulting geometry. */
export function publishMeshGeometry(mesh: HTMLElement, publication: MeshGeometryPublication): void {
  const state = getState(mesh);
  const prepared = prepareGeometryPublication(state, publication);
  applyGeometryPublication(state, prepared);
  state.geometryError = false;
  state.version += 1;
  state.attributeVersions[prepared.attribute] += 1;
  if (prepared.attribute === 'indices') {
    updateTopologyState(state, prepared.geometry, true);
    state.pendingGeometryUploads = [];
  } else {
    queuePublishedGeometryUpload(state, prepared);
  }
  updateMeshDiagnostics(mesh, state);
  notifyOwningScene(mesh);
}

function replaceMeshGeometryAttributes(
  mesh: HTMLElement,
  input: unknown,
  changedAttributes: readonly MeshGeometryAttribute[]
): void {
  const state = getState(mesh);
  const { captured, invalid } = captureGeometryReplacement(input);
  const topology = getTopologySnapshot(captured);
  const topologyChanged = changedAttributes.includes('indices') || topologyHasChanged(state, topology);
  const update = { captured, changedAttributes, invalid, state };
  applyGeometryReplacement(update);
  updateReplacementTopology(update, topologyChanged);
  updateMeshDiagnostics(mesh, state);
  notifyOwningScene(mesh);
}

function applyGeometryReplacement(update: GeometryReplacementUpdate): void {
  const { captured, changedAttributes, invalid, state } = update;
  state.positions = captured.positions;
  state.normals = captured.normals;
  state.uvs = captured.uvs;
  state.colors = captured.colors;
  state.indices = captured.indices;
  state.geometryError = invalid;
  state.version += 1;
  for (const attribute of changedAttributes) state.attributeVersions[attribute] += 1;
}

function updateReplacementTopology(update: GeometryReplacementUpdate, topologyChanged: boolean): void {
  const { captured, changedAttributes, state } = update;
  if (topologyChanged) {
    updateTopologyState(state, captured, true);
    state.pendingGeometryUploads = [];
  } else {
    for (const attribute of changedAttributes) queueFullGeometryUpload(state, attribute, captured[attribute]);
  }
}

function prepareGeometryPublication(
  state: MeshState,
  publication: MeshGeometryPublication
): PreparedGeometryPublication {
  const { attribute, source, start = 0, count } = publication;
  const snapshot = state[attribute];
  assertPublishSource(attribute, source, snapshot);
  if (!source || !snapshot) throw new DOMException(`Mesh ${attribute} geometry is unavailable.`, 'InvalidStateError');
  const width = geometryAttributeWidth(attribute);
  const { recordCount, scalarCount, scalarStart } = resolveGeometryPublicationRange({ count, source, start, width });
  const candidate = snapshot.slice() as Float32Array | Uint32Array;
  candidate.set(source.subarray(scalarStart, scalarStart + scalarCount), scalarStart);
  const geometry = getCurrentGeometry(state);
  Reflect.set(geometry, attribute, candidate);
  validateMeshGeometry(geometry);
  return {
    attribute,
    byteOffset: scalarStart * source.BYTES_PER_ELEMENT,
    byteSize: scalarCount * source.BYTES_PER_ELEMENT,
    candidate,
    geometry,
    recordCount
  };
}

function resolveGeometryPublicationRange(options: {
  readonly count: number | undefined;
  readonly source: Float32Array | Uint32Array;
  readonly start: number;
  readonly width: number;
}): { readonly recordCount: number; readonly scalarCount: number; readonly scalarStart: number } {
  const { count, source, start, width } = options;
  const capacity = source.length / width;
  const recordCount = count ?? capacity - start;
  assertGeometryPublishRange(start, recordCount, capacity);
  return { recordCount, scalarCount: recordCount * width, scalarStart: start * width };
}

function applyGeometryPublication(state: MeshState, prepared: PreparedGeometryPublication): void {
  Reflect.set(state, prepared.attribute, prepared.candidate);
}

function queuePublishedGeometryUpload(state: MeshState, prepared: PreparedGeometryPublication): void {
  if (prepared.recordCount <= 0 || !canUploadGeometryRange(state, prepared.attribute)) return;
  state.pendingGeometryUploads.push({
    attribute: prepared.attribute,
    offset: prepared.byteOffset,
    size: prepared.byteSize
  });
}

function captureGeometryReplacement(input: unknown): {
  readonly captured: MeshGeometryReplacement;
  readonly invalid: boolean;
} {
  let captured: MeshGeometryReplacement;
  try {
    captured = captureGeometry(input);
  } catch {
    return {
      captured: { colors: null, indices: null, normals: null, positions: null, uvs: null },
      invalid: true
    };
  }
  try {
    validateMeshGeometry(captured);
    return { captured, invalid: false };
  } catch {
    return { captured, invalid: true };
  }
}

export async function captureMeshTexture(
  mesh: HTMLElement,
  source: ImageBitmap | null
): Promise<SceneTextureCaptureResult> {
  if (source !== null && !(typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap)) {
    throw new TypeError('Texture source must be an ImageBitmap or null.');
  }
  const state = getState(mesh);
  const request = ++state.textureRequest;
  if (source === null) {
    applyCapturedTexture(mesh, state, null);
    return Object.freeze({ status: 'applied' });
  }
  const captured = await captureTextureSource(source);
  if (!captured) return settleTextureCaptureFailure(mesh, state, request);
  if (request !== state.textureRequest) {
    captured.close();
    return Object.freeze({ status: 'superseded' });
  }
  applyCapturedTexture(mesh, state, captured);
  return Object.freeze({ status: 'applied' });
}

async function captureTextureSource(source: ImageBitmap): Promise<ImageBitmap | undefined> {
  try {
    return await scenePlatform.captureImageBitmap(source);
  } catch {
    return undefined;
  }
}

function settleTextureCaptureFailure(mesh: HTMLElement, state: MeshState, request: number): SceneTextureCaptureResult {
  if (request !== state.textureRequest) return Object.freeze({ status: 'superseded' });
  failTextureCapture(mesh, state);
  return Object.freeze({ status: 'failed' });
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
  updateMeshDiagnostics(mesh, state);
  notifyOwningScene(mesh);
}

function updateMeshDiagnostics(mesh: HTMLElement, state: MeshState): void {
  state.episodes.update({
    element: mesh,
    code: MESH_GEOMETRY,
    active: state.geometryError,
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
  state.episodes.update({
    active: state.textureError,
    code: MESH_TEXTURE_CAPTURE,
    element: mesh,
    message: 'Mesh texture capture failed.',
    severity: 'error'
  });
}

function applyCapturedTexture(mesh: HTMLElement, state: MeshState, texture: ImageBitmap | null): void {
  releaseOwnedTexture(state);
  state.texture = texture;
  state.textureOwned = texture !== null;
  state.textureError = false;
  state.version += 1;
  validateMesh(mesh);
}

function failTextureCapture(mesh: HTMLElement, state: MeshState): void {
  releaseOwnedTexture(state);
  state.texture = null;
  state.textureOwned = false;
  state.textureError = true;
  state.version += 1;
  updateMeshDiagnostics(mesh, state);
  notifyOwningScene(mesh);
}

function releaseOwnedTexture(state: MeshState): void {
  if (state.textureOwned) state.texture?.close();
}

function captureGeometry(input: unknown): MeshGeometryReplacement {
  if (typeof input !== 'object' || input === null) throw new TypeError('Mesh geometry must be an object.');
  return {
    colors: captureFloatGeometryArray(Reflect.get(input, 'colors') ?? null, 'colors'),
    indices: captureIndexGeometryArray(Reflect.get(input, 'indices') ?? null),
    normals: captureFloatGeometryArray(Reflect.get(input, 'normals') ?? null, 'normals'),
    positions: captureFloatGeometryArray(Reflect.get(input, 'positions'), 'positions'),
    uvs: captureFloatGeometryArray(Reflect.get(input, 'uvs') ?? null, 'uvs')
  };
}

function captureFloatGeometryArray(value: unknown, name: string): Float32Array | null {
  assertFloatGeometryArray(value, name);
  return value === null ? null : new Float32Array(value);
}

function captureIndexGeometryArray(value: unknown): Uint32Array | null {
  assertIndexGeometryArray(value);
  return value === null ? null : new Uint32Array(value);
}

function assertFloatGeometryArray(value: unknown, name: string): asserts value is Float32Array | null {
  assertGeometryArray(value, Float32Array, name);
}

function assertIndexGeometryArray(value: unknown): asserts value is Uint32Array | null {
  assertGeometryArray(value, Uint32Array, 'indices');
}

function assertGeometryArray(
  value: unknown,
  constructor: typeof Float32Array | typeof Uint32Array,
  name: string
): void {
  if (value !== null && !(value instanceof constructor)) {
    throw new TypeError(`${name} must be the specified typed array or null.`);
  }
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

const MESH_GEOMETRY_ATTRIBUTES = ['positions', 'normals', 'uvs', 'colors', 'indices'] as const;

function createAttributeVersions(): Record<MeshGeometryAttribute, number> {
  return { colors: 0, indices: 0, normals: 0, positions: 0, uvs: 0 };
}

function takeGeometryUploadRanges(state: MeshState, consume: boolean): MeshGeometryUploadRange[] {
  const ranges = MESH_GEOMETRY_ATTRIBUTES.flatMap(attribute =>
    mergeUploadRanges(
      state.pendingGeometryUploads
        .filter(range => range.attribute === attribute)
        .map(({ offset, size }) => ({ offset, size }))
    ).map(range => ({ ...range, attribute }))
  );
  if (consume) state.pendingGeometryUploads = [];
  return ranges;
}

function queueFullGeometryUpload(
  state: MeshState,
  attribute: MeshGeometryAttribute,
  source: Float32Array | Uint32Array | null
): void {
  if (!source || !canUploadGeometryRange(state, attribute)) return;
  state.pendingGeometryUploads.push({ attribute, offset: 0, size: source.byteLength });
}

function canUploadGeometryRange(state: MeshState, attribute: MeshGeometryAttribute): boolean {
  return !state.indexedFlatNormals || attribute === 'normals';
}

function geometryAttributeWidth(attribute: MeshGeometryAttribute): number {
  if (attribute === 'uvs') return 2;
  if (attribute === 'colors') return 4;
  return attribute === 'indices' ? 1 : 3;
}

function assertPublishSource(
  attribute: MeshGeometryAttribute,
  source: Float32Array | Uint32Array | null,
  snapshot: Float32Array | Uint32Array | null
): void {
  const validType = attribute === 'indices' ? source instanceof Uint32Array : source instanceof Float32Array;
  if (!validType && source !== null) throw new TypeError(`Mesh ${attribute} must use its declared typed array.`);
  if (source !== null && snapshot !== null && source.length !== snapshot.length) {
    throw new RangeError(`Mesh ${attribute} publication cannot change geometry capacity.`);
  }
}

function assertGeometryPublishRange(start: number, count: number, capacity: number): void {
  if (!Number.isInteger(start) || !Number.isInteger(count) || start < 0 || count < 0 || start + count > capacity) {
    throw new RangeError('Mesh geometry publication range must be nonnegative and within capacity.');
  }
}

function getCurrentGeometry(state: MeshState): MeshGeometryReplacement {
  return {
    colors: state.colors,
    indices: state.indices,
    normals: state.normals,
    positions: state.positions,
    uvs: state.uvs
  };
}

function updateTopologyState(
  state: MeshState,
  input: Pick<MeshState, 'positions' | 'normals' | 'uvs' | 'indices'>,
  increment: boolean
): void {
  const topology = getTopologySnapshot(input);
  if (increment) state.topologyVersion += 1;
  state.topologyKey = topology.key;
  state.indexedFlatNormals = topology.indexedFlatNormals;
  state.topologyIndices = topology.indices;
}

function getNextGeometry(
  state: MeshState,
  name: MeshGeometryAttribute,
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
