import { html } from 'lit';

export default {
  title: 'Patterns/Trend',
  component: 'nve-internal-patterns'
};

/**
 * @description Trend badges for displaying data changes and metrics. Perfect
 * for dashboards, analytics, or financial data showing positive, negative,
 * or neutral trends.
 *
 * @tags pattern
 */
export const Trend = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-badge>0%</nve-badge>
  <nve-badge status="success"><nve-icon name="trend-down"></nve-icon> -15%</nve-badge>
  <nve-badge status="danger"><nve-icon name="trend-up"></nve-icon> +15%</nve-badge>
</div>
  `
}

/**
 * @description Displays a metric with a trend indicator. Ideal for dashboards
 * and analytics where users need to quickly assess changes and understand the
 * magnitude of change at at a glance.
 * 
 * @tags pattern
 */
export const TrendData = {
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
