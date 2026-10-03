// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createScanner } from './scanner.mjs';

const registered = new Map();

export function registerLanguage(name, machine) {
  registered.set(name, [machine]);
}

export function getScanner(name) {
  const entry = registered.get(name);
  if (!entry) throw new Error(`Unknown language: ${name}`);
  return (entry[1] ??= createScanner(entry[0]));
}
