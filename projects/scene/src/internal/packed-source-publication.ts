// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { publishSceneFeatureIds } from './feature-ids.js';
import {
  getPackedRecordState,
  resolvePublishOptions,
  type AnyPackedRecordSource,
  type ScenePublishOptions
} from './packed-record-source.js';

export interface PackedSourcePublication {
  readonly geometryChanged: boolean;
  readonly resolved: ReturnType<typeof resolvePublishOptions>;
  readonly sourceVersion: number;
  readonly visualChanged: boolean;
}

/** Resolves one packed source generation without committing layer-specific state. */
export function resolvePackedSourcePublication(options: {
  readonly currentActiveCount: number;
  readonly currentSourceVersion: number;
  readonly requested: ScenePublishOptions | undefined;
  readonly source: AnyPackedRecordSource;
  readonly unavailableStateMessage: string;
}): PackedSourcePublication {
  const { currentActiveCount, currentSourceVersion, requested, source, unavailableStateMessage } = options;
  const resolved = resolvePublishOptions({
    capacity: source.capacity,
    currentActiveCount,
    requested,
    sourceActiveCount: source.count
  });
  const sourceState = getPackedRecordState(source);
  if (!sourceState) throw new TypeError(unavailableStateMessage);
  const geometryChanged =
    requested !== undefined || !sourceState.cacheable || sourceState.version !== currentSourceVersion;
  return {
    geometryChanged,
    resolved,
    sourceVersion: sourceState.version,
    visualChanged: currentActiveCount !== resolved.activeCount || (geometryChanged && resolved.count > 0)
  };
}

/** Publishes source identities and returns the matching packed geometry version. */
export function publishPackedSourceGeneration(source: AnyPackedRecordSource | null, sourceVersion?: number): number {
  if (source === null) return -1;
  publishSceneFeatureIds(source);
  return sourceVersion ?? getPackedRecordState(source)?.version ?? -1;
}
