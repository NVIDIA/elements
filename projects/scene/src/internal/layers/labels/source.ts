// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const sourceTexts = new WeakMap<object, readonly string[]>();

export function registerLabelSourceTexts(source: object, texts: readonly string[]): void {
  sourceTexts.set(source, texts);
}

export function getLabelSourceTexts(source: object): readonly string[] | undefined {
  return sourceTexts.get(source);
}
