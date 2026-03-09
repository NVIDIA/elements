import { html } from 'lit';

export default {
  title: 'Patterns/Trend',
  component: 'nve-patterns'
};

/**
 * @summary Trend badges for displaying data changes and metrics. Perfect
 * for dashboards, analytics, or financial data showing positive, negative,
 * or neutral trends.
 *
 * @tags pattern
 */
export const TrendBadge = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-badge>0%</nve-badge>
  <nve-badge status="success"><nve-icon name="trend-down"></nve-icon> -15%</nve-badge>
  <nve-badge status="danger"><nve-icon name="trend-up"></nve-icon> +15%</nve-badge>
</div>
  `
}

/**
 * @summary Displays a metric with a trend indicator. Ideal for dashboards
 * and analytics where users need to quickly assess changes and understand the
 * scale of change at a glance.
 * 
 * @tags pattern
 */
export const TrendBadgeDetail = {
  render: () => html`
  <div nve-layout="column gap:sm">
    <label nve-text="label medium sm muted">Label</label>
    <div nve-layout="row gap:sm align:vertical-center">
      <h3 nve-text="heading semibold lg">198,298</h3>
      <nve-badge status="success">+15% <nve-icon name="trend-up"></nve-icon></nve-badge>
    </div>
    <label nve-text="label medium sm muted">Since last week</label>
  </div>
  `
};

/**
 * @summary Trend card for displaying a metric with a trend indicator. Ideal for dashboards
 * and analytics where users need to quickly assess changes and understand the
 * scale of change at a glance.
 * 
 * @tags pattern
 */
export const TrendCard = {
  render: () => html`
<div nve-layout="grid span-items:6 gap:sm" style="max-width: 600px;">
  <nve-card>
    <nve-card-header>
      <div nve-layout="row align:space-between align:vertical-center">
        <h2 nve-text="label muted">Training Loss</h2>
        <nve-badge container="flat" status="success">
          <nve-icon name="trend-down" slot="prefix-icon"></nve-icon> -42%
        </nve-badge>
      </div>
    </nve-card-header>
    <nve-card-content>
      <div nve-layout="column gap:sm">
        <div nve-layout="row gap:sm align:vertical-center">
          <h3 nve-text="heading semibold lg">0.0234</h3>
        </div>
        <nve-sparkline data="[0.12, 0.09, 0.075, 0.062, 0.051, 0.044, 0.039, 0.035, 0.032, 0.030, 0.028, 0.026, 0.025, 0.023]" mark="line" interpolation="smooth" status="success" size="xl"></nve-sparkline>
        <span nve-text="label sm muted">Per epoch</span>
      </div>
    </nve-card-content>
  </nve-card>
  <nve-card>
    <nve-card-header>
      <div nve-layout="row align:space-between align:vertical-center">
        <h2 nve-text="label muted">Job Throughput</h2>
        <nve-badge container="flat" status="success">
          <nve-icon name="trend-up" slot="prefix-icon"></nve-icon> +12%
        </nve-badge>
      </div>
    </nve-card-header>
    <nve-card-content>
      <div nve-layout="column gap:sm">
        <h3 nve-text="heading semibold lg">342 / hr</h3>
        <nve-sparkline data="[280, 295, 310, 305, 320, 335, 340, 328, 315, 342, 350, 338, 342]" mark="column" status="accent" size="lg" min="0" denote-max></nve-sparkline>
        <span nve-text="label sm muted">Last 24 hours</span>
      </div>
    </nve-card-content>
  </nve-card>
</div>
  `
};

/**
 * @summary Trend grid for displaying a list of metrics with a trend indicator. Ideal for dashboards
 * and analytics where users need to quickly assess changes and understand the
 * scale of change at a glance.
 * 
 * @tags pattern
 */
export const TrendGrid = {
  render: () => html`
<nve-grid>
  <nve-grid-header>
    <nve-grid-column>Checkpoint</nve-grid-column>
    <nve-grid-column>Epoch</nve-grid-column>
    <nve-grid-column>Train Loss</nve-grid-column>
    <nve-grid-column>Val Loss Trend</nve-grid-column>
    <nve-grid-column>BLEU Score Trend</nve-grid-column>
    <nve-grid-column>Status</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>ckpt-014</nve-grid-cell>
    <nve-grid-cell>14</nve-grid-cell>
    <nve-grid-cell>0.0234</nve-grid-cell>
    <nve-grid-cell>
      <div nve-layout="row gap:sm align:vertical-center">
        <span nve-text="label sm">0.031</span>
        <nve-sparkline data="[0.13, 0.082, 0.055, 0.042, 0.033, 0.029, 0.031]" mark="line" interpolation="smooth" status="warning" size="md"></nve-sparkline>
      </div>
    </nve-grid-cell>
    <nve-grid-cell>
      <div nve-layout="row gap:sm align:vertical-center">
        <span nve-text="label sm">42.8</span>
        <nve-sparkline data="[28, 32, 36, 38, 40, 41, 42.8]" mark="line" interpolation="smooth" status="success" size="md"></nve-sparkline>
      </div>
    </nve-grid-cell>
    <nve-grid-cell><nve-badge status="running" container="flat">Current</nve-badge></nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>ckpt-010</nve-grid-cell>
    <nve-grid-cell>10</nve-grid-cell>
    <nve-grid-cell>0.0298</nve-grid-cell>
    <nve-grid-cell>
      <div nve-layout="row gap:sm align:vertical-center">
        <span nve-text="label sm">0.029</span>
        <nve-sparkline data="[0.13, 0.082, 0.055, 0.042, 0.033, 0.029]" mark="line" interpolation="smooth" status="success" size="md"></nve-sparkline>
      </div>
    </nve-grid-cell>
    <nve-grid-cell>
      <div nve-layout="row gap:sm align:vertical-center">
        <span nve-text="label sm">41.2</span>
        <nve-sparkline data="[28, 32, 36, 38, 40, 41.2]" mark="line" interpolation="smooth" status="success" size="md"></nve-sparkline>
      </div>
    </nve-grid-cell>
    <nve-grid-cell><nve-badge status="finished" container="flat">Best</nve-badge></nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>ckpt-005</nve-grid-cell>
    <nve-grid-cell>5</nve-grid-cell>
    <nve-grid-cell>0.0512</nve-grid-cell>
    <nve-grid-cell>
      <div nve-layout="row gap:sm align:vertical-center">
        <span nve-text="label sm">0.048</span>
        <nve-sparkline data="[0.13, 0.082, 0.055, 0.048]" mark="line" interpolation="smooth" size="md"></nve-sparkline>
      </div>
    </nve-grid-cell>
    <nve-grid-cell>
      <div nve-layout="row gap:sm align:vertical-center">
        <span nve-text="label sm">35.6</span>
        <nve-sparkline data="[28, 32, 35.6]" mark="line" interpolation="smooth" size="md"></nve-sparkline>
      </div>
    </nve-grid-cell>
    <nve-grid-cell><nve-badge status="finished" container="flat">Saved</nve-badge></nve-grid-cell>
  </nve-grid-row>
</nve-grid>
  `
}
