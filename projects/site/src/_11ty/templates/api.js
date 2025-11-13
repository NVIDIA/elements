// @ts-check

import markdown from 'markdown-it';
import { ESM_ELEMENTS_VERSION } from '../utils/version.js';
import { siteData } from '../../index.11tydata.js';

const { elements, tests } = siteData;

// Base URL for package releases
const PACKAGE_URL = 'https://github.com/NVIDIA/elements/-/releases';

// Initialize markdown parser and metadata service
const md = markdown();

/**
 * Renders a component description with appropriate styling
 * @param {string} tag - The component tag name
 * @returns {string} HTML string containing the rendered description
 */
export function elementDescription(tag) {
  const element = elements.find(d => d.name === tag);
  return element?.manifest?.description
    ? md.render(element.manifest.description).replace('<p>', '<p nve-text="heading muted sm">')
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

  return /* html */ `<section nve-layout="column gap:md align:stretch">
  <div nve-layout="row gap:xs align:center align:space-between align:wrap">
    <div nve-layout="row gap:xxs align:center">
      ${badgeStatus(element?.manifest?.metadata?.status ?? '', '', ESM_ELEMENTS_VERSION)}
      ${badgeCoverage(coverageTotal, '', 'Coverage:&nbsp;')}
      ${badgeBundle(lighthouseResults?.payload?.javascript?.kb ?? 0, '', 'Bundle:&nbsp;')}
      ${badgeLighthouse(lighthouseResults?.scores ?? {}, '', 'Lighthouse:&nbsp;')}
      ${badgeAxe(axeResults?.message ?? '', '')}
    </div>

    <div nve-layout="row gap:xxs align:center">
      ${element?.manifest?.metadata?.behavior === 'form' ? /* html */ `<nve-button size="sm"><nve-icon name="checklist" size="sm"></nve-icon><a href="./docs/elements/forms/controls/#form-associated-elements" target="_blank">Form Control</a></nve-button>` : ''}

      <nve-button size="sm" style="margin-left: auto"><nve-icon name="code" size="sm"></nve-icon><a href="${element?.manifest?.metadata?.aria ?? ''}" target="_blank">Spec</a></nve-button>

      ${element?.manifest?.metadata?.figma ? /* html */ `<nve-button size="sm"><nve-icon name="shapes" size="sm"></nve-icon><a href="${element.manifest.metadata.figma}" target="_blank">Figma</a></nve-button>` : ''}

      <nve-button size="sm"><nve-icon name="merge" size="sm"></nve-icon><a href="${PACKAGE_URL}" target="_blank">${element?.manifest?.metadata?.since ?? ''}</a></nve-button>
    </div>
  </div>
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
  <nve-badge container="${container}" status="${statuses[status]}">
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
    <nve-badge container="${container}" status="${status}">
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
    <nve-badge container="${container}" status="${status}">
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
  <nve-badge status="${status}" container="${container}">
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
  ${value === undefined || value === '' ? /* html */ `<nve-badge container="${container}" status="success"><a href="https://github.com/dequelabs/axe-core" target="_blank">Axe Core</a></nve-badge>` : ''}
  ${value === false ? /* html */ `<nve-badge container="${container}" status="pending">Pending</nve-badge>` : ''}
  ${value ? /* html */ `<nve-badge container="${container}" status="warning"><a href="https://dequeuniversity.com/rules/axe/4.8/${value}?application=axeAPI" target="_blank">${value}</a></nve-badge>` : ''}
  `;
}

/**
 * Generates a detailed status section showing component development progress
 * @param {string} tag - The component tag name
 * @returns {string} HTML string containing the component status section
 */
export function elementStatus(tag) {
  /** @type {import('@nve-internals/metadata').MetadataCustomElementsManifestDeclaration['metadata']} */
  const elementMetadata = elements.find(d => d.name === tag)?.manifest?.metadata ?? {
    status: 'unknown',
    figma: '',
    storybook: '',
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
        <nve-alert status="${elementMetadata.figma ? 'finished' : 'pending'}">Published in <a href="http://nv/elements-figma">Figma</a></nve-alert>
        <nve-alert status="${elementMetadata.storybook ? 'finished' : 'pending'}">Docs Preview</nve-alert>
        <nve-alert status="${elementMetadata.storybook ? 'finished' : 'pending'}">API Documentation</nve-alert>
        <nve-alert status="${elementMetadata.themes ? 'finished' : 'pending'}">Fully Themeable</nve-alert>
      </div>
    </div>

    <div nve-layout="column gap:sm">
      <nve-badge status="${elementMetadata.status === 'beta' ? 'running' : 'pending'}">beta <nve-icon name="clock"></nve-icon></nve-badge>

      <div nve-layout="column gap:xs">
        <nve-alert status="${elementMetadata.unitTests ? 'finished' : 'pending'}">Robust unit test coverages</nve-alert>
        <nve-alert status="${elementMetadata.apiReview ? 'finished' : 'pending'}">Passed <a href="docs/api-design/">API Review</a></nve-alert>
        <nve-alert status="${elementMetadata.vqa ? 'finished' : 'pending'}">Passed Designer VQA Review</nve-alert>
        <nve-alert status="${elementMetadata.package ? 'finished' : 'pending'}">Included in <a href="http://nv/elements">library package</a></nve-alert>
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
