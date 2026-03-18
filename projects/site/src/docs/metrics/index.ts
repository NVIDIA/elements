import { compareVersions } from 'compare-versions';
import { Chart } from 'chart.js/auto';
import { getThemeTokens } from '@nvidia-elements/core';
import {
  UsageService,
  DownloadsService,
  ReleasesService,
  TestsService,
  type ProjectUsage,
  ApiService
} from '@internals/metadata';

const tokens = getThemeTokens();
const usageMetrics = await UsageService.getData();
const downloadMetrics = await DownloadsService.getData();
const releaseMetrics = await ReleasesService.getData();
const apiMetrics = await ApiService.getData();
const testMetrics = await TestsService.getData();
const projectElementReferences = usageMetrics.projects.reduce(
  (p, n) => ({ ...p, [n.name]: n.elements }),
  {} as Record<string, { name: string; total: unknown }[]>
);

const colors = [
  tokens['--nve-sys-visualization-categorical-grass'],
  tokens['--nve-sys-visualization-categorical-cyan'],
  tokens['--nve-sys-visualization-categorical-seafoam'],
  tokens['--nve-sys-visualization-categorical-pear'],
  tokens['--nve-sys-visualization-categorical-nova'],
  tokens['--nve-sys-visualization-categorical-amber'],
  tokens['--nve-sys-visualization-categorical-pumpkin'],
  tokens['--nve-sys-visualization-categorical-red'],
  tokens['--nve-sys-visualization-categorical-rose'],
  tokens['--nve-sys-visualization-categorical-lavender'],
  tokens['--nve-sys-visualization-categorical-violet']
];

const sortedPackages = [...downloadMetrics.packages].sort((a, b) => b.totalDownloads - a.totalDownloads);
const packageLabels = sortedPackages.map(pkg => pkg.package);
const instanceNames = [...new Set(sortedPackages.flatMap(pkg => pkg.instances.map(inst => inst.name)))];
const stackedDatasets = instanceNames.map((instanceName, index) => {
  const data = sortedPackages.map(pkg => {
    const instance = pkg.instances.find(inst => inst.name === instanceName);
    return instance ? instance.totalDownloads : 0;
  });

  return {
    label: instanceName,
    data: data,
    backgroundColor:
      index === 0
        ? tokens['--nve-sys-visualization-categorical-slate']
        : tokens['--nve-sys-visualization-categorical-grass'],
    borderWidth: 0
  };
});

const topProjectsByAdoption = Object.entries(
  usageMetrics.projects.reduce(
    (p, n) => ({ ...p, [n.name]: n.elementReferenceTotal + n.importReferenceTotal }),
    {} as Record<string, number>
  )
)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25);

const repoAdoption = usageMetrics.projects.reduce(
  (p, n) => {
    const repo = n.url.split('.com')[0].replace('https://', '') + '.com';
    return { ...p, [repo]: (p[repo] ?? 0) + 1 };
  },
  {} as Record<string, number>
);

const components = Object.values(projectElementReferences)
  .flatMap(n => n)
  .reduce(
    (p, n: { name: string; total: unknown }) => {
      const total = n.total as number;
      let name = n.name.replace('nve-', '');
      if (
        name.startsWith('grid-') ||
        name.includes('header') ||
        name.includes('footer') ||
        name.includes('content') ||
        name.includes('item') ||
        name.includes('group') ||
        name.includes('control')
      ) {
        name = name.split('-')[0];
      }
      return { ...p, [name]: (p[name] ?? 0) + total };
    },
    {} as Record<string, number>
  );

const topComponents = Object.entries(components)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25);

const versions = usageMetrics.projects.reduce(
  (p, n) => {
    return {
      ...p,
      [n.elementsVersion.replace('^', '').replace('~', '')]:
        (p[n.elementsVersion.replace('^', '').replace('~', '')] ?? 0) + 1
    };
  },
  {} as Record<string, number>
);

const sortedVersions = Object.entries(versions).sort((a, b) => {
  try {
    return compareVersions(b[0], a[0]);
  } catch {
    return a[0].includes('latest') ? 1 : -1;
  }
});

const versionUsage = Object.entries(
  sortedVersions.reduce(
    (p, n) => {
      if (n[0].includes('.')) {
        const [major, minor] = n[0].split('.');
        const formatted = `${major}.${minor.length > 1 ? minor[0] + 'x' : minor}.0`;
        const versionNumber = formatted.startsWith('0') ? '0.0.x' : formatted;
        return { ...p, [versionNumber]: (p[versionNumber] ?? 0) + n[1] };
      } else {
        return p;
      }
    },
    {} as Record<string, number>
  )
);

const allVersions: { label: string; downloads: number; package: string }[] = [];
sortedPackages.forEach(pkg => {
  pkg.versions.forEach(version => {
    allVersions.push({
      label: pkg.package + ' v' + version.version,
      downloads: version.totalDownloads,
      package: pkg.package
    });
  });
});

const topVersions = allVersions.sort((a, b) => b.downloads - a.downloads).slice(0, 15);

const packageColorMap = new Map();
sortedPackages.forEach((pkg, index) => {
  packageColorMap.set(pkg.package, colors[index % colors.length]);
});

const totalURMDownloads = downloadMetrics.packages.reduce(
  (sum, pkg) => sum + (pkg.instances.find(inst => inst.name === 'registry.npmjs.org')?.totalDownloads ?? 0),
  0
);
const totalAVInfraDownloads = downloadMetrics.packages.reduce(
  (sum, pkg) => sum + (pkg.instances.find(inst => inst.name === 'artifactory.build.nvidia.com')?.totalDownloads ?? 0),
  0
);

const elementReferenceTotal = usageMetrics.projects.reduce((p, n) => p + n.elementReferenceTotal, 0);
const attributeReferenceTotal = usageMetrics.projects.reduce((p, n) => p + n.attributeReferenceTotal, 0);
const importReferenceTotal = usageMetrics.projects.reduce((p, n) => p + n.importReferenceTotal, 0);
const styleReferenceTotal = usageMetrics.projects.reduce((p, n) => p + n.styleReferenceTotal, 0);
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

const sortedReleases = [...releaseMetrics.data].reverse();

const releasesByMonth = sortedReleases.reduce(
  (acc, release) => {
    const date = new Date(release.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthKey,
        date,
        count: 0,
        releases: []
      };
    }

    acc[monthKey].count++;
    acc[monthKey].releases.push(release);
    return acc;
  },
  {} as Record<string, { monthKey: string; date: Date; count: number; releases: typeof sortedReleases }>
);

const monthlyData = Object.values(releasesByMonth).sort((a, b) => a.date.getTime() - b.date.getTime());

let cumulativeTotal = 0;
const monthlyMilestones = monthlyData.map(month => {
  cumulativeTotal += month.count;
  return {
    monthKey: month.monthKey,
    date: month.date,
    releasesThisMonth: month.count,
    cumulativeTotal,
    formattedDate: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(month.date),
    releases: month.releases
  };
});

// Release Type Distribution Data
type ReleaseWithType = { name: string; version: string; date: string; type: 'fix' | 'feat' | 'breaking' | 'chore' };

const releaseTypesByMonth = sortedReleases.reduce(
  (acc, release) => {
    const date = new Date(release.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthKey,
        date,
        fix: 0,
        feat: 0,
        breaking: 0,
        chore: 0
      };
    }

    const releaseWithType = release as unknown as ReleaseWithType;
    if (releaseWithType.type) {
      acc[monthKey][releaseWithType.type]++;
    }
    return acc;
  },
  {} as Record<string, { monthKey: string; date: Date; fix: number; feat: number; breaking: number; chore: number }>
);

const monthlyTypeData = Object.values(releaseTypesByMonth).sort((a, b) => a.date.getTime() - b.date.getTime());

const releaseTypeDatasets = [
  {
    label: 'Features (minor)',
    data: monthlyTypeData.map(m => m.feat),
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
    data: monthlyTypeData.map(m => m.fix),
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
    data: monthlyTypeData.map(m => m.breaking),
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
    data: monthlyTypeData.map(m => m.feat + m.fix + m.breaking),
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
const coverageTestResults = Object.values(testMetrics.projects)
  .flatMap(n => n.coverage.testResults)
  .filter(n => {
    const name = n.file.split('/')[0];
    return components[name] !== undefined || components[`monaco-${name}`] !== undefined;
  });
const lighthouseTestResults = Object.values(testMetrics.projects).flatMap(n => n.lighthouse.testResults);

const coverageByComponent = new Map();
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

const relativeAdoptionDatasets = sortedPackages
  .filter(pkg => !pkg.package.includes('@elements'))
  .map(pkg => {
    const sortedVersions = [...pkg.versions].sort((a, b) => {
      try {
        return compareVersions(a.version, b.version);
      } catch {
        return 0;
      }
    });

    const totalVersions = sortedVersions.length;

    let cumulative = 0;
    const cumulativeData = sortedVersions.map((version, index) => {
      cumulative += version.totalDownloads;
      const percentage = ((index + 1) / totalVersions) * 100;
      return {
        x: percentage,
        y: cumulative,
        version: version.version,
        versionIndex: index + 1
      };
    });

    return {
      label: pkg.package,
      data: cumulativeData,
      borderColor: packageColorMap.get(pkg.package),
      backgroundColor: packageColorMap.get(pkg.package),
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 0.5,
      pointHoverRadius: 1
    };
  });

new Chart(globalThis.document.getElementById('top-components-chart') as HTMLCanvasElement, {
  type: 'bar',
  options: {
    responsive: true,
    scales: {
      y: {
        ticks: { color: tokens['--nve-sys-text-emphasis-color'] },
        grid: { color: tokens['--nve-ref-border-color-muted'] }
      },
      x: {
        ticks: { color: tokens['--nve-sys-text-emphasis-color'] },
        grid: { color: tokens['--nve-ref-border-color-muted'] }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  },
  data: {
    labels: topComponents.map(n => n[0]),
    datasets: [
      {
        backgroundColor: tokens['--nve-sys-visualization-categorical-grass'],
        data: topComponents.map(n => n[1])
      }
    ]
  }
});

new Chart(globalThis.document.getElementById('top-projects-by-adoption-chart') as HTMLCanvasElement, {
  type: 'bar',
  options: {
    responsive: true,
    scales: {
      y: {
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: {
            size: 10
          }
        },
        grid: { color: tokens['--nve-ref-border-color-muted'] }
      },
      x: {
        grid: { color: tokens['--nve-ref-border-color-muted'] },
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: {
            size: 10
          },
          callback: function (val) {
            const tickText = this.getLabelForValue(val as number);
            const split = tickText.split('/');
            const truncatedText = split[split.length - 1].toLowerCase().substring(0, 15);
            return truncatedText;
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  },
  data: {
    labels: topProjectsByAdoption.map(n => n[0]),
    datasets: [
      {
        data: topProjectsByAdoption.map(n => n[1]),
        backgroundColor: tokens['--nve-ref-color-purple-violet-1000']
      }
    ]
  }
});

new Chart(globalThis.document.getElementById('version-adoption-chart') as HTMLCanvasElement, {
  type: 'pie',
  options: {
    responsive: true,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        position: 'left',
        labels: {
          color: tokens['--nve-sys-text-emphasis-color']
        }
      }
    }
  },
  data: {
    labels: versionUsage.map(n => (n[0].includes('.') ? n[0].split('.').slice(0, 2).join('.') + '.x' : n[0])),
    datasets: [
      {
        label: 'Version Distribution',
        data: versionUsage.map(n => n[1]),
        borderWidth: 0,
        backgroundColor: [
          tokens['--nve-sys-visualization-sequential-diverging-red-green-900'],
          tokens['--nve-sys-visualization-sequential-diverging-red-green-800'],
          tokens['--nve-sys-visualization-sequential-diverging-red-green-700'],
          tokens['--nve-sys-visualization-sequential-diverging-red-green-700'],
          tokens['--nve-sys-visualization-sequential-diverging-red-green-400'],
          tokens['--nve-sys-visualization-sequential-diverging-red-green-300'],
          tokens['--nve-sys-visualization-sequential-diverging-red-green-200'],
          tokens['--nve-sys-visualization-sequential-diverging-red-green-100']
        ]
      }
    ]
  }
});

new Chart(globalThis.document.getElementById('repo-adoption-chart') as HTMLCanvasElement, {
  type: 'doughnut',
  options: {
    responsive: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: tokens['--nve-sys-text-emphasis-color'],
          generateLabels: chart => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const backgroundColor = data.datasets[0].backgroundColor;
                const fillStyle = Array.isArray(backgroundColor) ? backgroundColor[i] : backgroundColor;
                return {
                  text: `${label}: ${value}`,
                  fontColor: tokens['--nve-sys-text-emphasis-color'],
                  fillStyle: fillStyle as string,
                  strokeStyle: fillStyle as string,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      }
    }
  },
  data: {
    labels: Object.keys(repoAdoption),
    datasets: [
      {
        label: 'Projects',
        data: Object.values(repoAdoption),
        borderWidth: 0,
        backgroundColor: [
          tokens['--nve-sys-visualization-categorical-slate'],
          tokens['--nve-sys-visualization-categorical-grass']
        ]
      }
    ]
  }
});

new Chart(globalThis.document.getElementById('downloads-by-instance-chart') as HTMLCanvasElement, {
  type: 'bar',
  data: {
    labels: packageLabels,
    datasets: stackedDatasets
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: {
            size: 10
          }
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Total Downloads',
          color: tokens['--nve-sys-text-emphasis-color'],
          font: {
            size: 10
          }
        },
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: {
            size: 10
          }
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
          font: {
            size: 10
          }
        }
      }
    }
  }
});

new Chart(globalThis.document.getElementById('package-distribution-chart') as HTMLCanvasElement, {
  type: 'doughnut',
  data: {
    labels: sortedPackages.map(pkg => pkg.package),
    datasets: [
      {
        data: sortedPackages.map(pkg => pkg.totalDownloads),
        backgroundColor: sortedPackages.map((_, index) => colors[index % colors.length]),
        borderWidth: 0
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: tokens['--nve-sys-text-emphasis-color'],
          padding: 10,
          font: {
            size: 10
          }
        }
      }
    }
  }
});

new Chart(globalThis.document.getElementById('top-versions-chart') as HTMLCanvasElement, {
  type: 'bar',
  data: {
    labels: topVersions.map(v => v.label),
    datasets: [
      {
        label: 'Downloads',
        data: topVersions.map(v => v.downloads),
        backgroundColor: tokens['--nve-sys-visualization-categorical-cyan'],
        borderWidth: 1
      }
    ]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Total Downloads',
          color: tokens['--nve-sys-text-emphasis-color'],
          font: {
            size: 11
          }
        },
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: {
            size: 11
          },
          callback: function (value) {
            return value.toLocaleString();
          }
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        },
        beginAtZero: true
      },
      y: {
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: {
            size: 10
          }
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return 'Downloads: ' + (context.parsed?.x ?? 0).toLocaleString();
          }
        }
      }
    }
  }
});

new Chart(globalThis.document.getElementById('total-downloads-chart') as HTMLCanvasElement, {
  type: 'doughnut',
  data: {
    labels: ['registry.npmjs.org', 'artifactory.build.nvidia.com'],
    datasets: [
      {
        label: 'Total Downloads',
        data: [totalURMDownloads, totalAVInfraDownloads],
        backgroundColor: [
          tokens['--nve-sys-visualization-categorical-grass'],
          tokens['--nve-sys-visualization-categorical-slate']
        ],
        borderWidth: 0
      }
    ]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: tokens['--nve-sys-text-emphasis-color'],
          padding: 10,
          font: {
            size: 10
          },
          generateLabels: chart => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const backgroundColor = data.datasets[0].backgroundColor;
                const fillStyle = Array.isArray(backgroundColor) ? backgroundColor[i] : backgroundColor;
                return {
                  text: `${label}: ${value?.toLocaleString() ?? 0}`,
                  fontColor: tokens['--nve-sys-text-emphasis-color'],
                  fillStyle: fillStyle as string,
                  strokeStyle: fillStyle as string,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      }
    }
  }
});

new Chart(globalThis.document.getElementById('api-references-chart') as HTMLCanvasElement, {
  type: 'doughnut',
  data: {
    labels: ['Elements', 'Attributes', 'Imports', 'Styles'],
    datasets: [
      {
        data: [elementReferenceTotal, attributeReferenceTotal, importReferenceTotal, styleReferenceTotal],
        backgroundColor: colors,
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
          color: tokens['--nve-sys-text-emphasis-color'],
          generateLabels: chart => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const backgroundColor = data.datasets[0].backgroundColor;
                const fillStyle = Array.isArray(backgroundColor) ? backgroundColor[i] : backgroundColor;
                return {
                  text: `${label}: ${value?.toLocaleString() ?? 0}`,
                  fontColor: tokens['--nve-sys-text-emphasis-color'],
                  fillStyle: fillStyle as string,
                  strokeStyle: fillStyle as string,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      }
    }
  }
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
    labels: monthlyMilestones.map(m => m.formattedDate),
    datasets: [
      {
        label: 'Total Releases',
        data: monthlyMilestones.map(m => m.cumulativeTotal),
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
            const milestone = monthlyMilestones[idx];
            return milestone.formattedDate;
          },
          label: function (context) {
            const idx = context.dataIndex;
            const milestone = monthlyMilestones[idx];
            return [
              `Cumulative Total: ${milestone.cumulativeTotal}`,
              `Releases This Month: ${milestone.releasesThisMonth}`
            ];
          },
          afterLabel: function (context) {
            const idx = context.dataIndex;
            const milestone = monthlyMilestones[idx];
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
    labels: monthlyTypeData.map(m =>
      new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(m.date)
    ),
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
          text: 'Releases per Month',
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
            const month = monthlyTypeData[idx];
            return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(month.date);
          },
          afterTitle: function (context) {
            const idx = context[0].dataIndex;
            const month = monthlyTypeData[idx];
            const total = month.feat + month.fix + month.breaking + month.chore;
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

new Chart(globalThis.document.getElementById('relative-adoption-chart') as HTMLCanvasElement, {
  type: 'line',
  data: {
    datasets: relativeAdoptionDatasets
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Relative Release Progress over Time',
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 11 }
        },
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 9 },
          callback: function (value) {
            if (value === 100) {
              return 'latest release';
            } else {
              return `${value}%`;
            }
          }
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        }
      },
      y: {
        title: {
          display: false,
          text: 'Cumulative Downloads',
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 10 }
        },
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 8 },
          callback: function (value) {
            return value.toLocaleString();
          }
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
          padding: 10,
          font: { size: 10 }
        }
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        callbacks: {
          title: () => 'Release Progress Over Time',
          label: function (context) {
            const packageName = context.dataset.label;
            const downloads = context.parsed.y ?? 0;
            const dataPoint = context.raw as { x: number; y: number; version: string; versionIndex: number };
            if (dataPoint.version) {
              return [
                `${packageName} v${dataPoint.version}`,
                `Version ${dataPoint.versionIndex}`,
                `${downloads.toLocaleString()} cumulative downloads`
              ];
            }
            return `${packageName}: ${downloads.toLocaleString()} downloads`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
      axis: 'x'
    }
  }
});

const dependencyCounts: Record<string, number> = {
  angular: 0,
  react: 0,
  vue: 0,
  svelte: 0,
  solid: 0,
  preact: 0,
  alpinejs: 0,
  hybrids: 0,
  htmx: 0,
  lit: 0,
  other: 0
};

const knownFrameworks = [
  'angular',
  'react',
  'vue',
  'svelte',
  'solid',
  'preact',
  'alpinejs',
  'hybrids',
  'htmx',
  'lit'
] as const;

usageMetrics.projects.forEach((project: ProjectUsage) => {
  const deps = (project as ProjectUsage & { projectDependencies?: Record<string, boolean> }).projectDependencies;
  if (deps) {
    let matchedAny = false;
    for (const framework of knownFrameworks) {
      if (deps[framework]) {
        dependencyCounts[framework]++;
        matchedAny = true;
      }
    }
    if (!matchedAny) {
      dependencyCounts.other++;
    }
  }
});

// Sort dependencies by count (greatest to least) and filter out zeros
const sortedDependencies = Object.entries(dependencyCounts)
  .filter(([_, count]) => count > 0)
  .sort((a, b) => b[1] - a[1]);

const dependencyLabels = sortedDependencies.map(([key]) => key);
const dependencyData = sortedDependencies.map(([_, count]) => count);

new Chart(globalThis.document.getElementById('frontend-dependencies-distribution-chart') as HTMLCanvasElement, {
  type: 'bar',
  data: {
    labels: dependencyLabels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
    datasets: [
      {
        label: 'Projects',
        data: dependencyData,
        backgroundColor: tokens['--nve-sys-visualization-categorical-cyan'],
        borderWidth: 0,
        borderRadius: 4
      }
    ]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            return context[0].label || '';
          },
          label: function (context) {
            const value = context.parsed.x ?? 0;
            const totalProjects = usageMetrics.projects.length;
            const percentage = ((value / totalProjects) * 100).toFixed(1);
            return `${value} projects (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 10 },
          callback: function (value) {
            return value.toLocaleString();
          }
        },
        grid: {
          color: tokens['--nve-ref-border-color-muted']
        },
        title: {
          display: true,
          text: 'Number of Projects',
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 11, weight: 'bold' }
        }
      },
      y: {
        ticks: {
          color: tokens['--nve-sys-text-emphasis-color'],
          font: { size: 11 }
        },
        grid: {
          display: false
        }
      }
    }
  }
});
