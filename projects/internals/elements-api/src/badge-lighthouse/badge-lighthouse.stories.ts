import { html } from 'lit';
import '@nve-internals/elements-api/badge-lighthouse/define.js';

export default {
  title: 'Internal/Elements API/Badge Lighthouse',
  component: 'nve-api-badge-lighthouse',
};

export const Default = {
  render: () => html`
  <div nve-layout="column gap:lg">
    <div nve-layout="column gap:md">
      <nve-api-badge-lighthouse .value=${ { performance: 100, accessibility: 100, bestPractices: 100 } } container="flat"></nve-api-badge-lighthouse>
      <nve-api-badge-lighthouse .value=${ { performance: 85, accessibility: 85, bestPractices: 85 } } container="flat"></nve-api-badge-lighthouse>
      <nve-api-badge-lighthouse .value=${ { performance: 60, accessibility: 60, bestPractices: 60 } } container="flat"></nve-api-badge-lighthouse>
    </div>

    <div nve-layout="column gap:md">
      <nve-api-badge-lighthouse .value=${ { performance: 100, accessibility: 100, bestPractices: 100 } }>Lighthouse: </nve-api-badge-lighthouse>
      <nve-api-badge-lighthouse .value=${ { performance: 85, accessibility: 85, bestPractices: 85 } }>Lighthouse: </nve-api-badge-lighthouse>
      <nve-api-badge-lighthouse .value=${ { performance: 60, accessibility: 60, bestPractices: 60 } }>Lighthouse: </nve-api-badge-lighthouse>
    </div>

    <div nve-layout="column gap:md">
      <nve-api-badge-lighthouse .value=${ { performance: 100 } } container="flat">Performance: </nve-api-badge-lighthouse>
      <nve-api-badge-lighthouse .value=${ { accessibility: 100 } } container="flat">Accessibility: </nve-api-badge-lighthouse>
      <nve-api-badge-lighthouse .value=${ { bestPractices: 100 } } container="flat">Best Practices: </nve-api-badge-lighthouse>
    </div>
  </div>
  `
};
