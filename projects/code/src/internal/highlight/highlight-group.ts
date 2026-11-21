// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function getHighlightGroup(category: string): Highlight {
  const name = `nve-code-${category}`;
  let highlight = CSS.highlights.get(name);
  if (!highlight) {
    highlight = new Highlight();
    if (category.startsWith('bracket-')) highlight.priority = 1;
    CSS.highlights.set(name, highlight);
  }
  return highlight;
}
