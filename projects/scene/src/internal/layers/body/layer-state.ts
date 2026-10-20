// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { composeModelTint } from '../../composition/model/tint.js';
import { SHAPE_KIND } from '../../diagnostics/errors.js';
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
import { SCENE_SHAPE_TAG } from '../registry.js';
import type { SceneBodyGeometry } from './types.js';
import { compileBodyGeometry, type CompiledBodyGeometry } from './geometry.js';
import { resolveSceneColor } from '../../color/color.js';
import { EMPTY_ALPHA_SUMMARY, summarizeRGBAAlpha, type AlphaSummary } from '../../color/alpha.js';
import type { SceneColor, RGBA } from '../../color/types.js';

interface BodyLayerState {
  alphaSummary: AlphaSummary;
  compiled: CompiledBodyGeometry;
  geometry: SceneBodyGeometry | null;
  input: 'children' | 'geometry' | 'asset';
  tint: RGBA;
  ownTint: RGBA;
  geometryError: boolean;
  observer?: MutationObserver;
  aggregateErrorShape?: HTMLElement;
  topologyVersion: number;
  version: number;
}

const states = new WeakMap<HTMLElement, BodyLayerState>();

export function registerBodyLayer(layer: HTMLElement): void {
  states.set(layer, {
    alphaSummary: EMPTY_ALPHA_SUMMARY,
    compiled: compileShapes([]),
    geometryError: false,
    geometry: [],
    input: 'children',
    tint: [1, 1, 1, 1],
    ownTint: [1, 1, 1, 1],
    topologyVersion: 0,
    version: 0
  });
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
  state.observer?.disconnect();
  state.observer = undefined;
}

/** Recompiles a body when one of its declarative shape properties changes. */
export function notifyOwningBodyShape(shape: HTMLElement): void {
  const layer = shape.parentElement;
  if (layer && isBodyLayerRegistered(layer)) recompileDeclarative(layer, getState(layer));
}

/** Captures geometry before replacing its input authority. */
export function setBodyLayerGeometry(
  layer: HTMLElement,
  geometry: SceneBodyGeometry | null,
  input: 'geometry' | 'asset' = 'geometry'
): void {
  const state = getState(layer);
  const compiled = geometry === null ? null : compileBodyGeometry(geometry);
  state.input = geometry === null ? 'children' : input;
  state.geometry = geometry;
  if (compiled !== null) {
    clearAggregateError(state);
    state.geometryError = false;
    replaceCompiled(state, compiled);
  } else recompileDeclarative(layer, state);
  notifyOwningScene(layer);
}

/** Current resolved data; renderer captures have separate ownership. */
export function getBodyLayerGeometry(layer: HTMLElement): SceneBodyGeometry | null {
  return getState(layer).geometry;
}

/** Selects an unresolved file input and clears the previous rendered contribution. */
export function beginBodyLayerAsset(layer: HTMLElement): void {
  const state = getState(layer);
  clearAggregateError(state);
  state.input = 'asset';
  state.geometry = null;
  state.geometryError = false;
  replaceCompiled(state, compileShapes([]));
  notifyOwningScene(layer);
}

export function failBodyLayerAsset(layer: HTMLElement): void {
  getState(layer).geometryError = true;
  notifyOwningScene(layer);
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
      state.geometryError ||
      (state.input === 'children' && [...layer.children].some(child => child.localName !== SCENE_SHAPE_TAG)),
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
  if (state.input !== 'children') return;
  const candidates = [...layer.children].filter(isShapeElement).map(shape => ({ shape, value: readShape(shape) }));
  try {
    const geometry = candidates.flatMap(candidate => candidate.value ?? []);
    const compiled = compileNormalizedShapes(geometry);
    state.geometry = geometry;
    clearAggregateError(state);
    state.geometryError = false;
    replaceCompiled(state, compiled);
  } catch {
    setAggregateError(state, getLatestValidShape(candidates));
    state.geometryError = true;
    state.geometry = null;
    replaceCompiled(state, compileShapes([]));
  }
  notifyOwningScene(layer);
}

function getLatestValidShape(
  candidates: readonly { readonly shape: HTMLElement; readonly value: NormalizedBodyShape | null }[]
): HTMLElement | undefined {
  let latest: HTMLElement | undefined;
  for (const candidate of candidates) {
    if (candidate.value !== null) latest = candidate.shape;
  }
  return latest;
}

function clearAggregateError(state: BodyLayerState): void {
  if (state.aggregateErrorShape) updateShapeAggregateError(state.aggregateErrorShape, false);
  state.aggregateErrorShape = undefined;
}

function setAggregateError(state: BodyLayerState, shape: HTMLElement | undefined): void {
  if (state.aggregateErrorShape && state.aggregateErrorShape !== shape)
    updateShapeAggregateError(state.aggregateErrorShape, false);
  if (shape) updateShapeAggregateError(shape, true);
  state.aggregateErrorShape = shape;
}

function replaceCompiled(state: BodyLayerState, compiled: CompiledBodyGeometry): void {
  state.alphaSummary = summarizeRGBAAlpha(compiled.colors);
  state.compiled = compiled;
  state.topologyVersion += 1;
  state.version += 1;
}

function readShape(shape: HTMLElement): NormalizedBodyShape | null {
  try {
    const candidate: BodyShape = {
      color: readString(shape, 'color', '#ffffff'),
      position: readVector3(shape, 'position', [0, 0, 0]),
      orientation: readVector4(shape, 'orientation'),
      scale: readVector3(shape, 'scale', [1, 1, 1]),
      kind: readString(shape, 'kind', 'cube') as BodyShape['kind']
    };
    const normalized = normalizeBodyShape(candidate, 'shape');
    updateShapeInvalidError(shape, false);
    return normalized;
  } catch {
    updateShapeInvalidError(shape, true);
    return null;
  }
}

function readVector3(shape: HTMLElement, name: string, fallback: Readonly<Vec3>): Vec3 {
  const values = readVector(shape, name, fallback);
  const [x, y, z] = values;
  if (x === undefined || y === undefined || z === undefined) throw new RangeError(`${name} is invalid.`);
  return [x, y, z];
}

function readVector4(shape: HTMLElement, name: string): Quaternion {
  const values = readVector(shape, name, [0, 0, 0, 1]);
  const [x, y, z, w] = values;
  if (x === undefined || y === undefined || z === undefined || w === undefined)
    throw new RangeError(`${name} is invalid.`);
  return [x, y, z, w];
}

function readVector(shape: HTMLElement, name: string, fallback: readonly number[]): readonly number[] {
  const property = Reflect.get(shape, name);
  const attribute = shape.getAttribute(name);
  const values = property ?? (attribute === null ? fallback : (JSON.parse(attribute) ?? fallback));
  if (
    !Array.isArray(values) ||
    values.length !== fallback.length ||
    values.some(value => typeof value !== 'number' || !Number.isFinite(value))
  )
    throw new RangeError(`${name} is invalid.`);
  return [...values];
}

function updateShapeInvalidError(shape: HTMLElement, active: boolean): void {
  const state = getShapeErrorState(shape);
  state.invalid = active;
  updateShapeError(shape, state);
}

function updateShapeAggregateError(shape: HTMLElement, active: boolean): void {
  const state = getShapeErrorState(shape);
  state.aggregate = active;
  updateShapeError(shape, state);
}

function updateShapeError(shape: HTMLElement, state: ShapeErrorState): void {
  diagnosticReporterService.update({
    active: state.invalid || state.aggregate,
    code: SHAPE_KIND,
    element: shape,
    message: 'Scene shape kind or transform is invalid.',
    severity: 'error'
  });
}

interface ShapeErrorState {
  aggregate: boolean;
  invalid: boolean;
}

const shapeErrorStates = new WeakMap<HTMLElement, ShapeErrorState>();
function getShapeErrorState(shape: HTMLElement): ShapeErrorState {
  let state = shapeErrorStates.get(shape);
  if (!state) {
    state = { aggregate: false, invalid: false };
    shapeErrorStates.set(shape, state);
  }
  return state;
}

function isShapeElement(element: Element): element is HTMLElement {
  return element.localName === SCENE_SHAPE_TAG;
}

function readString(element: HTMLElement, name: string, fallback: string): string {
  const value = Reflect.get(element, name);
  return typeof value === 'string' ? value : (element.getAttribute(name) ?? fallback);
}

function getState(layer: HTMLElement): BodyLayerState {
  const state = states.get(layer);
  if (!state) throw new TypeError('Element is not a registered scene body.');
  return state;
}
