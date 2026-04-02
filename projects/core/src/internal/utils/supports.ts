// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function supportsNativeCSSAnchorPosition() {
  return globalThis.CSS?.supports?.('position-area', 'top') || globalThis.CSS?.supports?.('inset-area', 'top');
}

export function supportsCSSPositionArea() {
  return globalThis.CSS?.supports?.('position-area', 'top');
}

export function supportsCSSLegacyInsetArea() {
  return globalThis.CSS?.supports?.('inset-area', 'top');
}
