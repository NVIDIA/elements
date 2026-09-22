// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type SemanticMarkerKind = 'arrow' | 'cone' | 'cube' | 'cylinder' | 'marker' | 'pyramid' | 'sphere';

const semanticKinds = new WeakMap<object, SemanticMarkerKind>();

export function registerSemanticMarkerSource(source: object, kind: SemanticMarkerKind): void {
  semanticKinds.set(source, kind);
}

export function getSemanticMarkerKind(source: object): SemanticMarkerKind | undefined {
  return semanticKinds.get(source);
}
