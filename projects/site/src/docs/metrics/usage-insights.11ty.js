import { compareVersions } from 'compare-versions';
import { UsageService } from '@internals/metadata';
import { ESM_ELEMENTS_VERSION } from '../../_11ty/utils/version.js';

const metricsUsage = await UsageService.getMetadata();

const projectElementReferences = metricsUsage.projects.reduce((p, n) => ({ ...p, [n.name]: n.elements }), {});

const components = Object.values(projectElementReferences)
  .flatMap(n => n)
  .reduce((p, n) => {
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
    return { ...p, [name]: (p[name] ?? 0) + n.total };
  }, {});

const topComponents = Object.entries(components)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25);

const versions = metricsUsage.projects.reduce((p, n) => {
  return {
    ...p,
    [n.elementsVersion.replace('^', '').replace('~', '')]:
      (p[n.elementsVersion.replace('^', '').replace('~', '')] ?? 0) + 1
  };
}, {});

const sortedVersions = Object.entries(versions).sort((a, b) => {
  if (a[0].includes('latest') || b[0].includes('latest')) {
    return a[0].includes('latest') ? 1 : -1;
  }
  return compareVersions(b[0], a[0]);
});

const versionUsage = Object.entries(
  sortedVersions.reduce((p, n) => {
    if (n[0].includes('.')) {
      const [major, minor] = n[0].split('.');
      const formatted = `${major}.${minor.length > 1 ? minor[0] + 'x' : minor}.0`;
      const versionNumber = formatted.startsWith('0') ? '0.0.x' : formatted;
      return { ...p, [versionNumber]: (p[versionNumber] ?? 0) + n[1] };
    } else {
      return p;
    }
  }, {})
);

const topProjectsByAdoption = Object.entries(
  metricsUsage.projects.reduce((p, n) => ({ ...p, [n.name]: n.elementReferenceTotal + n.importReferenceTotal }), {})
)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25);

const repoAdoption = metricsUsage.projects.reduce((p, n) => {
  const repo = n.url.split('.com')[0].replace('https://', '') + '.com';
  return { ...p, [repo]: (p[repo] ?? 0) + 1 };
}, {});

export const data = {
  title: 'Usage Metrics',
  layout: 'docs.11ty.js'
};

export function render() {
  return this.renderTemplate(
    /* html */ `
<div nve-layout="column gap:md align:stretch" docs-full-width>
  <div nve-layout="column gap:md pad-bottom:lg">
    <div nve-layout="row gap:md align:vertical-center">
      <h1 nve-text="heading lg">Elements</h1>
      <nve-badge status="success">version ${ESM_ELEMENTS_VERSION}</nve-badge>
    </div>
    <p nve-text="body muted">Below are metrics measuring various aspects of the Elements system including usage, test coverage and API stability.</p>
  </div>
  <div nve-layout="column gap:xs">
    <nve-tabs style="height: 32px">
      <nve-tabs-item><a href="docs/metrics/">Metrics</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/usage-metrics/">Usage Metrics</a></nve-tabs-item>
      <nve-tabs-item selected><a href="docs/metrics/usage-insights/">Usage Insights</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/wireit/">Wireit Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
    <div style="contain: layout; display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: 1.1fr 0.9fr; gap: 12px; width: 100%; height: calc(100vh - 245px); max-width: 1440px; max-height: 760px">
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Top Components by Template Reference</h3>
        </nve-card-header>
        <nve-card-content>
          <canvas id="top-components-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Top Project Adoption by Template and Import Reference</h3>
        </nve-card-header>
        <nve-card-content style="--padding: var(--nve-ref-size-400) var(--nve-ref-size-400) 0 var(--nve-ref-size-400)">
          <canvas id="top-projects-by-adoption-chart"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Version Adoption</h3>
        </nve-card-header>
        <nve-card-content style="--padding: var(--nve-ref-size-400) var(--nve-ref-size-400) 0 var(--nve-ref-size-400)">
          <canvas id="version-adoption-chart" style="margin: auto;" width="350" height="270"></canvas>
        </nve-card-content>
      </nve-card>
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading sm medium">Repository Projects</h3>
        </nve-card-header>
        <nve-card-content style="--padding: var(--nve-ref-size-400) var(--nve-ref-size-400) 0 var(--nve-ref-size-400)">
          <canvas id="repo-adoption-chart" style="margin: auto;" width="400" height="270"></canvas>
        </nve-card-content>
      </nve-card>
    </div>
    <script type="module">
      import { Chart } from 'chart.js/auto';
      import { getThemeTokens } from '@nvidia-elements/core';

      const tokens = getThemeTokens();
      const topComponents = ${JSON.stringify(topComponents)};
      const topComponentsChart = new Chart(document.getElementById('top-components-chart'), {
        type: 'bar',
        options: {
          responsive: true,
          plugins: {
            legend: false
          },
          scales: {
            y: {
              ticks: { color: tokens['--nve-sys-text-emphasis-color'] },
              grid: { color: tokens['--nve-ref-border-color-muted'] }
            },
            x: {
              ticks: { color: tokens['--nve-sys-text-emphasis-color'] },
              grid: { color: tokens['--nve-ref-border-color-muted'] }
            },
          }
        },
        data: {
          labels: topComponents.map(n => n[0]),
          datasets: [{
            label: 'Known Template References',
            backgroundColor: tokens['--nve-sys-visualization-categorical-grass'],
            pointBorderColor: '#fff',
            data: topComponents.map(n => n[1])
          }]
        }
      });


      const topProjectsByAdoption = ${JSON.stringify(topProjectsByAdoption)};
      const topProjectsByAdoptionChart = new Chart(document.getElementById('top-projects-by-adoption-chart'), {
        type: 'bar',
        options: {
          responsive: true,
          scales: {
            y: {
              ticks: { color: tokens['--nve-sys-text-emphasis-color'] },
              grid: { color: tokens['--nve-ref-border-color-muted'] }
            },
            x: {
              grid: { color: tokens['--nve-ref-border-color-muted'] },
              ticks: {
                color: tokens['--nve-sys-text-emphasis-color'],
                callback: function(val, index, ticks) {
                  const tickText = this.getLabelForValue(val);
                  const split = tickText.split('/');
                  const truncatedText = split[split.length - 1].toLowerCase().substring(0, 15);
                  return truncatedText;
                }
              }
            }
          },
          plugins: {
            legend: false
          }
        },
        data: {
          labels: topProjectsByAdoption.map(n => n[0]),
          datasets: [{
            label: '',
            data: topProjectsByAdoption.map(n => n[1]),
            backgroundColor: tokens['--nve-ref-color-purple-violet-1000'],
          }]
        }
      });


      const versionUsage = ${JSON.stringify(versionUsage)};
      const versionAdoptionChart = new Chart(document.getElementById('version-adoption-chart'), {
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
          labels: versionUsage.map(n => n[0].includes('.') ? n[0].split('.').slice(0, 2).join('.') + '.x' : n[0]),
          datasets: [{
            label: 'Version Adoption',
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
          }]
        }
      });

      const repoAdoption = ${JSON.stringify(repoAdoption)};
      const repoAdoptionChart = new Chart(document.getElementById('repo-adoption-chart'), {
        type: 'pie',
        options: {
          responsive: true,
          aspectRatio: 1.5,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: tokens['--nve-sys-text-emphasis-color']
              }
            }
          }
        },
        data: {
          labels: Object.keys(repoAdoption),
          datasets: [{
            label: 'Projects',
            data: Object.values(repoAdoption),
            borderWidth: 0,
            backgroundColor: [
              tokens['--nve-sys-visualization-sequential-diverging-red-green-900'],
              tokens['--nve-sys-visualization-sequential-diverging-red-green-800']
            ]
          }]
        }
      });
    </script>`,
    'html'
  );
}
