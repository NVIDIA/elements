// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Chart } from 'chart.js/auto';
import { getThemeTokens } from '@nvidia-elements/core';
import { AdoptionService } from '@internals/metadata';
import {
  getCdnVersionShareRows,
  getChannelMixPoints,
  getPackageDownloadTrend,
  getReleaseAdoptionTimeline
} from './adoption-data.js';

const tokens = getThemeTokens();
const adoption = await AdoptionService.getData();
const packageDownloadTrend = getPackageDownloadTrend(adoption);
const cdnVersionShareRows = getCdnVersionShareRows(adoption);
const channelMixPoints = getChannelMixPoints(adoption);
const releaseAdoptionTimeline = getReleaseAdoptionTimeline(adoption);
const chartColors = [
  tokens['--nve-sys-visualization-categorical-grass'],
  tokens['--nve-sys-visualization-categorical-cyan'],
  tokens['--nve-sys-visualization-categorical-amber'],
  tokens['--nve-sys-visualization-categorical-violet'],
  tokens['--nve-sys-visualization-categorical-rose'],
  tokens['--nve-sys-visualization-categorical-red']
];

function getCanvas(id: string): HTMLCanvasElement {
  return globalThis.document.getElementById(id) as HTMLCanvasElement;
}

function getChartColor(index: number): string {
  return chartColors[index % chartColors.length] ?? tokens['--nve-sys-visualization-categorical-grass'];
}

function getCurrencyFormat(value: number): string {
  return value.toLocaleString();
}

function getVersionShareLabel(version: string, share: number, requests: number): string {
  return `${version}: ${share.toFixed(1)}% (${getCurrencyFormat(requests)} requests)`;
}

function getCdnVersionTooltipLabel(row: (typeof cdnVersionShareRows)[number], datasetLabel?: string): string {
  if (datasetLabel === 'Latest version') {
    return `Latest ${getVersionShareLabel(row.latestVersion, row.latestVersionShare, row.latestVersionRequests)}`;
  }

  if (datasetLabel === 'Leading non-latest version') {
    return row.topNonLatestVersion === 'none'
      ? 'No non-latest version traffic'
      : `Top non-latest ${getVersionShareLabel(
          row.topNonLatestVersion,
          row.topNonLatestVersionShare,
          row.topNonLatestVersionRequests
        )}`;
  }

  return `Other versions: ${row.otherVersionShare.toFixed(1)}% (${getCurrencyFormat(row.otherVersionRequests)} requests)`;
}

new Chart(getCanvas('adoption-downloads-chart'), {
  type: 'bar',
  data: {
    labels: packageDownloadTrend.labels,
    datasets: packageDownloadTrend.packages.map((packageData, index) => ({
      label: packageData.name,
      data: packageData.values,
      backgroundColor: getChartColor(index),
      borderWidth: 0
    }))
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.1,
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 9 },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 12
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Downloads',
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 11 }
        },
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 10 }
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: tokens['--nve-sys-text-emphasis-color'],
          usePointStyle: true,
          font: { size: 10 }
        }
      },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${getCurrencyFormat(context.parsed.y)} downloads`
        }
      }
    }
  }
});

new Chart(getCanvas('adoption-cdn-version-chart'), {
  type: 'bar',
  data: {
    labels: cdnVersionShareRows.map(row => row.name),
    datasets: [
      {
        label: 'Latest version',
        data: cdnVersionShareRows.map(row => row.latestVersionShare),
        backgroundColor: tokens['--nve-sys-visualization-categorical-grass'],
        stack: 'versions',
        borderWidth: 0
      },
      {
        label: 'Leading non-latest version',
        data: cdnVersionShareRows.map(row => row.topNonLatestVersionShare),
        backgroundColor: tokens['--nve-sys-visualization-categorical-amber'],
        stack: 'versions',
        borderWidth: 0
      },
      {
        label: 'Other versions',
        data: cdnVersionShareRows.map(row => row.otherVersionShare),
        backgroundColor: tokens['--nve-ref-border-color-muted'],
        stack: 'versions',
        borderWidth: 0
      }
    ]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.1,
    scales: {
      x: {
        stacked: true,
        max: 100,
        title: {
          display: true,
          text: 'jsDelivr Request Share',
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 11 }
        },
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          callback: value => `${value}%`
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        }
      },
      y: {
        stacked: true,
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 10 }
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: tokens['--nve-sys-text-emphasis-color'],
          usePointStyle: true,
          font: { size: 10 }
        }
      },
      tooltip: {
        callbacks: {
          title: context => {
            const row = cdnVersionShareRows[context[0].dataIndex];

            return row ? `${row.name}: ${getCurrencyFormat(row.cdnRequests)} CDN requests` : '';
          },
          label: context => {
            const row = cdnVersionShareRows[context.dataIndex];
            return row ? getCdnVersionTooltipLabel(row, context.dataset.label) : '';
          }
        }
      }
    }
  }
});

new Chart(getCanvas('adoption-channel-mix-chart'), {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'Packages',
        data: channelMixPoints,
        backgroundColor: channelMixPoints.map(point =>
          point.status === 'unavailable'
            ? tokens['--nve-ref-border-color-muted']
            : point.status === 'partial'
              ? tokens['--nve-sys-visualization-categorical-amber']
              : tokens['--nve-sys-visualization-categorical-grass']
        ),
        borderWidth: 0,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.1,
    scales: {
      x: {
        title: {
          display: true,
          text: 'npm Downloads',
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 11 }
        },
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color']
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        },
        beginAtZero: true
      },
      y: {
        title: {
          display: true,
          text: 'CDN Requests',
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 11 }
        },
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color']
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: context => {
            const point = channelMixPoints[context.dataIndex];
            return point
              ? [
                  point.name,
                  `npm: ${getCurrencyFormat(point.x)}`,
                  `CDN: ${getCurrencyFormat(point.y)}`,
                  `Status: ${point.status}`
                ]
              : [];
          }
        }
      }
    }
  }
});

new Chart(getCanvas('adoption-release-overlay-chart'), {
  type: 'line',
  data: {
    labels: releaseAdoptionTimeline.labels,
    datasets: [
      {
        label: 'npm Downloads',
        data: releaseAdoptionTimeline.npmDownloads,
        borderColor: tokens['--nve-sys-visualization-categorical-grass'],
        backgroundColor: tokens['--nve-sys-visualization-categorical-grass'],
        borderWidth: 2,
        tension: 0.35
      },
      {
        label: 'CDN Requests',
        data: releaseAdoptionTimeline.cdnRequests,
        borderColor: tokens['--nve-sys-visualization-categorical-cyan'],
        backgroundColor: tokens['--nve-sys-visualization-categorical-cyan'],
        borderWidth: 2,
        tension: 0.35
      },
      {
        label: 'Releases',
        type: 'scatter',
        data: releaseAdoptionTimeline.releaseMarkers.map(marker => ({
          x: marker.date,
          y: marker.value
        })),
        backgroundColor: tokens['--nve-sys-visualization-categorical-amber'],
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.1,
    scales: {
      x: {
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 9 },
          autoSkip: true,
          maxTicksLimit: 12,
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        }
      },
      y: {
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color']
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: tokens['--nve-sys-text-emphasis-color'],
          usePointStyle: true,
          font: { size: 10 }
        }
      },
      tooltip: {
        callbacks: {
          label: context => {
            const marker = releaseAdoptionTimeline.releaseMarkers[context.dataIndex];

            if (context.dataset.label === 'Releases' && marker) {
              return marker.label;
            }

            return `${context.dataset.label}: ${getCurrencyFormat(context.parsed.y)}`;
          }
        }
      }
    }
  }
});

new Chart(getCanvas('adoption-github-interest-chart'), {
  type: 'line',
  data: {
    labels: adoption.github.stargazers.map(stargazer => stargazer.month),
    datasets: [
      {
        label: 'Stars Added',
        data: adoption.github.stargazers.map(stargazer => stargazer.stars),
        borderColor: tokens['--nve-sys-visualization-categorical-amber'],
        backgroundColor: tokens['--nve-sys-visualization-categorical-amber'],
        borderWidth: 2,
        tension: 0.35
      },
      {
        label: 'Cumulative Stars',
        data: adoption.github.stargazers.map(stargazer => stargazer.cumulativeStars),
        borderColor: tokens['--nve-sys-visualization-categorical-grass'],
        backgroundColor: tokens['--nve-sys-visualization-categorical-grass'],
        borderWidth: 2,
        tension: 0.35
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.1,
    scales: {
      x: {
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color']
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        }
      },
      y: {
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color']
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: tokens['--nve-sys-text-emphasis-color'],
          usePointStyle: true,
          font: { size: 10 }
        }
      }
    }
  }
});
