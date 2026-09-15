// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FEATURE_ID_INACTIVE, FEATURE_ID_MAP_INVALID } from '../errors.js';
import {
  assertSceneFeatureId,
  getSceneFeatureId,
  publishSceneFeatureIds,
  registerSceneFeatureIdSource,
  setSceneFeatureIds
} from './feature-ids.js';
import { notifyOwningScene } from './scene/notifications.js';
import { diagnosticReporterService } from './services/diagnostic-reporter.service.js';

interface FeatureIdElement extends HTMLElement {
  requestUpdate(name?: PropertyKey, oldValue?: unknown): void;
}

const INVALID_FEATURE_ID = Symbol('invalid-feature-id');

export const sceneFeatureIdConverter = {
  fromAttribute(value: string | null): number | undefined {
    if (value === null) return undefined;
    const source = value.trim();
    const parsed = Number(source);
    return /^\d+$/.test(source) && parsed <= 0xffffffff ? parsed : (INVALID_FEATURE_ID as unknown as number);
  }
};

export function registerElementFeatureId(element: FeatureIdElement): void {
  registerSceneFeatureIdSource(element, 1);
}

export function getElementFeatureId(element: object): number | undefined {
  return getSceneFeatureId(element, 0);
}

export function setElementFeatureId(element: FeatureIdElement, value: number | undefined): void {
  const previous = getSceneFeatureId(element, 0);
  const invalidAttribute = (value as unknown) === INVALID_FEATURE_ID;
  if (!invalidAttribute && value !== undefined) assertSceneFeatureId(value);
  const next = invalidAttribute ? undefined : value;
  diagnosticReporterService.update({
    active: invalidAttribute,
    code: FEATURE_ID_MAP_INVALID,
    element,
    message: 'Feature ID attributes must contain an unsigned 32-bit integer.',
    severity: 'warning'
  });
  if (next === previous) return;
  setSceneFeatureIds(element, next ?? null);
  publishSceneFeatureIds(element);
  notifyOwningScene(element, 'identity');
  element.requestUpdate('featureId', previous);
}

export function updateElementFeatureIdInactive(element: HTMLElement, inactive: boolean): void {
  diagnosticReporterService.update({
    active: inactive,
    code: FEATURE_ID_INACTIVE,
    element,
    message: 'The feature ID is inactive while explicit marker instances define the pick targets.',
    severity: 'warning'
  });
}
