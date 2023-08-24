import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { state } from 'lit/decorators/state.js';
import { property } from 'lit/decorators/property.js';
import { define } from '@elements/elements/internal';
import { MLV_VERSION } from '@elements/elements';
import typography from '@elements/elements/css/module.typography.css?inline';
import layout from '@elements/elements/css/module.layout.css?inline';
import '@elements/elements/alert/define.js';
import '@elements/elements/badge/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/grid/define.js';
import '@elements/elements/sort-button/define.js';
import '@elements/elements/tooltip/define.js';
import '@elements/elements/drawer/define.js';
import '@elements/elements/search/define.js';
import '@elements/elements/json-viewer/define.js';
import metrics from 'metrics/data.json';

const reportDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(new Date(metrics.created));

export default {
  title: 'Elements/Data Grid/Examples',
  component: 'nve-grid',
};

function getMinorVersion(value) {
  return parseFloat(`${value.split('.')[1]}`);
}

function getVersionBadge(value) {
  const pin = value.replace('^', '').replace('~', '');
  const currentVersion = getMinorVersion(MLV_VERSION);
  const version = getMinorVersion(pin);
  let status = 'success';

  if ((currentVersion - version) > 2) {
    status = 'warning';
  }

  if ((currentVersion - version) > 4 || value.includes('workspace')) {
    status = 'danger';
  }

  return html`<nve-badge status=${status as any}>${pin}</nve-badge>`;
}

function getCoverageStatus(value, message = '') {
  // get status based on lcov standard coverage ranges
  let status = 'unknown';

  if (value !== undefined) {
    if (value > 90) {
      status = 'success';
    } else if (value > 70) {
      status = 'warning';
    } else {
      status = 'danger';
    }
  }

  const format = status !== 'unknown' ? new Intl.NumberFormat('default', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100) : 'unknown';
  return html`<nve-badge status=${status as any}>${message} ${format}</nve-badge>`;
}

function getStatusBadge(status, message = '') {
  const statuses = {
    'pre-release': 'warning',
    'beta': 'accent',
    'stable': 'success',
    undefined: 'unknown'
  };

  return html`<nve-badge .status=${statuses[status]}>${status ? status : 'unknown'}${message}</nve-badge>`
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

class ElementStatus extends LitElement {
  @property({ type: String }) tag = '';

  static metadata = {
    tag: 'element-status',
    version: 'demo'
  }

  render() {
    const metadata = metrics.elements.find(d => d.name === this.tag);
    return html`
    <div className="status-summary" style="margin: 0 0 80px 0">
      <h2 id="stability" style="gap: 0">Release Status</h2>
      <p>All elements and features go through 3 phases of stability, pre-release, beta and stable.</p>
      <h3><nve-badge .status=${metadata.status === 'pre-release' ? 'warning' : 'pending'}>pre-release <nve-icon name="warning"></nve-icon></nve-badge></h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <nve-alert .status=${metadata.figma ? 'finished' : 'pending'}>Published in <a href="http://nv/elements-figma">Figma</a></nve-alert>
        <nve-alert .status=${metadata.storybook ? 'finished' : 'pending'}>Storybook Preview</nve-alert>
        <nve-alert .status=${metadata.storybook ? 'finished' : 'pending'}>API Documentation</nve-alert>
        <nve-alert .status=${metadata.themes ? 'finished' : 'pending'}>Theme Support</nve-alert>
      </div>
      <h3><nve-badge .status=${metadata.status === 'beta' ? 'running' : 'pending'}>beta <nve-icon name="schedule"></nve-icon></nve-badge></h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <nve-alert .status=${metadata.unitTests ? 'finished' : 'pending'}>Robust unit test coverages</nve-alert>
        <nve-alert .status=${metadata.apiReview ? 'finished' : 'pending'}>Passed <a href="./?path=/docs/about-api-design-getting-started--docs">API Review</a></nve-alert>
        <nve-alert .status=${metadata.vqa ? 'finished' : 'pending'}>Passed Designer VQA Review</nve-alert>
        <nve-alert .status=${metadata.package ? 'finished' : 'pending'}>Included in <a href="http://nv/elements">library package</a></nve-alert>
      </div>
      <h3><nve-badge .status=${metadata.status === 'stable' ? 'finished' : 'pending'}>stable <nve-icon name="checkmark-circle"></nve-icon></nve-badge></h3>
      <div style="display: flex; flex-direction: column; gap: 8px">
        <nve-alert .status=${metadata.aria ? 'finished' : 'pending'}>No known outstanding <a href="https://www.w3.org/WAI/ARIA/apg/">AA WCAG issues</a></nve-alert>
        <nve-alert .status=${metadata.performance ? 'finished' : 'pending'}>No known outstanding performance issues</nve-alert>
        <nve-alert .status=${metadata.responsive ? 'finished' : 'pending'}>Adapts to different screen/container sizes</nve-alert>
        <nve-alert .status=${metadata.stable ? 'finished' : 'pending'}>No breaking API changes for at least 90 days</nve-alert>
      </div>
    </div>
    `;
  }

  createRenderRoot() {
    return this;
  }
}

define(ElementStatus)

class ElementMetrics extends LitElement {
  @property({ type: String }) tag = '';

  static metadata = {
    tag: 'element-metrics',
    version: 'demo'
  }

  render() {
    const element = metrics.elements.find(d => d.name === this.tag);
    return html`
    <section nve-layout="column gap:md">
      <div nve-layout="row gap:sm align:vertical-center">
        <div>${getStatusBadge(element.status, ` ${MLV_VERSION}`)}</div>
        <div>${getCoverageStatus(element.coverageTotal, 'coverage: ')}</div>
        <a href=${element.aria} nve-text="link no-visit label">API Spec</a>
        ${element.figma ? html`<a href=${element.figma} nve-text="link no-visit label">Figma</a>` : nothing}
      </div>
      ${element.description ? html`<p nve-text="body">${element.description}</p>` : nothing}
    </section>`;
  }

  createRenderRoot() {
    return this;
  }
}

define(ElementMetrics)

class ElementsMetrics extends LitElement {
  static styles = [unsafeCSS(`${typography}${layout}`)];

  static metadata = {
    tag: 'elements-metrics',
    version: 'demo'
  }

  @state() state = {
    tooltipColumn: null,
    columns: {
      element: { sort: 'none' },
      status: { sort: 'none' },
      coverage: { sort: 'none' },
      spec: { sort: 'none', tooltip: 'Behavior category from W3C and WAI-ARIA Specification' },
      themes: { sort: 'none' },
      responsive: { sort: 'none' },
      instances: { sort: 'none', tooltip: 'Number of instances of element directly in MagLev source. Note this does not account for runtime instances created from reusable abstractions.' },
      projects: { sort: 'none', tooltip: 'Number of Maglev Projects which reference the given element.' },
      figma: { sort: 'none' }
    }
  };

  get elements() {
    return Object.entries(this.state.columns).reduce((elements, [name, column]) => {
        if (column.sort !== 'none') {
          elements = basicSort(elements, name);
          elements = column.sort === 'descending' ? elements.reverse() : elements;
        }
        return elements;
    }, [...metrics.elements]);
  }

  render() {
    return html`
      <nve-grid style="--scroll-height: calc(100vh - 210px">
        <nve-grid-header>
          ${Object.entries(this.state.columns).map(([name, column]) => html`
            <nve-grid-column
              @mouseover=${() => this.state = { ...this.state, tooltipColumn: name } }
              @mouseleave=${() => this.state = { ...this.state, tooltipColumn: null } }
              id=${name}
              width="160px">
              ${name.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1").replace(/^./, (match) => match.toUpperCase())}
              <nve-sort-button .name=${name} .sort=${column.sort as 'ascending' | 'descending' | 'none'} @sort=${e => this.#sort(e)}></nve-sort-button>
            </nve-grid-column>
          `)}
        </nve-grid-header>
        ${this.elements.map(element => {
          return html`
          <nve-grid-row>
            <nve-grid-cell><a href=${element.storybook.replace('https://elements.nvidia.com/ui/storybook/elements', './')} nve-text="body link no-visit">${element.name.replace('nve-', '')}</a></nve-grid-cell>
            <nve-grid-cell>${getStatusBadge(element.status)}</nve-grid-cell>
            <nve-grid-cell>${getCoverageStatus(element.coverageTotal)}</nve-grid-cell>
            <nve-grid-cell>${getBehaviorCategoryIcon(element.behavior)}&nbsp;&nbsp;<a href=${element.aria} nve-text="link no-visit">${element.behavior}</a></nve-grid-cell>
            <nve-grid-cell><nve-icon name="checkmark-circle" status="success"></nve-icon></nve-grid-cell>
            <nve-grid-cell>${element.responsive ? html`<nve-icon name="checkmark-circle" status="success"></nve-icon>` : html`<nve-icon name="warning" status="warning"></nve-icon>`}</nve-grid-cell>
            <nve-grid-cell>${element.instanceTotal}</nve-grid-cell>
            <nve-grid-cell>${element.projectTotal}</nve-grid-cell>
            <nve-grid-cell>${element.figma ? html`<a href=${element.figma} nve-text="link no-visit">Figma</a>` : html`<nve-icon name="warning" status="warning"></nve-icon>`}</nve-grid-cell>
          </nve-grid-row>`
        })}
        <nve-grid-footer>
          <p nve-text="body muted sm">Report Created on ${reportDate}</p>
          <nve-button @click=${() => this.dispatchEvent(new CustomEvent('view-data', { detail: 'elements', bubbles: true }))} interaction="flat" style="margin-left: auto">view data</nve-button>
        </nve-grid-footer>
      </nve-grid>
      <nve-tooltip style="--width: 300px" ?hidden=${!this.state.columns[this.state.tooltipColumn]?.tooltip} anchor=${this.state.tooltipColumn as any}>${this.state.columns[this.state.tooltipColumn]?.tooltip}</nve-tooltip>
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
      project: { sort: 'none', width: '250px' },
      '@elements/elements': { sort: 'none', width: '200px' },
      instanceTotal: { sort: 'none', width: '200px', tooltip: 'Number of instances of elements directly in MagLev source. Note this does not account for runtime instances created from reusable abstractions.' },
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
    }, [...metrics.projects]);
  }

  render() {
    return html`
      <nve-grid style="--scroll-height: calc(50vh - 135px)">
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
        ${this.projects.sort((a, b) => getMinorVersion(a.elementsVersion) > getMinorVersion(b.elementsVersion) ? -1 : 1 ).map(project => html`
          <nve-grid-row>
            <nve-grid-cell>${project.name}</nve-grid-cell>
            <nve-grid-cell>${getVersionBadge(project.elementsVersion)}</nve-grid-cell>
            <nve-grid-cell>${project.instanceTotal}</nve-grid-cell>
            <nve-grid-cell><code nve-text="code">${project.path}</code></nve-grid-cell>
          </nve-grid-row>
        `)}
        <nve-grid-footer>
          <p nve-text="body muted sm">Report Created on ${reportDate}</p>
          <nve-button @click=${() => this.dispatchEvent(new CustomEvent('view-data', { detail: 'projects', bubbles: true }))} interaction="flat" style="margin-left: auto">view data</nve-button>
        </nve-grid-footer>
      </nve-grid>
      <nve-tooltip style="--width: 300px" ?hidden=${!this.state.columns[this.state.tooltipColumn]?.tooltip} anchor=${this.state.tooltipColumn as any}>${this.state.columns[this.state.tooltipColumn]?.tooltip}</nve-tooltip>
    `;
  }
}

define(ProjectMetrics);

class MetricDemo extends LitElement {
  @state() rawData: '' | 'elements' | 'projects' | 'versions' | 'tests' = '';

  static styles = [unsafeCSS(`${typography}${layout}`)];

  static metadata = {
    tag: 'metrics-demo',
    version: 'demo'
  }

  render() {
    return html`
    <div nve-theme="root" nve-layout="column gap:xl align:horizontal-stretch pad:lg" no-story-container @view-data=${e => this.rawData = e.detail}>
      <div nve-layout="column gap:md">
        <div nve-layout="row gap:md">
          <h1 nve-text="heading lg">@elements/elements</h1>
          <nve-badge status="success">version ${MLV_VERSION}</nve-badge>
        </div>
        <p nve-text="body muted">Below are metrics measuring various aspects of the Elements system including usage, test coverage and API stability.</p>
      </div>

      <section nve-layout="grid gap:md">
        <div nve-layout="column gap:md align:horizontal-stretch span:6">
          <div nve-layout="row gap:md align:vertical-center">
            <h3 nve-text="body bold">Summary:</h3>
            <section nve-layout="row gap:xs align:center">
              <span nve-text="body sm muted">Total Available Components</span>
              <span nve-text="body sm bold"><nve-badge status="success">${metrics.elements.length}</nve-badge></span>
              <span nve-text="body sm muted">Total Maglev Instances</span>
              <span nve-text="body sm bold"><nve-badge status="success">${metrics.projects.reduce((p, n) => n.instanceTotal + p, 0)}</nve-badge></span>
            </section>
          </div>
          <elements-metrics></elements-metrics>
        </div>
        <div nve-layout="column gap:md align:horizontal-stretch span:6">
          <div nve-layout="row gap:md align:vertical-center">
            <h3 nve-text="body bold">Test Coverage:</h3>
            <section nve-layout="row gap:xs align:center">
              <span nve-text="body sm muted">Statements</span>
              <span nve-text="body sm bold">${getCoverageStatus(metrics.tests.coverageTotal.statements.pct)}</span>
            </section>
            <section nve-layout="row gap:xs align:center">
              <span nve-text="body sm muted">Lines</span>
              <span nve-text="body sm bold">${getCoverageStatus(metrics.tests.coverageTotal.lines.pct)}</span>
            </section>
            <section nve-layout="row gap:xs align:center">
              <span nve-text="body sm muted">Functions</span>
              <span nve-text="body sm bold">${getCoverageStatus(metrics.tests.coverageTotal.functions.pct)}</span>
            </section>
            <section nve-layout="row gap:xs align:center">
              <span nve-text="body sm muted">Branches</span>
              <span nve-text="body sm bold">${getCoverageStatus(metrics.tests.coverageTotal.branches.pct)}</span>
            </section>
          </div>
          <nve-grid style="--scroll-height: calc(50vh - 130px)">
            <nve-grid-header>
              <nve-grid-column width="350px">File</nve-grid-column>
              <nve-grid-column width="180px">Statements</nve-grid-column>
              <nve-grid-column width="180px">Lines</nve-grid-column>
              <nve-grid-column width="180px">Functions</nve-grid-column>
              <nve-grid-column>Branches</nve-grid-column>
            </nve-grid-header>
            ${metrics.tests.coverage.map(cov => html`
              <nve-grid-row>
                <nve-grid-cell><p nve-text="body truncate">${cov.file}</p></nve-grid-cell>
                <nve-grid-cell>${getCoverageStatus(cov.statements.pct)}</nve-grid-cell>
                <nve-grid-cell>${getCoverageStatus(cov.lines.pct)}</nve-grid-cell>
                <nve-grid-cell>${getCoverageStatus(cov.functions.pct)}</nve-grid-cell>
                <nve-grid-cell>${getCoverageStatus(cov.branches.pct)}</nve-grid-cell>
              </nve-grid-row>
            `)}
            <nve-grid-footer>
              <p nve-text="body muted sm">Report Created on ${reportDate}</p>
              <nve-button @click=${() => this.rawData = 'tests'} interaction="flat" style="margin-left: auto">view data</nve-button>
            </nve-grid-footer>
          </nve-grid>
          <project-metrics></project-metrics>
        </div>
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
      <div style="padding: 12px; width: 100%;">
        <nve-json-viewer expanded>${JSON.stringify(metrics[this.rawData])}</nve-json-viewer>
      </div>
    </nve-drawer>
`;
  }

  #search(e: any) {
    const value = e.target.value.length ? searchJson(structuredClone(metrics[this.rawData]), e.target.value) : metrics[this.rawData];
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
