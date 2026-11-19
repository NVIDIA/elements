// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';
import type { Color } from '@nvidia-elements/core/internal';

describe('dot visual', () => {
  for (const theme of ['', 'dark'] as const) {
    test(`dot colors and shapes should match visual baseline ${theme || 'light'} theme`, async () => {
      const report = await visualRunner.render(`dot.color-shape${theme ? '.dark' : ''}`, colorShapeTemplate(theme));
      expect(report.maxDiffPercentage).toBeLessThan(1);
    });
  }

  test('dot should match visual baseline', async () => {
    const report = await visualRunner.render('dot', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('dot should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('dot.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/dot/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <div nve-layout="row gap:md">
    <nve-dot status="scheduled"></nve-dot>
    <nve-dot status="queued"></nve-dot>
    <nve-dot status="pending"></nve-dot>
    <nve-dot status="starting"></nve-dot>
    <nve-dot status="running"></nve-dot>
    <nve-dot status="restarting"></nve-dot>
    <nve-dot status="stopping"></nve-dot>
    <nve-dot status="finished"></nve-dot>
    <nve-dot status="failed"></nve-dot>
    <nve-dot status="unknown"></nve-dot>
  </div>
  <div nve-layout="row gap:md">
    <nve-dot></nve-dot>
    <nve-dot status="accent"></nve-dot>
    <nve-dot status="warning"></nve-dot>
    <nve-dot status="success"></nve-dot>
    <nve-dot status="danger"></nve-dot>
  </div>
  `;
}

function colorShapeTemplate(theme: '' | 'dark') {
  const colors: Color[] = [
    'red-cardinal',
    'gray-slate',
    'gray-denim',
    'blue-indigo',
    'blue-cobalt',
    'blue-sky',
    'teal-cyan',
    'green-mint',
    'teal-seafoam',
    'green-grass',
    'yellow-amber',
    'orange-pumpkin',
    'red-tomato',
    'pink-magenta',
    'purple-plum',
    'purple-violet',
    'purple-lavender',
    'pink-rose',
    'green-jade',
    'lime-pear',
    'yellow-nova',
    'brand-green'
  ];

  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/dot/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div nve-layout="column gap:sm">
      ${(['circle', 'square'] as const)
        .map(
          shape => /* html */ `
        <div nve-layout="row gap:sm">
          ${colors.map(color => /* html */ `<nve-dot color="${color}" shape="${shape}" size="lg"></nve-dot>`).join('')}
        </div>
      `
        )
        .join('')}
    </div>
  `;
}
