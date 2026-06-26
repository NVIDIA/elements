// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getWeeklyReleaseMilestones, getWeeklyReleaseTypeDistribution } from './release-data.js';

const releaseFixture = [
  { name: 'core-v2.0.2', date: '2026-06-15T10:00:00.000Z' },
  { name: 'themes-v2.0.0', date: '2026-06-08T10:00:00.000Z' },
  { name: 'styles-v2.0.0', date: '2026-06-14T10:00:00.000Z' },
  { name: 'core-v2.0.0', date: '2026-06-01T10:00:00.000Z' },
  { name: 'core-v2.0.1', date: '2026-06-03T10:00:00.000Z' }
];

describe('release chart data', () => {
  it('should create weekly cumulative release milestones', () => {
    expect(getWeeklyReleaseMilestones(releaseFixture)).toEqual([
      {
        weekKey: '2026-06-01',
        formattedDate: 'Week of Jun 1, 2026',
        releasesThisWeek: 2,
        cumulativeTotal: 2,
        releases: [
          { name: 'core-v2.0.0', date: '2026-06-01T10:00:00.000Z' },
          { name: 'core-v2.0.1', date: '2026-06-03T10:00:00.000Z' }
        ]
      },
      {
        weekKey: '2026-06-08',
        formattedDate: 'Week of Jun 8, 2026',
        releasesThisWeek: 2,
        cumulativeTotal: 4,
        releases: [
          { name: 'themes-v2.0.0', date: '2026-06-08T10:00:00.000Z' },
          { name: 'styles-v2.0.0', date: '2026-06-14T10:00:00.000Z' }
        ]
      },
      {
        weekKey: '2026-06-15',
        formattedDate: 'Week of Jun 15, 2026',
        releasesThisWeek: 1,
        cumulativeTotal: 5,
        releases: [{ name: 'core-v2.0.2', date: '2026-06-15T10:00:00.000Z' }]
      }
    ]);
  });

  it('should group release types into Monday-based weeks', () => {
    expect(
      getWeeklyReleaseTypeDistribution([
        { name: 'core-v2.0.2', date: '2026-06-15T10:00:00.000Z', type: 'fix' },
        { name: 'themes-v2.0.0', date: '2026-06-14T10:00:00.000Z', type: 'feat' },
        { name: 'styles-v3.0.0', date: '2026-06-08T10:00:00.000Z', type: 'breaking' },
        { name: 'docs-v2.0.0', date: '2026-06-10T10:00:00.000Z', type: 'chore' },
        { name: 'forms-v2.0.1', date: '2026-06-09T10:00:00.000Z', type: 'fix' }
      ])
    ).toEqual([
      {
        weekKey: '2026-06-08',
        formattedDate: 'Week of Jun 8, 2026',
        fix: 1,
        feat: 1,
        breaking: 1,
        chore: 1
      },
      {
        weekKey: '2026-06-15',
        formattedDate: 'Week of Jun 15, 2026',
        fix: 1,
        feat: 0,
        breaking: 0,
        chore: 0
      }
    ]);
  });
});
