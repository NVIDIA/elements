// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineLayout } from './define-layout.js';

export const MARKER = defineLayout(
  'nve.marker',
  {
    position: { type: 'f32x3', offset: 0 },
    orientation: { type: 'f32x4', offset: 12 },
    scale: { type: 'f32x3', offset: 28 },
    color: { type: 'unorm8x4', offset: 40 },
    'outline-color': { type: 'unorm8x4', offset: 44 }
  },
  { stride: 48 }
);

export const POINT = defineLayout(
  'nve.point',
  {
    position: { type: 'f32x3', offset: 0 },
    color: { type: 'unorm8x4', offset: 12 }
  },
  { stride: 16 }
);

export const LINE_VERTEX = defineLayout(
  'nve.line-vertex',
  {
    position: { type: 'f32x3', offset: 0 },
    color: { type: 'unorm8x4', offset: 12 },
    normal: { type: 'f32x3', offset: 16 },
    width: { type: 'f32', offset: 28 },
    dash: { type: 'f32', offset: 32 },
    gap: { type: 'f32', offset: 36 }
  },
  { stride: 40 }
);

export const TRI_VERTEX = defineLayout(
  'nve.tri-vertex',
  {
    position: { type: 'f32x3', offset: 0 },
    color: { type: 'unorm8x4', offset: 12 }
  },
  { stride: 16 }
);
