import { html, css, LitElement, nothing, unsafeCSS } from 'lit';
import { state } from 'lit/decorators/state.js';
import showdown from 'showdown';
import { compareVersions } from 'compare-versions';

import { define } from '@nvidia-elements/core/internal';
import typography from '@nvidia-elements/styles/typography.css?inline';
import layout from '@nvidia-elements/styles/layout.css?inline';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/tag/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/sort-button/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/drawer/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/json-viewer/define.js';
import '@nvidia-elements/core/tabs/define.js';
import '@internals/elements-api/badge-coverage/define.js';
import '@internals/elements-api/badge-lighthouse/define.js';
import '@internals/elements-api/badge-axe/define.js';
import { MetadataService, ESM_ELEMENTS_VERSION } from '@internals/elements-api';

const metrics = await MetadataService.getMetadata();
const metricsMaglev = await MetadataService.getMaglevMetadata();
const reportDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(new Date(metrics.created));
const showdownOptions = { simplifiedAutoLink: true };

export default {
  title: 'Internal/Metrics'
};

function getVersionNum(value) {
  return parseFloat(`${value.replace('^', '').replace('~', '')}`);
}

function getVersionBadge(value) {
  const latestBetaElementsRelease = 41; // last minor patch for 0.x was 0.41.0;
  const projectMinorVersion = parseFloat(`${value.split('.')[1]}`) ;

  let status = 'success';

  if (getVersionNum(value) < 1.0) {
    status = 'warning';
  }

  if (getVersionNum(value) < 1.0 && (latestBetaElementsRelease - projectMinorVersion) > 10 || value.includes('workspace')) {
    status = 'danger';
  }

  return html`<nve-badge status=${status as any}>${value.replace('^', '').replace('~', '')}</nve-badge>`;
}

function getBehaviorCategoryIcon(category: string) {
  return {
    ['navigation']: '🧭',
    ['content']: '🖥️',
    ['list']: '📃',
    ['form']: '🖋️',
    ['feedback']: '💡',
    ['popover']: '💬',
    ['container']: '📦',
    ['button']: '🆗'
  }[category]
}

function basicSort(list: any[], key: string) {
  return list.sort((a, b) => {
    if (!isNaN(a[key])) {
      return parseFloat(a[key]) > parseFloat(b[key]) ? 1 : -1;
    } else {
      return a[key] > b[key] ? 1 : -1;
    }
  });
}

export const RawMetadata = {
  render: () => html`
    <div nve-layout="column gap:lg">
      <nve-button>download</nve-button>
      <nve-json-viewer expanded></nve-json-viewer>
    </div>
    <script type="module">
      const button = document.querySelector('nve-button');
      const viewer = document.querySelector('nve-json-viewer');
      viewer.value = ${JSON.stringify(metrics)};
      button.addEventListener('click', () => {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(viewer.value, null, 2)));
        element.setAttribute('download', 'metadata.json');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      });
    </script>
  `
}

class ElementsGlossary extends LitElement {
  static metadata = {
    tag: 'elements-glossary',
    version: 'demo'
  }

  static styles = [unsafeCSS(`${typography}${layout}`)];

  #markdown = new showdown.Converter(showdownOptions);

  render() {
    return html`
      <section nve-layout="column gap:md">
        <h3 nve-text="heading">Properties</h3>
        <nve-grid>
          <nve-grid-header>
            <nve-grid-column width="150px">Property</nve-grid-column>
            <nve-grid-column>Description</nve-grid-column>
            <nve-grid-column width="350px">Type</nve-grid-column>
          </nve-grid-header>
          ${metrics.types.props?.map(prop => html`
          <nve-grid-row>
            <nve-grid-cell><code nve-text="code">${prop.name}</code></nve-grid-cell>
            <nve-grid-cell .innerHTML=${this.#markdown.makeHtml(prop.description ?? '')}></nve-grid-cell>
            <nve-grid-cell>
              <div nve-layout="row gap:xs align:wrap">
                ${prop.type ? html`${prop.type?.split('|').map(i => i.trim()).filter(i => i.length).map(i => html`<nve-tag readonly color="gray-slate">${i.replaceAll("'", '')}</nve-tag>`)}` : nothing}
              </div>
            </nve-grid-cell>
          </nve-grid-row>`)}
        </nve-grid>
      </section>
    `;
  }
}

define(ElementsGlossary);

interface MetricColumn {
  sort: 'ascending' | 'descending' | 'none',
  width?: string,
  tooltip?: string
}

class ElementsMetrics extends LitElement {
  static styles = [unsafeCSS(`${typography}${layout}`)];

  static metadata = {
    tag: 'elements-metrics',
    version: 'demo'
  }

  @state() state: {
    tooltipColumn: string | null,
    columns: Record<string, MetricColumn>
  } = {
    tooltipColumn: null,
    columns: {
      element: { sort: 'none', width: '200px', tooltip: 'Custom Element API' },
      status: { sort: 'none', width: '120px', tooltip: 'Element Stability Status' },
      coverage: { sort: 'none', width: '130px', tooltip: 'Unit Test Coverage' },
      bundle: { sort: 'none', width: '130px', tooltip: 'Standalone total JavaScript bundle size in kb' },
      performance: { sort: 'none', width: '130px', tooltip: 'Chrome Lighthouse Performance Score' },
      accessibility: { sort: 'none', width: '130px', tooltip: 'Chrome Lighthouse Accessibility Score' },
      bestPractices: { sort: 'none', width: '130px', tooltip: 'Chrome Lighthouse Best Practices Score' },
      ssr: { sort: 'none', width: '130px', tooltip: 'Support Basic Server Side Rendering (SSR)' },
      axe: { sort: 'none', width: '170px', tooltip: 'Accessibility status from Axe Core API' },
      spec: { sort: 'none', tooltip: 'Behavior category from W3C and WAI-ARIA Specification', width: '170px' },
      released: { sort: 'none', tooltip: 'Version Element was first released', width: '170px' },
      figma: { sort: 'none', width: '170px', tooltip: '' },
      themes: { sort: 'none', width: '170px', tooltip: 'Supports base light and dark theme' },
      responsive: { sort: 'none', tooltip: 'Provides basic minimal resposive layouts' },
    }
  };

  get elements() {
    return Object.entries(this.state.columns).reduce((elements, [name, column]) => {
        if (column.sort !== 'none') {
          elements = basicSort(elements, name);
          elements = column.sort === 'descending' ? elements.reverse() : elements;
        }
        return elements;
    }, [...metrics['@nvidia-elements/core'].elements]);
  }

  render() {
    return html`
      <div nve-layout="row gap:md align:vertical-center pad-bottom:sm">
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
      <nve-grid style="--scroll-height: calc(100vh - 290px)">
        <nve-grid-header>
          ${Object.entries(this.state.columns).map(([name, column]) => html`
            <nve-grid-column
              @mouseover=${() => this.state = { ...this.state, tooltipColumn: name } }
              popovertarget="tooltip"
              id=${name}
              width=${column.width ? column.width : '160px'}>
              ${name.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1").replace(/^./, (match) => match.toUpperCase()).replace('Ssr', 'SSR')}
              <nve-sort-button .name=${name} .sort=${column.sort as 'ascending' | 'descending' | 'none'} @sort=${e => this.#sort(e)}></nve-sort-button>
            </nve-grid-column>
          `)}
        </nve-grid-header>
        ${this.elements.map(element => {
          return html`
          <nve-grid-row>
            <nve-grid-cell><a href=${element.manifest.metadata.storybook.replace('https://NVIDIA.github.io/elements/api/', './')} nve-text="body link no-visit">${element.name.replace('nve-', '')}</a></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-status .value=${element.manifest.metadata.status} container="flat"></nve-api-badge-status></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-coverage .value=${element.tests.unit.coverageTotal} container="flat"></nve-api-badge-coverage></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-bundle .value=${element.tests.lighthouse?.payload?.javascript?.kb?.toFixed(2)} container="flat"></nve-api-badge-bundle></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-lighthouse .value=${ { performance: element.tests.lighthouse?.scores?.performance } } container="flat"></nve-api-badge-lighthouse></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-lighthouse .value=${ { performance: element.tests.lighthouse?.scores?.accessibility } } container="flat"></nve-api-badge-lighthouse></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-lighthouse .value=${ { performance: element.tests.lighthouse?.scores?.bestPractices } } container="flat"></nve-api-badge-lighthouse></nve-grid-cell>
            <nve-grid-cell><nve-badge container="flat" .status=${element.tests?.ssr?.baseline ? 'success' : 'warning'}>Static</nve-badge></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-axe container="flat" .value=${element.manifest.metadata.axe}></nve-api-badge-axe></nve-grid-cell>
            <nve-grid-cell>${getBehaviorCategoryIcon(element.manifest.metadata.behavior)}&nbsp;&nbsp;<a href=${element.manifest.metadata.aria} nve-text="link no-visit">${element.manifest.metadata.behavior}</a></nve-grid-cell>
            <nve-grid-cell>${element.manifest.metadata.since}</nve-grid-cell>
            <nve-grid-cell>${element.manifest.metadata.figma ? html`<a href=${element.manifest.metadata.figma} nve-text="link no-visit">Figma</a>` : html`<nve-icon name="exclamation-triangle" status="warning"></nve-icon>`}</nve-grid-cell>
            <nve-grid-cell><nve-badge status="success" container="flat">light/dark</nve-badge></nve-grid-cell>
            <nve-grid-cell>${element.manifest.metadata.responsive ? html`<nve-badge status="success" container="flat">layouts</nve-badge>` : html`<nve-badge status="warning" container="flat">partial</nve-badge>`}</nve-grid-cell>
          </nve-grid-row>`
        })}
        <nve-grid-footer>
          <p nve-text="body muted sm">Report Created on ${reportDate}</p>
          <nve-button @click=${() => this.dispatchEvent(new CustomEvent('view-data', { detail: 'elements', bubbles: true }))} container="flat" style="margin-left: auto">view data</nve-button>
        </nve-grid-footer>
      </nve-grid>
      <nve-tooltip style="--width: 300px" id="tooltip">${this.state.columns[this.state.tooltipColumn]?.tooltip}</nve-tooltip>
    `;
  }

  #sort(event) {
    this.state.columns[event.target.name].sort = event.detail.next;
    this.state = { ...this.state };
  }
}

define(ElementsMetrics);

class ProjectMetrics extends LitElement {
  static styles = [unsafeCSS(`${typography}${layout}`)];

  static metadata = {
    tag: 'project-metrics',
    version: 'demo'
  }

  @state() state = {
    tooltipColumn: null,
    columns: {
      project: { sort: 'none', width: '300px' },
      elements: { sort: 'none', width: '300px' },
      instanceTotal: { sort: 'none', width: '300px', tooltip: 'Number of instances of elements directly in MagLev source. Note this does not account for runtime instances created from reusable abstractions.' },
      source: { sort: 'none', width: '' },
    }
  };

  get projects() {
    return Object.entries(this.state.columns).reduce((projects, [name, column]) => {
        if (column.sort !== 'none') {
          projects = basicSort(projects, name);
          projects = column.sort === 'descending' ? projects.reverse() : projects;
        }
        return projects;
    }, [...metricsMaglev.projects]);
  }

  render() {
    return html`
      <div nve-layout="row gap:md align:vertical-center pad-bottom:sm">
        <h3 nve-text="body bold">Summary:</h3>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Total Maglev Instances</span>
          <span nve-text="body sm bold"><nve-badge status="queued">${metricsMaglev.projects.reduce((p, n) => n.instanceTotal + p, 0)}</nve-badge></span>
        </section>
      </div>
      <nve-grid style="--scroll-height: calc(100vh - 290px)">
        <nve-grid-header>
          ${Object.entries(this.state.columns).map(([name, column]) => html`
            <nve-grid-column
              @mouseover=${() => this.state = { ...this.state, tooltipColumn: name } }
              @mouseleave=${() => this.state = { ...this.state, tooltipColumn: null } }
              .name=${name}
              .width=${column.width}
              id=${name}>${name.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1").replace(/^./, (match) => match.toUpperCase())}</nve-grid-column>
          `)}
        </nve-grid-header>
        ${this.projects.sort((a, b) => compareVersions(a.elementsVersion, b.elementsVersion) ).reverse().map(project => html`
          <nve-grid-row>
            <nve-grid-cell>${project.name ?? 'unknown'}</nve-grid-cell>
            <nve-grid-cell>${getVersionBadge(project.elementsVersion)}</nve-grid-cell>
            <nve-grid-cell>${project.instanceTotal}</nve-grid-cell>
            <nve-grid-cell><code nve-text="code">${project.path}</code></nve-grid-cell>
          </nve-grid-row>
        `)}
        <nve-grid-footer>
          <p nve-text="body muted sm">Report Created on ${reportDate}</p>
        </nve-grid-footer>
      </nve-grid>
      <nve-tooltip style="--width: 300px" ?hidden=${!this.state.columns[this.state.tooltipColumn]?.tooltip} anchor=${this.state.tooltipColumn as any}>${this.state.columns[this.state.tooltipColumn]?.tooltip}</nve-tooltip>
    `;
  }
}

define(ProjectMetrics);

class LighthouseMetrics extends LitElement {
  static styles = [unsafeCSS(`${typography}${layout}`)];

  static metadata = {
    tag: 'lighthouse-metrics',
    version: 'demo'
  }

  render() {
    return html`
      <nve-grid style="--scroll-height: calc(100vh - 290px)">
        <nve-grid-header>
          <nve-grid-column>Lighthouse Report</nve-grid-column>
          <nve-grid-column>Performance</nve-grid-column>
          <nve-grid-column>Accessibility</nve-grid-column>
          <nve-grid-column>Best Practices</nve-grid-column>
          <nve-grid-column>Bundle Size</nve-grid-column>
        </nve-grid-header>
        ${metrics['@nvidia-elements/core'].elements.map(element => html`
          <nve-grid-row>
            <nve-grid-cell>${element.name}</nve-grid-cell>
            <nve-grid-cell><nve-api-badge-lighthouse .value=${ { performance: element.tests.lighthouse?.scores?.performance } } container="flat"></nve-api-badge-lighthouse></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-lighthouse .value=${ { accessibility: element.tests.lighthouse?.scores?.accessibility } } container="flat"></nve-api-badge-lighthouse></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-lighthouse .value=${ { bestPractices: element.tests.lighthouse?.scores?.bestPractices } } container="flat"></nve-api-badge-lighthouse></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-bundle .value=${element.tests.lighthouse?.payload?.javascript?.kb?.toFixed(2)} container="flat"></nve-api-badge-bundle></nve-grid-cell>
          </nve-grid-row>
        `)}
        <nve-grid-footer>
          <p nve-text="body muted sm">Report Created on ${reportDate}</p>
          <a nve-text="link" href="https://developer.chrome.com/docs/lighthouse/overview/" style="margin-left: auto">Lighthouse</a>
        </nve-grid-footer>
      </nve-grid>
    `;
  }
}

define(LighthouseMetrics);

class MetricsData extends LitElement {
  static metadata = {
    tag: 'metrics-data',
    version: 'demo'
  }

  @state() value = { loading: '...' };

  render() {
    return html`
    <div nve-layout="column gap:lg">
      <nve-button @click=${this.#download}>download</nve-button>
      <nve-json-viewer .value=${this.value} expanded></nve-json-viewer>
    </div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => this.value = metrics);
  }

  #download() {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(metrics, null, 2)));
    element.setAttribute('download', 'metadata.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

define(MetricsData);

class TestMetrics extends LitElement {
  static metadata = {
    tag: 'test-metrics',
    version: 'demo'
  }

  static styles = [unsafeCSS(`${typography}${layout}`)];

  render() {
    return html`
    <section nve-layout="column gap:md">
      <div nve-layout="row gap:md align:vertical-center">
        <h3 nve-text="body bold">Test Coverage:</h3>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Statements</span>
          <nve-api-badge-coverage .value=${metrics['@nvidia-elements/core'].tests.coverageTotal.statements.pct} container="flat"></nve-api-badge-coverage>
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Lines</span>
          <nve-api-badge-coverage .value=${metrics['@nvidia-elements/core'].tests.coverageTotal.lines.pct} container="flat"></nve-api-badge-coverage>
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Functions</span>
          <nve-api-badge-coverage .value=${metrics['@nvidia-elements/core'].tests.coverageTotal.functions.pct} container="flat"></nve-api-badge-coverage>
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Branches</span>
          <nve-api-badge-coverage .value=${metrics['@nvidia-elements/core'].tests.coverageTotal.branches.pct} container="flat"></nve-api-badge-coverage>
        </section>
      </div>
      <nve-grid style="--scroll-height: calc(100vh - 290px)">
        <nve-grid-header>
          <nve-grid-column width="350px">File</nve-grid-column>
          <nve-grid-column width="180px">Statements</nve-grid-column>
          <nve-grid-column width="180px">Lines</nve-grid-column>
          <nve-grid-column width="180px">Functions</nve-grid-column>
          <nve-grid-column>Branches</nve-grid-column>
        </nve-grid-header>
        ${metrics['@nvidia-elements/core'].tests.coverage.map(cov => html`
          <nve-grid-row>
            <nve-grid-cell><p nve-text="body truncate">${cov.file}</p></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-coverage .value=${cov.statements.pct} container="flat"></nve-api-badge-coverage></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-coverage .value=${cov.lines.pct} container="flat"></nve-api-badge-coverage></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-coverage .value=${cov.functions.pct} container="flat"></nve-api-badge-coverage></nve-grid-cell>
            <nve-grid-cell><nve-api-badge-coverage .value=${cov.branches.pct} container="flat"></nve-api-badge-coverage></nve-grid-cell>
          </nve-grid-row>
        `)}
        <nve-grid-footer>
          <p nve-text="body muted sm">Report Created on ${reportDate}</p>
          <!-- <nve-button @click=${() => this.rawData = 'tests'} container="flat" style="margin-left: auto">view data</nve-button> -->
        </nve-grid-footer>
      </nve-grid>
    </section>
    `;
  }
}

define(TestMetrics);

class MetricDemo extends LitElement {
  @state() rawData: '' | 'elements' | 'projects' | 'versions' | 'tests' = '';

  @state() tab: 'metrics' | 'test' | 'lighthouse' | 'elements' | 'metadata' | 'bundle' = 'metrics';

  static styles = [unsafeCSS(`${typography}${layout}`), css`
  .bundle {
    border: 0;
    height: calc(100vh - 175px);
    width: 100%;
    margin-top: -24px;
  }
  `];

  static metadata = {
    tag: 'metrics-demo',
    version: 'demo'
  }

  render() {
    return html`
    <div nve-layout="column gap:md align:horizontal-stretch pad:lg" no-story-container @view-data=${e => this.rawData = e.detail}>
      <div nve-layout="column gap:md">
        <div nve-layout="row gap:md">
          <h1 nve-text="heading lg">Elements</h1>
          <nve-badge status="success">version ${ESM_ELEMENTS_VERSION}</nve-badge>
        </div>
        <p nve-text="body muted">Below are metrics measuring various aspects of the Elements system including usage, test coverage and API stability.</p>
      </div>

      <section nve-layout="column gap:lg align:stretch pad-top:lg">
        <div  nve-layout="column gap:xs align:stretch">
          <nve-tabs>
            <nve-tabs-item .selected=${this.tab === 'metrics'} @click=${() => this.tab = 'metrics'} selected>Metrics</nve-tabs-item>
            <nve-tabs-item .selected=${this.tab === 'test'} @click=${() => this.tab = 'test'}>Testing &amp; Performance</nve-tabs-item>
            <nve-tabs-item .selected=${this.tab === 'bundle'} @click=${() => this.tab = 'bundle'}>Bundle Explorer</nve-tabs-item>
            <nve-tabs-item .selected=${this.tab === 'elements'} @click=${() => this.tab = 'elements'}>Maglev</nve-tabs-item>
            <nve-tabs-item .selected=${this.tab === 'metadata'} @click=${() => this.tab = 'metadata'}>Raw Metadata</nve-tabs-item>
          </nve-tabs>
          <nve-divider></nve-divider>
        </div>
        ${this.tab === 'metrics' ? html`<elements-metrics></elements-metrics>` : nothing}
        ${this.tab === 'test' ? html`
        <div nve-layout="grid gap:md span-items:6">
          <test-metrics></test-metrics>
          <lighthouse-metrics style="margin-top: 26px;"></lighthouse-metrics>
        </div>` : nothing}
        ${this.tab === 'bundle' ? html`<iframe id="bundle" class="bundle" src="iframe.html?viewMode=story&id=internal-bundle-sizes--elements"></iframe>` : nothing}
        ${this.tab === 'elements' ? html`<project-metrics></project-metrics>` : nothing}
        ${this.tab === 'metadata' ? html`<metrics-data></metrics-data>` : nothing}
      </section>
    </div>
    <nve-drawer @close=${() => this.rawData = ''} .hidden=${!this.rawData} position="right" modal closable style="--max-width: 720px; --content-padding: 0">
      <nve-drawer-header>
        <div nve-layout="column gap:md full">
          <h2 nve-text="heading" style="text-transform: capitalize">${this.rawData} data</h2>
          <nve-search>
            <input type="search" @input=${this.#search} />
          </nve-search>
        </div>
      </nve-drawer-header>
      <nve-drawer-content>
        <nve-json-viewer expanded>${JSON.stringify(metrics[this.rawData])}</nve-json-viewer>
      </nve-drawer-content>
    </nve-drawer>
`;
  }

  #search(e: any) {
    const value = e.target.value.length ? searchJson(structuredClone(metrics['@nvidia-elements/core'][this.rawData]), e.target.value) : metrics['@nvidia-elements/core'][this.rawData];
    (this.shadowRoot as any).querySelector('nve-json-viewer').value = value;
  }
}

const searchJson = (json, target) => {
  const filtered = JSON.stringify(json, (key, value) => {
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      if (key.includes(target) || JSON.stringify(value).includes(target)) {
        return value;
      } else {
        return undefined;
      }
    } else {
      return value;
    }
  }, 2);

  return JSON.parse(filtered);
};

define(MetricDemo);

export const Metrics = {
  render: () => html`<metrics-demo no-story-container></metrics-demo>`
};

export const Maglev = {
  render: () => html`<project-metrics></project-metrics>`
};

export const Glossary = {
  render: () => html`<elements-glossary></elements-glossary>`
};
