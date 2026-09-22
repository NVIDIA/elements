// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Complete producer input captured by SceneMesh.geometry. */
export interface SceneMeshGeometry {
  readonly colors?: Float32Array | null;
  readonly indices?: Uint32Array | null;
  readonly normals?: Float32Array | null;
  readonly positions: Float32Array;
  readonly uvs?: Float32Array | null;
}
