// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

interface ReleaseLike {
  name: string;
  date: string;
}

type ReleaseType = 'fix' | 'feat' | 'breaking' | 'chore';

interface ReleaseWithType extends ReleaseLike {
  type: ReleaseType;
}

export interface WeeklyReleaseMilestone {
  weekKey: string;
  formattedDate: string;
  releasesThisWeek: number;
  cumulativeTotal: number;
  releases: ReleaseLike[];
}

interface WeeklyReleaseBucket<T extends ReleaseLike> {
  weekKey: string;
  weekStartDate: Date;
  releases: T[];
}

export interface WeeklyReleaseTypeDistribution {
  weekKey: string;
  formattedDate: string;
  fix: number;
  feat: number;
  breaking: number;
  chore: number;
}

const WEEK_START_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC'
});

function getWeekStartDate(dateValue: string): Date {
  const date = new Date(dateValue);
  const weekStartDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (weekStartDate.getUTCDay() + 6) % 7;
  weekStartDate.setUTCDate(weekStartDate.getUTCDate() - daysSinceMonday);

  return weekStartDate;
}

function getWeekKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getFormattedWeekStart(date: Date): string {
  return `Week of ${WEEK_START_FORMATTER.format(date)}`;
}

function getSortedReleases<T extends ReleaseLike>(releases: T[]): T[] {
  return [...releases].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function getWeeklyReleaseBuckets<T extends ReleaseLike>(releases: T[]): WeeklyReleaseBucket<T>[] {
  const buckets = getSortedReleases(releases).reduce<Record<string, WeeklyReleaseBucket<T>>>((acc, release) => {
    const weekStartDate = getWeekStartDate(release.date);
    const weekKey = getWeekKey(weekStartDate);

    acc[weekKey] ??= {
      weekKey,
      weekStartDate,
      releases: []
    };

    acc[weekKey].releases.push(release);

    return acc;
  }, {});

  return Object.values(buckets).sort((a, b) => a.weekStartDate.getTime() - b.weekStartDate.getTime());
}

export function getWeeklyReleaseMilestones(releases: ReleaseLike[]): WeeklyReleaseMilestone[] {
  let cumulativeTotal = 0;

  return getWeeklyReleaseBuckets(releases).map(bucket => {
    cumulativeTotal += bucket.releases.length;

    return {
      weekKey: bucket.weekKey,
      formattedDate: getFormattedWeekStart(bucket.weekStartDate),
      releasesThisWeek: bucket.releases.length,
      cumulativeTotal,
      releases: bucket.releases
    };
  });
}

export function getWeeklyReleaseTypeDistribution(releases: ReleaseWithType[]): WeeklyReleaseTypeDistribution[] {
  return getWeeklyReleaseBuckets(releases).map(bucket => {
    const distribution: WeeklyReleaseTypeDistribution = {
      weekKey: bucket.weekKey,
      formattedDate: getFormattedWeekStart(bucket.weekStartDate),
      fix: 0,
      feat: 0,
      breaking: 0,
      chore: 0
    };

    for (const release of bucket.releases) {
      distribution[release.type]++;
    }

    return distribution;
  });
}
