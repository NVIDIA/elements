// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Vec3 } from '../../internal/types.js';

/** A row in the ID table that stays alive while a readback maps. */
export interface PickTableEntry {
  readonly layer: Element;
  readonly marker?: Element;
  readonly instanceIndex: number;
}

/** The public shape returned by a resolved scene pick. */
export interface PickHit {
  readonly element: Element;
  readonly layer: Element;
  readonly instanceIndex: number;
  readonly worldPosition: Readonly<Vec3>;
}

/** Kinds of requests that the scene input router can issue. */
export type PickRequestKind = 'pointerdown' | 'pointerup' | 'click' | 'hover';

export interface PickRequest {
  readonly kind: PickRequestKind;
  /** Monotonically increasing across every request, including hover. */
  readonly sequence: number;
}

export interface PickCompletion<T = PickHit> {
  readonly request: PickRequest;
  readonly hit: T | null;
}
