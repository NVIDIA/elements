// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type SyntaxRange = [start: number, end: number, category: number];
export type ScannerCheckpoint = [offset: number, state: number, category: number, stack: unknown[], line: number];
export type Scanner = (
  text: string,
  checkpoint?: ScannerCheckpoint,
  checkpoints?: ScannerCheckpoint[],
  onLine?: (checkpoint: ScannerCheckpoint) => boolean,
  checkpointStride?: number
) => SyntaxRange[];
export function createScanner(machine: object): Scanner;
