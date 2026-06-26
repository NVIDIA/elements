// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  getCdnVersionShareRows,
  getChannelMixPoints,
  getPackageDownloadTrend,
  getReleaseAdoptionTimeline
} from './adoption-data.js';

const adoptionFixture = {
  packages: [
    {
      name: '@nvidia-elements/core',
      status: 'published',
      latestVersion: '2.0.2',
      publishDates: [],
      npm: {
        total: 15,
        daily: [
          { date: '2026-06-01', count: 5 },
          { date: '2026-06-02', count: 10 }
        ]
      },
      cdn: {
        total: 100,
        daily: [
          { date: '2026-06-01', count: 40 },
          { date: '2026-06-02', count: 60 }
        ],
        versions: [
          { version: '2.0.1', total: 65, share: 65 },
          { version: '2.0.2', total: 30, share: 30 },
          { version: '0.1.4', total: 5, share: 5 }
        ],
        latestVersionShare: 30,
        topVersion: {
          version: '2.0.1',
          total: 65,
          share: 65
        }
      }
    },
    {
      name: '@nvidia-elements/code',
      status: 'published',
      latestVersion: '2.0.1',
      publishDates: [],
      npm: {
        total: 5,
        daily: [{ date: '2026-06-02', count: 5 }]
      },
      cdn: {
        total: 10,
        daily: [{ date: '2026-06-02', count: 10 }],
        versions: [{ version: '2.0.1', total: 10, share: 100 }],
        latestVersionShare: 100,
        topVersion: {
          version: '2.0.1',
          total: 10,
          share: 100
        }
      }
    },
    {
      name: '@nvidia-elements/lint',
      status: 'published',
      latestVersion: '2.0.1',
      publishDates: [],
      npm: {
        total: 40,
        daily: [
          { date: '2026-06-01', count: 25 },
          { date: '2026-06-02', count: 15 }
        ]
      },
      cdn: {
        total: 0,
        daily: [],
        versions: [],
        latestVersionShare: 0,
        topVersion: null
      }
    },
    {
      name: '@nvidia-elements/media',
      status: 'unavailable',
      latestVersion: null,
      publishDates: [],
      npm: {
        total: 0,
        daily: []
      },
      cdn: {
        total: 0,
        daily: [],
        versions: [],
        latestVersionShare: 0,
        topVersion: null
      }
    }
  ]
};

describe('adoption chart data', () => {
  it('should create package download totals for a stacked trend chart', () => {
    const trend = getPackageDownloadTrend(adoptionFixture);

    expect(trend.labels).toEqual(['2026-06-01', '2026-06-02']);
    expect(trend.packages).toEqual([
      { name: 'lint', total: 40, values: [25, 15] },
      { name: 'core', total: 15, values: [5, 10] },
      { name: 'code', total: 5, values: [0, 5] }
    ]);
  });

  it('should expose latest version share rows for CDN adoption', () => {
    expect(getCdnVersionShareRows(adoptionFixture)).toEqual([
      {
        name: 'core',
        latestVersion: '2.0.2',
        latestVersionShare: 30,
        latestVersionRequests: 30,
        topVersion: '2.0.1',
        topVersionShare: 65,
        topNonLatestVersion: '2.0.1',
        topNonLatestVersionShare: 65,
        topNonLatestVersionRequests: 65,
        otherVersionShare: 5,
        otherVersionRequests: 5,
        cdnRequests: 100
      },
      {
        name: 'code',
        latestVersion: '2.0.1',
        latestVersionShare: 100,
        latestVersionRequests: 10,
        topVersion: '2.0.1',
        topVersionShare: 100,
        topNonLatestVersion: 'none',
        topNonLatestVersionShare: 0,
        topNonLatestVersionRequests: 0,
        otherVersionShare: 0,
        otherVersionRequests: 0,
        cdnRequests: 10
      }
    ]);
  });

  it('should select the leading non-latest CDN version from unsorted versions', () => {
    const corePackage = adoptionFixture.packages[0];
    const rows = getCdnVersionShareRows({
      packages: [
        {
          ...corePackage,
          cdn: {
            ...corePackage.cdn,
            versions: [corePackage.cdn.versions[2], corePackage.cdn.versions[1], corePackage.cdn.versions[0]]
          }
        }
      ]
    });

    expect(rows[0]).toMatchObject({
      topNonLatestVersion: '2.0.1',
      topNonLatestVersionShare: 65,
      topNonLatestVersionRequests: 65
    });
  });

  it('should align release markers with adoption activity', () => {
    const timeline = getReleaseAdoptionTimeline({
      packages: adoptionFixture.packages.map((packageData, index) =>
        index === 0
          ? {
              ...packageData,
              publishDates: [{ version: '2.0.2', date: '2026-06-02T12:00:00.000Z' }]
            }
          : packageData
      )
    });

    expect(timeline).toEqual({
      labels: ['2026-06-01', '2026-06-02'],
      npmDownloads: [30, 30],
      cdnRequests: [40, 70],
      releaseMarkers: [{ date: '2026-06-02', label: 'core 2.0.2', value: 70 }]
    });
  });

  it('should expose npm and CDN channel mix points', () => {
    expect(getChannelMixPoints(adoptionFixture)).toEqual([
      { name: 'core', status: 'published', x: 15, y: 100 },
      { name: 'lint', status: 'published', x: 40, y: 0 },
      { name: 'code', status: 'published', x: 5, y: 10 },
      { name: 'media', status: 'unavailable', x: 0, y: 0 }
    ]);
  });
});
