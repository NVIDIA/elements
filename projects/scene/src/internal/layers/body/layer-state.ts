// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { composeModelTint } from '../../composition/model/tint.js';
import { MESH_GEOMETRY, MESH_PART, SHAPE_TYPE } from '../../diagnostics/errors.js';
import {
  compileNormalizedShapes,
  compileShapes,
  normalizeBodyShape,
  type BodyShape,
  type NormalizedBodyShape
} from './compile.js';
import { diagnosticReporterService } from '../../diagnostics/reporter.service.js';
import { createConstructedMeshRenderData, type MeshRenderData } from '../mesh/render-data.js';
import { getLayerInstances } from '../markers/layer-state.js';
import type { Quaternion, Vec3 } from '../../math/types.js';
import { notifyOwningScene } from '../../composition/scene/notifications.js';
import { isSceneBodyPart, SCENE_SHAPE_TAG } from '../registry.js';
import { getMeshPartGeometry, isMeshLayerRegistered } from '../mesh/layer-state.js';
import type { SceneBodyGeometry, SceneBodyNode } from './types.js';
import { observeBodyParts } from './part-notifications.js';
import {
  bodyGeometryWorkIsBounded,
  compileBodyGeometry,
  prepareBodyGeometry,
  type CompiledBodyGeometry
} from './geometry.js';
import { parseCSSColor, resolveSceneColor } from '../../color/color.js';
import { EMPTY_ALPHA_SUMMARY, summarizeRGBAAlpha, type AlphaSummary } from '../../color/alpha.js';
import type { SceneColor, RGBA } from '../../color/types.js';

import { createPreparationContext, runPreparation, type PreparationContext } from '../../rendering/preparation.js';

interface BodyLayerState {
  generation: number;
  pendingInput?: 'children' | 'geometry';
  preparationComplete: Promise<void>;
  alphaSummary: AlphaSummary;
  compiled: CompiledBodyGeometry;
  geometry: SceneBodyGeometry | null;
  input: 'children' | 'geometry';
  tint: RGBA;
  ownTint: RGBA;
  geometryError: boolean;
  observer?: MutationObserver;
  aggregateErrorPart?: HTMLElement;
  parts: ReadonlySet<HTMLElement>;
  topologyVersion: number;
  version: number;
}

const states = new WeakMap<HTMLElement, BodyLayerState>();

export function registerBodyLayer(layer: HTMLElement): void {
  states.set(layer, {
    generation: 0,
    preparationComplete: Promise.resolve(),
    alphaSummary: EMPTY_ALPHA_SUMMARY,
    compiled: compileShapes([]),
    geometryError: false,
    geometry: [],
    input: 'children',
    parts: new Set(),
    tint: [1, 1, 1, 1],
    ownTint: [1, 1, 1, 1],
    topologyVersion: 0,
    version: 0
  });
  observeBodyParts(layer, () => recompileDeclarative(layer, getState(layer)));
}

export function connectBodyLayer(layer: HTMLElement): void {
  const state = getState(layer);
  state.observer = new MutationObserver(records => {
    if (records.some(record => record.type === 'childList')) recompileDeclarative(layer, state);
  });
  state.observer.observe(layer, { childList: true });
  refreshBodyLayerTint(layer);
  recompileDeclarative(layer, state);
}

export function disconnectBodyLayer(layer: HTMLElement): void {
  const state = getState(layer);
  cancelBodyPreparation(state);
  state.observer?.disconnect();
  state.observer = undefined;
}

/** Captures geometry before replacing its input authority. */
export function setBodyLayerGeometry(layer: HTMLElement, geometry: SceneBodyGeometry | null): 'applied' | 'pending' {
  const state = getState(layer);
  if (geometry !== null && !bodyGeometryWorkIsBounded(geometry)) {
    void scheduleBodyPreparation(layer, geometry, 'geometry');
    return 'pending';
  }
  const compiled = geometry === null ? null : compileBodyGeometry(geometry);
  cancelBodyPreparation(state);
  updatePreparationError(layer, false);
  state.input = geometry === null ? 'children' : 'geometry';
  state.geometry = geometry;
  if (compiled !== null) {
    clearAggregateError(state);
    state.geometryError = false;
    replaceCompiled(state, compiled);
  } else recompileDeclarative(layer, state);
  notifyOwningScene(layer);
  return 'applied';
}

export function getBodyLayerLoadComplete(layer: HTMLElement): Promise<void> {
  return getState(layer).preparationComplete;
}

function cancelBodyPreparation(state: BodyLayerState): void {
  state.generation += 1;
  state.pendingInput = undefined;
  state.preparationComplete = Promise.resolve();
}

function scheduleBodyPreparation(
  layer: HTMLElement,
  geometry: SceneBodyGeometry,
  input: BodyLayerState['input']
): Promise<void> {
  return startBodyPreparation(layer, input, async context => {
    const compiled = await prepareBodyGeometry(geometry, context);
    return compiled ? { geometry, compiled } : undefined;
  });
}

interface PreparedBody {
  readonly geometry: SceneBodyGeometry;
  readonly compiled: CompiledBodyGeometry;
}

function scheduleDeclarativePreparation(layer: HTMLElement): Promise<void> {
  return startBodyPreparation(layer, 'children', async context => {
    const geometry = await runPreparation(readDeclarativeGeometry(layer), context);
    if (!geometry) return undefined;
    const compiled = await prepareBodyGeometry(geometry, context);
    return compiled ? { geometry, compiled } : undefined;
  });
}

function* readDeclarativeGeometry(layer: HTMLElement): Generator<void, SceneBodyNode[]> {
  if (layer.children.length > 65_536) throw new RangeError('body geometry exceeds its node limit.');
  const geometry: SceneBodyNode[] = [];
  const parts = new Set<HTMLElement>();
  let count = 0;
  for (const child of layer.children) {
    if (isPartElement(child)) {
      parts.add(child);
      geometry.push(...(readPart(child) ?? []));
    }
    if (++count % 64 === 0) yield;
  }
  clearDepartedParts(getState(layer), parts);
  return geometry;
}

function publishCompiledGeometry(layer: HTMLElement, prepared: PreparedBody, input: BodyLayerState['input']): void {
  const state = getState(layer);
  state.input = input;
  state.geometry = prepared.geometry;
  state.geometryError = false;
  clearAggregateError(state);
  replaceCompiled(state, prepared.compiled);
  updatePreparationError(layer, false);
  notifyOwningScene(layer);
}

function startBodyPreparation(
  layer: HTMLElement,
  input: BodyLayerState['input'],
  prepare: (context: PreparationContext) => Promise<PreparedBody | undefined>
): Promise<void> {
  const state = getState(layer);
  const generation = ++state.generation;
  state.pendingInput = input;
  const context = createPreparationContext(() => generation === state.generation);
  const pending = prepare(context)
    .then(prepared => {
      if (!prepared || !context.isCurrent()) throw new DOMException('Body preparation cancelled.', 'AbortError');
      publishCompiledGeometry(layer, prepared, input);
    })
    .catch((error: unknown) => {
      if (context.isCurrent()) updatePreparationError(layer, true);
      throw error;
    })
    .finally(() => {
      if (context.isCurrent()) state.pendingInput = undefined;
    });
  state.preparationComplete = pending;
  void pending.catch(() => {});
  return pending;
}

function updatePreparationError(layer: HTMLElement, active: boolean): void {
  diagnosticReporterService.update({
    active,
    code: MESH_GEOMETRY,
    element: layer,
    message: 'Unable to prepare body geometry.',
    severity: 'error'
  });
}

/** Current resolved data; renderer captures have separate ownership. */
export function getBodyLayerGeometry(layer: HTMLElement): SceneBodyGeometry | null {
  return getState(layer).geometry;
}

/** Updates the shader color factor without recompiling captured geometry. */
export function setBodyLayerTint(layer: HTMLElement, tint: SceneColor): void {
  const color = resolveSceneColor(tint);
  const state = getState(layer);
  state.ownTint = color;
  refreshBodyLayerTint(layer);
}

export function refreshBodyLayerTint(layer: HTMLElement): void {
  const state = getState(layer);
  state.tint = composeModelTint(layer, state.ownTint);
  state.version += 1;
  notifyOwningScene(layer);
}

export function getBodyLayerTopologyVersion(layer: HTMLElement): number {
  return getState(layer).topologyVersion;
}

export function isBodyLayerRegistered(layer: HTMLElement): boolean {
  return states.has(layer);
}

export function takeBodyLayerRenderData(layer: HTMLElement): MeshRenderData {
  const state = getState(layer);
  const identityInstance = getLayerInstances(layer) === null;
  return createConstructedMeshRenderData({
    alphaSummary: state.alphaSummary,
    color: state.tint,
    colors: state.compiled.colors,
    geometryError:
      state.geometryError || (state.input === 'children' && [...layer.children].some(child => !isPartElement(child))),
    identityInstance,
    indices: state.compiled.indices,
    normals: state.compiled.normals,
    positions: state.compiled.positions,
    texture: null,
    topologyVersion: state.topologyVersion,
    uvs: state.compiled.uvs ?? null,
    version: state.version
  });
}

function recompileDeclarative(layer: HTMLElement, state: BodyLayerState): void {
  if (state.input !== 'children' || state.pendingInput === 'geometry') return;
  if (layer.children.length > 64) {
    void scheduleDeclarativePreparation(layer);
    return;
  }
  const candidates = [...layer.children].filter(isPartElement).map(part => ({ part, value: readPart(part) }));
  clearDepartedParts(state, new Set(candidates.map(candidate => candidate.part)));
  try {
    compileDeclarativeCandidates(layer, state, candidates);
  } catch {
    cancelBodyPreparation(state);
    setAggregateError(state, getLatestValidPart(candidates));
    state.geometryError = true;
    state.geometry = null;
    replaceCompiled(state, compileShapes([]));
  }
  notifyOwningScene(layer);
}

function compileDeclarativeCandidates(
  layer: HTMLElement,
  state: BodyLayerState,
  candidates: readonly { readonly part: HTMLElement; readonly value: readonly SceneBodyNode[] | null }[]
): void {
  const geometry = candidates.flatMap(candidate => candidate.value ?? []);
  if (!bodyGeometryWorkIsBounded(geometry)) {
    void scheduleBodyPreparation(layer, geometry, 'children');
    return;
  }
  const compiled = candidates.every(candidate => isShapeElement(candidate.part))
    ? compileNormalizedShapes(geometry as NormalizedBodyShape[])
    : compileBodyGeometry(geometry);
  cancelBodyPreparation(state);
  publishCompiledGeometry(layer, { geometry, compiled }, 'children');
}

function getLatestValidPart(
  candidates: readonly { readonly part: HTMLElement; readonly value: readonly SceneBodyNode[] | null }[]
): HTMLElement | undefined {
  let latest: HTMLElement | undefined;
  for (const candidate of candidates) {
    if (candidate.value !== null) latest = candidate.part;
  }
  return latest;
}

/** Clears diagnostics on parts that left the body since its previous compilation. */
function clearDepartedParts(state: BodyLayerState, parts: ReadonlySet<HTMLElement>): void {
  for (const part of state.parts) {
    if (parts.has(part)) continue;
    if (state.aggregateErrorPart === part) state.aggregateErrorPart = undefined;
    const errors = getPartErrorState(part);
    errors.aggregate = false;
    errors.invalid = false;
    updatePartError(part, errors);
  }
  state.parts = parts;
}

function clearAggregateError(state: BodyLayerState): void {
  if (state.aggregateErrorPart) updatePartAggregateError(state.aggregateErrorPart, false);
  state.aggregateErrorPart = undefined;
}

function setAggregateError(state: BodyLayerState, part: HTMLElement | undefined): void {
  if (state.aggregateErrorPart && state.aggregateErrorPart !== part)
    updatePartAggregateError(state.aggregateErrorPart, false);
  if (part) updatePartAggregateError(part, true);
  state.aggregateErrorPart = part;
}

function replaceCompiled(state: BodyLayerState, compiled: CompiledBodyGeometry): void {
  state.alphaSummary = compiled.alphaSummary ?? summarizeRGBAAlpha(compiled.colors);
  state.compiled = compiled;
  state.topologyVersion += 1;
  state.version += 1;
}

function readPart(part: HTMLElement): readonly SceneBodyNode[] | null {
  return isShapeElement(part) ? readShape(part) : readMesh(part);
}

function readShape(shape: HTMLElement): readonly NormalizedBodyShape[] | null {
  try {
    const candidate: BodyShape = {
      color: readString(shape, 'color', '#ffffff'),
      position: readVector3(shape, 'position', [0, 0, 0]),
      orientation: readOrientation(shape),
      scale: readVector3(shape, 'scale', [1, 1, 1]),
      type: readString(shape, 'type', 'cube') as BodyShape['type']
    };
    const normalized = normalizeBodyShape(candidate, 'shape');
    updatePartInvalidError(shape, false);
    return [normalized];
  } catch {
    updatePartInvalidError(shape, true);
    return null;
  }
}

/** Reads one mesh part; an unloaded, empty, or not yet upgraded mesh contributes no nodes. */
function readMesh(mesh: HTMLElement): readonly SceneBodyNode[] | null {
  try {
    const transform = normalizeBodyShape(
      {
        type: 'cube',
        position: readVector3(mesh, 'position', [0, 0, 0]),
        orientation: readOrientation(mesh),
        scale: readVector3(mesh, 'scale', [1, 1, 1])
      },
      'mesh'
    );
    updatePartInvalidError(mesh, false);
    const geometry = isMeshLayerRegistered(mesh) ? getMeshPartGeometry(mesh) : null;
    if (!geometry) return [];
    // Matches standalone meshes, where unsupported CSS colors fall back to white.
    const color = parseCSSColor(readString(mesh, 'color', '#ffffff')) ?? DEFAULT_PART_COLOR;
    const { position, orientation, scale } = transform;
    return [{ geometry, color, position, orientation, scale }];
  } catch {
    updatePartInvalidError(mesh, true);
    return null;
  }
}

function readVector3(part: HTMLElement, name: string, fallback: Readonly<Vec3>): Vec3 {
  const values = readVector(part, name, fallback);
  const [x, y, z] = values;
  if (x === undefined || y === undefined || z === undefined) throw new RangeError(`${name} is invalid.`);
  return [x, y, z];
}

/** A null orientation means identity. */
function readOrientation(part: HTMLElement): Quaternion {
  const [x, y, z, w] = readVector(part, 'orientation', [0, 0, 0, 1]);
  if (x === undefined || y === undefined || z === undefined || w === undefined)
    throw new RangeError('orientation is invalid.');
  return [x, y, z, w];
}

function readVector(part: HTMLElement, name: string, fallback: readonly number[]): readonly number[] {
  return checkVector(readInput(part, name) ?? fallback, fallback.length, name);
}

/** Reads the upgraded property, or the attribute before upgrade; null means unset. */
function readInput(part: HTMLElement, name: string): unknown {
  const property: unknown = Reflect.get(part, name);
  if (property !== undefined) return property;
  const attribute = part.getAttribute(name);
  return attribute === null ? null : JSON.parse(attribute);
}

function checkVector(values: unknown, length: number, name: string): readonly number[] {
  if (
    !Array.isArray(values) ||
    values.length !== length ||
    values.some(value => typeof value !== 'number' || !Number.isFinite(value))
  )
    throw new RangeError(`${name} is invalid.`);
  return [...(values as number[])];
}

function updatePartInvalidError(part: HTMLElement, active: boolean): void {
  const state = getPartErrorState(part);
  state.invalid = active;
  updatePartError(part, state);
}

function updatePartAggregateError(part: HTMLElement, active: boolean): void {
  const state = getPartErrorState(part);
  state.aggregate = active;
  updatePartError(part, state);
}

function updatePartError(part: HTMLElement, state: PartErrorState): void {
  const shape = isShapeElement(part);
  diagnosticReporterService.update({
    active: state.invalid || state.aggregate,
    code: shape ? SHAPE_TYPE : MESH_PART,
    element: part,
    message: shape
      ? 'Scene shape type or transform is invalid.'
      : 'Body mesh transform is invalid, or the body exceeds its geometry limits.',
    severity: 'error'
  });
}

interface PartErrorState {
  aggregate: boolean;
  invalid: boolean;
}

const partErrorStates = new WeakMap<HTMLElement, PartErrorState>();
function getPartErrorState(part: HTMLElement): PartErrorState {
  let state = partErrorStates.get(part);
  if (!state) {
    state = { aggregate: false, invalid: false };
    partErrorStates.set(part, state);
  }
  return state;
}

function isShapeElement(element: Element): element is HTMLElement {
  return element.localName === SCENE_SHAPE_TAG;
}

function isPartElement(element: Element): element is HTMLElement {
  return isShapeElement(element) || isSceneBodyPart(element);
}

const DEFAULT_PART_COLOR: Readonly<RGBA> = [1, 1, 1, 1];

function readString(element: HTMLElement, name: string, fallback: string): string {
  const value = Reflect.get(element, name);
  return typeof value === 'string' ? value : (element.getAttribute(name) ?? fallback);
}

function getState(layer: HTMLElement): BodyLayerState {
  const state = states.get(layer);
  if (!state) throw new TypeError('Element is not a registered scene body.');
  return state;
}
