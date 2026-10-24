// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MESH_GEOMETRY, MESH_TEXTURE_CAPTURE, MESH_TEXTURE_WITHOUT_UVS } from '../../diagnostics/errors.js';
import { parseCSSColor } from '../../color/color.js';
import {
  EMPTY_ALPHA_SUMMARY,
  replaceAlphaSummary,
  summarizeAlpha,
  summarizeRGBAAlpha,
  type AlphaSummary
} from '../../color/alpha.js';
import { diagnosticReporterService } from '../../diagnostics/reporter.service.js';
import { getLayerInstances, getLayerCount } from '../markers/layer-state.js';
import type { RGBA } from '../../color/types.js';
import { validateMeshGeometry, validateMeshGeometryRange } from './geometry.js';
import { readMeshGeometry, meshGeometryScalarCount, type CapturedMeshGeometry } from './capture.js';
import { assertSynchronousCapture, SynchronousCaptureLimitError } from '../../rendering/capture.js';
import type { SceneMeshGeometry } from './types.js';
import { createTopologyKey } from './processing.js';
import { notifyOwningScene } from '../../composition/scene/notifications.js';
import { scenePlatform } from '../../gpu/platform.js';
import { VersionedRangeJournal } from '../../structures/versioned-range-journal.js';
import {
  createPreparationContext,
  PREPARATION_CHUNK_SIZE,
  runPreparation,
  runPreparationSync
} from '../../rendering/preparation.js';
import { notifyOwningBodyPart } from '../body/part-notifications.js';
import {
  createMeshGeometryCopy,
  finishMeshGeometryCopy,
  prepareMeshGeometryCopyRange,
  type MeshGeometryCopy
} from './publication.js';
import {
  createConstructedMeshRenderData,
  createMeshGeometryAttributeVersions,
  type MeshGeometryAttribute,
  type MeshGeometryUploadRange,
  type MeshRenderData
} from './render-data.js';

interface MeshGeometryPublication {
  readonly attribute: MeshGeometryAttribute;
  readonly count?: number;
  readonly source: Float32Array | Uint32Array | null;
  readonly start?: number;
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

interface MeshState {
  alphaSummary: AlphaSummary;
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
  readonly sharedAttributes: Set<MeshGeometryAttribute>;
  readonly pendingCopies: Map<MeshGeometryAttribute, PendingGeometryCopy>;
  readonly pendingGeometryUploads: Map<MeshGeometryAttribute, VersionedRangeJournal>;
}

interface PendingGeometryCopy extends MeshGeometryCopy {
  readonly baseVersion: number;
  version: number;
  alphaSummary: AlphaSummary;
  readonly uploads: VersionedRangeJournal;
}

interface PreparedGeometryPublication {
  readonly attribute: MeshGeometryAttribute;
  readonly byteOffset: number;
  readonly byteSize: number;
  readonly values: Float32Array | Uint32Array;
  readonly snapshot: Float32Array | Uint32Array;
  readonly replacement?: Float32Array | Uint32Array;
  readonly recordCount: number;
}

interface GeometryReplacementUpdate {
  readonly alphaSummary?: AlphaSummary;
  readonly captured: MeshGeometryReplacement;
  readonly changedAttributes: readonly MeshGeometryAttribute[];
  readonly invalid: boolean;
  readonly state: MeshState;
}

const states = new WeakMap<HTMLElement, MeshState>();

export function registerMeshLayer(mesh: HTMLElement): void {
  states.set(mesh, {
    alphaSummary: EMPTY_ALPHA_SUMMARY,
    attributeVersions: createMeshGeometryAttributeVersions(),
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
    sharedAttributes: new Set(),
    pendingCopies: new Map(),
    pendingGeometryUploads: new Map()
  });
}

export function getMeshRenderData(mesh: HTMLElement): MeshRenderData {
  return createMeshRenderData(mesh, false);
}

function createMeshRenderData(mesh: HTMLElement, consumeUploads: boolean): MeshRenderData {
  const state = getState(mesh);
  shareGeometry(state);
  const markerSource = getLayerInstances(mesh);
  const markerCount = getLayerCount(mesh);
  const hasChildren = mesh.children.length > 0;
  const uploads = takeGeometryUploadHistory(state, consumeUploads);
  return createConstructedMeshRenderData({
    alphaSummary: state.alphaSummary,
    color: state.color,
    colors: state.colors,
    geometryError: state.geometryError || state.textureError,
    geometryUploadBaseVersions: uploads.baseVersions,
    geometryUploadRanges: uploads.ranges,
    geometryVersions: { ...state.attributeVersions },
    identityInstance: markerSource === null && !hasChildren && markerCount === undefined,
    indices: state.indices,
    normals: state.normals,
    positions: state.positions,
    texture: state.texture,
    topologyVersion: state.topologyVersion,
    uvs: state.uvs,
    version: state.version
  });
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

/** Captured geometry for body compilation; null while empty or invalid. */
export function getMeshPartGeometry(mesh: HTMLElement): SceneMeshGeometry | null {
  const state = getState(mesh);
  if (state.geometryError || !state.positions) return null;
  shareGeometry(state);
  return { ...getCurrentGeometry(state), positions: state.positions };
}

export function hasMeshTexture(mesh: HTMLElement): boolean {
  return getState(mesh).texture !== null;
}

export function setMeshGeometryProperty(mesh: HTMLElement, name: MeshGeometryAttribute, value: unknown): void {
  const state = getState(mesh);
  if (value !== null && !(value instanceof (name === 'indices' ? Uint32Array : Float32Array))) {
    throw new TypeError(`${name} must be the specified typed array or null.`);
  }
  const next = {
    ...getNextGeometry(state, name, value),
    colors: name === 'colors' ? (value as Float32Array | null) : state.colors
  };
  assertSynchronousCapture(meshGeometryScalarCount(next), 'geometry');
  state.pendingCopies.delete(name);
  flushGeometryCopies(mesh, state);
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

/** Installs a complete private capture without rescanning its validated arrays. */
export function applyCapturedMeshGeometry(mesh: HTMLElement, capture: CapturedMeshGeometry): void {
  const state = getState(mesh);
  const update = {
    captured: capture.geometry,
    changedAttributes: MESH_GEOMETRY_ATTRIBUTES,
    invalid: false,
    state,
    alphaSummary: capture.alphaSummary
  };
  applyGeometryReplacement(update);
  updateReplacementTopology(update, true);
  updateMeshDiagnostics(mesh, state);
  notifyOwningScene(mesh);
}

/** Captures and validates one changed range, detaching shared snapshots only before mutation. */
export function publishMeshGeometry(mesh: HTMLElement, publication: MeshGeometryPublication): 'applied' | 'pending' {
  const state = getState(mesh);
  const prepared = prepareGeometryPublication(state, publication);
  if (queueGeometryCopy(mesh, state, prepared)) return 'pending';
  applyGeometryPublication(state, prepared);
  state.geometryError = false;
  state.version += 1;
  state.attributeVersions[prepared.attribute] += 1;
  if (prepared.attribute === 'indices') {
    updateTopologyState(state, state, true);
    clearPendingGeometryUploads(state);
  } else {
    queuePublishedGeometryUpload(state, prepared);
  }
  updateMeshDiagnostics(mesh, state);
  notifyOwningScene(mesh);
  return 'applied';
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
  state.alphaSummary = update.alphaSummary ?? summarizeRGBAAlpha(captured.colors);
  state.positions = captured.positions;
  state.normals = captured.normals;
  state.uvs = captured.uvs;
  state.colors = captured.colors;
  state.indices = captured.indices;
  state.geometryError = invalid;
  state.sharedAttributes.clear();
  state.pendingCopies.clear();
  state.version += 1;
  for (const attribute of changedAttributes) state.attributeVersions[attribute] += 1;
}

function updateReplacementTopology(update: GeometryReplacementUpdate, topologyChanged: boolean): void {
  const { captured, changedAttributes, state } = update;
  if (topologyChanged) {
    updateTopologyState(state, captured, true);
    clearPendingGeometryUploads(state);
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
  const range = source.subarray(scalarStart, scalarStart + scalarCount);
  const values = attribute === 'indices' ? new Uint32Array(range) : new Float32Array(range);
  const replacement = state.geometryError
    ? validateGeometryRepair(state, { attribute, snapshot, values, scalarStart })
    : undefined;
  if (!state.geometryError) validateMeshGeometryRange(attribute, values, (state.positions?.length ?? 0) / 3);
  return {
    attribute,
    byteOffset: scalarStart * source.BYTES_PER_ELEMENT,
    byteSize: scalarCount * source.BYTES_PER_ELEMENT,
    values,
    snapshot,
    replacement,
    recordCount
  };
}

function validateGeometryRepair(
  state: MeshState,
  range: {
    readonly attribute: MeshGeometryAttribute;
    readonly snapshot: Float32Array | Uint32Array;
    readonly values: Float32Array | Uint32Array;
    readonly scalarStart: number;
  }
): Float32Array | Uint32Array {
  const candidate = range.snapshot.slice();
  candidate.set(range.values, range.scalarStart);
  const geometry = getCurrentGeometry(state);
  Reflect.set(geometry, range.attribute, candidate);
  validateMeshGeometry(geometry);
  return candidate;
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
  if (prepared.values.length === 0 && !prepared.replacement) return;
  const { attribute, snapshot } = prepared;
  const target = prepared.replacement ?? (state.sharedAttributes.has(attribute) ? snapshot.slice() : snapshot);
  if (prepared.attribute === 'colors' && prepared.recordCount > 0) {
    const span = {
      offset: prepared.byteOffset / Float32Array.BYTES_PER_ELEMENT + 3,
      stride: 4,
      count: prepared.recordCount,
      opaqueValue: 1
    } as const;
    state.alphaSummary = replaceAlphaSummary(
      state.alphaSummary,
      summarizeAlpha({ ...span, values: snapshot }),
      summarizeAlpha({ ...span, offset: 3, values: prepared.values })
    );
  }
  target.set(prepared.values, prepared.byteOffset / target.BYTES_PER_ELEMENT);
  Reflect.set(state, attribute, target);
  state.sharedAttributes.delete(attribute);
}

function shareGeometry(state: MeshState): void {
  for (const attribute of MESH_GEOMETRY_ATTRIBUTES) {
    if (state[attribute]) state.sharedAttributes.add(attribute);
  }
}

function queueGeometryCopy(mesh: HTMLElement, state: MeshState, prepared: PreparedGeometryPublication): boolean {
  const { attribute, snapshot } = prepared;
  let pending = state.pendingCopies.get(attribute);
  if (!pending) {
    if (
      prepared.replacement ||
      prepared.values.length === 0 ||
      !state.sharedAttributes.has(attribute) ||
      snapshot.length <= PREPARATION_CHUNK_SIZE
    )
      return false;
    pending = {
      ...createMeshGeometryCopy(snapshot),
      alphaSummary: state.alphaSummary,
      baseVersion: state.attributeVersions[attribute],
      version: state.attributeVersions[attribute],
      uploads: new VersionedRangeJournal()
    };
    state.pendingCopies.set(attribute, pending);
    scheduleGeometryCopy(mesh, state, { attribute, pending });
  }
  const start = prepared.byteOffset / pending.target.BYTES_PER_ELEMENT;
  prepareMeshGeometryCopyRange(pending, start, prepared.values.length);
  if (attribute === 'colors' && prepared.recordCount > 0) {
    const span = { stride: 4, count: prepared.recordCount, opaqueValue: 1 } as const;
    pending.alphaSummary = replaceAlphaSummary(
      pending.alphaSummary,
      summarizeAlpha({ ...span, offset: start + 3, values: pending.target }),
      summarizeAlpha({ ...span, offset: 3, values: prepared.values })
    );
  }
  pending.target.set(prepared.values, start);
  pending.uploads.record({
    baseVersion: pending.version,
    version: ++pending.version,
    ranges: prepared.recordCount > 0 ? [{ offset: prepared.byteOffset, size: prepared.byteSize }] : []
  });
  return true;
}

function scheduleGeometryCopy(
  mesh: HTMLElement,
  state: MeshState,
  job: { readonly attribute: MeshGeometryAttribute; readonly pending: PendingGeometryCopy }
): void {
  const { attribute, pending } = job;
  const context = createPreparationContext(() => state.pendingCopies.get(attribute) === pending);
  void runPreparation(finishMeshGeometryCopy(pending), context)
    .then(result => {
      if (result && context.isCurrent()) {
        commitGeometryCopy(mesh, state, attribute);
        updateMeshDiagnostics(mesh, state);
        notifyOwningBodyPart(mesh);
      }
    })
    .catch(() => {
      if (!context.isCurrent()) return;
      state.pendingCopies.delete(attribute);
      diagnosticReporterService.update({
        active: true,
        code: MESH_GEOMETRY,
        element: mesh,
        message: 'Unable to prepare published mesh geometry.',
        severity: 'error'
      });
    });
}

function commitGeometryCopy(mesh: HTMLElement, state: MeshState, attribute: MeshGeometryAttribute): void {
  const pending = state.pendingCopies.get(attribute);
  if (!pending) return;
  state.pendingCopies.delete(attribute);
  Reflect.set(state, attribute, pending.target);
  state.sharedAttributes.delete(attribute);
  state.version += pending.version - pending.baseVersion;
  state.attributeVersions[attribute] = pending.version;
  if (attribute === 'colors') state.alphaSummary = pending.alphaSummary;
  if (attribute === 'indices') {
    state.topologyVersion += pending.version - pending.baseVersion - 1;
    updateTopologyState(state, state, true);
    clearPendingGeometryUploads(state);
  } else {
    const uploads = pending.uploads.snapshot();
    if (uploads) getPendingGeometryUploadJournal(state, attribute).record(uploads);
  }
  notifyOwningScene(mesh);
}

function flushGeometryCopies(mesh: HTMLElement, state: MeshState): void {
  for (const [attribute, pending] of state.pendingCopies) {
    runPreparationSync(finishMeshGeometryCopy(pending));
    commitGeometryCopy(mesh, state, attribute);
  }
}

function queuePublishedGeometryUpload(state: MeshState, prepared: PreparedGeometryPublication): void {
  const version = state.attributeVersions[prepared.attribute];
  getPendingGeometryUploadJournal(state, prepared.attribute).record({
    baseVersion: version - 1,
    version,
    ranges: prepared.recordCount > 0 ? [{ offset: prepared.byteOffset, size: prepared.byteSize }] : []
  });
}

function captureGeometryReplacement(input: unknown): {
  readonly captured: MeshGeometryReplacement;
  readonly invalid: boolean;
} {
  let captured: MeshGeometryReplacement;
  try {
    captured = captureGeometry(input);
  } catch (error) {
    if (error instanceof SynchronousCaptureLimitError) throw error;
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

function updateMeshDiagnostics(mesh: HTMLElement, state: MeshState): void {
  diagnosticReporterService.update({
    element: mesh,
    code: MESH_GEOMETRY,
    active: state.geometryError,
    message: 'Mesh geometry arrays are invalid.',
    severity: 'error'
  });
  diagnosticReporterService.update({
    element: mesh,
    code: MESH_TEXTURE_WITHOUT_UVS,
    active: !!state.texture && !state.uvs,
    message: 'Mesh texture ignored because UVs are absent.',
    severity: 'warning'
  });
  diagnosticReporterService.update({
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
  updateMeshDiagnostics(mesh, state);
  notifyOwningScene(mesh);
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
  const geometry = readMeshGeometry(input);
  assertSynchronousCapture(meshGeometryScalarCount(geometry), 'geometry');
  return {
    colors: captureFloatGeometryArray(geometry.colors),
    indices: captureIndexGeometryArray(geometry.indices),
    normals: captureFloatGeometryArray(geometry.normals),
    positions: captureFloatGeometryArray(geometry.positions),
    uvs: captureFloatGeometryArray(geometry.uvs)
  };
}

function captureFloatGeometryArray(value: Float32Array | null): Float32Array | null {
  return value === null ? null : new Float32Array(value);
}

function captureIndexGeometryArray(value: Uint32Array | null): Uint32Array | null {
  return value === null ? null : new Uint32Array(value);
}

function getState(mesh: HTMLElement): MeshState {
  const state = states.get(mesh);
  if (!state) throw new TypeError('Element is not a registered scene mesh.');
  return state;
}

const MESH_GEOMETRY_ATTRIBUTES = ['positions', 'normals', 'uvs', 'colors', 'indices'] as const;

function takeGeometryUploadHistory(
  state: MeshState,
  consume: boolean
): {
  readonly baseVersions: Partial<Record<MeshGeometryAttribute, number>>;
  readonly ranges: MeshGeometryUploadRange[];
} {
  const baseVersions: Partial<Record<MeshGeometryAttribute, number>> = {};
  const ranges: MeshGeometryUploadRange[] = [];
  for (const attribute of MESH_GEOMETRY_ATTRIBUTES) {
    const pending = state.pendingGeometryUploads.get(attribute);
    const snapshot = consume ? pending?.drain() : pending?.snapshot();
    if (!snapshot) continue;
    baseVersions[attribute] = snapshot.baseVersion;
    for (const range of snapshot.ranges) ranges.push({ ...range, attribute });
  }
  return { baseVersions, ranges };
}

function getPendingGeometryUploadJournal(state: MeshState, attribute: MeshGeometryAttribute): VersionedRangeJournal {
  let journal = state.pendingGeometryUploads.get(attribute);
  if (!journal) {
    journal = new VersionedRangeJournal();
    state.pendingGeometryUploads.set(attribute, journal);
  }
  return journal;
}

function clearPendingGeometryUploads(state: MeshState): void {
  state.pendingGeometryUploads.clear();
}

function queueFullGeometryUpload(
  state: MeshState,
  attribute: MeshGeometryAttribute,
  source: Float32Array | Uint32Array | null
): void {
  if (!source) {
    state.pendingGeometryUploads.delete(attribute);
    return;
  }
  const version = state.attributeVersions[attribute];
  getPendingGeometryUploadJournal(state, attribute).record({
    baseVersion: version - 1,
    version,
    ranges: [{ offset: 0, size: source.byteLength }]
  });
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
    indices: input.indices,
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
