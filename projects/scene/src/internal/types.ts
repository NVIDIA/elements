// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** A mutable three-component numeric vector. */
export type Vec3 = [number, number, number];

/** A mutable four-component numeric vector. */
export type Vec4 = [number, number, number, number];

/** A mutable quaternion in xyzw component order. */
export type Quaternion = [number, number, number, number];

/** A position and orientation expressed in the same coordinate frame. */
export interface ScenePose {
  readonly orientation: Readonly<Quaternion>;
  readonly position: Readonly<Vec3>;
}

/** A mutable normalized red, green, blue, and alpha color tuple. */
export type RGBA = [number, number, number, number];

/** A column-major 4-by-4 matrix. */
export type Mat4 = Float32Array;

/** A matrix retained at JavaScript numeric precision until a GPU upload boundary. */
export type PreciseMat4 = Float64Array;

/** Internal matrix inputs can cross either side of the GPU precision boundary. */
export type Matrix4 = Mat4 | PreciseMat4;
