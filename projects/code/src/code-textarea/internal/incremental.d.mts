// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Scanner, ScannerCheckpoint, SyntaxRange } from '../../internal/highlight/language-registry.mjs';

export interface ParsedDocument {
  text: string;
  ranges: SyntaxRange[];
  checkpoints: ScannerCheckpoint[];
  reusedFrom: number | null;
  checkpointStride: number;
}

export function createDocument(scan: Scanner, text: string, checkpointStride?: number): ParsedDocument;
export function editDocument(
  scan: Scanner,
  previous: ParsedDocument,
  start: number,
  end: number,
  insertion: string
): ParsedDocument;
