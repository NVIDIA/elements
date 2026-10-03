// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { categories } from '../../internal/highlight/categories.mjs';

// The caller owns the code text node. This function only registers CSS highlights.
export function registerHighlights(code, spans) {
  if (!CSS.highlights || typeof Highlight === 'undefined') {
    throw new Error('CSS Custom Highlight API is required');
  }
  const nodes = [];
  const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
  let node;
  let length = 0;
  while ((node = walker.nextNode())) {
    nodes.push([node, length, length + node.length]);
    length += node.length;
  }

  function boundary(offset) {
    for (const [text, start, end] of nodes) {
      if (offset <= end) return [text, Math.max(0, offset - start)];
    }
    throw new RangeError(`Highlight offset ${offset} exceeds code length ${length}`);
  }

  const registered = [];
  for (const [start, end, category] of spans) {
    if (!categories[category] || end <= start) continue;
    const [startNode, startOffset] = boundary(start);
    const [endNode, endOffset] = boundary(end);
    // Full rebuilds own these offsets; avoid live Range mutation tracking.
    const range = new StaticRange({
      startContainer: startNode,
      startOffset,
      endContainer: endNode,
      endOffset
    });
    let group = registered[category];
    if (!group) {
      const name = `nve-code-${categories[category]}`;
      let highlight = CSS.highlights.get(name);
      if (!highlight) {
        highlight = new Highlight();
        CSS.highlights.set(name, highlight);
      }
      registered[category] = group = [highlight];
    }
    group[0].add(range);
    group.push(range);
  }
  return () => {
    for (const group of registered) {
      if (!group) continue;
      for (let index = 1; index < group.length; index++) group[0].delete(group[index]);
    }
    registered.length = 0;
  };
}
