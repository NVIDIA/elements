// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function removeNoiseWords(str: string) {
  const noiseWords = [
    'example',
    'examples',
    'story',
    'stories',
    'pattern',
    'patterns',
    'properties',
    'usage',
    'element',
    'component',
    'components',
    'available',
    'display',
    'displays',
    'for',
    'how',
    'and',
    'the',
    'from',
    'this'
  ];
  return removeWords(str, noiseWords);
}

export function removeWords(str: string, wordsToRemove: string[]) {
  const escapedWords = wordsToRemove.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');
  return str
    .toLowerCase()
    .replace(pattern, '')
    .replace(/\b\w{1,2}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fuzzyMatch(search: string, candidates: string[]) {
  const words = removeNoiseWords(search)
    .split(/[^a-z0-9\-]+/)
    .filter(w => w.length > 2);

  return candidates.filter(candidate => {
    const candidateParts = new Set(
      candidate
        .toLowerCase()
        .split(/[\/-]/)
        .filter(i => i !== 'nve')
    );
    return words.some(word => {
      return word.split(/[\/-]/).some(item => candidateParts.has(item));
    });
  });
}
