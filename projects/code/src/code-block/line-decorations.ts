// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

type LinePosition = [index: number, top: number, height: number];
type GutterGeometry = { top: number; lineHeight: number };
type LineContent = { nodes: Text[]; starts: number[] };
type CodeGeometry = { bounds: DOMRect; firstTop: number; preTop: number; scale: number };
type LineOptions = { numbers: boolean; selected: Set<number> };

// Keep decorations outside <code> so source offsets and copied text stay intact.
export function decorateLines(
  pre: HTMLPreElement,
  text: string,
  { numbers = false, selection }: { numbers?: boolean; selection?: string }
) {
  const layer = pre.querySelector<HTMLElement>('[data-lines]');
  if (!layer) return;

  const code = pre.querySelector('code');
  if (!code || !text) {
    layer.replaceChildren();
    return;
  }

  const starts = getLineStarts(text);
  const selected = getSelectedLines(selection, starts.length);
  const nodes = [...code.childNodes].filter((child): child is Text => child.nodeType === Node.TEXT_NODE);
  if (!nodes.length || (!numbers && !selected.size)) {
    layer.replaceChildren();
    return;
  }

  const { positions, gutter } = getLineLayout(pre, code, { nodes, starts, numbers, selected });
  updateGutter(layer, starts.length, gutter);
  updateLineRows(layer, positions, { selected, numbers: numbers && !gutter });
}

function getLineStarts(text: string) {
  const starts = [0];
  for (let offset = text.indexOf('\n'); offset !== -1; offset = text.indexOf('\n', offset + 1)) {
    starts.push(offset + 1);
  }
  return starts;
}

function getSelectedLines(selection: string | undefined, lineCount: number) {
  const selected = new Set<number>();
  for (const item of (selection ?? '').split(',')) {
    const match = /^\s*(\d+)(?:\s*-\s*(\d+))?\s*$/.exec(item);
    if (!match) continue;
    const first = Math.max(1, Number(match[1]));
    const last = Math.min(lineCount, Number(match[2] ?? match[1]));
    for (let line = first; line <= last; line++) selected.add(line);
  }
  return selected;
}

function getLineLayout(
  pre: HTMLPreElement,
  code: HTMLElement,
  { nodes, starts, numbers, selected }: LineContent & LineOptions
) {
  const range = pre.ownerDocument.createRange();
  const style = getComputedStyle(code);
  const tops =
    numbers && style.whiteSpace === 'pre' && style.writingMode === 'horizontal-tb'
      ? getBatchedLineTops(range, nodes.length === 1 ? nodes[0]! : code, starts.length)
      : [];
  const hasBatchedTops = tops.length === starts.length;
  const getLineTop = createLineTopReader(range, { nodes, starts }, tops);
  const bounds = code.getBoundingClientRect();
  const geometry = {
    bounds,
    firstTop: getLineTop(0),
    preTop: pre.getBoundingClientRect().top,
    // Convert viewport measurements to local CSS pixels so decorations align under CSS scaling.
    scale: bounds.height / parseFloat(style.height) || 1
  };
  const gutter = hasBatchedTops ? getGutterGeometry(tops, starts.length, geometry) : undefined;
  const positions = getLinePositions(getLineTop, geometry, {
    lineCount: starts.length,
    numbers: numbers && !gutter,
    selected
  });
  return { positions, gutter };
}

function getBatchedLineTops(range: Range, node: Node, lineCount: number) {
  // A logical line can produce more than one rectangle. Use the batch only when it yields one distinct top per line.
  range.selectNodeContents(node);
  const tops: number[] = [];
  for (const rect of range.getClientRects()) {
    if (tops.at(-1) !== rect.top) tops.push(rect.top);
  }
  return tops.length === lineCount ? tops : [];
}

// Request uncached lines in source order. The text-node cursor only moves forward.
function createLineTopReader(range: Range, { nodes, starts }: LineContent, tops: number[]) {
  let nodeIndex = 0;
  let nodeStart = 0;
  return (index: number) => {
    if (tops[index] === undefined) {
      const offset = starts[index]!;
      while (nodeIndex < nodes.length - 1 && offset >= nodeStart + nodes[nodeIndex]!.length) {
        nodeStart += nodes[nodeIndex]!.length;
        nodeIndex++;
      }
      const node = nodes[nodeIndex]!;
      const localOffset = offset - nodeStart;
      range.setStart(node, localOffset);
      range.setEnd(node, Math.min(localOffset + 1, node.length));
      // Read individual rectangles so a zero-width newline can still supply the line's top.
      tops[index] = range.getClientRects()[0]?.top ?? 0;
    }
    return tops[index];
  };
}

function getGutterGeometry(tops: number[], lineCount: number, { bounds, firstTop, preTop, scale }: CodeGeometry) {
  const step = tops[1] === undefined ? bounds.height : tops[1] - firstTop;
  if (step <= 0 || Math.abs(bounds.height - step * lineCount) >= 0.1) {
    return;
  }
  if (!tops.every((top, index) => Math.abs(top - firstTop - step * index) < 0.1)) return undefined;
  return { top: (bounds.top - preTop) / scale, lineHeight: step / scale };
}

function getLinePositions(
  getLineTop: (index: number) => number,
  { bounds, firstTop, preTop, scale }: CodeGeometry,
  { lineCount, numbers, selected }: LineOptions & { lineCount: number }
) {
  const positions: LinePosition[] = [];
  const origin = bounds.top - firstTop;
  for (let index = 0; index < lineCount; index++) {
    if (!numbers && !selected.has(index + 1)) continue;
    const top = getLineTop(index) + origin;
    const bottom = index + 1 < lineCount ? getLineTop(index + 1) + origin : bounds.bottom;
    positions.push([index, (top - preTop) / scale, (bottom - top) / scale]);
  }
  return positions;
}

function updateGutter(layer: HTMLElement, lineCount: number, geometry?: GutterGeometry) {
  let gutter = layer.querySelector<HTMLElement>('[data-gutter]');
  if (!geometry) {
    gutter?.remove();
    return;
  }

  if (!gutter) {
    gutter = layer.ownerDocument.createElement('span');
    gutter.dataset.gutter = '';
    gutter.className = 'line-number';
    layer.prepend(gutter);
  }
  const labels = Array.from({ length: lineCount }, (_, index) => index + 1).join('\n');
  if (gutter.textContent !== labels) gutter.textContent = labels;
  gutter.style.top = `${geometry.top}px`;
  gutter.style.lineHeight = `${geometry.lineHeight}px`;
}

function updateLineRows(layer: HTMLElement, positions: LinePosition[], options: LineOptions) {
  const fragment = layer.ownerDocument.createDocumentFragment();
  const rows = layer.querySelectorAll<HTMLElement>('[data-line]');
  let count = 0;
  for (const position of positions) {
    const line = String(position[0] + 1);
    let row = rows[count];
    if (!row || row.dataset.line !== line) {
      const next = layer.ownerDocument.createElement('span');
      next.dataset.line = line;
      if (row) layer.replaceChild(next, row);
      else fragment.append(next);
      row = next;
    }
    updateLineRow(row, position, options);
    count++;
  }
  for (let index = count; index < rows.length; index++) rows[index]!.remove();
  layer.append(fragment);
}

function updateLineRow(row: HTMLElement, [index, top, height]: LinePosition, { selected, numbers }: LineOptions) {
  const name = `${selected.has(index + 1) ? 'selected-line ' : ''}${numbers ? 'line-number' : ''}`;
  if (row.className !== name) row.className = name;
  if (row.style.top !== `${top}px`) row.style.top = `${top}px`;
  if (row.style.height !== `${height}px`) row.style.height = `${height}px`;
  const label = numbers ? String(index + 1) : '';
  if (row.textContent !== label) row.textContent = label;
}
