// @ts-check

import markdown from 'markdown-it';
import markdownItLink from 'markdown-it-link-attributes';
import { ESM_ELEMENTS_VERSION } from '../utils/version.js';
import { siteData } from '../../index.11tydata.js';

import { svgLogoShortcode } from '../shortcodes/svg-logo.js';
import { ELEMENTS_REPO_BASE_URL } from '../utils/env.js';

const { elements, tests } = siteData;

// Base URL for package releases
const PACKAGE_URL = `${ELEMENTS_REPO_BASE_URL}/-/releases`;

// Initialize markdown parser and metadata service
const md = markdown();

// Open MDN links in new tab
md.use(markdownItLink, {
  matcher(href) {
    return href.match(/^https?:\/\//);
  },
  attrs: {
    target: '_blank',
    rel: 'noopener'
  }
});

// Always add nve-text="link" to all links
md.use(markdownItLink, {
  matcher() {
    return true;
  },
  attrs: {
    'nve-text': 'link'
  }
});

/**
 * Renders a component description with appropriate styling
 * @param {string} tag - The component tag name
 * @returns {string} HTML string containing the rendered description
 */
export function elementDescription(tag) {
  const element = elements.find(d => d.name === tag);
  return element?.manifest?.description
    ? md.render(element.manifest.description).replace('<p>', '<p nve-text="body lg">')
    : '';
}

/**
 * Generates a summary section for a component including description, status badges, and metadata links
 * @param {string} tag - The component tag name
 * @returns {string} HTML string containing the component summary
 */
export function elementSummary(tag) {
  const element = elements.find(d => d.name === tag);
  const testReports = Object.values(tests.projects);
  const unitTestResults = testReports.flatMap(report => report.coverage.testResults);
  const coverageTotal =
    unitTestResults.find(result => result.file?.includes(tag.replace('nve-', '')))?.branches.pct ?? 0;
  const lighthouseResults = testReports
    .flatMap(report => report.lighthouse)
    .flatMap(result => result.testResults)
    .find(result => result.name.includes(tag)) ?? {
    payload: {
      javascript: {
        kb: 10
      }
    },
    scores: {
      performance: 100,
      accessibility: 100,
      bestPractices: 100
    }
  };
  const axeResults = testReports
    .flatMap(report => report.axe)
    .flatMap(result => result.testResults)
    .flatMap(result => result.assertionResults)
    .find(result => result.name?.includes(tag));

  return /* html */ `
  <section nve-layout="row gap:xxs align:wrap">
    ${badgeStatus(element?.manifest?.metadata?.status ?? '', '', ESM_ELEMENTS_VERSION)}
    ${badgeCoverage(coverageTotal, '', 'Coverage:&nbsp;')}
    ${badgeBundle(lighthouseResults?.payload?.javascript?.kb ?? 0, '', 'Bundle:&nbsp;')}
    ${badgeLighthouse(lighthouseResults?.scores ?? {}, '', 'Lighthouse:&nbsp;')}
    ${badgeAxe(axeResults?.message ?? '', '')}

    <nve-badge size="sm" status="success"><nve-icon name="merge" size="sm"></nve-icon><a href="${PACKAGE_URL}" target="_blank">Released: ${element?.manifest?.metadata?.since ?? ''}</a></nve-badge>
  </section>`;
}

/**
 * Generates the component support buttons section for a given custom element tag.
 * @param {string} tag - The component tag name
 * @returns {string} HTML string containing the component support buttons
 */
export function elementSupportButtons(tag) {
  const element = elements.find(d => d.name === tag);

  return /* html */ `
  <section nve-layout="grid span-items:12 &md|span-items:6 &lg|span-items:3 gap:md">
    <a href="http://nv/elements-slack" target="_blank" class="support-button-link">
      <nve-card>
        <div nve-layout="row align:vertical-center">
          <span class="support-button-icon" nve-layout="row align:center">
            ${svgLogoShortcode('slack', '20')}
          </span>

          <span nve-layout="pad:sm" nve-text="label md semibold emphasis">
            Support Request
          </span>
        </div>
      </nve-card>
    </a>

    <a href="${ELEMENTS_REPO_BASE_URL}/-/issues/new?issuable_template=chore&issue[title]=chore(docs): update ${tag} component documentation" target="_blank" class="support-button-link">
      <nve-card>
        <div nve-layout="row align:vertical-center">
          <span class="support-button-icon" nve-layout="row align:center">
            ${svgLogoShortcode('gitlab', '20')}
          </span>

          <span nve-layout="pad:sm" nve-text="label md semibold emphasis">
            Request Doc Edit
          </span>
        </div>
      </nve-card>
    </a>

    <a href="${element?.manifest?.metadata?.aria ?? ''}" target="_blank" class="support-button-link">
      <nve-card>
        <div nve-layout="row align:vertical-center">
          <span class="support-button-icon" nve-layout="row align:center">
            ${svgLogoShortcode('w3c', '20')}
          </span>

          <span nve-layout="pad:sm" nve-text="label md semibold emphasis">
            ARIA Pattern
          </span>
        </div>
      </nve-card>
    </a>

    <a href="http://nv/elements-figma" target="_blank" class="support-button-link">
      <nve-card>
        <div nve-layout="row align:vertical-center">
          <span class="support-button-icon" nve-layout="row align:center">
            ${svgLogoShortcode('figma', '20')}
          </span>

          <span nve-layout="pad:sm" nve-text="label md semibold emphasis">
            Figma
          </span>
        </div>
      </nve-card>
    </a>
  </section>`;
}

/**
 * Generates a status badge with appropriate color based on component status
 * @param {string} status - Component status (pre-release, beta, stable)
 * @param {string} container - Container class for the badge
 * @param {string} content - Additional content to display
 * @returns {string} HTML string for the status badge
 */
export function badgeStatus(status, container = '', content = '') {
  const statuses = {
    'pre-release': 'warning',
    beta: 'accent',
    stable: 'success',
    undefined: 'unknown'
  };

  return /* html */ `
  <nve-badge ${container ? `container="${container}"` : ''} status="${statuses[status]}">
    <a href="docs/changelog/">${status ? status : 'unknown'}: &nbsp;${content}</a>
  </nve-badge>
  `;
}

/**
 * Generates a coverage badge with color based on test coverage percentage
 * @param {number} value - Test coverage percentage
 * @param {string} container - Container class for the badge
 * @param {string} content - Additional content to display
 * @returns {string} HTML string for the coverage badge
 */
export function badgeCoverage(value, container = '', content = '') {
  let status = 'unknown';
  let formattedValue = value
    ? new Intl.NumberFormat('default', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value / 100)
    : null;

  if (value !== undefined) {
    if (value >= 90) {
      status = 'success';
    } else if (value >= 70) {
      status = 'warning';
    } else {
      status = 'danger';
    }
  }

  return /* html */ `
    <nve-badge ${container ? `container="${container}"` : ''} status="${status}">
      <a href="docs/metrics/">${content}${formattedValue}</a>
    </nve-badge>
  `;
}

/**
 * Generates a bundle size badge with color based on JavaScript bundle size
 * @param {number} value - Bundle size in KB
 * @param {string} container - Container class for the badge
 * @param {string} content - Additional content to display
 * @returns {string} HTML string for the bundle size badge
 */
export function badgeBundle(value, container = '', content = '') {
  let status = 'unknown';
  if (value !== undefined) {
    if (value <= 25) {
      status = 'success';
    } else if (value <= 40) {
      status = 'warning';
    } else {
      status = 'danger';
    }
  }

  return /* html */ `
    <nve-badge ${container ? `container="${container}"` : ''} status="${status}">
      <a href="docs/metrics/">${content}${value}${value ? 'kb' : ''}</a>
    </nve-badge>
  `;
}

/**
 * Generates a Lighthouse score badge with color based on average score
 * @param {Object} value - Lighthouse scores object
 * @param {string} container - Container class for the badge
 * @param {string} content - Additional content to display
 * @returns {string} HTML string for the Lighthouse score badge
 */
export function badgeLighthouse(value, container = '', content = '') {
  const values = Object.keys(value ?? {})
    .map(key => (value ?? {})[key])
    .filter(value => value !== undefined);
  const average = values.length ? Math.floor(values.reduce((prev, next) => prev + next, 0) / values.length) : null;

  let status = 'unknown';
  if (value !== null) {
    if (average && average > 95) {
      status = 'success';
    } else if (average && average > 80) {
      status = 'warning';
    } else {
      status = 'danger';
    }
  }

  return /* html */ `
  <nve-badge status="${status}" ${container ? `container="${container}"` : ''}>
    <a href="https://developer.chrome.com/docs/lighthouse/overview/" target="_blank">${content}${average}</a>
  </nve-badge>
  `;
}

/**
 * Generates an Axe accessibility badge with appropriate status
 * @param {string|boolean} value - Axe accessibility status
 * @param {string} container - Container class for the badge
 * @returns {string} HTML string for the Axe accessibility badge
 */
export function badgeAxe(value, container = '') {
  return /* html */ `
  ${value === undefined || value === '' ? /* html */ `<nve-badge ${container ? `container="${container}"` : ''} status="success"><a href="https://github.com/dequelabs/axe-core" target="_blank">Axe Core</a></nve-badge>` : ''}
  ${value === false ? /* html */ `<nve-badge ${container ? `container="${container}"` : ''} status="pending">Pending</nve-badge>` : ''}
  ${value ? /* html */ `<nve-badge ${container ? `container="${container}"` : ''} status="warning"><a href="https://dequeuniversity.com/rules/axe/4.8/${value}?application=axeAPI" target="_blank">${value}</a></nve-badge>` : ''}
  `;
}

/**
 * Generates a detailed status section showing component development progress
 * @param {string} tag - The component tag name
 * @returns {string} HTML string containing the component status section
 */
export function elementStatus(tag) {
  /** @type {import('@internals/metadata').MetadataCustomElementsManifestDeclaration['metadata']} */
  const elementMetadata = elements.find(d => d.name === tag)?.manifest?.metadata ?? {
    status: 'unknown',
    aria: '',
    themes: false,
    performance: false,
    responsive: false,
    stable: false,
    vqa: false,
    package: false,
    unitTests: false,
    apiReview: false,
    behavior: '',
    example: '',
    entrypoint: '',
    since: ''
  };

  return /* html */ `
  <h2 nve-text="heading xl emphasis mkd" id="release-status">Release Status</h2>

  <div nve-layout="column gap:md">
    <p nve-text="body">All elements and features go through 3 phases of stability, pre-release, beta and stable.</p>

    <div nve-layout="column gap:sm">
      <nve-badge status="${elementMetadata.status === 'pre-release' ? 'warning' : 'pending'}">pre-release <nve-icon name="exclamation-triangle"></nve-icon></nve-badge>
      
      <div nve-layout="column gap:xs">
        <nve-alert status="finished">Docs Preview</nve-alert>
        <nve-alert status="finished">API Documentation</nve-alert>
        <nve-alert status="${elementMetadata.themes ? 'finished' : 'pending'}">Fully Themeable</nve-alert>
      </div>
    </div>

    <div nve-layout="column gap:sm">
      <nve-badge status="${elementMetadata.status === 'beta' ? 'running' : 'pending'}">beta <nve-icon name="clock"></nve-icon></nve-badge>

      <div nve-layout="column gap:xs">
        <nve-alert status="${elementMetadata.unitTests ? 'finished' : 'pending'}">Robust unit test coverages</nve-alert>
        <nve-alert status="${elementMetadata.apiReview ? 'finished' : 'pending'}">Passed <a href="docs/api-design/">API Review</a></nve-alert>
        <nve-alert status="${elementMetadata.vqa ? 'finished' : 'pending'}">Passed Designer VQA Review</nve-alert>
        <nve-alert status="${elementMetadata.package ? 'finished' : 'pending'}">Included in library package</nve-alert>
      </div>
    </div>

    <div nve-layout="column gap:sm">
      <nve-badge status="${elementMetadata.status === 'stable' ? 'finished' : 'pending'}">stable <nve-icon name="checkmark-circle"></nve-icon></nve-badge>
      
      <div nve-layout="column gap:xs">
        <nve-alert status="${elementMetadata.aria ? 'finished' : 'pending'}">No known outstanding <a href="https://www.w3.org/WAI/ARIA/apg/">AA WCAG issues</a></nve-alert>
        <nve-alert status="${elementMetadata.performance ? 'finished' : 'pending'}">No known outstanding performance issues</nve-alert>
        <nve-alert status="${elementMetadata.responsive ? 'finished' : 'pending'}">Adapts to different screen/container sizes</nve-alert>
        <nve-alert status="${elementMetadata.stable ? 'finished' : 'pending'}">No breaking API changes for at least 90 days</nve-alert>
      </div>
    </div>
  </div>
  `;
}
