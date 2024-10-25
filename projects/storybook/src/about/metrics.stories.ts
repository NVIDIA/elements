import { html, css, LitElement, nothing, unsafeCSS } from 'lit';
import { state } from 'lit/decorators/state.js';
import { property } from 'lit/decorators/property.js';
import showdown from 'showdown';
import { compareVersions } from 'compare-versions';

import { define } from '@nvidia-elements/core/internal';
import typography from '@nvidia-elements/styles/typography.css?inline';
import layout from '@nvidia-elements/styles/layout.css?inline';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/tag/define.js';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/sort-button/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/drawer/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/json-viewer/define.js';
import '@nvidia-elements/core/tabs/define.js';
import metrics from '../../../internals/metadata/metadata.json';
import metricsMaglev from '../../../internals/metadata/elements.json';
import { ELEMENTS_VERSION } from '../../.storybook/version.js';

const reportDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(new Date(metrics.created));
const showdownOptions = { simplifiedAutoLink: true };

export default {
  title: 'Internal/Metrics'
};

function getVersionNum(value) {
  return parseFloat(`${value.replace('^', '').replace('~', '')}`);
}

function getMinorVersion(value) {
  return parseFloat(`${value.split('.')[1]}`) 
}

function getVersionBadge(value) {
  const latestBetaElementsRelease = 41; // last minor patch for 0.x was 0.41.0;
  const projectMinorVersion = getMinorVersion(value);

  let status = 'success';

  if (getVersionNum(value) < 1.0) {
    status = 'warning';
  }

  if (getVersionNum(value) < 1.0 && (latestBetaElementsRelease - projectMinorVersion) > 10 || value.includes('workspace')) {
    status = 'danger';
  }

  return html`<nve-badge status=${status as any}>${value.replace('^', '').replace('~', '')}</nve-badge>`;
}

function getCoverageStatus(value, message = '', container = 'flat') {
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
  return html`<nve-badge .container=${container} status=${status as any}>${message} ${format}</nve-badge>`;
}

function getStatusBadge(status, message = '', container = 'flat') {
  const statuses = {
    'pre-release': 'warning',
    'beta': 'accent',
    'stable': 'success',
    undefined: 'unknown'
  };

  return html`<nve-badge .container=${container} .status=${statuses[status]}>${status ? status : 'unknown'}${message}</nve-badge>`
}

function getA11yStatusBadge(axe: string | boolean, shorthand = false, container = 'flat') {
  if (axe === undefined) {
    return html`<nve-badge .container=${container} status="success" style="--text-transform: none"><a href="https://github.com/dequelabs/axe-core" target="_blank">${shorthand ? 'Reviewed' : 'Accessibility'}</a></nve-badge>`;
  } else if (axe === false) {
    return html`<nve-badge .container=${container} status="pending">${shorthand ? 'Pending' : 'Accessibility: Pending'}</nve-badge>`
  } else {
    return html`<nve-badge .container=${container} status="warning" style="--text-transform: none"><a href="https://dequeuniversity.com/rules/axe/4.8/${axe}?application=axeAPI" target="_blank">${shorthand ? axe : `Accessibility: ${axe}`}</a></nve-badge>`
  }
}

function getLighthouseScoreStatus(score: number) {
  if (score > 95) {
    return 'success';
  } else if (score > 80) {
    return 'warning';
  } else if (score !== undefined) {
    return 'danger';
  } else {
    return 'unknown';
  }
}

function getLighthouseScores(element, container = '') {
  const scores = element.lighthouse.scores;
  const average = scores ? Math.floor((scores.performance + scores.accessibility + scores.bestPractices) / 3) : 0;
  return scores ? html`
  <nve-tooltip style="--background: var(--nve-sys-layer-overlay-background);" behavior-trigger anchor="lighthouse-badge" trigger="lighthouse-badge" position="bottom" hidden>
    <div nve-layout="column gap:sm">
      <nve-badge container="flat" .status=${getLighthouseScoreStatus(scores.performance)}>Performance: ${scores.performance}</nve-badge>
      <nve-badge container="flat" .status=${getLighthouseScoreStatus(scores.bestPractices)}>Best Practices: ${scores.bestPractices}</nve-badge>
      <nve-badge container="flat" .status=${getLighthouseScoreStatus(scores.accessibility)}>Accessibility: ${scores.accessibility}</nve-badge>
    </div>
  </nve-tooltip>
  <nve-badge id="lighthouse-badge" .status=${getLighthouseScoreStatus(average)} .container=${container} style="--text-transform: none">
    <a href="https://developer.chrome.com/docs/lighthouse/overview/" target="_blank">Lighthouse: ${average}</a>
  </nve-badge>
  ` : nothing;
}

function getPayloadSize(payload, container = 'flat') {
  return payload?.javascript ? html`<nve-badge .container=${container} status="success">${container === 'flat' ? nothing : 'Bundle: '}${payload.javascript.kb.toFixed(2)}kb</nve-badge>` : nothing;
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

class ElementStatus extends LitElement {
  @property({ type: String }) tag = '';

  static metadata = {
    tag: 'element-status',
    version: 'demo'
  }

  static styles = [unsafeCSS(`${typography}${layout}`)];

  get #element() {
    return metrics['@nvidia-elements/core'].elements.find(d => d.name === this.tag);
  }

  render() {
    const metadata = this.#element;
    return html`
    <div className="status-summary" nve-layout="column gap:md align:stretch">
      <div nve-layout="column gap:xs align:stretch pad-top:xl">
        <h2 id="stability" nve-text="heading xl">Release Status</h2>
      </div>
      <p nve-text="body">All elements and features go through 3 phases of stability, pre-release, beta and stable.</p>
      <div nve-layout="column gap:sm">
        <nve-badge .status=${metadata.status === 'pre-release' ? 'warning' : 'pending'}>pre-release <nve-icon name="exclamation-triangle"></nve-icon></nve-badge>
        <div nve-layout="column gap:xs">
          <nve-alert .status=${metadata.figma ? 'finished' : 'pending'}>Published in <a href="http://nv/elements-figma">Figma</a></nve-alert>
          <nve-alert .status=${metadata.storybook ? 'finished' : 'pending'}>Storybook Preview</nve-alert>
          <nve-alert .status=${metadata.storybook ? 'finished' : 'pending'}>API Documentation</nve-alert>
          <nve-alert .status=${metadata.themes ? 'finished' : 'pending'}>Fully Themeable</nve-alert>
        </div>
      </div>
      <div nve-layout="column gap:sm">
        <nve-badge .status=${metadata.status === 'beta' ? 'running' : 'pending'}>beta <nve-icon name="clock"></nve-icon></nve-badge>
        <div nve-layout="column gap:xs">
          <nve-alert .status=${metadata.unitTests ? 'finished' : 'pending'}>Robust unit test coverages</nve-alert>
          <nve-alert .status=${metadata.apiReview ? 'finished' : 'pending'}>Passed <a href="./?path=/docs/api-design-getting-started--docs">API Review</a></nve-alert>
          <nve-alert .status=${metadata.vqa ? 'finished' : 'pending'}>Passed Designer VQA Review</nve-alert>
          <nve-alert .status=${metadata.package ? 'finished' : 'pending'}>Included in <a href="http://nv/elements">library package</a></nve-alert>
        </div>
      </div>
      <div nve-layout="column gap:sm">
        <nve-badge .status=${metadata.status === 'stable' ? 'finished' : 'pending'}>stable <nve-icon name="checkmark-circle"></nve-icon></nve-badge>
        <div nve-layout="column gap:xs">
          <nve-alert .status=${metadata.aria ? 'finished' : 'pending'}>No known outstanding <a href="https://www.w3.org/WAI/ARIA/apg/">AA WCAG issues</a></nve-alert>
          <nve-alert .status=${metadata.performance ? 'finished' : 'pending'}>No known outstanding performance issues</nve-alert>
          <nve-alert .status=${metadata.responsive ? 'finished' : 'pending'}>Adapts to different screen/container sizes</nve-alert>
          <nve-alert .status=${metadata.stable ? 'finished' : 'pending'}>No breaking API changes for at least 90 days</nve-alert>
        </div>
      </div>
    </div>
    `;
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.id = 'element-status';
  }
}

define(ElementStatus);

class ElementMetrics extends LitElement {
  @property({ type: String }) tag = '';

  static metadata = {
    tag: 'element-metrics',
    version: 'demo'
  }
  
  static styles = [unsafeCSS(`${typography}${layout}`)];

  get #element() {
    return metrics['@nvidia-elements/core'].elements.find(d => d.name === this.tag || d.name === this.tag || d.name === this.tag);
  }

  render() {
    const element = this.#element;
    return html`
      <section nve-layout="column gap:lg">
        <div nve-layout="row gap:xs align:center full">
          <div nve-layout="row gap:xs">
            ${getStatusBadge(element.status, ` ${ELEMENTS_VERSION}`, '')}
            ${getCoverageStatus(element.tests.coverageTotal, 'coverage: ', '')}
            ${element.lighthouse?.payload ? getPayloadSize(element.lighthouse?.payload, '') : nothing}
            ${getLighthouseScores(element)}
            ${getA11yStatusBadge(element.axe, false, '')}
          </div>
          <nve-button size="sm" style="margin-left: auto"><nve-icon name="checklist" size="sm"></nve-icon><a href=${element.aria}>API Spec</a></nve-button>
          ${element.figma ? html`<nve-button size="sm"><nve-icon name="shapes" size="sm"></nve-icon><a href=${element.figma}>Figma</a></nve-button>` : nothing}
          <nve-button size="sm"><nve-icon name="merge" size="sm"></nve-icon><a href="https://artifactory.build.nvidia.com/ui/packages?name=%40elements%2Felements&type=packages">Released ${element.since}</a></nve-button>
        </div>
        ${element.description ? html`<div .innerHTML=${new showdown.Converter(showdownOptions).makeHtml(element.description).replace('<p>', '<p nve-text="body">')}></div>` : nothing}
      </section>
    `;
  }
}

define(ElementMetrics);

class ElementAPI extends LitElement {
  @property({ type: String }) tag = '';

  @property({ type: String }) type: 'property' | 'event' | 'slot';

  @property({ type: String }) value: string;

  static styles = [unsafeCSS(`${typography}${layout}`), css`:host { width: 100%; display: block; }`];

  static metadata = {
    tag: 'element-api',
    version: 'demo'
  }

  get #element() {
    return metrics['@nvidia-elements/core'].elements.find(d => d.name === this.tag || d.name === this.tag || d.name === this.tag);
  }

  #markdown = new showdown.Converter(showdownOptions);

  #checkIfPropertyExists(property) {
    return CSS.supports(`${property}: initial`);  
  }

  render() {
    return html`
      ${this.type === 'event' ? html`<div .innerHTML=${this.#markdown.makeHtml((`<code nve-text="code">${this.value}</code>: ` + this.#element.schema.events?.find(m => m.name === this.value)?.description))?.replace('<p>', '<p nve-text="body">')}></div>` : nothing}
      ${this.type === 'property' ? html`<div .innerHTML=${this.#markdown.makeHtml((this.#element.schema.properties?.find(m => m.name === this.value)?.description) ?? '')?.replace('<p>', '<p nve-text="body">')}></div>` : nothing}
      ${this.type === 'slot' ? html`<div .innerHTML=${this.#markdown.makeHtml((this.#element.schema.slots?.find(m => m.name === this.value)?.description) ?? '')?.replace('<p>', '<p nve-text="body">')}></div>` : nothing}
      ${!this.type ? html`
        <div nve-layout="column gap:xs pad-top:xl pad-bottom:lg align:stretch">
          <h3 nve-text="heading xl">API - ${this.tag}</h3>
          <nve-divider></nve-divider>
        </div>
        <div nve-layout="column gap:xxl align:stretch">
          <section nve-layout="column gap:md" ?hidden=${!this.#element.schema.attributes}>
            <h3 nve-text="heading">Properties</h3>
            <nve-grid>
              <nve-grid-header>
                <nve-grid-column width="120px">Property</nve-grid-column>
                <nve-grid-column width="180px">Attribute</nve-grid-column>
                <nve-grid-column>Description</nve-grid-column>
                <nve-grid-column>Type</nve-grid-column>
              </nve-grid-header>
              ${this.#element.schema.attributes?.map(attr => html`
              <nve-grid-row>
                <nve-grid-cell><code nve-text="code">${attr.fieldName}</code></nve-grid-cell>
                <nve-grid-cell><code nve-text="code">${attr.name}</code></nve-grid-cell>
                <nve-grid-cell .innerHTML=${this.#markdown.makeHtml(attr.description ?? '')}></nve-grid-cell>
                <nve-grid-cell>
                  <div nve-layout="row gap:xs align:wrap">
                    ${attr.type?.text ? html`${attr.type?.text.split(' | ').map(i => html`<nve-tag readonly color="gray-slate">${i.replaceAll("'", '')}</nve-tag>`)}` : nothing}
                    ${attr.enum ? html`${attr.enum.map(i => html`<nve-tag readonly color="gray-slate">${i.replaceAll("'", '')}</nve-tag>`)}` : nothing}
                    ${attr.type && !attr.type.text ? html`<nve-tag readonly color="gray-slate">${attr.type.replaceAll("'", '')}</nve-tag>` : nothing}
                  </div>
                </nve-grid-cell>
              </nve-grid-row>`)}
            </nve-grid>
          </section>

          <section nve-layout="column gap:md" ?hidden=${!this.#element.schema.events}>
            <h3 nve-text="heading">Events</h3>
            <nve-grid>
              <nve-grid-header>
                <nve-grid-column>Event</nve-grid-column>
                <nve-grid-column>Description</nve-grid-column>
              </nve-grid-header>
              ${this.#element.schema.events?.map(event => html`
              <nve-grid-row>
                <nve-grid-cell>${event.name}</nve-grid-cell>
                <nve-grid-cell .innerHTML=${this.#markdown.makeHtml(event.description ?? '')}></nve-grid-cell>
              </nve-grid-row>`)}
            </nve-grid>
          </section>

          <section nve-layout="column gap:md" ?hidden=${!this.#element.schema.slots}>
            <h3 nve-text="heading">Slots</h3>
            <nve-grid>
              <nve-grid-header>
                <nve-grid-column>Slot</nve-grid-column>
                <nve-grid-column>Description</nve-grid-column>
              </nve-grid-header>
              ${this.#element.schema.slots?.map(slot => html`
              <nve-grid-row>
                <nve-grid-cell>${slot.name?.length ? slot.name : 'Default'}</nve-grid-cell>
                <nve-grid-cell .innerHTML=${this.#markdown.makeHtml(slot.description ?? '')}></nve-grid-cell>
              </nve-grid-row>`)}
            </nve-grid>
          </section>

          <section nve-layout="column gap:md" ?hidden=${!this.#element.schema.cssProperties}>
            <h3 nve-text="heading">CSS Properties</h3>
            <nve-grid>
              <nve-grid-header>
                <nve-grid-column>Name</nve-grid-column>
                <nve-grid-column>Description</nve-grid-column>
              </nve-grid-header>
              ${this.#element.schema.cssProperties?.map(prop => html`
              <nve-grid-row>
                <nve-grid-cell>${prop.name}</nve-grid-cell>
                <nve-grid-cell>
                  ${!prop.name.includes('icon') && this.#checkIfPropertyExists(prop.name.replace('--', ''))
                    ? html`<a nve-text="link" href=${`https://developer.mozilla.org/en-US/docs/Web/CSS/${prop.name.replace('--', '')}`} target="_blank" rel="none">MDN Documentation</a>`
                    : nothing}
                </nve-grid-cell>
              </nve-grid-row>`)}
            </nve-grid>
          </section>
        </div>
      ` : nothing}
    `;
  }

  updated(props) {
    super.updated(props);
    if (!this.type) {
      this.id = `element-api`;
    }
  }
}

define(ElementAPI);

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
      element: { sort: 'none', width: '220px' },
      status: { sort: 'none', width: '170px' },
      coverage: { sort: 'none', width: '170px' },
      bundle: { sort: 'none', width: '170px', tooltip: 'Standalone total JavaScript bundle size in kb' },
      performance: { sort: 'none', width: '170px', tooltip: 'Chrome Lighthouse Performance Score' },
      accessibility: { sort: 'none', width: '170px', tooltip: 'Chrome Lighthouse Accessibility Score' },
      bestPractices: { sort: 'none', width: '170px', tooltip: 'Chrome Lighthouse Best Practices Score' },
      axe: { sort: 'none', tooltip: 'Accessibility status from Axe Core API', width: '170px' },
      spec: { sort: 'none', tooltip: 'Behavior category from W3C and WAI-ARIA Specification', width: '170px' },
      released: { sort: 'none', tooltip: 'Version Element was first released', width: '170px' },
      // instances: { sort: 'none', tooltip: 'Number of instances of element directly in MagLev source. Note this does not account for runtime instances created from reusable abstractions.', width: '130px' },
      // projects: { sort: 'none', tooltip: 'Number of Maglev Projects which reference the given element.', width: '130px' },
      figma: { sort: 'none', width: '130px' },
      themes: { sort: 'none', width: '130px' },
      responsive: { sort: 'none', width: '130px' },
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
          <span nve-text="body sm bold"><nve-badge status="scheduled">${metrics['@nvidia-elements/core'].elements.length}</nve-badge></span>
        </section>
      </div>
      <nve-grid style="--scroll-height: calc(100vh - 290px)">
        <nve-grid-header>
          ${Object.entries(this.state.columns).map(([name, column]) => html`
            <nve-grid-column
              @mouseover=${() => this.state = { ...this.state, tooltipColumn: name } }
              @mouseleave=${() => this.state = { ...this.state, tooltipColumn: null } }
              id=${name}
              width=${column.width ? column.width : '160px'}>
              ${name.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1").replace(/^./, (match) => match.toUpperCase())}
              <nve-sort-button .name=${name} .sort=${column.sort as 'ascending' | 'descending' | 'none'} @sort=${e => this.#sort(e)}></nve-sort-button>
            </nve-grid-column>
          `)}
        </nve-grid-header>
        ${this.elements.map(element => {
          return html`
          <nve-grid-row>
            <nve-grid-cell><a href=${element.storybook.replace('https://NVIDIA.github.io/elements/api/', './')} nve-text="body link no-visit">${element.name.replace('nve-', '')}</a></nve-grid-cell>
            <nve-grid-cell>${getStatusBadge(element.status)}</nve-grid-cell>
            <nve-grid-cell>${getCoverageStatus(element.tests.coverageTotal)}</nve-grid-cell>
            <nve-grid-cell>${getPayloadSize(element.lighthouse?.payload, 'flat')}</nve-grid-cell>
            <nve-grid-cell><nve-badge container="flat" .status=${getLighthouseScoreStatus(element.lighthouse.scores?.performance)}>${element.lighthouse.scores?.performance}</nve-badge></nve-grid-cell>
            <nve-grid-cell><nve-badge container="flat" .status=${getLighthouseScoreStatus(element.lighthouse.scores?.accessibility)}>${element.lighthouse.scores?.accessibility}</nve-badge></nve-grid-cell>
            <nve-grid-cell><nve-badge container="flat" .status=${getLighthouseScoreStatus(element.lighthouse.scores?.bestPractices)}>${element.lighthouse.scores?.bestPractices}</nve-badge></nve-grid-cell>
            <nve-grid-cell>${getA11yStatusBadge(element.axe, true)}</nve-grid-cell>
            <nve-grid-cell>${getBehaviorCategoryIcon(element.behavior)}&nbsp;&nbsp;<a href=${element.aria} nve-text="link no-visit">${element.behavior}</a></nve-grid-cell>
            <nve-grid-cell>${element.since}</nve-grid-cell>
            <nve-grid-cell>${element.figma ? html`<a href=${element.figma} nve-text="link no-visit">Figma</a>` : html`<nve-icon name="exclamation-triangle" status="warning"></nve-icon>`}</nve-grid-cell>
            <nve-grid-cell><nve-icon name="checkmark-circle" status="success"></nve-icon></nve-grid-cell>
            <nve-grid-cell>${element.responsive ? html`<nve-icon name="checkmark-circle" status="success"></nve-icon>` : html`<nve-icon name="exclamation-triangle" status="warning"></nve-icon>`}</nve-grid-cell>
          </nve-grid-row>`
        })}
        <nve-grid-footer>
          <p nve-text="body muted sm">Report Created on ${reportDate}</p>
          <nve-button @click=${() => this.dispatchEvent(new CustomEvent('view-data', { detail: 'elements', bubbles: true }))} container="flat" style="margin-left: auto">view data</nve-button>
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
            <nve-grid-cell><nve-badge container="flat" .status=${getLighthouseScoreStatus(element.lighthouse.scores?.performance)}>${element.lighthouse.scores?.performance}</nve-badge></nve-grid-cell>
            <nve-grid-cell><nve-badge container="flat" .status=${getLighthouseScoreStatus(element.lighthouse.scores?.accessibility)}>${element.lighthouse.scores?.accessibility}</nve-badge></nve-grid-cell>
            <nve-grid-cell><nve-badge container="flat" .status=${getLighthouseScoreStatus(element.lighthouse.scores?.bestPractices)}>${element.lighthouse.scores?.bestPractices}</nve-badge></nve-grid-cell>
            <nve-grid-cell>${getPayloadSize(element.lighthouse?.payload, 'flat')}</nve-grid-cell>
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
          <span nve-text="body sm bold">${getCoverageStatus(metrics['@nvidia-elements/core'].tests.coverageTotal.statements.pct)}</span>
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Lines</span>
          <span nve-text="body sm bold">${getCoverageStatus(metrics['@nvidia-elements/core'].tests.coverageTotal.lines.pct)}</span>
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Functions</span>
          <span nve-text="body sm bold">${getCoverageStatus(metrics['@nvidia-elements/core'].tests.coverageTotal.functions.pct)}</span>
        </section>
        <section nve-layout="row gap:xs align:center">
          <span nve-text="body sm muted">Branches</span>
          <span nve-text="body sm bold">${getCoverageStatus(metrics['@nvidia-elements/core'].tests.coverageTotal.branches.pct)}</span>
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
            <nve-grid-cell>${getCoverageStatus(cov.statements.pct)}</nve-grid-cell>
            <nve-grid-cell>${getCoverageStatus(cov.lines.pct)}</nve-grid-cell>
            <nve-grid-cell>${getCoverageStatus(cov.functions.pct)}</nve-grid-cell>
            <nve-grid-cell>${getCoverageStatus(cov.branches.pct)}</nve-grid-cell>
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
          <nve-badge status="success">version ${ELEMENTS_VERSION}</nve-badge>
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
