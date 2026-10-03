// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Build-only: mark expressions whose users never need capture offsets. Bit 0
// still identifies sticky expressions; bit 1 allows omitting RegExp's /d flag.
export function elideIndices(machine) {
  if (!machine.expressions || machine.ruleMask === undefined)
    throw new Error('Capture index elision requires indexed compact expressions');
  const needsOffsets = captures => captures?.length && !(captures.length === 2 && captures[0] === 0);
  const required = machine.expressions.map(() => false);
  for (const state of machine.states) {
    for (const stream of [0, 2, 4]) {
      const expression = state[stream];
      if (expression === undefined || expression < 0) continue;
      const branches = state[stream + 1] ?? [];
      for (let index = 1; index < branches.length; index += 2) {
        if (needsOffsets(machine.rules[branches[index] & machine.ruleMask][3])) required[expression] = true;
      }
    }
  }
  // Phase changes can reuse an enclosing end matcher with a new capture map.
  // Keep static ends conservative when such a phase needs partial captures.
  const reusedEnd = machine.rules.some(rule => rule[0] === 4 && rule[4] === 0 && needsOffsets(rule[5]));
  for (const rule of machine.rules) {
    if (typeof rule[4] === 'number' && rule[4] < 0 && (reusedEnd || needsOffsets(rule[5]))) {
      required[-rule[4] - 1] = true;
    }
  }
  return {
    ...machine,
    expressions: machine.expressions.map((entry, index) => [
      entry[0],
      (entry[1] & ~2) | (required[index] ? 0 : 2),
      ...entry.slice(2)
    ])
  };
}
