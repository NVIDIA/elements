// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type PolygonPoint = readonly [number, number];
export type PolygonRing = readonly PolygonPoint[];

export type PolygonGeometry = {
  readonly outer: PolygonRing;
  readonly holes?: readonly PolygonRing[];
};
