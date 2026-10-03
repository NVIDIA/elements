// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadGrammar } from '../compile.mjs';

for (const path of process.argv.slice(2)) {
  const grammar = await loadGrammar(path);
  const counts = {
    rules: 0,
    match: 0,
    beginEnd: 0,
    captures: 0,
    includes: 0,
    selfBase: 0,
    external: 0,
    dynamicEnd: 0,
    while: 0,
    applyEndPatternLast: 0,
    regexDialect: 0
  };
  const pending = [grammar];
  while (pending.length) {
    const rule = pending.pop();
    if (!rule || typeof rule !== 'object') continue;
    counts.rules++;
    if (rule.match) counts.match++;
    if (rule.begin && rule.end) counts.beginEnd++;
    if (rule.captures || rule.beginCaptures || rule.endCaptures || rule.whileCaptures) counts.captures++;
    if (rule.include) {
      counts.includes++;
      if (rule.include === '$self' || rule.include === '$base') counts.selfBase++;
      if (!rule.include.startsWith('#') && !rule.include.startsWith('$')) counts.external++;
    }
    if (rule.end && /\\[1-9]/.test(rule.end)) counts.dynamicEnd++;
    if (rule.while) counts.while++;
    if (rule.applyEndPatternLast) counts.applyEndPatternLast++;
    if (
      [rule.match, rule.begin, rule.end, rule.while].some(
        source => source && (/\\[AGKzRWh]/.test(source) || /\(\?x\)/.test(source))
      )
    )
      counts.regexDialect++;
    pending.push(...Object.values(rule.repository ?? {}), ...(rule.patterns ?? []));
  }
  console.log(`${path.split('/').slice(-2).join('/')}: ${JSON.stringify(counts)}`);
}
