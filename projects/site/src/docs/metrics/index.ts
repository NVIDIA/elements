// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { compareVersions } from 'compare-versions';
import { Chart } from 'chart.js/auto';
import { getThemeTokens } from '@nvidia-elements/core';
import { ReleasesService, TestsService, ApiService } from '@internals/metadata';
import { getWeeklyReleaseMilestones, getWeeklyReleaseTypeDistribution } from './release-data.js';

const tokens = getThemeTokens();
const releaseMetrics = await ReleasesService.getData();
const apiMetrics = await ApiService.getData();
const testMetrics = await TestsService.getData();

const componentReleases = apiMetrics.data.elements.reduce(
  (p, n) => ({ ...p, [n.name]: n.manifest?.metadata?.since ?? '' }),
  {} as Record<string, string>
);

const componentsByVersion = Object.entries(componentReleases)
  .filter(([_, version]) => version && version !== '') // Exclude empty versions
  .reduce(
    (acc, [component, version]) => {
      if (!acc[version]) acc[version] = [];
      acc[version].push(component);
      return acc;
    },
    {} as Record<string, string[]>
  );

const sortedReleaseVersions = Object.keys(componentsByVersion).sort((a, b) => {
  try {
    return compareVersions(a, b);
  } catch {
    return 0;
  }
});

const versionMilestones = sortedReleaseVersions.map((version, idx) => ({
  version,
  componentsAdded: componentsByVersion[version].length,
  componentNames: componentsByVersion[version],
  cumulativeTotal: sortedReleaseVersions.slice(0, idx + 1).reduce((sum, v) => sum + componentsByVersion[v].length, 0)
}));

const weeklyReleaseMilestones = getWeeklyReleaseMilestones(releaseMetrics.data);
const weeklyTypeData = getWeeklyReleaseTypeDistribution(releaseMetrics.data);

const releaseTypeDatasets = [
  {
    label: 'Features (minor)',
    data: weeklyTypeData.map(week => week.feat),
    borderColor: tokens['--nve-sys-visualization-categorical-grass'],
    backgroundColor: tokens['--nve-sys-visualization-categorical-grass'],
    borderWidth: 1,
    fill: false,
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 5
  },
  {
    label: 'Fixes (patch)',
    data: weeklyTypeData.map(week => week.fix),
    borderColor: tokens['--nve-sys-visualization-categorical-amber'],
    backgroundColor: tokens['--nve-sys-visualization-categorical-amber'],
    borderWidth: 1,
    fill: false,
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 5
  },
  {
    label: 'Breaking Changes (major)',
    data: weeklyTypeData.map(week => week.breaking),
    borderColor: tokens['--nve-sys-visualization-categorical-red'],
    backgroundColor: tokens['--nve-sys-visualization-categorical-red'],
    borderWidth: 1,
    fill: false,
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 5
  },
  {
    label: 'Total',
    data: weeklyTypeData.map(week => week.feat + week.fix + week.breaking),
    borderColor: tokens['--nve-sys-visualization-categorical-cyan'],
    backgroundColor: tokens['--nve-sys-visualization-categorical-cyan'],
    borderWidth: 1,
    fill: false,
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 5
  }
];

// Component Complexity Score Data
const coverageTestResults = Object.values(testMetrics.projects).flatMap(n => n.coverage.testResults);
const lighthouseTestResults = Object.values(testMetrics.projects).flatMap(n => n.lighthouse.testResults);

const coverageByComponent = new Map<string, { branches: number; coverage: number; count: number }>();
const lighthouseByComponent = new Map();
coverageTestResults.forEach(result => {
  if (result.file !== 'total') {
    const componentName = result.file.split('/')[0];
    if (!coverageByComponent.has(componentName)) {
      coverageByComponent.set(componentName, {
        branches: 0,
        coverage: 0,
        count: 0
      });
    }
    const component = coverageByComponent.get(componentName);
    component.branches += result.branches.total;
    component.coverage += result.branches.pct;
    component.count += 1;
  }
});

lighthouseTestResults.forEach(result => {
  const componentName = result.name.replace('nve-', '').replace('monaco-', '');
  lighthouseByComponent.set(componentName, {
    bundleSize: Math.min(result.payload.javascript.kb, 45),
    performance: result.scores.performance,
    accessibility: result.scores.accessibility
  });
});

interface ComplexityScoreDataPoint {
  x: number;
  y: number;
  r: number;
  label: string;
  coverage: number;
  performance: number;
  accessibility: number;
}

const complexityScoreData: ComplexityScoreDataPoint[] = [];
coverageByComponent.forEach((coverageData, componentName) => {
  const lighthouseData = lighthouseByComponent.get(componentName);
  if (lighthouseData && coverageData.branches > 0) {
    const avgCoverage = coverageData.coverage / coverageData.count;
    complexityScoreData.push({
      x: lighthouseData.bundleSize,
      y: coverageData.branches,
      r: lighthouseData.bundleSize / 2.5,
      label: componentName,
      coverage: avgCoverage,
      performance: lighthouseData.performance,
      accessibility: lighthouseData.accessibility
    });
  }
});

complexityScoreData.sort((a, b) => b.x - a.x);

// Test Distribution Data
const testDistribution = {
  unit: 0,
  visual: 0,
  axe: 0,
  ssr: 0,
  lighthouse: 0
};

Object.values(testMetrics.projects).forEach(project => {
  testDistribution.unit += project.unit.numPassedTests;
  testDistribution.visual += project.visual.numPassedTests;
  testDistribution.axe += project.axe.numPassedTests;
  testDistribution.ssr += project.ssr.numPassedTests;
  testDistribution.lighthouse += project.lighthouse.testResults.length;
});

new Chart(globalThis.document.getElementById('elements-growth-chart') as HTMLCanvasElement, {
  type: 'line',
  data: {
    labels: versionMilestones.map(m => `v${m.version}`),
    datasets: [
      {
        label: 'Total Elements',
        data: versionMilestones.map(m => m.cumulativeTotal),
        borderColor: tokens['--nve-sys-visualization-categorical-grass'],
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    scales: {
      x: {
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 9 },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        }
      },
      y: {
        title: {
          display: true,
          text: 'Total Elements',
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 11 }
        },
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 10 },
          stepSize: 5
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
          label: function (context) {
            const idx = context.dataIndex;
            const milestone = versionMilestones[idx];
            return [
              `Total: ${milestone.cumulativeTotal} elements`,
              `Added in this version: ${milestone.componentsAdded}`
            ];
          }
        }
      }
    }
  }
});

new Chart(globalThis.document.getElementById('total-releases-chart') as HTMLCanvasElement, {
  type: 'line',
  data: {
    labels: weeklyReleaseMilestones.map(m => m.formattedDate),
    datasets: [
      {
        label: 'Total Releases',
        data: weeklyReleaseMilestones.map(m => m.cumulativeTotal),
        borderColor: tokens['--nve-sys-visualization-categorical-grass'],
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    scales: {
      x: {
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
        title: {
          display: true,
          text: 'Cumulative Releases',
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
        display: false
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            const idx = context[0].dataIndex;
            const milestone = weeklyReleaseMilestones[idx];
            return milestone.formattedDate;
          },
          label: function (context) {
            const idx = context.dataIndex;
            const milestone = weeklyReleaseMilestones[idx];
            return [
              `Cumulative Total: ${milestone.cumulativeTotal}`,
              `Releases This Week: ${milestone.releasesThisWeek}`
            ];
          },
          afterLabel: function (context) {
            const idx = context.dataIndex;
            const milestone = weeklyReleaseMilestones[idx];
            const releaseNames = milestone.releases.slice(0, 5).map(r => `  • ${r.name}`);
            if (milestone.releases.length > 5) {
              releaseNames.push(`  ... and ${milestone.releases.length - 5} more`);
            }
            return releaseNames.length > 0 ? [' ', ...releaseNames] : [];
          }
        }
      }
    }
  }
});

new Chart(globalThis.document.getElementById('release-type-distribution-chart') as HTMLCanvasElement, {
  type: 'line',
  data: {
    labels: weeklyTypeData.map(week => week.formattedDate),
    datasets: releaseTypeDatasets
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    scales: {
      x: {
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 8 },
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
        title: {
          display: true,
          text: 'Releases per Week',
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 11 }
        },
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 10 },
          stepSize: 1
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
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            const idx = context[0].dataIndex;
            return weeklyTypeData[idx].formattedDate;
          },
          afterTitle: function (context) {
            const idx = context[0].dataIndex;
            const week = weeklyTypeData[idx];
            const total = week.feat + week.fix + week.breaking + week.chore;
            return `Total: ${total} releases`;
          },
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  }
});

new Chart(globalThis.document.getElementById('component-complexity-score-chart') as HTMLCanvasElement, {
  type: 'bubble',
  data: {
    datasets: [
      {
        label: 'Components',
        data: complexityScoreData,
        borderColor: complexityScoreData.map(d => {
          if (d.coverage >= 95) return tokens['--nve-sys-visualization-categorical-grass'];
          if (d.coverage >= 90) return tokens['--nve-sys-visualization-categorical-cyan'];
          if (d.coverage >= 85) return tokens['--nve-sys-visualization-categorical-amber'];
          return tokens['--nve-sys-visualization-categorical-red'];
        }),
        borderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Bundle Size (KB)',
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 11 }
        },
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 10 }
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Branches (Complexity)',
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
        display: false
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            const dataPoint = complexityScoreData[context[0].dataIndex];
            return `nve-${dataPoint.label}`;
          },
          label: function (context) {
            const dataPoint = complexityScoreData[context.dataIndex];
            return [
              `Bundle Size: ${dataPoint.x.toFixed(2)} KB`,
              `Branches: ${dataPoint.y}`,
              `Coverage: ${dataPoint.coverage.toFixed(2)}%`,
              `Performance: ${dataPoint.performance}`,
              `Accessibility: ${dataPoint.accessibility}`
            ];
          }
        }
      }
    }
  }
});

new Chart(globalThis.document.getElementById('test-distribution-chart') as HTMLCanvasElement, {
  type: 'doughnut',
  data: {
    labels: ['Unit Tests', 'Visual Tests', 'Accessibility Tests', 'SSR Tests', 'Lighthouse Tests'],
    datasets: [
      {
        label: 'Tests',
        data: [
          testDistribution.unit,
          testDistribution.visual,
          testDistribution.axe,
          testDistribution.ssr,
          testDistribution.lighthouse
        ],
        backgroundColor: [
          tokens['--nve-sys-visualization-categorical-grass'],
          tokens['--nve-sys-visualization-categorical-cyan'],
          tokens['--nve-sys-visualization-categorical-amber'],
          tokens['--nve-sys-visualization-categorical-violet'],
          tokens['--nve-sys-visualization-categorical-rose']
        ],
        borderWidth: 0
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          padding: 10,
          font: {
            size: 11
          },
          generateLabels: function (chart) {
            const data = chart.data;
            const total = data.datasets[0].data.reduce((sum: number, val) => sum + (val as number), 0);
            const bgColors = data.datasets[0].backgroundColor as string[];
            return (data.labels ?? []).map((label, index) => {
              const value = data.datasets[0].data[index] as number;
              const percentage = ((value / total) * 100).toFixed(1);
              return {
                text: `${label}: ${value.toLocaleString()} (${percentage}%)`,
                fillStyle: bgColors[index],
                strokeStyle: bgColors[index],
                fontColor: tokens['--nve-sys-text-emphasis-color'],
                hidden: false,
                index: index
              };
            });
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((sum: number, val) => sum + (val as number), 0);
            const value = context.parsed as number;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  }
});
