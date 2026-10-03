// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** @hotPath */
function firstPast(items, offset, field) {
  let low = 0;
  let high = items.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (items[middle][field] <= offset) low = middle + 1;
    else high = middle;
  }
  return low;
}

/** @hotPath */
function sameState(left, right) {
  if (!right || left[1] !== right[1] || left[2] !== right[2] || left[3].length !== right[3].length) {
    return false;
  }
  for (let i = 0; i < left[3].length; i++) {
    if (left[3][i] !== right[3][i]) return false;
  }
  return true;
}

function appendRange(ranges, start, end, category) {
  if (end <= start) return;
  const last = ranges.length - 1;
  const previous = ranges[last];
  if (previous?.[1] === start && previous[2] === category) {
    ranges[last] = [previous[0], end, category];
  } else {
    ranges.push([start, end, category]);
  }
}

function countLineBreaks(text) {
  let count = 0;
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) count++;
  return count;
}

export function createDocument(scan, text, checkpointStride = 1) {
  if (!Number.isInteger(checkpointStride) || checkpointStride < 1) {
    throw new RangeError('Checkpoint stride must be a positive integer');
  }
  const checkpoints = [];
  const ranges = scan(text, undefined, checkpoints, undefined, checkpointStride);
  return { text, ranges, checkpoints, reusedFrom: null, checkpointStride };
}

export function editDocument(scan, previous, start, end, insertion) {
  if (start < 0 || end < start || end > previous.text.length) throw new RangeError('Invalid edit range');
  const text = previous.text.slice(0, start) + insertion + previous.text.slice(end);
  const delta = insertion.length - (end - start);
  const lineDelta = countLineBreaks(insertion) - countLineBreaks(previous.text.slice(start, end));
  const checkpointStride = previous.checkpointStride ?? 1;
  const oldCheckpoints = previous.checkpoints;
  const startIndex = firstPast(oldCheckpoints, start, 0) - 1;
  const startState = oldCheckpoints[startIndex];
  const checkpoints = oldCheckpoints.slice(0, startIndex);
  let reusedFrom = null;
  const changed = scan(
    text,
    startState,
    checkpoints,
    lineState => {
      // Only compare states once the remaining text is the unchanged old suffix.
      if (lineState[0] < start + insertion.length) return false;
      const oldOffset = lineState[0] - delta;
      if (oldOffset < end) return false;
      const oldIndex = firstPast(oldCheckpoints, oldOffset, 0) - 1;
      const oldState = oldCheckpoints[oldIndex];
      if (oldState?.[0] !== oldOffset || !sameState(lineState, oldState)) return false;
      reusedFrom = [lineState[0], oldOffset, oldIndex];
      return true;
    },
    checkpointStride
  );

  const oldRanges = previous.ranges;
  const prefixEnd = firstPast(oldRanges, startState[0], 1);
  const ranges = oldRanges.slice(0, prefixEnd);
  const crossing = oldRanges[prefixEnd];
  if (crossing && crossing[0] < startState[0]) {
    appendRange(ranges, crossing[0], startState[0], crossing[2]);
  }
  for (const [from, to, category] of changed) appendRange(ranges, from, to, category);
  if (reusedFrom) {
    const [, oldOffset, oldIndex] = reusedFrom;
    const suffixStart = firstPast(oldRanges, oldOffset, 1);
    for (let i = suffixStart; i < oldRanges.length; i++) {
      const [from, to, category] = oldRanges[i];
      appendRange(ranges, Math.max(from, oldOffset) + delta, to + delta, category);
    }
    for (let i = oldIndex + 1; i < oldCheckpoints.length; i++) {
      const saved = oldCheckpoints[i];
      checkpoints.push([saved[0] + delta, saved[1], saved[2], saved[3], saved[4] + lineDelta]);
    }
  }
  return { text, ranges, checkpoints, reusedFrom: reusedFrom?.[0] ?? null, checkpointStride };
}
