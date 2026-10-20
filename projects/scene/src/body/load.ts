// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export {
  decodeGeometry,
  loadGeometry,
  type DecodeGeometryOptions,
  type LoadGeometryOptions
} from '../internal/layers/body/load.js';
export {
  registerGeometryDecoder,
  type SceneGeometryFormat,
  type GeometryDecoderLoader,
  type GeometryDecoderModule,
  type GeometryDecoderOptions
} from '../internal/layers/body/decoders.js';
