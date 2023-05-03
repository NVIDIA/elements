import { html, LitElement, unsafeCSS } from 'lit';
import { state } from 'lit/decorators/state.js';
import { property } from 'lit/decorators/property.js';
import { define } from '@elements/elements/internal';
import { MLV_VERSION } from '@elements/elements';
import typography from '@elements/elements/css/module.typography.css';
import layout from '@elements/elements/css/module.layout.css';
import '@elements/elements/grid/define.js';
import metrics from 'metrics/data.json';

const reportDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(new Date(metrics.created));

export default {
  title: 'Elements/Data Grid/Examples',
  component: 'mlv-grid',
  parameters: { badges: ['alpha'] }
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
    if (value > 90) {
      status = 'success';
    } else if (value > 70) {
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

class ElementMetrics extends LitElement {
  @property({ type: String }) tag = '';

  static metadata = {
    tag: 'metrics-demo',
    version: 'demo'
  }

  render() {
    const element = metrics.elements.find(d => d.name === this.tag);
    return html`
    <section mlv-layout="row gap:sm align:vertical-center">
      <div>${getStatusBadge(element.status, ` ${MLV_VERSION}`)}</div>
      <div>${getCoverageStatus(element.coverageTotal, 'coverage: ')}</div>
      <div><a href=${element.aria} mlv-text="link no-visit label">API Spec</a></div>
      <div>${element.figma ? html`<a href=${element.figma} mlv-text="link no-visit label">Figma</a>` : html`<mlv-icon name="warning" status="warning"></mlv-icon>`}</div>
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
      <mlv-grid style="--scroll-height: calc(100vh - 210px">
        <mlv-grid-header>
          ${Object.entries(this.state.columns).map(([name, column]) => html`
            <mlv-grid-column
              @mouseover=${() => this.state = { ...this.state, tooltipColumn: name } }
              @mouseleave=${() => this.state = { ...this.state, tooltipColumn: null } }
              id=${name}
              width="160px">
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
            <mlv-grid-cell>${getBehaviorCategoryIcon(element.behavior)}&nbsp;&nbsp;<a href=${element.aria} mlv-text="link no-visit">${element.behavior}</a></mlv-grid-cell>
            <mlv-grid-cell><mlv-icon name="success-badge" status="success"></mlv-icon></mlv-grid-cell>
            <mlv-grid-cell>${element.responsive ? html`<mlv-icon name="success-badge" status="success"></mlv-icon>` : html`<mlv-icon name="warning" status="warning"></mlv-icon>`}</mlv-grid-cell>
            <mlv-grid-cell>${element.instanceTotal}</mlv-grid-cell>
            <mlv-grid-cell>${element.projectTotal}</mlv-grid-cell>
            <mlv-grid-cell>${element.figma ? html`<a href=${element.figma} mlv-text="link no-visit">Figma</a>` : html`<mlv-icon name="warning" status="warning"></mlv-icon>`}</mlv-grid-cell>
          </mlv-grid-row>`
        })}
        <mlv-grid-footer><p mlv-text="body muted sm">Report Created on ${reportDate}</p></mlv-grid-footer>
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
        <mlv-grid-footer><p mlv-text="body muted sm">Report Created on ${reportDate}</p></mlv-grid-footer>
      </mlv-grid>
      <mlv-tooltip style="--width: 300px" ?hidden=${!this.state.columns[this.state.tooltipColumn]?.tooltip} anchor=${this.state.tooltipColumn as any}>${this.state.columns[this.state.tooltipColumn]?.tooltip}</mlv-tooltip>
    `;
  }
}

define(ProjectMetrics);

export const Metrics = {
  render: () => html`
<div mlv-theme="root" mlv-layout="column gap:xl align:horizontal-stretch pad:lg" no-story-container>
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
          <span mlv-text="body sm muted">Total</span>
          <span mlv-text="body sm bold"><mlv-badge>${metrics.elements.length}</mlv-badge></span>
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
            <mlv-grid-cell><p mlv-text="truncate">${cov.file}</p></mlv-grid-cell>
            <mlv-grid-cell>${getCoverageStatus(cov.statements.pct)}</mlv-grid-cell>
            <mlv-grid-cell>${getCoverageStatus(cov.lines.pct)}</mlv-grid-cell>
            <mlv-grid-cell>${getCoverageStatus(cov.functions.pct)}</mlv-grid-cell>
            <mlv-grid-cell>${getCoverageStatus(cov.branches.pct)}</mlv-grid-cell>
          </mlv-grid-row>
        `)}
        <mlv-grid-footer>
          <p mlv-text="body muted sm">Report Created on ${reportDate}</p>
        </mlv-grid-footer>
      </mlv-grid>
      <project-metrics></project-metrics>
    </div>
  </section>
</div>
  `
};
