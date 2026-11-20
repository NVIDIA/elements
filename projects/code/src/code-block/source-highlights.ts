// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getHighlightGroup } from '../internal/highlight/highlight-group.js';
import type { SyntaxSpan } from '../internal/highlight/syntax.js';

type RegisteredHighlights = Map<string, { highlight: Highlight; ranges: StaticRange[] }>;

// Call the returned cleanup function before replacing the source nodes. Registered ranges reference those nodes.
export function registerHighlights(code: HTMLElement, spans: SyntaxSpan[]) {
  if (!CSS.highlights || typeof Highlight === 'undefined') {
    throw new Error('CSS Custom Highlight API is required');
  }
  const getBoundary = createBoundaryFinder(code);
  const registered: RegisteredHighlights = new Map();
  for (const [start, end, category] of spans) {
    if (!category || end <= start) continue;
    const [startNode, startOffset] = getBoundary(start);
    const [endNode, endOffset] = getBoundary(end);
    // Source changes recreate these ranges, so their endpoints can stay fixed.
    const range = new StaticRange({
      startContainer: startNode,
      startOffset,
      endContainer: endNode,
      endOffset
    });
    const group = getRegistration(registered, category);
    group.highlight.add(range);
    group.ranges.push(range);
  }
  return () => {
    for (const { highlight, ranges } of registered.values()) {
      for (const range of ranges) highlight.delete(range);
    }
    registered.clear();
  };
}

function getRegistration(registered: RegisteredHighlights, category: string) {
  let group = registered.get(category);
  if (!group) {
    group = { highlight: getHighlightGroup(category), ranges: [] };
    registered.set(category, group);
  }
  return group;
}

function createBoundaryFinder(code: HTMLElement) {
  const nodes: [Text, number, number][] = [];
  const walker = code.ownerDocument.createTreeWalker(code, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  let length = 0;
  while ((node = walker.nextNode() as Text | null)) {
    nodes.push([node, length, length + node.length]);
    length += node.length;
  }

  return (offset: number): [Text, number] => {
    for (const [text, start, end] of nodes) {
      if (offset <= end) return [text, Math.max(0, offset - start)];
    }
    throw new RangeError(`Highlight offset ${offset} exceeds code length ${length}`);
  };
}
