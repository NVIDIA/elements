// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MARKER_PARENT, MARKER_VALUE } from '../../errors.js';
import { parseCSSColor } from '../utils/color.js';
import { diagnosticReporterService } from '../services/diagnostic-reporter.service.js';
import type { MarkerFields } from '../layouts/helpers.js';
import { normalizeQuaternion } from '../math/quaternion.js';
import type { Quaternion, Vec3 } from '../types.js';
import { isMarkerInstanceLayerTag } from '../layer-tags.js';

interface MarkerState {
  color?: CachedColor;
  outlineColor?: CachedColor;
}

interface CachedColor {
  readonly source: string;
  readonly value: MarkerFields['color'] | null;
}

const markerStates = new WeakMap<HTMLElement, MarkerState>();

const markerGeometryFields = [
  { attribute: 'position', property: 'position' },
  { attribute: 'orientation', property: 'orientation' },
  { attribute: 'scale', property: 'scale' },
  { attribute: 'color', property: 'color' },
  { attribute: 'outline-color', property: 'outlineColor' },
  { attribute: 'hidden' }
] as const;

export function markerPropertyChangesAffectGeometry(changes: ReadonlyMap<PropertyKey, unknown>): boolean {
  return markerGeometryFields.some(field => 'property' in field && changes.has(field.property));
}

export function markerAttributeAffectsGeometry(attributeName: string | null): boolean {
  return attributeName !== null && markerGeometryFields.some(field => field.attribute === attributeName);
}

export function registerMarkerState(marker: HTMLElement): void {
  markerStates.set(marker, {});
}

export function compileMarker(marker: HTMLElement): MarkerFields | null {
  const state = getMarkerState(marker);
  const validParent = isInstanceLayer(marker.parentElement);
  diagnosticReporterService.update({
    element: marker,
    code: MARKER_PARENT,
    active: !validParent,
    message: 'Scene markers must be direct children of an instance layer.',
    severity: 'error'
  });
  if (!validParent || marker.hidden) {
    return null;
  }

  const color = readColor(state, 'color', readString(marker, 'color', '#ffffff'));
  const outlineColor = readColor(state, 'outlineColor', readString(marker, 'outlineColor', 'transparent'));
  if (!color || !outlineColor) {
    return rejectMarkerValue(marker, 'Scene marker colors must be supported CSS color values.');
  }
  return compileTransform({ marker, color, outlineColor });
}

function readColor(state: MarkerState, key: 'color' | 'outlineColor', source: string): MarkerFields['color'] | null {
  const cached = state[key];
  if (cached?.source === source) return cached.value;
  const value = parseCSSColor(source);
  state[key] = { source, value };
  return value;
}

export function validateMarkerParent(marker: HTMLElement): void {
  diagnosticReporterService.update({
    element: marker,
    code: MARKER_PARENT,
    active: !isInstanceLayer(marker.parentElement),
    message: 'Scene markers must be direct children of an instance layer.',
    severity: 'error'
  });
}

function compileTransform(options: {
  marker: HTMLElement;
  color: MarkerFields['color'];
  outlineColor: MarkerFields['outlineColor'];
}): MarkerFields | null {
  const { marker, color, outlineColor } = options;
  const position = readVec3(marker, 'position', [0, 0, 0]);
  const orientation = readQuaternion(marker, 'orientation', [0, 0, 0, 1]);
  const scale = readVec3(marker, 'scale', [1, 1, 1]);
  if (!position || !orientation || !scale || Math.hypot(...orientation) === 0) {
    return rejectMarkerValue(marker, 'Scene marker transforms must contain finite values and a nonzero quaternion.');
  }
  clearMarkerValue(marker);
  return { position, orientation: normalizeQuaternion(orientation), scale, color, outlineColor };
}

function rejectMarkerValue(marker: HTMLElement, message: string): null {
  diagnosticReporterService.update({ element: marker, code: MARKER_VALUE, active: true, message, severity: 'error' });
  return null;
}

function clearMarkerValue(marker: HTMLElement): void {
  diagnosticReporterService.update({
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
  return element !== null && isMarkerInstanceLayerTag(element.localName);
}

function getMarkerState(marker: HTMLElement): MarkerState {
  const state = markerStates.get(marker);
  if (!state) {
    throw new TypeError('Element is not a registered scene marker.');
  }
  return state;
}
