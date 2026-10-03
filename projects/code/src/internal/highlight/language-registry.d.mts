// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Scanner } from './scanner.mjs';
export type { Scanner, ScannerCheckpoint, SyntaxRange } from './scanner.mjs';
export function registerLanguage(language: string, machine: object): void;
export function getScanner(language: string): Scanner;
