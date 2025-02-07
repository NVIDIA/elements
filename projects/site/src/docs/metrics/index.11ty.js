import { MetadataService, ESM_ELEMENTS_VERSION } from '@internals/elements-api';

export const data = {
  title: 'Metrics',
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
      <nve-tabs-item selected><a href="docs/metrics/">Metrics</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/testing-and-performance/">Testing &amp; Performance</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/bundle-explorer/">Bundle Explorer</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/elements/">Maglev</a></nve-tabs-item>
      <nve-tabs-item><a href="docs/metrics/metadata/">Raw Metadata</a></nve-tabs-item>
    </nve-tabs>
    <nve-divider></nve-divider>
  </div>
  <div nve-layout="row gap:md align:vertical-center">
    <h3 nve-text="body bold">Summary:</h3>
    <section nve-layout="row gap:xs align:center">
      <span nve-text="body sm muted">Total Available Web Components</span>
      <span nve-text="body sm bold">
        <nve-badge color="blue-cobalt">
          ${metrics['@nvidia-elements/core'].elements.length}
        </nve-badge>
      </span>
      -
      <span nve-text="body sm muted">Total Available Parent Elements</span>
      <span nve-text="body sm bold">
        <nve-badge color="blue-cobalt">
          ${[...new Set(metrics['@nvidia-elements/core'].elements.map(el => el.name.split('-')[1]))].length + 2}
        </nve-badge>
      </span>
    </section>
  </div>
  <nve-grid style="--scroll-height: calc(100vh - 335px)">
    <nve-grid-header>
      ${Object.entries(columns)
        .map(
          ([name, column]) => /* html */ `<nve-grid-column
        id="${name}"
        popovertarget="tooltip-${name}"
        width="${column.width ? column.width : '160px'}">
        ${name
          .replace(/([A-Z]+)/g, ' $1')
          .replace(/([A-Z][a-z])/g, ' $1')
          .replace(/^./, match => match.toUpperCase())
          .replace('Ssr', 'SSR')}
      </nve-grid-column>`
        )
        .join('')}
    </nve-grid-header>
    ${elements
      .map(element => {
        return /* html */ `<nve-grid-row>
        <nve-grid-cell><a href=${element.manifest.metadata.storybook.replace('https://NVIDIA.github.io/elements/api/', './')} nve-text="body link no-visit">${element.name.replace('nve-', '')}</a></nve-grid-cell>
        <nve-grid-cell><nve-api-badge-status value="${element.manifest.metadata.status}" container="flat"></nve-api-badge-status></nve-grid-cell>
        <nve-grid-cell><nve-api-badge-coverage value="${element.tests.unit.coverageTotal}" container="flat"></nve-api-badge-coverage></nve-grid-cell>
        <nve-grid-cell>${element.tests.lighthouse?.payload?.javascript?.kb ? /* html */ `<nve-api-badge-bundle value="${element.tests.lighthouse?.payload?.javascript?.kb?.toFixed(2)}" container="flat"></nve-api-badge-bundle>` : /* html */ `<nve-icon name="exclamation-triangle" status="warning"></nve-icon>`}</nve-grid-cell>
        <nve-grid-cell>${element.tests.lighthouse?.scores?.performance ? /* html */ `<nve-api-badge-lighthouse value='{ "performance": ${element.tests.lighthouse?.scores?.performance} }' container="flat"></nve-api-badge-lighthouse>` : /* html */ `<nve-icon name="exclamation-triangle" status="warning"></nve-icon>`}</nve-grid-cell>
        <nve-grid-cell>${element.tests.lighthouse?.scores?.accessibility ? /* html */ `<nve-api-badge-lighthouse value='{ "performance": ${element.tests.lighthouse?.scores?.accessibility} }' container="flat"></nve-api-badge-lighthouse>` : /* html */ `<nve-icon name="exclamation-triangle" status="warning"></nve-icon>`}</nve-grid-cell>
        <nve-grid-cell>${element.tests.lighthouse?.scores?.bestPractices ? /* html */ `<nve-api-badge-lighthouse value='{ "performance": ${element.tests.lighthouse?.scores?.bestPractices} }' container="flat"></nve-api-badge-lighthouse>` : /* html */ `<nve-icon name="exclamation-triangle" status="warning"></nve-icon>`}</nve-grid-cell>
        <nve-grid-cell><nve-badge container="flat" status="${element.tests?.ssr?.baseline ? 'success' : 'warning'}">Static</nve-badge></nve-grid-cell>
        <nve-grid-cell><nve-api-badge-axe container="flat" value="${element.manifest.metadata.axe ?? ''}"></nve-api-badge-axe></nve-grid-cell>
        <nve-grid-cell>${getBehaviorCategoryIcon(element.manifest.metadata.behavior)}&nbsp;&nbsp;<a href=${element.manifest.metadata.aria} nve-text="link no-visit">${element.manifest.metadata.behavior}</a></nve-grid-cell>
        <nve-grid-cell>${element.manifest.metadata.since ?? ''}</nve-grid-cell>
        <nve-grid-cell>${element.manifest.metadata.figma ? /* html */ `<a href=${element.manifest.metadata.figma} nve-text="link no-visit">Figma</a>` : /* html */ `<nve-icon name="exclamation-triangle" status="warning"></nve-icon>`}</nve-grid-cell>
        <nve-grid-cell><nve-badge status="success" container="flat">light/dark</nve-badge></nve-grid-cell>
        <nve-grid-cell>${element.manifest.metadata.responsive ? /* html */ `<nve-badge status="success" container="flat">layouts</nve-badge>` : /* html */ `<nve-badge status="warning" container="flat">partial</nve-badge>`}</nve-grid-cell>
      </nve-grid-row>`;
      })
      .join('')}
    <nve-grid-footer>
      <p nve-text="body muted sm">Report Created on ${reportDate}</p>
    </nve-grid-footer>
  </nve-grid>
  ${Object.entries(columns)
    .map(([name, column]) => /* html */ `<nve-tooltip id="tooltip-${name}" hidden>${column.tooltip}</nve-tooltip>`)
    .join('')}
</div >
    `,
    'md'
  );
}

const metrics = await MetadataService.getMetadata();
const reportDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(
  new Date(metrics.created)
);
const elements = metrics['@nvidia-elements/core'].elements;
const columns = {
  element: { width: '200px', tooltip: 'Custom Element API' },
  status: { width: '120px', tooltip: 'Element Stability Status' },
  coverage: { width: '130px', tooltip: 'Unit Test Coverage' },
  bundle: { width: '130px', tooltip: 'Standalone total JavaScript bundle size in kb' },
  performance: { width: '130px', tooltip: 'Chrome Lighthouse Performance Score' },
  accessibility: { width: '130px', tooltip: 'Chrome Lighthouse Accessibility Score' },
  bestPractices: { width: '130px', tooltip: 'Chrome Lighthouse Best Practices Score' },
  ssr: { width: '130px', tooltip: 'Support Basic Server Side Rendering (SSR)' },
  axe: { width: '170px', tooltip: 'Accessibility status from Axe Core API' },
  spec: { tooltip: 'Behavior category from W3C and WAI-ARIA Specification', width: '170px' },
  released: { tooltip: 'Version Element was first released', width: '170px' },
  figma: { width: '170px', tooltip: 'Figma Design File URL' },
  themes: { width: '170px', tooltip: 'Supports base light and dark theme' },
  responsive: { tooltip: 'Provides basic minimal resposive layouts' }
};

function getBehaviorCategoryIcon(category) {
  return {
    ['navigation']: '🧭',
    ['content']: '🖥️',
    ['list']: '📃',
    ['form']: '🖋️',
    ['feedback']: '💡',
    ['popover']: '💬',
    ['container']: '📦',
    ['button']: '🆗'
  }[category];
}
