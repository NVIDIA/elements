// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Vec3 } from '../../internal/types.js';

/** A row in the ID table that stays alive while a readback maps. */
export interface PickTableEntry {
  readonly layer: Element;
  readonly marker?: Element;
  readonly instanceIndex: number;
}

/** Renderer-facing hit resolved from a retained ID-table row. */
export interface ResolvedPickHit {
  readonly element: Element;
  readonly layer: Element;
  readonly instanceIndex: number;
  readonly worldPosition: Readonly<Vec3>;
}

/** Explicit source-record meaning for a resolved scene pick. */
export type ScenePickTarget =
  | { readonly index: number; readonly kind: 'instance' }
  | { readonly index: number; readonly kind: 'label' }
  | { readonly index: number; readonly kind: 'point' }
  | {
      readonly index: number;
      readonly kind: 'segment';
      readonly vertexIndices: readonly [number, number];
    }
  | {
      readonly index: number;
      readonly kind: 'triangle';
      readonly vertexIndices: readonly [number, number, number];
    }
  | { readonly kind: 'surface' };

/** Immutable public result from a scene pick. */
export interface ScenePickHit {
  readonly clientX: number;
  readonly clientY: number;
  readonly element: Element;
  readonly featureId?: number;
  readonly layer: Element;
  readonly target: ScenePickTarget;
  readonly worldPosition: Readonly<Vec3>;
}

/** Kinds of requests that the scene input router can issue. */
export type PickRequestKind = 'pointerdown' | 'pointerup' | 'click' | 'hover';

export interface PickRequest {
  readonly kind: PickRequestKind;
  /** Monotonically increasing across every request, including hover. */
  readonly sequence: number;
}

export interface PickCompletion<T = ResolvedPickHit> {
  readonly request: PickRequest;
  readonly hit: T | null;
}
