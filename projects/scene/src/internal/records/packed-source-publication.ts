// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { publishSceneFeatureIds } from '../interaction/feature-ids.js';
import type { FlagPrefixIndex } from '../structures/flag-prefix-index.js';
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

/** Validity transitions redraw; rejected candidates and identity-only edits do not change accepted geometry. */
export function packedPublicationNeedsRender(
  publication: PackedSourcePublication,
  state: { readonly publicationError: boolean },
  previousPublicationError: boolean
): boolean {
  return previousPublicationError !== state.publicationError || (!state.publicationError && publication.visualChanged);
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
    visualChanged: currentActiveCount !== resolved.activeCount || (geometryChanged && resolved.ranges.length > 0)
  };
}

/** Checks changed source records and retained validity before committing any bytes. */
export function packedPublicationIsValid(options: {
  readonly capacity: number;
  readonly invalidFlag: number;
  readonly publication: PackedSourcePublication;
  readonly recordIsValid: (records: DataView, offset: number) => boolean;
  readonly source: Uint8Array;
  readonly stride: number;
  readonly summary: FlagPrefixIndex;
}): boolean {
  const { capacity, invalidFlag, publication, recordIsValid, source, stride, summary } = options;
  const { activeCount, ranges } = publication.resolved;
  try {
    if (source.byteLength !== capacity * stride || activeCount > capacity) return false;
    const records = new DataView(source.buffer, source.byteOffset, source.byteLength);
    let retainedStart = 0;
    for (const range of publication.geometryChanged ? ranges : []) {
      const start = Math.min(range.start, activeCount);
      const end = Math.min(range.start + range.count, activeCount);
      if (summary.hasInRange(invalidFlag, retainedStart, start - retainedStart)) return false;
      if (!sourceRangeIsValid({ records, start, end, stride, recordIsValid })) return false;
      retainedStart = end;
    }
    return !summary.hasInRange(invalidFlag, retainedStart, activeCount - retainedStart);
  } catch {
    // Detached producer storage rejects the candidate while preserving the capture.
    return false;
  }
}

function sourceRangeIsValid(options: {
  readonly records: DataView;
  readonly start: number;
  readonly end: number;
  readonly stride: number;
  readonly recordIsValid: (records: DataView, offset: number) => boolean;
}): boolean {
  const { records, start, end, stride, recordIsValid } = options;
  for (let index = start; index < end; index += 1) {
    if (!recordIsValid(records, index * stride)) return false;
  }
  return true;
}

/** Publishes source identities and returns the matching packed geometry version. */
export function publishPackedSourceGeneration(source: AnyPackedRecordSource | null, sourceVersion?: number): number {
  if (source === null) return -1;
  publishSceneFeatureIds(source);
  return sourceVersion ?? getPackedRecordState(source)?.version ?? -1;
}
