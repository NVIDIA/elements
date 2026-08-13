// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const ELLIPSIS = '…';

type TruncatePosition = 'start' | 'center' | 'end';
type TruncateStrategy = 'character' | 'word' | 'path';
type TruncateBias = 'start' | 'end';

export function normalizeTruncateText(nodes: Iterable<Node>): string {
  return normalizeTruncateString(Array.from(nodes, node => node.textContent ?? '').join(' '));
}

export function normalizeTruncateString(text: string): string {
  return text.replace(/\s+/gu, ' ').trim();
}

export function truncateText(
  text: string,
  {
    position,
    strategy,
    bias,
    preserve,
    availableWidth,
    measureText
  }: {
    position: TruncatePosition;
    strategy: TruncateStrategy;
    bias: TruncateBias;
    preserve: number;
    availableWidth: number;
    measureText: (value: string) => number;
  }
): string {
  if (!text || !Number.isFinite(availableWidth)) return text;
  if (availableWidth <= 0) return '';
  if (measureText(text) <= availableWidth) return text;
  if (measureText(ELLIPSIS) > availableWidth) return ELLIPSIS;

  switch (position) {
    case 'start':
      return truncateStart(segmentText(text, 'grapheme'), availableWidth, measureText);
    case 'center':
      return truncateMiddle(text, { strategy, bias, preserve, availableWidth, measureText });
    case 'end':
    default:
      return truncateEnd(segmentText(text, 'grapheme'), availableWidth, measureText);
  }
}

function truncateMiddle(
  text: string,
  {
    strategy,
    bias,
    preserve,
    availableWidth,
    measureText
  }: {
    strategy: TruncateStrategy;
    bias: TruncateBias;
    preserve: number;
    availableWidth: number;
    measureText: (value: string) => number;
  }
): string {
  const units = getUnits(text, strategy, bias);
  const preserveCount = Math.min(units.length, normalizePreserve(preserve));

  if (bias === 'start') {
    const preservedUnits = units.slice(0, preserveCount);
    const truncatableUnits = units.slice(preserveCount);
    const candidate = (count: number) =>
      joinWithEllipsis(preservedUnits.join(''), truncatableUnits.slice(-count || truncatableUnits.length).join(''));

    if (measureText(candidate(0)) > availableWidth) {
      return truncateEnd(preservedUnits, availableWidth, measureText);
    }

    return candidate(findLargestFittingCount(truncatableUnits.length, candidate, { availableWidth, measureText }));
  }

  const truncatableUnits = units.slice(0, units.length - preserveCount);
  const preservedUnits = units.slice(units.length - preserveCount);
  const candidate = (count: number) =>
    joinWithEllipsis(truncatableUnits.slice(0, count).join(''), preservedUnits.join(''));

  if (measureText(candidate(0)) > availableWidth) {
    return truncateStart(preservedUnits, availableWidth, measureText);
  }

  return candidate(findLargestFittingCount(truncatableUnits.length, candidate, { availableWidth, measureText }));
}

function truncateStart(units: string[], availableWidth: number, measureText: (value: string) => number): string {
  const candidate = (count: number) => `${ELLIPSIS}${units.slice(-count || units.length).join('')}`;
  return candidate(findLargestFittingCount(units.length - 1, candidate, { availableWidth, measureText }));
}

function truncateEnd(units: string[], availableWidth: number, measureText: (value: string) => number): string {
  const candidate = (count: number) => `${units.slice(0, count).join('')}${ELLIPSIS}`;
  return candidate(findLargestFittingCount(units.length - 1, candidate, { availableWidth, measureText }));
}

function findLargestFittingCount(
  maximum: number,
  candidate: (count: number) => string,
  {
    availableWidth,
    measureText
  }: {
    availableWidth: number;
    measureText: (value: string) => number;
  }
): number {
  let lower = 0;
  let upper = maximum;
  let fitting = 0;

  while (lower <= upper) {
    const count = Math.floor((lower + upper) / 2);

    if (measureText(candidate(count)) <= availableWidth) {
      fitting = count;
      lower = count + 1;
    } else {
      upper = count - 1;
    }
  }

  return fitting;
}

function joinWithEllipsis(start: string, end: string): string {
  return `${start.trimEnd()}${ELLIPSIS}${end.trimStart()}`;
}

function normalizePreserve(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
}

function segmentText(text: string, granularity: 'grapheme' | 'word'): string[] {
  const segments = new Intl.Segmenter(undefined, { granularity }).segment(text);
  return Array.from(segments, segment => segment.segment);
}

function mergeWhitespace(segments: string[], bias: TruncateBias): string[] {
  return bias === 'start' ? mergeFollowingWhitespace(segments) : mergePrecedingWhitespace(segments);
}

function mergeFollowingWhitespace(segments: string[]): string[] {
  const units: string[] = [];

  for (const segment of segments) {
    if (segment.trim()) units.push(segment);
    else appendToLastUnit(units, segment);
  }

  return units;
}

function mergePrecedingWhitespace(segments: string[]): string[] {
  const units: string[] = [];
  let whitespace = '';

  for (const segment of segments) {
    if (segment.trim()) {
      units.push(whitespace + segment);
      whitespace = '';
    } else {
      whitespace += segment;
    }
  }

  appendToLastUnit(units, whitespace);

  return units;
}

function appendToLastUnit(units: string[], text: string): void {
  const previous = units.at(-1);
  if (previous !== undefined) units[units.length - 1] = previous + text;
}

function splitPathUnits(text: string, bias: TruncateBias): string[] {
  const pathSegments = Array.from(text.matchAll(/[^/\\]+/gu));
  if (pathSegments.length === 0) return [text];

  if (bias === 'start') {
    return pathSegments.map((segment, index) => {
      const start = index === 0 ? 0 : segment.index;
      const end = pathSegments[index + 1]?.index ?? text.length;
      return text.slice(start, end);
    });
  }

  return pathSegments.map((segment, index) => {
    const previous = pathSegments[index - 1];
    const start = previous ? previous.index + previous[0].length : 0;
    const end = index === pathSegments.length - 1 ? text.length : segment.index + segment[0].length;
    return text.slice(start, end);
  });
}

function getUnits(text: string, strategy: TruncateStrategy, bias: TruncateBias): string[] {
  switch (strategy) {
    case 'word': {
      const units = mergeWhitespace(segmentText(text, 'word'), bias);
      return units.length ? units : [text];
    }
    case 'path': {
      const units = splitPathUnits(text, bias);
      return units.length ? units : [text];
    }
    case 'character':
    default:
      return segmentText(text, 'grapheme');
  }
}
