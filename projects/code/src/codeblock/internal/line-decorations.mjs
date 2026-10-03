// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Decorations never enter code: syntax offsets and copied text stay unchanged.
export function decorateLines(pre, text, numbers, selection) {
  const layer = pre.querySelector('[data-lines]');
  const code = pre.querySelector('code');
  const node = code && [...code.childNodes].find(child => child.nodeType === Node.TEXT_NODE);
  if (!layer) return;
  if (!node || !text) {
    layer.replaceChildren();
    return;
  }
  const starts = [0];
  for (let offset = text.indexOf('\n'); offset !== -1; offset = text.indexOf('\n', offset + 1)) {
    starts.push(offset + 1);
  }
  const selected = new Set();
  for (const item of (selection ?? '').split(',')) {
    const match = /^\s*(\d+)(?:\s*-\s*(\d+))?\s*$/.exec(item);
    if (!match) continue;
    const first = Math.max(1, Number(match[1]));
    const last = Math.min(starts.length, Number(match[2] ?? match[1]));
    for (let line = first; line <= last; line++) selected.add(line);
  }
  if (!numbers && !selected.size) {
    layer.replaceChildren();
    return;
  }

  // One transient Range locates logical line starts after browser wrapping.
  // Read all geometry before appending any decoration elements.
  const range = pre.ownerDocument.createRange();
  const style = getComputedStyle(code);
  let tops = [];
  if (numbers && style.whiteSpace === 'pre' && style.writingMode === 'horizontal-tb') {
    // Unwrapped text can expose every row in one native query. Do not assume
    // uniform font metrics: ambiguous fragment tops use the per-line path.
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      if (tops.at(-1) !== rect.top) tops.push(rect.top);
    }
    if (tops.length !== starts.length) tops = [];
  }
  const batched = tops.length === starts.length;
  function topAt(index) {
    if (tops[index] === undefined) {
      const offset = starts[index];
      range.setStart(node, offset);
      range.setEnd(node, Math.min(offset + 1, text.length));
      // Include zero-width newline rects, which boundingClientRect can discard.
      tops[index] = range.getClientRects()[0]?.top ?? 0;
    }
    return tops[index];
  }
  const bounds = code.getBoundingClientRect();
  const origin = bounds.top - topAt(0);
  // DOMRects use viewport coordinates; row styles need local CSS coordinates.
  const scale = bounds.height / parseFloat(style.height) || 1;
  const preTop = pre.getBoundingClientRect().top;
  const step = starts.length > 1 ? tops[1] - tops[0] : bounds.height;
  const simple =
    numbers &&
    batched &&
    tops.length === starts.length &&
    step > 0 &&
    Math.abs(bounds.height - step * starts.length) < 0.1 &&
    tops.every((top, index) => Math.abs(top - tops[0] - step * index) < 0.1);
  const positions = [];
  for (let index = 0; index < starts.length; index++) {
    if ((!numbers || simple) && !selected.has(index + 1)) continue;
    const top = topAt(index) + origin;
    const bottom = index + 1 < starts.length ? topAt(index + 1) + origin : bounds.bottom;
    positions.push([index, (top - preTop) / scale, (bottom - top) / scale]);
  }
  let gutter = layer.querySelector('[data-gutter]');
  if (simple) {
    if (!gutter) {
      gutter = pre.ownerDocument.createElement('span');
      gutter.dataset.gutter = '';
      gutter.className = 'line-number';
      layer.prepend(gutter);
    }
    const labels = starts.map((_, index) => index + 1).join('\n');
    if (gutter.textContent !== labels) gutter.textContent = labels;
    gutter.style.top = `${(bounds.top - preTop) / scale}px`;
    gutter.style.lineHeight = `${step / scale}px`;
  } else {
    gutter?.remove();
  }
  const fragment = pre.ownerDocument.createDocumentFragment();
  const rows = layer.querySelectorAll('[data-line]');
  let count = 0;
  for (const [index, top, height] of positions) {
    const line = String(index + 1);
    let row = rows[count];
    if (!row || row.dataset.line !== line) {
      const next = pre.ownerDocument.createElement('span');
      next.dataset.line = line;
      if (row) layer.replaceChild(next, row);
      else fragment.append(next);
      row = next;
    }
    const name = `${selected.has(index + 1) ? 'selected-line ' : ''}${numbers && !simple ? 'line-number' : ''}`;
    if (row.className !== name) row.className = name;
    if (row.style.top !== `${top}px`) row.style.top = `${top}px`;
    if (row.style.height !== `${height}px`) row.style.height = `${height}px`;
    const label = numbers && !simple ? line : '';
    if (row.textContent !== label) row.textContent = label;
    count++;
  }
  for (let index = count; index < rows.length; index++) rows[index].remove();
  layer.append(fragment);
}
