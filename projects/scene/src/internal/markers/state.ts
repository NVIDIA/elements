// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MARKER_ARROW_DEGENERATE, MARKER_ARROW_FORM, MARKER_PARENT, MARKER_VALUE } from '../../errors.js';
import { parseCSSColor } from '../color.js';
import { DiagnosticEpisodes } from '../diagnostic-episodes.js';
import type { MarkerFields } from '../layouts/helpers.js';
import { normalizeQuaternion } from '../math/quaternion.js';
import type { Quaternion, Vec3 } from '../types.js';
import { markerFromPointPair, parseVector } from './data.js';

interface MarkerState {
  readonly episodes: DiagnosticEpisodes;
}

const markerStates = new WeakMap<HTMLElement, MarkerState>();
const INSTANCE_LAYER_TAGS = new Set([
  'nve-scene-arrows',
  'nve-scene-cones',
  'nve-scene-cubes',
  'nve-scene-cylinders',
  'nve-scene-pyramids',
  'nve-scene-spheres',
  'nve-scene-mesh',
  'nve-scene-model'
]);

export function registerMarkerState(marker: HTMLElement): void {
  markerStates.set(marker, { episodes: new DiagnosticEpisodes() });
}

export function compileMarker(marker: HTMLElement, arrowLayer: boolean): MarkerFields | null {
  const state = getMarkerState(marker);
  const validParent = isInstanceLayer(marker.parentElement);
  state.episodes.update({
    element: marker,
    code: MARKER_PARENT,
    active: !validParent,
    message: 'Scene markers must be direct children of an instance layer.',
    severity: 'error'
  });
  if (!validParent || marker.hidden) {
    return null;
  }

  const color = parseCSSColor(readString(marker, 'color', '#ffffff'));
  const outlineColor = parseCSSColor(readString(marker, 'outlineColor', 'transparent'));
  if (!color || !outlineColor) {
    return rejectMarkerValue(marker, state, 'Scene marker colors must be supported CSS color values.');
  }
  const pointPair = readNullableString(marker, 'from') !== null || readNullableString(marker, 'to') !== null;
  if (arrowLayer && pointPair) {
    return compilePointPair({ marker, state, color, outlineColor });
  }
  return compileTransform({ marker, state, color, outlineColor });
}

export function validateMarkerParent(marker: HTMLElement): void {
  const state = getMarkerState(marker);
  state.episodes.update({
    element: marker,
    code: MARKER_PARENT,
    active: !isInstanceLayer(marker.parentElement),
    message: 'Scene markers must be direct children of an instance layer.',
    severity: 'error'
  });
}

function compileTransform(options: {
  marker: HTMLElement;
  state: MarkerState;
  color: MarkerFields['color'];
  outlineColor: MarkerFields['outlineColor'];
}): MarkerFields | null {
  const { marker, state, color, outlineColor } = options;
  state.episodes.update({
    element: marker,
    code: MARKER_ARROW_FORM,
    active: false,
    message: 'Arrow markers require both from and to attributes.',
    severity: 'error'
  });
  state.episodes.update({
    element: marker,
    code: MARKER_ARROW_DEGENERATE,
    active: false,
    message: 'Arrow marker endpoints must not be equal.',
    severity: 'error'
  });
  const position = readVec3(marker, 'position', [0, 0, 0]);
  const orientation = readQuaternion(marker, 'orientation', [0, 0, 0, 1]);
  const scale = readVec3(marker, 'scale', [1, 1, 1]);
  if (!position || !orientation || !scale || Math.hypot(...orientation) === 0) {
    return rejectMarkerValue(
      marker,
      state,
      'Scene marker transforms must contain finite values and a nonzero quaternion.'
    );
  }
  clearMarkerValue(marker, state);
  return { position, orientation: normalizeQuaternion(orientation), scale, color, outlineColor };
}

function compilePointPair(options: {
  marker: HTMLElement;
  state: MarkerState;
  color: MarkerFields['color'];
  outlineColor: MarkerFields['outlineColor'];
}): MarkerFields | null {
  const { marker, state, color, outlineColor } = options;
  const exclusive = ['position', 'orientation', 'scale'].some(name => marker.hasAttribute(name));
  const fromSource = readNullableString(marker, 'from');
  const toSource = readNullableString(marker, 'to');
  const from = fromSource === null ? null : parseVector(fromSource, 3);
  const to = toSource === null ? null : parseVector(toSource, 3);
  const invalid = exclusive || !from || !to;
  state.episodes.update({
    element: marker,
    code: MARKER_ARROW_FORM,
    active: invalid,
    message: 'Arrow markers require valid from and to attributes without position, orientation, or scale.',
    severity: 'error'
  });
  clearMarkerValue(marker, state);
  if (invalid || !from || !to) {
    return null;
  }
  return resolvePointPair({ marker, state, from, to, color, outlineColor });
}

function resolvePointPair(options: {
  marker: HTMLElement;
  state: MarkerState;
  from: Vec3;
  to: Vec3;
  color: MarkerFields['color'];
  outlineColor: MarkerFields['outlineColor'];
}): MarkerFields | null {
  const { marker, state, from, to, color, outlineColor } = options;
  try {
    const fields = { ...markerFromPointPair(from, to, color), outlineColor };
    updateDegenerateEpisode(marker, state, false);
    return fields;
  } catch {
    updateDegenerateEpisode(marker, state, true);
    return null;
  }
}

function updateDegenerateEpisode(marker: HTMLElement, state: MarkerState, active: boolean): void {
  state.episodes.update({
    element: marker,
    code: MARKER_ARROW_DEGENERATE,
    active,
    message: 'Arrow marker endpoints must not be equal.',
    severity: 'error'
  });
}

function rejectMarkerValue(marker: HTMLElement, state: MarkerState, message: string): null {
  state.episodes.update({ element: marker, code: MARKER_VALUE, active: true, message, severity: 'error' });
  return null;
}

function clearMarkerValue(marker: HTMLElement, state: MarkerState): void {
  state.episodes.update({
    element: marker,
    code: MARKER_VALUE,
    active: false,
    message: '',
    severity: 'error'
  });
}

function readString(element: HTMLElement, name: string, fallback: string): string {
  const value = Reflect.get(element, name);
  return typeof value === 'string' ? value : fallback;
}

function readNullableString(element: HTMLElement, name: string): string | null {
  const value = Reflect.get(element, name);
  return typeof value === 'string' ? value : null;
}

function readVec3(element: HTMLElement, name: string, fallback: Vec3): Vec3 | null {
  const value = Reflect.get(element, name) ?? fallback;
  return isVec3(value) ? [value[0], value[1], value[2]] : null;
}

function readQuaternion(element: HTMLElement, name: string, fallback: Quaternion): Quaternion | null {
  const value = Reflect.get(element, name) ?? fallback;
  return isQuaternion(value) ? [value[0], value[1], value[2], value[3]] : null;
}

function isVec3(value: unknown): value is Vec3 {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(component => typeof component === 'number' && Number.isFinite(component))
  );
}

function isQuaternion(value: unknown): value is Quaternion {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every(component => typeof component === 'number' && Number.isFinite(component))
  );
}

function isInstanceLayer(element: Element | null): boolean {
  return element !== null && INSTANCE_LAYER_TAGS.has(element.localName);
}

function getMarkerState(marker: HTMLElement): MarkerState {
  const state = markerStates.get(marker);
  if (!state) {
    throw new TypeError('Element is not a registered scene marker.');
  }
  return state;
}
