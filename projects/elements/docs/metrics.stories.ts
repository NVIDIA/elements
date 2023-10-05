import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { state } from 'lit/decorators/state.js';
import { property } from 'lit/decorators/property.js';
import showdown from 'showdown';
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
const showdownOptions = { simplifiedAutoLink: true };

export default {
  title: 'Elements/Data Grid/Examples',
  component: 'mlv-grid',
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

  return html`<mlv-badge status=${status as any}>${pin}</mlv-badge>`;
}

function getCoverageStatus(value, message = '') {
  // get status based on lcov standard coverage ranges
  let status = 'unknown';

  if (value !== undefined) {
    if (value >= 90) {
      status = 'success';
    } else if (value >= 70) {
      status = 'warning';
    } else {
      status = 'danger';
    }
  }

  const format = status !== 'unknown' ? new Intl.NumberFormat('default', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100) : 'unknown';
  return html`<mlv-badge status=${status as any}>${message} ${format}</mlv-badge>`;
}

function getStatusBadge(status, message = '') {
  const statuses = {
    'pre-release': 'warning',
    'beta': 'accent',
    'stable': 'success',
    undefined: 'unknown'
  };

  return html`<mlv-badge .status=${statuses[status]}>${status ? status : 'unknown'}${message}</mlv-badge>`
}

function getA11yStatusBadge(axe: string | boolean, shorthand = false) {
  if (axe === undefined) {
    return html`<mlv-badge status="success">${shorthand ? 'Reviewed' : 'Accessibility: Reviewed'}</mlv-badge>`;
  } else if (axe === false) {
    return html`<mlv-badge status="pending">${shorthand ? 'Pending' : 'Accessibility: Pending'}</mlv-badge>`
  } else {
    return html`<mlv-badge status="warning" style="--text-transform: none"><a href="https://dequeuniversity.com/rules/axe/4.8/${axe}?application=axeAPI" target="_blank">${shorthand ? axe : `Accessibility: ${axe}`}</a></mlv-badge>`
  }
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
      <h3><mlv-badge .status=${metadata.status === 'pre-release' ? 'warning' : 'pending'}>pre-release <mlv-icon name="warning"></mlv-icon></mlv-badge></h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <mlv-alert .status=${metadata.figma ? 'finished' : 'pending'}>Published in <a href="http://nv/elements-figma">Figma</a></mlv-alert>
        <mlv-alert .status=${metadata.storybook ? 'finished' : 'pending'}>Storybook Preview</mlv-alert>
        <mlv-alert .status=${metadata.storybook ? 'finished' : 'pending'}>API Documentation</mlv-alert>
        <mlv-alert .status=${metadata.themes ? 'finished' : 'pending'}>Theme Support</mlv-alert>
      </div>
      <h3><mlv-badge .status=${metadata.status === 'beta' ? 'running' : 'pending'}>beta <mlv-icon name="schedule"></mlv-icon></mlv-badge></h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <mlv-alert .status=${metadata.unitTests ? 'finished' : 'pending'}>Robust unit test coverages</mlv-alert>
        <mlv-alert .status=${metadata.apiReview ? 'finished' : 'pending'}>Passed <a href="./?path=/docs/about-api-design-getting-started--docs">API Review</a></mlv-alert>
        <mlv-alert .status=${metadata.vqa ? 'finished' : 'pending'}>Passed Designer VQA Review</mlv-alert>
        <mlv-alert .status=${metadata.package ? 'finished' : 'pending'}>Included in <a href="http://nv/elements">library package</a></mlv-alert>
      </div>
      <h3><mlv-badge .status=${metadata.status === 'stable' ? 'finished' : 'pending'}>stable <mlv-icon name="checkmark-circle"></mlv-icon></mlv-badge></h3>
      <div style="display: flex; flex-direction: column; gap: 8px">
        <mlv-alert .status=${metadata.aria ? 'finished' : 'pending'}>No known outstanding <a href="https://www.w3.org/WAI/ARIA/apg/">AA WCAG issues</a></mlv-alert>
        <mlv-alert .status=${metadata.performance ? 'finished' : 'pending'}>No known outstanding performance issues</mlv-alert>
        <mlv-alert .status=${metadata.responsive ? 'finished' : 'pending'}>Adapts to different screen/container sizes</mlv-alert>
        <mlv-alert .status=${metadata.stable ? 'finished' : 'pending'}>No breaking API changes for at least 90 days</mlv-alert>
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

  @property({ type: String }) type: 'property' | 'slot';

  @property({ type: String }) value: string;

  static metadata = {
    tag: 'element-metrics',
    version: 'demo'
  }

  render() {
    const element = metrics.elements.find(d => d.name === this.tag);
    return html`
      ${this.type === 'property' ? html`<div .innerHTML=${new showdown.Converter(showdownOptions).makeHtml((element.properties?.find(m => m.name === this.value)?.description) ?? '')?.replace('<p>', '<p mlv-text="body">')}></div>` : nothing}
      ${this.type === 'slot' ? html`<div .innerHTML=${new showdown.Converter(showdownOptions).makeHtml((element.slots?.find(m => m.name === this.value)?.description) ?? '')?.replace('<p>', '<p mlv-text="body">')}></div>` : nothing}
      ${!this.type ? html`
      <section mlv-layout="column gap:md">
        <div mlv-layout="row gap:sm align:vertical-center">
          <div>${getStatusBadge(element.status, ` ${MLV_VERSION}`)}</div>
          <div>${getCoverageStatus(element.coverageTotal, 'coverage: ')}</div>
          <div>${getA11yStatusBadge(element.axe)}</div>
          <a href=${element.aria} mlv-text="link no-visit label">API Spec</a>
          ${element.figma ? html`<a href=${element.figma} mlv-text="link no-visit label">Figma</a>` : nothing}
          <a href="https://artifactory.build.nvidia.com/ui/packages?name=%40elements%2Felements&type=packages" mlv-text="link no-visit label">Released ${element.since}</a>
        </div>
        ${element.description ? html`<div .innerHTML=${new showdown.Converter(showdownOptions).makeHtml(element.description).replace('<p>', '<p mlv-text="body">')}></div>` : nothing}
      </section>` : nothing}
    `; 
  }

  createRenderRoot() {
    return this;
  }
}

define(ElementMetrics);

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
      element: { sort: 'none', width: '200px' },
      status: { sort: 'none', width: '150px' },
      coverage: { sort: 'none', width: '150px' },
      accessibility: { sort: 'none', tooltip: 'Accessibility status from Axe Core API', width: '190px' },
      spec: { sort: 'none', tooltip: 'Behavior category from W3C and WAI-ARIA Specification', width: '130px' },
      released: { sort: 'none', tooltip: 'Version Element was first released', width: '100px' },
      instances: { sort: 'none', tooltip: 'Number of instances of element directly in MagLev source. Note this does not account for runtime instances created from reusable abstractions.', width: '100px' },
      projects: { sort: 'none', tooltip: 'Number of Maglev Projects which reference the given element.', width: '100px' },
      figma: { sort: 'none', width: '100px' },
      themes: { sort: 'none', width: '100px' },
      responsive: { sort: 'none', width: '100px' },
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
      <mlv-grid style="--scroll-height: calc(100vh - 210px">
        <mlv-grid-header>
          ${Object.entries(this.state.columns).map(([name, column]) => html`
            <mlv-grid-column
              @mouseover=${() => this.state = { ...this.state, tooltipColumn: name } }
              @mouseleave=${() => this.state = { ...this.state, tooltipColumn: null } }
              id=${name}
              width=${column.width ? column.width : '160px'}>
              ${name.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1").replace(/^./, (match) => match.toUpperCase())}
              <mlv-sort-button .name=${name} .sort=${column.sort as 'ascending' | 'descending' | 'none'} @sort=${e => this.#sort(e)}></mlv-sort-button>
            </mlv-grid-column>
          `)}
        </mlv-grid-header>
        ${this.elements.map(element => {
          return html`
          <mlv-grid-row>
            <mlv-grid-cell><a href=${element.storybook.replace('https://elements.nvidia.com/ui/storybook/elements', './')} mlv-text="body link no-visit">${element.name.replace('mlv-', '')}</a></mlv-grid-cell>
            <mlv-grid-cell>${getStatusBadge(element.status)}</mlv-grid-cell>
            <mlv-grid-cell>${getCoverageStatus(element.coverageTotal)}</mlv-grid-cell>
            <mlv-grid-cell>${getA11yStatusBadge(element.axe, true)}</mlv-grid-cell>
            <mlv-grid-cell>${getBehaviorCategoryIcon(element.behavior)}&nbsp;&nbsp;<a href=${element.aria} mlv-text="link no-visit">${element.behavior}</a></mlv-grid-cell>
            <mlv-grid-cell>${element.since}</mlv-grid-cell>
            <mlv-grid-cell>${element.instanceTotal}</mlv-grid-cell>
            <mlv-grid-cell>${element.projectTotal}</mlv-grid-cell>
            <mlv-grid-cell>${element.figma ? html`<a href=${element.figma} mlv-text="link no-visit">Figma</a>` : html`<mlv-icon name="warning" status="warning"></mlv-icon>`}</mlv-grid-cell>
            <mlv-grid-cell><mlv-icon name="checkmark-circle" status="success"></mlv-icon></mlv-grid-cell>
            <mlv-grid-cell>${element.responsive ? html`<mlv-icon name="checkmark-circle" status="success"></mlv-icon>` : html`<mlv-icon name="warning" status="warning"></mlv-icon>`}</mlv-grid-cell>
          </mlv-grid-row>`
        })}
        <mlv-grid-footer>
          <p mlv-text="body muted sm">Report Created on ${reportDate}</p>
          <mlv-button @click=${() => this.dispatchEvent(new CustomEvent('view-data', { detail: 'elements', bubbles: true }))} interaction="flat" style="margin-left: auto">view data</mlv-button>
        </mlv-grid-footer>
      </mlv-grid>
      <mlv-tooltip style="--width: 300px" ?hidden=${!this.state.columns[this.state.tooltipColumn]?.tooltip} anchor=${this.state.tooltipColumn as any}>${this.state.columns[this.state.tooltipColumn]?.tooltip}</mlv-tooltip>
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
      <mlv-grid style="--scroll-height: calc(50vh - 135px)">
        <mlv-grid-header>
          ${Object.entries(this.state.columns).map(([name, column]) => html`
            <mlv-grid-column
              @mouseover=${() => this.state = { ...this.state, tooltipColumn: name } }
              @mouseleave=${() => this.state = { ...this.state, tooltipColumn: null } }
              .name=${name}
              .width=${column.width}
              id=${name}>${name.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1").replace(/^./, (match) => match.toUpperCase())}</mlv-grid-column>
          `)}
        </mlv-grid-header>
        ${this.projects.sort((a, b) => getMinorVersion(a.elementsVersion) > getMinorVersion(b.elementsVersion) ? -1 : 1 ).map(project => html`
          <mlv-grid-row>
            <mlv-grid-cell>${project.name}</mlv-grid-cell>
            <mlv-grid-cell>${getVersionBadge(project.elementsVersion)}</mlv-grid-cell>
            <mlv-grid-cell>${project.instanceTotal}</mlv-grid-cell>
            <mlv-grid-cell><code mlv-text="code">${project.path}</code></mlv-grid-cell>
          </mlv-grid-row>
        `)}
        <mlv-grid-footer>
          <p mlv-text="body muted sm">Report Created on ${reportDate}</p>
          <mlv-button @click=${() => this.dispatchEvent(new CustomEvent('view-data', { detail: 'projects', bubbles: true }))} interaction="flat" style="margin-left: auto">view data</mlv-button>
        </mlv-grid-footer>
      </mlv-grid>
      <mlv-tooltip style="--width: 300px" ?hidden=${!this.state.columns[this.state.tooltipColumn]?.tooltip} anchor=${this.state.tooltipColumn as any}>${this.state.columns[this.state.tooltipColumn]?.tooltip}</mlv-tooltip>
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
    <div mlv-theme="root" mlv-layout="column gap:xl align:horizontal-stretch pad:lg" no-story-container @view-data=${e => this.rawData = e.detail}>
      <div mlv-layout="column gap:md">
        <div mlv-layout="row gap:md">
          <h1 mlv-text="heading lg">@elements/elements</h1>
          <mlv-badge status="success">version ${MLV_VERSION}</mlv-badge>
        </div>
        <p mlv-text="body muted">Below are metrics measuring various aspects of the Elements system including usage, test coverage and API stability.</p>
      </div>

      <section mlv-layout="grid gap:md">
        <div mlv-layout="column gap:md align:horizontal-stretch span:6">
          <div mlv-layout="row gap:md align:vertical-center">
            <h3 mlv-text="body bold">Summary:</h3>
            <section mlv-layout="row gap:xs align:center">
              <span mlv-text="body sm muted">Total Available Components</span>
              <span mlv-text="body sm bold"><mlv-badge status="success">${metrics.elements.length}</mlv-badge></span>
              <span mlv-text="body sm muted">Total Maglev Instances</span>
              <span mlv-text="body sm bold"><mlv-badge status="success">${metrics.projects.reduce((p, n) => n.instanceTotal + p, 0)}</mlv-badge></span>
            </section>
          </div>
          <elements-metrics></elements-metrics>
        </div>
        <div mlv-layout="column gap:md align:horizontal-stretch span:6">
          <div mlv-layout="row gap:md align:vertical-center">
            <h3 mlv-text="body bold">Test Coverage:</h3>
            <section mlv-layout="row gap:xs align:center">
              <span mlv-text="body sm muted">Statements</span>
              <span mlv-text="body sm bold">${getCoverageStatus(metrics.tests.coverageTotal.statements.pct)}</span>
            </section>
            <section mlv-layout="row gap:xs align:center">
              <span mlv-text="body sm muted">Lines</span>
              <span mlv-text="body sm bold">${getCoverageStatus(metrics.tests.coverageTotal.lines.pct)}</span>
            </section>
            <section mlv-layout="row gap:xs align:center">
              <span mlv-text="body sm muted">Functions</span>
              <span mlv-text="body sm bold">${getCoverageStatus(metrics.tests.coverageTotal.functions.pct)}</span>
            </section>
            <section mlv-layout="row gap:xs align:center">
              <span mlv-text="body sm muted">Branches</span>
              <span mlv-text="body sm bold">${getCoverageStatus(metrics.tests.coverageTotal.branches.pct)}</span>
            </section>
          </div>
          <mlv-grid style="--scroll-height: calc(50vh - 130px)">
            <mlv-grid-header>
              <mlv-grid-column width="350px">File</mlv-grid-column>
              <mlv-grid-column width="180px">Statements</mlv-grid-column>
              <mlv-grid-column width="180px">Lines</mlv-grid-column>
              <mlv-grid-column width="180px">Functions</mlv-grid-column>
              <mlv-grid-column>Branches</mlv-grid-column>
            </mlv-grid-header>
            ${metrics.tests.coverage.map(cov => html`
              <mlv-grid-row>
                <mlv-grid-cell><p mlv-text="body truncate">${cov.file}</p></mlv-grid-cell>
                <mlv-grid-cell>${getCoverageStatus(cov.statements.pct)}</mlv-grid-cell>
                <mlv-grid-cell>${getCoverageStatus(cov.lines.pct)}</mlv-grid-cell>
                <mlv-grid-cell>${getCoverageStatus(cov.functions.pct)}</mlv-grid-cell>
                <mlv-grid-cell>${getCoverageStatus(cov.branches.pct)}</mlv-grid-cell>
              </mlv-grid-row>
            `)}
            <mlv-grid-footer>
              <p mlv-text="body muted sm">Report Created on ${reportDate}</p>
              <mlv-button @click=${() => this.rawData = 'tests'} interaction="flat" style="margin-left: auto">view data</mlv-button>
            </mlv-grid-footer>
          </mlv-grid>
          <project-metrics></project-metrics>
        </div>
      </section>
    </div>
    <mlv-drawer @close=${() => this.rawData = ''} .hidden=${!this.rawData} position="right" modal closable style="--max-width: 720px; --content-padding: 0">
      <mlv-drawer-header>
        <div mlv-layout="column gap:md full">
          <h2 mlv-text="heading" style="text-transform: capitalize">${this.rawData} data</h2>
          <mlv-search>
            <input type="search" @input=${this.#search} />
          </mlv-search>
        </div>
      </mlv-drawer-header>
      <div style="padding: 12px; width: 100%;">
        <mlv-json-viewer expanded>${JSON.stringify(metrics[this.rawData])}</mlv-json-viewer>
      </div>
    </mlv-drawer>
`;
  }

  #search(e: any) {
    const value = e.target.value.length ? searchJson(structuredClone(metrics[this.rawData]), e.target.value) : metrics[this.rawData];
    (this.shadowRoot as any).querySelector('mlv-json-viewer').value = value;
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
