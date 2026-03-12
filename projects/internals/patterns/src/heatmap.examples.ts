import { html } from 'lit';

export default {
  title: 'Patterns/Heatmap',
  component: 'nve-patterns'
};

/**
 * @summary Grid heatmap displaying simulation test pass rates for AV software modules across driving scenarios.
 * Ideal for CI/CD dashboards tracking autonomous vehicle stack validation using red-green diverging tokens.
 * @tags pattern
 */
export const ModulePassRate = {
  render: () => html`
<nve-grid container="flat">
  <style>
    @scope {
      [data-value='0'], [data-value='1'], [data-value='2'], [data-value='3'], [data-value='4'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-100); --color: var(--nve-ref-color-neutral-100); }
      [data-value='5'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-200); }
      [data-value='6'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-300); }
      [data-value='7'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-400); }
      [data-value='8'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-700); }
      [data-value='9'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-800); }
      [data-value='10'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-900); --color: var(--nve-ref-color-neutral-100); }
      [data-value] { --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted); text-align: center; }
    }
  </style>
  <nve-grid-header>
    <nve-grid-column width="150px" position="fixed">AV Module</nve-grid-column>
    <nve-grid-column column-align="center">Highway</nve-grid-column>
    <nve-grid-column column-align="center">Urban</nve-grid-column>
    <nve-grid-column column-align="center">Intersection</nve-grid-column>
    <nve-grid-column column-align="center">Parking</nve-grid-column>
    <nve-grid-column column-align="center">Construction</nve-grid-column>
    <nve-grid-column column-align="center">Adverse Weather</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>Perception</nve-grid-cell>
    <nve-grid-cell data-value="9">99.0%</nve-grid-cell>
    <nve-grid-cell data-value="7">71.7%</nve-grid-cell>
    <nve-grid-cell data-value="9">94.7%</nve-grid-cell>
    <nve-grid-cell data-value="6">69.3%</nve-grid-cell>
    <nve-grid-cell data-value="7">77.3%</nve-grid-cell>
    <nve-grid-cell data-value="9">94.3%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Localization</nve-grid-cell>
    <nve-grid-cell data-value="7">78.0%</nve-grid-cell>
    <nve-grid-cell data-value="9">94.5%</nve-grid-cell>
    <nve-grid-cell data-value="6">65.3%</nve-grid-cell>
    <nve-grid-cell data-value="7">70.9%</nve-grid-cell>
    <nve-grid-cell data-value="6">69.9%</nve-grid-cell>
    <nve-grid-cell data-value="7">76.5%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Prediction</nve-grid-cell>
    <nve-grid-cell data-value="8">82.7%</nve-grid-cell>
    <nve-grid-cell data-value="9">97.6%</nve-grid-cell>
    <nve-grid-cell data-value="6">66.1%</nve-grid-cell>
    <nve-grid-cell data-value="7">79.2%</nve-grid-cell>
    <nve-grid-cell data-value="8">82.8%</nve-grid-cell>
    <nve-grid-cell data-value="7">78.7%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Planning</nve-grid-cell>
    <nve-grid-cell data-value="8">84.8%</nve-grid-cell>
    <nve-grid-cell data-value="7">78.4%</nve-grid-cell>
    <nve-grid-cell data-value="9">91.1%</nve-grid-cell>
    <nve-grid-cell data-value="7">71.9%</nve-grid-cell>
    <nve-grid-cell data-value="7">76.9%</nve-grid-cell>
    <nve-grid-cell data-value="9">97.3%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Control</nve-grid-cell>
    <nve-grid-cell data-value="10">100.0%</nve-grid-cell>
    <nve-grid-cell data-value="7">74.2%</nve-grid-cell>
    <nve-grid-cell data-value="9">92.8%</nve-grid-cell>
    <nve-grid-cell data-value="9">94.0%</nve-grid-cell>
    <nve-grid-cell data-value="9">91.9%</nve-grid-cell>
    <nve-grid-cell data-value="7">70.9%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Mapping</nve-grid-cell>
    <nve-grid-cell data-value="8">89.2%</nve-grid-cell>
    <nve-grid-cell data-value="8">85.0%</nve-grid-cell>
    <nve-grid-cell data-value="9">91.9%</nve-grid-cell>
    <nve-grid-cell data-value="9">99.1%</nve-grid-cell>
    <nve-grid-cell data-value="8">82.9%</nve-grid-cell>
    <nve-grid-cell data-value="9">91.6%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Sensor Fusion</nve-grid-cell>
    <nve-grid-cell data-value="7">72.6%</nve-grid-cell>
    <nve-grid-cell data-value="9">97.8%</nve-grid-cell>
    <nve-grid-cell data-value="8">89.5%</nve-grid-cell>
    <nve-grid-cell data-value="8">82.9%</nve-grid-cell>
    <nve-grid-cell data-value="8">89.9%</nve-grid-cell>
    <nve-grid-cell data-value="6">68.6%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Safety Monitor</nve-grid-cell>
    <nve-grid-cell data-value="8">87.0%</nve-grid-cell>
    <nve-grid-cell data-value="10">100.0%</nve-grid-cell>
    <nve-grid-cell data-value="10">100.0%</nve-grid-cell>
    <nve-grid-cell data-value="8">86.7%</nve-grid-cell>
    <nve-grid-cell data-value="7">77.6%</nve-grid-cell>
    <nve-grid-cell data-value="8">85.0%</nve-grid-cell>
  </nve-grid-row>
</nve-grid>
  `
};

/**
 * @summary Grid heatmap showing sensor coverage for autonomous vehicle perception systems across distance ranges.
 * Useful for AV engineers analyzing LiDAR, radar, and camera fusion performance to identify blind spots.
 * @tags pattern
 */
export const SensorCoverageHeatmap = {
  render: () => html`
<nve-grid container="flat">
  <style>
  @scope {
    [data-coverage='0'], [data-coverage='1'], [data-coverage='2'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-100); --color: var(--nve-ref-color-neutral-100); }
    [data-coverage='3'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-200); }
    [data-coverage='4'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-300); }
    [data-coverage='5'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-400); }
    [data-coverage='6'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-600); }
    [data-coverage='7'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-700); }
    [data-coverage='8'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-800); }
    [data-coverage='9'], [data-coverage='10'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-900); --color: var(--nve-ref-color-neutral-100); }
    [data-coverage] { --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted); text-align: center; }
  }
  </style>
  <nve-grid-header>
    <nve-grid-column width="140px" position="fixed">Sensor</nve-grid-column>
    <nve-grid-column column-align="center">0-10m</nve-grid-column>
    <nve-grid-column column-align="center">10-30m</nve-grid-column>
    <nve-grid-column column-align="center">30-50m</nve-grid-column>
    <nve-grid-column column-align="center">50-100m</nve-grid-column>
    <nve-grid-column column-align="center">100-150m</nve-grid-column>
    <nve-grid-column column-align="center">150-200m</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>LiDAR Front</nve-grid-cell>
    <nve-grid-cell data-coverage="9">92.3%</nve-grid-cell>
    <nve-grid-cell data-coverage="8">86.2%</nve-grid-cell>
    <nve-grid-cell data-coverage="7">74.5%</nve-grid-cell>
    <nve-grid-cell data-coverage="6">69.9%</nve-grid-cell>
    <nve-grid-cell data-coverage="6">62.1%</nve-grid-cell>
    <nve-grid-cell data-coverage="5">58.7%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>LiDAR Rear</nve-grid-cell>
    <nve-grid-cell data-coverage="9">98.5%</nve-grid-cell>
    <nve-grid-cell data-coverage="8">88.8%</nve-grid-cell>
    <nve-grid-cell data-coverage="7">74.2%</nve-grid-cell>
    <nve-grid-cell data-coverage="6">66.6%</nve-grid-cell>
    <nve-grid-cell data-coverage="6">62.1%</nve-grid-cell>
    <nve-grid-cell data-coverage="5">54.5%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Radar Front</nve-grid-cell>
    <nve-grid-cell data-coverage="8">83.5%</nve-grid-cell>
    <nve-grid-cell data-coverage="7">73.2%</nve-grid-cell>
    <nve-grid-cell data-coverage="7">70.1%</nve-grid-cell>
    <nve-grid-cell data-coverage="6">62.7%</nve-grid-cell>
    <nve-grid-cell data-coverage="5">52.0%</nve-grid-cell>
    <nve-grid-cell data-coverage="4">46.6%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Radar Side L</nve-grid-cell>
    <nve-grid-cell data-coverage="8">89.8%</nve-grid-cell>
    <nve-grid-cell data-coverage="7">72.6%</nve-grid-cell>
    <nve-grid-cell data-coverage="7">72.1%</nve-grid-cell>
    <nve-grid-cell data-coverage="6">61.5%</nve-grid-cell>
    <nve-grid-cell data-coverage="5">53.3%</nve-grid-cell>
    <nve-grid-cell data-coverage="4">46.0%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Radar Side R</nve-grid-cell>
    <nve-grid-cell data-coverage="8">81.8%</nve-grid-cell>
    <nve-grid-cell data-coverage="7">77.2%</nve-grid-cell>
    <nve-grid-cell data-coverage="7">72.7%</nve-grid-cell>
    <nve-grid-cell data-coverage="5">59.6%</nve-grid-cell>
    <nve-grid-cell data-coverage="5">50.8%</nve-grid-cell>
    <nve-grid-cell data-coverage="4">44.1%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Camera Front</nve-grid-cell>
    <nve-grid-cell data-coverage="7">77.2%</nve-grid-cell>
    <nve-grid-cell data-coverage="6">60.0%</nve-grid-cell>
    <nve-grid-cell data-coverage="5">55.3%</nve-grid-cell>
    <nve-grid-cell data-coverage="3">38.6%</nve-grid-cell>
    <nve-grid-cell data-coverage="2">27.0%</nve-grid-cell>
    <nve-grid-cell data-coverage="1">19.8%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Camera Rear</nve-grid-cell>
    <nve-grid-cell data-coverage="7">74.5%</nve-grid-cell>
    <nve-grid-cell data-coverage="6">62.6%</nve-grid-cell>
    <nve-grid-cell data-coverage="5">50.6%</nve-grid-cell>
    <nve-grid-cell data-coverage="4">42.9%</nve-grid-cell>
    <nve-grid-cell data-coverage="2">22.9%</nve-grid-cell>
    <nve-grid-cell data-coverage="1">13.9%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Camera Side L</nve-grid-cell>
    <nve-grid-cell data-coverage="7">77.8%</nve-grid-cell>
    <nve-grid-cell data-coverage="6">62.9%</nve-grid-cell>
    <nve-grid-cell data-coverage="5">55.9%</nve-grid-cell>
    <nve-grid-cell data-coverage="4">41.3%</nve-grid-cell>
    <nve-grid-cell data-coverage="2">28.0%</nve-grid-cell>
    <nve-grid-cell data-coverage="1">14.1%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Camera Side R</nve-grid-cell>
    <nve-grid-cell data-coverage="7">73.3%</nve-grid-cell>
    <nve-grid-cell data-coverage="5">59.6%</nve-grid-cell>
    <nve-grid-cell data-coverage="4">48.9%</nve-grid-cell>
    <nve-grid-cell data-coverage="3">35.3%</nve-grid-cell>
    <nve-grid-cell data-coverage="3">30.6%</nve-grid-cell>
    <nve-grid-cell data-coverage="1">12.3%</nve-grid-cell>
  </nve-grid-row>
</nve-grid>
  `
};

/**
 * @summary Grid heatmap visualizing object detection latency for robotics perception pipelines using viridis colors.
 * Helps robotics engineers identify inference bottlenecks across object classes and model configurations.
 * @tags pattern
 */
export const InferenceLatencyHeatmap = {
  render: () => html`
<nve-grid container="flat">
  <style>
    @scope {
      [data-latency] { --color: #000; --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted); text-align: center; }
      [data-latency='0'], [data-latency='1'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-100); }
      [data-latency='2'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-200); }
      [data-latency='3'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-300); }
      [data-latency='4'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-400); }
      [data-latency='5'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-500); }
      [data-latency='6'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-600); }
      [data-latency='7'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-700); }
      [data-latency='8'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-800); }
      [data-latency='9'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-900); --color: #fff; }
      [data-latency='10'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1000); --color: #fff; }
      [data-latency='11'], [data-latency='12'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1100); --color: #fff; }
      [data-latency='13'], [data-latency='14'], [data-latency='15'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1200); --color: #fff; }
    }
  </style>
  <nve-grid-header>
    <nve-grid-column width="140px" position="fixed">Object Class</nve-grid-column>
    <nve-grid-column column-align="center">FP32 CPU</nve-grid-column>
    <nve-grid-column column-align="center">FP16 GPU</nve-grid-column>
    <nve-grid-column column-align="center">INT8 GPU</nve-grid-column>
    <nve-grid-column column-align="center">TensorRT</nve-grid-column>
    <nve-grid-column column-align="center">ONNX Runtime</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>Pedestrian</nve-grid-cell>
    <nve-grid-cell data-latency="13">54.6ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">26.7ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">24.8ms</nve-grid-cell>
    <nve-grid-cell data-latency="3">14.2ms</nve-grid-cell>
    <nve-grid-cell data-latency="7">28.2ms</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Vehicle</nve-grid-cell>
    <nve-grid-cell data-latency="11">47.8ms</nve-grid-cell>
    <nve-grid-cell data-latency="5">23.8ms</nve-grid-cell>
    <nve-grid-cell data-latency="5">21.3ms</nve-grid-cell>
    <nve-grid-cell data-latency="2">11.5ms</nve-grid-cell>
    <nve-grid-cell data-latency="5">21.5ms</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Cyclist</nve-grid-cell>
    <nve-grid-cell data-latency="12">50.8ms</nve-grid-cell>
    <nve-grid-cell data-latency="5">23.1ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">26.7ms</nve-grid-cell>
    <nve-grid-cell data-latency="2">10.3ms</nve-grid-cell>
    <nve-grid-cell data-latency="5">22.1ms</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Traffic Sign</nve-grid-cell>
    <nve-grid-cell data-latency="13">53.2ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">25.4ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">24.7ms</nve-grid-cell>
    <nve-grid-cell data-latency="2">9.2ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">26.4ms</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Traffic Light</nve-grid-cell>
    <nve-grid-cell data-latency="13">52.5ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">25.6ms</nve-grid-cell>
    <nve-grid-cell data-latency="5">23.3ms</nve-grid-cell>
    <nve-grid-cell data-latency="2">9.5ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">24.6ms</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Road Marking</nve-grid-cell>
    <nve-grid-cell data-latency="12">51.5ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">25.2ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">25.2ms</nve-grid-cell>
    <nve-grid-cell data-latency="3">13.6ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">25.9ms</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Construction</nve-grid-cell>
    <nve-grid-cell data-latency="12">51.3ms</nve-grid-cell>
    <nve-grid-cell data-latency="5">23.4ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">27.0ms</nve-grid-cell>
    <nve-grid-cell data-latency="2">11.3ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">25.4ms</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Animal</nve-grid-cell>
    <nve-grid-cell data-latency="13">53.5ms</nve-grid-cell>
    <nve-grid-cell data-latency="5">22.5ms</nve-grid-cell>
    <nve-grid-cell data-latency="6">25.6ms</nve-grid-cell>
    <nve-grid-cell data-latency="2">11.4ms</nve-grid-cell>
    <nve-grid-cell data-latency="5">23.5ms</nve-grid-cell>
  </nve-grid-row>
</nve-grid>
  `
};

/**
 * @summary Grid heatmap showing path planning success rates for autonomous navigation across environmental conditions.
 * Ideal for AV validation teams comparing planner behavior in edge cases like fog, snow, and night driving.
 * @tags pattern
 */
export const PathPlanningHeatmap = {
  render: () => html`
<nve-grid container="flat">
  <style>
    @scope {
      [data-rate='6'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-200); }
      [data-rate='7'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-400); }
      [data-rate='8'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-600); }
      [data-rate='9'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-800); }
      [data-rate='10'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-900); --color: var(--nve-ref-color-neutral-100); }
      [data-rate] { --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted); text-align: center; }
    }
  </style>
  <nve-grid-header>
    <nve-grid-column width="160px" position="fixed">Scenario</nve-grid-column>
    <nve-grid-column column-align="center">Clear Day</nve-grid-column>
    <nve-grid-column column-align="center">Rain</nve-grid-column>
    <nve-grid-column column-align="center">Night</nve-grid-column>
    <nve-grid-column column-align="center">Fog</nve-grid-column>
    <nve-grid-column column-align="center">Snow</nve-grid-column>
    <nve-grid-column column-align="center">Glare</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>Highway Merge</nve-grid-cell>
    <nve-grid-cell data-rate="9">98.6%</nve-grid-cell>
    <nve-grid-cell data-rate="9">91.7%</nve-grid-cell>
    <nve-grid-cell data-rate="8">85.2%</nve-grid-cell>
    <nve-grid-cell data-rate="7">79.0%</nve-grid-cell>
    <nve-grid-cell data-rate="7">70.9%</nve-grid-cell>
    <nve-grid-cell data-rate="9">92.0%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Intersection Turn</nve-grid-cell>
    <nve-grid-cell data-rate="9">92.5%</nve-grid-cell>
    <nve-grid-cell data-rate="8">85.7%</nve-grid-cell>
    <nve-grid-cell data-rate="8">81.4%</nve-grid-cell>
    <nve-grid-cell data-rate="7">72.5%</nve-grid-cell>
    <nve-grid-cell data-rate="7">70.4%</nve-grid-cell>
    <nve-grid-cell data-rate="8">85.2%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Pedestrian Crossing</nve-grid-cell>
    <nve-grid-cell data-rate="9">95.2%</nve-grid-cell>
    <nve-grid-cell data-rate="8">82.1%</nve-grid-cell>
    <nve-grid-cell data-rate="8">80.0%</nve-grid-cell>
    <nve-grid-cell data-rate="7">71.5%</nve-grid-cell>
    <nve-grid-cell data-rate="6">65.7%</nve-grid-cell>
    <nve-grid-cell data-rate="8">87.3%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Construction Zone</nve-grid-cell>
    <nve-grid-cell data-rate="9">97.8%</nve-grid-cell>
    <nve-grid-cell data-rate="8">80.8%</nve-grid-cell>
    <nve-grid-cell data-rate="7">77.0%</nve-grid-cell>
    <nve-grid-cell data-rate="7">75.3%</nve-grid-cell>
    <nve-grid-cell data-rate="6">66.3%</nve-grid-cell>
    <nve-grid-cell data-rate="7">79.5%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Parking Lot</nve-grid-cell>
    <nve-grid-cell data-rate="8">86.0%</nve-grid-cell>
    <nve-grid-cell data-rate="8">82.0%</nve-grid-cell>
    <nve-grid-cell data-rate="7">73.0%</nve-grid-cell>
    <nve-grid-cell data-rate="6">68.9%</nve-grid-cell>
    <nve-grid-cell data-rate="6">65.0%</nve-grid-cell>
    <nve-grid-cell data-rate="8">80.6%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Emergency Vehicle</nve-grid-cell>
    <nve-grid-cell data-rate="9">96.4%</nve-grid-cell>
    <nve-grid-cell data-rate="8">88.9%</nve-grid-cell>
    <nve-grid-cell data-rate="7">78.9%</nve-grid-cell>
    <nve-grid-cell data-rate="7">72.7%</nve-grid-cell>
    <nve-grid-cell data-rate="6">67.8%</nve-grid-cell>
    <nve-grid-cell data-rate="8">84.3%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>School Zone</nve-grid-cell>
    <nve-grid-cell data-rate="9">92.5%</nve-grid-cell>
    <nve-grid-cell data-rate="8">89.7%</nve-grid-cell>
    <nve-grid-cell data-rate="7">77.5%</nve-grid-cell>
    <nve-grid-cell data-rate="7">73.3%</nve-grid-cell>
    <nve-grid-cell data-rate="6">65.0%</nve-grid-cell>
    <nve-grid-cell data-rate="8">82.3%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>Roundabout</nve-grid-cell>
    <nve-grid-cell data-rate="9">91.4%</nve-grid-cell>
    <nve-grid-cell data-rate="8">82.1%</nve-grid-cell>
    <nve-grid-cell data-rate="7">78.3%</nve-grid-cell>
    <nve-grid-cell data-rate="7">71.5%</nve-grid-cell>
    <nve-grid-cell data-rate="7">70.4%</nve-grid-cell>
    <nve-grid-cell data-rate="8">85.4%</nve-grid-cell>
  </nve-grid-row>
</nve-grid>
  `
};

/**
 * @summary Grid heatmap displaying robot joint usage for multi-axis manipulator arms across motion profiles.
 * Essential for robotics engineers optimizing arm trajectories and preventing mechanical wear using viridis scale.
 * @tags pattern
 */
export const JointUtilizationHeatmap = {
  render: () => html`
<nve-grid container="flat">
  <style>
    @scope {
      [data-load] { --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted); text-align: center; --color: #000; }
      [data-load='0'], [data-load='1'], [data-load='2'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-100); }
      [data-load='3'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-300); }
      [data-load='4'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-500); }
      [data-load='5'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-600); }
      [data-load='6'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-700); }
      [data-load='7'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-900); --color: #fff }
      [data-load='8'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1100); --color: #fff }
      [data-load='9'], [data-load='10'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1400); --color: #fff }
    }
  </style>
  <nve-grid-header>
    <nve-grid-column width="120px" position="fixed">Joint</nve-grid-column>
    <nve-grid-column column-align="center">Pick Light</nve-grid-column>
    <nve-grid-column column-align="center">Pick Heavy</nve-grid-column>
    <nve-grid-column column-align="center">Place</nve-grid-column>
    <nve-grid-column column-align="center">Transport</nve-grid-column>
    <nve-grid-column column-align="center">Inspection</nve-grid-column>
    <nve-grid-column column-align="center">Home</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>J1 Base</nve-grid-cell>
    <nve-grid-cell data-load="6">69%</nve-grid-cell>
    <nve-grid-cell data-load="10">100%</nve-grid-cell>
    <nve-grid-cell data-load="7">74%</nve-grid-cell>
    <nve-grid-cell data-load="8">82%</nve-grid-cell>
    <nve-grid-cell data-load="7">74%</nve-grid-cell>
    <nve-grid-cell data-load="7">78%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>J2 Shoulder</nve-grid-cell>
    <nve-grid-cell data-load="7">79%</nve-grid-cell>
    <nve-grid-cell data-load="9">97%</nve-grid-cell>
    <nve-grid-cell data-load="7">73%</nve-grid-cell>
    <nve-grid-cell data-load="9">92%</nve-grid-cell>
    <nve-grid-cell data-load="7">71%</nve-grid-cell>
    <nve-grid-cell data-load="7">75%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>J3 Elbow</nve-grid-cell>
    <nve-grid-cell data-load="5">57%</nve-grid-cell>
    <nve-grid-cell data-load="6">68%</nve-grid-cell>
    <nve-grid-cell data-load="5">57%</nve-grid-cell>
    <nve-grid-cell data-load="6">67%</nve-grid-cell>
    <nve-grid-cell data-load="5">56%</nve-grid-cell>
    <nve-grid-cell data-load="5">51%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>J4 Wrist 1</nve-grid-cell>
    <nve-grid-cell data-load="5">58%</nve-grid-cell>
    <nve-grid-cell data-load="6">64%</nve-grid-cell>
    <nve-grid-cell data-load="5">52%</nve-grid-cell>
    <nve-grid-cell data-load="6">64%</nve-grid-cell>
    <nve-grid-cell data-load="5">50%</nve-grid-cell>
    <nve-grid-cell data-load="5">58%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>J5 Wrist 2</nve-grid-cell>
    <nve-grid-cell data-load="3">32%</nve-grid-cell>
    <nve-grid-cell data-load="5">52%</nve-grid-cell>
    <nve-grid-cell data-load="3">36%</nve-grid-cell>
    <nve-grid-cell data-load="4">47%</nve-grid-cell>
    <nve-grid-cell data-load="4">41%</nve-grid-cell>
    <nve-grid-cell data-load="3">37%</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>J6 Wrist 3</nve-grid-cell>
    <nve-grid-cell data-load="4">41%</nve-grid-cell>
    <nve-grid-cell data-load="4">48%</nve-grid-cell>
    <nve-grid-cell data-load="4">42%</nve-grid-cell>
    <nve-grid-cell data-load="4">46%</nve-grid-cell>
    <nve-grid-cell data-load="4">40%</nve-grid-cell>
    <nve-grid-cell data-load="3">35%</nve-grid-cell>
  </nve-grid-row>
</nve-grid>
  `
};

/**
 * @summary Grid heatmap displaying occupancy probability for dynamic obstacle detection across a spatial coordinate grid. Ideal for robotics and AV perception teams visualizing sensor fusion output to identify high-occupancy zones and detection blind spots using viridis scale.
 * @tags pattern
 */
export const OccupancyDetectionHeatmap = {
  render: () => html`
<nve-grid container="flat">
  <style>
    @scope {
      [data-intensity] { --color: #000; --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted); text-align: center; }
      [data-intensity^='0'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-100); }
      [data-intensity^='1'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-200); }
      [data-intensity^='2'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-300); }
      [data-intensity^='3'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-400); }
      [data-intensity^='4'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-500); }
      [data-intensity^='5'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-600); }
      [data-intensity^='6'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-700); }
      [data-intensity^='7'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-800); }
      [data-intensity^='8'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-900); }
      [data-intensity^='9'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1100); --color: #fff; }
      [data-intensity^='100'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1200); --color: #fff; }
    }
  </style>
  <nve-grid-header>
    <nve-grid-column position="fixed" tabindex="0" left="" aria-colindex="1">Y (m)</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="2">-5</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="3">-4</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="4">-3</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="5">-2</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="6">-1</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="7">0</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="8">1</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="9">2</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="10">3</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="11">4</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="12">5</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="13">6</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>-4</nve-grid-cell>
    <nve-grid-cell data-intensity="10">5</nve-grid-cell>
    <nve-grid-cell data-intensity="10">8</nve-grid-cell>
    <nve-grid-cell data-intensity="10">10</nve-grid-cell>
    <nve-grid-cell data-intensity="10">12</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
    <nve-grid-cell data-intensity="20">18</nve-grid-cell>
    <nve-grid-cell data-intensity="20">20</nve-grid-cell>
    <nve-grid-cell data-intensity="20">18</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
    <nve-grid-cell data-intensity="10">12</nve-grid-cell>
    <nve-grid-cell data-intensity="10">10</nve-grid-cell>
    <nve-grid-cell data-intensity="10">8</nve-grid-cell>
  </nve-grid-row>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>-3</nve-grid-cell>
    <nve-grid-cell data-intensity="10">8</nve-grid-cell>
    <nve-grid-cell data-intensity="10">12</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
    <nve-grid-cell data-intensity="20">18</nve-grid-cell>
    <nve-grid-cell data-intensity="20">22</nve-grid-cell>
    <nve-grid-cell data-intensity="30">28</nve-grid-cell>
    <nve-grid-cell data-intensity="30">32</nve-grid-cell>
    <nve-grid-cell data-intensity="30">28</nve-grid-cell>
    <nve-grid-cell data-intensity="20">22</nve-grid-cell>
    <nve-grid-cell data-intensity="20">18</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
    <nve-grid-cell data-intensity="10">12</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>-2</nve-grid-cell>
    <nve-grid-cell data-intensity="10">10</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
    <nve-grid-cell data-intensity="20">20</nve-grid-cell>
    <nve-grid-cell data-intensity="30">25</nve-grid-cell>
    <nve-grid-cell data-intensity="90">85</nve-grid-cell>
    <nve-grid-cell data-intensity="90">92</nve-grid-cell>
    <nve-grid-cell data-intensity="100">95</nve-grid-cell>
    <nve-grid-cell data-intensity="90">88</nve-grid-cell>
    <nve-grid-cell data-intensity="30">30</nve-grid-cell>
    <nve-grid-cell data-intensity="30">25</nve-grid-cell>
    <nve-grid-cell data-intensity="20">20</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>-1</nve-grid-cell>
    <nve-grid-cell data-intensity="10">12</nve-grid-cell>
    <nve-grid-cell data-intensity="20">18</nve-grid-cell>
    <nve-grid-cell data-intensity="30">25</nve-grid-cell>
    <nve-grid-cell data-intensity="30">30</nve-grid-cell>
    <nve-grid-cell data-intensity="90">90</nve-grid-cell>
    <nve-grid-cell data-intensity="100">95</nve-grid-cell>
    <nve-grid-cell data-intensity="100">98</nve-grid-cell>
    <nve-grid-cell data-intensity="90">92</nve-grid-cell>
    <nve-grid-cell data-intensity="40">35</nve-grid-cell>
    <nve-grid-cell data-intensity="30">30</nve-grid-cell>
    <nve-grid-cell data-intensity="30">25</nve-grid-cell>
    <nve-grid-cell data-intensity="20">18</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>0</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
    <nve-grid-cell data-intensity="20">22</nve-grid-cell>
    <nve-grid-cell data-intensity="30">30</nve-grid-cell>
    <nve-grid-cell data-intensity="40">35</nve-grid-cell>
    <nve-grid-cell data-intensity="90">92</nve-grid-cell>
    <nve-grid-cell data-intensity="100">98</nve-grid-cell>
    <nve-grid-cell data-intensity="100">98</nve-grid-cell>
    <nve-grid-cell data-intensity="100">95</nve-grid-cell>
    <nve-grid-cell data-intensity="40">40</nve-grid-cell>
    <nve-grid-cell data-intensity="40">35</nve-grid-cell>
    <nve-grid-cell data-intensity="30">30</nve-grid-cell>
    <nve-grid-cell data-intensity="20">22</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>1</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
    <nve-grid-cell data-intensity="20">22</nve-grid-cell>
    <nve-grid-cell data-intensity="30">30</nve-grid-cell>
    <nve-grid-cell data-intensity="40">35</nve-grid-cell>
    <nve-grid-cell data-intensity="90">88</nve-grid-cell>
    <nve-grid-cell data-intensity="100">95</nve-grid-cell>
    <nve-grid-cell data-intensity="100">95</nve-grid-cell>
    <nve-grid-cell data-intensity="90">90</nve-grid-cell>
    <nve-grid-cell data-intensity="40">40</nve-grid-cell>
    <nve-grid-cell data-intensity="40">35</nve-grid-cell>
    <nve-grid-cell data-intensity="30">30</nve-grid-cell>
    <nve-grid-cell data-intensity="20">22</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>2</nve-grid-cell>
    <nve-grid-cell data-intensity="10">12</nve-grid-cell>
    <nve-grid-cell data-intensity="20">18</nve-grid-cell>
    <nve-grid-cell data-intensity="30">25</nve-grid-cell>
    <nve-grid-cell data-intensity="30">30</nve-grid-cell>
    <nve-grid-cell data-intensity="80">82</nve-grid-cell>
    <nve-grid-cell data-intensity="90">88</nve-grid-cell>
    <nve-grid-cell data-intensity="90">90</nve-grid-cell>
    <nve-grid-cell data-intensity="90">85</nve-grid-cell>
    <nve-grid-cell data-intensity="40">35</nve-grid-cell>
    <nve-grid-cell data-intensity="30">30</nve-grid-cell>
    <nve-grid-cell data-intensity="30">25</nve-grid-cell>
    <nve-grid-cell data-intensity="20">18</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>3</nve-grid-cell>
    <nve-grid-cell data-intensity="10">10</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
    <nve-grid-cell data-intensity="20">20</nve-grid-cell>
    <nve-grid-cell data-intensity="30">25</nve-grid-cell>
    <nve-grid-cell data-intensity="80">75</nve-grid-cell>
    <nve-grid-cell data-intensity="80">80</nve-grid-cell>
    <nve-grid-cell data-intensity="80">82</nve-grid-cell>
    <nve-grid-cell data-intensity="80">78</nve-grid-cell>
    <nve-grid-cell data-intensity="30">30</nve-grid-cell>
    <nve-grid-cell data-intensity="30">25</nve-grid-cell>
    <nve-grid-cell data-intensity="20">20</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>4</nve-grid-cell>
    <nve-grid-cell data-intensity="10">8</nve-grid-cell>
    <nve-grid-cell data-intensity="10">12</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
    <nve-grid-cell data-intensity="20">18</nve-grid-cell>
    <nve-grid-cell data-intensity="20">22</nve-grid-cell>
    <nve-grid-cell data-intensity="30">28</nve-grid-cell>
    <nve-grid-cell data-intensity="30">32</nve-grid-cell>
    <nve-grid-cell data-intensity="30">28</nve-grid-cell>
    <nve-grid-cell data-intensity="20">22</nve-grid-cell>
    <nve-grid-cell data-intensity="20">18</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
    <nve-grid-cell data-intensity="10">12</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>5</nve-grid-cell>
    <nve-grid-cell data-intensity="10">5</nve-grid-cell>
    <nve-grid-cell data-intensity="10">8</nve-grid-cell>
    <nve-grid-cell data-intensity="10">10</nve-grid-cell>
    <nve-grid-cell data-intensity="10">12</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
    <nve-grid-cell data-intensity="20">18</nve-grid-cell>
    <nve-grid-cell data-intensity="20">20</nve-grid-cell>
    <nve-grid-cell data-intensity="20">18</nve-grid-cell>
    <nve-grid-cell data-intensity="20">15</nve-grid-cell>
    <nve-grid-cell data-intensity="10">12</nve-grid-cell>
    <nve-grid-cell data-intensity="10">10</nve-grid-cell>
    <nve-grid-cell data-intensity="10">8</nve-grid-cell>
  </nve-grid-row>
</nve-grid>
  `
};


/**
 * @summary Grid heatmap displaying thermal distribution across robotic arm joints and actuators over time. Essential for monitoring overheating risks during extended operation cycles and validating cooling system performance using viridis scale.
 * @tags pattern
 */
export const ThermalHeatmap = {
  render: () => html`
<nve-grid container="flat">
  <style>
    @scope {
      [data-intensity] { --color: #000; --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted); text-align: center; }
      [data-intensity^='0'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-100); }
      [data-intensity^='1'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-200); }
      [data-intensity^='2'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-300); }
      [data-intensity^='3'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-400); }
      [data-intensity^='4'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-500); }
      [data-intensity^='5'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-600); }
      [data-intensity^='6'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-700); }
      [data-intensity^='7'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-800); }
      [data-intensity^='8'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-900); }
      [data-intensity^='9'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1100); --color: #fff; }
      [data-intensity^='100'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1200); --color: #fff; }
    }
  </style>
  <nve-grid-header>
    <nve-grid-column position="fixed" tabindex="0" left="" aria-colindex="1">Time (min)</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="2">Base</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="3">J1</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="4">J2</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="5">J3</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="6">J4</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="7">J5</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="8">J6</nve-grid-column>
    <nve-grid-column column-align="center" aria-colindex="9">EE</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>0</nve-grid-cell>
    <nve-grid-cell data-intensity="20">22</nve-grid-cell>
    <nve-grid-cell data-intensity="20">23</nve-grid-cell>
    <nve-grid-cell data-intensity="20">24</nve-grid-cell>
    <nve-grid-cell data-intensity="30">25</nve-grid-cell>
    <nve-grid-cell data-intensity="30">26</nve-grid-cell>
    <nve-grid-cell data-intensity="30">27</nve-grid-cell>
    <nve-grid-cell data-intensity="30">28</nve-grid-cell>
    <nve-grid-cell data-intensity="30">25</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>15</nve-grid-cell>
    <nve-grid-cell data-intensity="20">24</nve-grid-cell>
    <nve-grid-cell data-intensity="30">28</nve-grid-cell>
    <nve-grid-cell data-intensity="30">32</nve-grid-cell>
    <nve-grid-cell data-intensity="40">35</nve-grid-cell>
    <nve-grid-cell data-intensity="40">38</nve-grid-cell>
    <nve-grid-cell data-intensity="40">40</nve-grid-cell>
    <nve-grid-cell data-intensity="40">42</nve-grid-cell>
    <nve-grid-cell data-intensity="40">35</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>30</nve-grid-cell>
    <nve-grid-cell data-intensity="30">26</nve-grid-cell>
    <nve-grid-cell data-intensity="30">32</nve-grid-cell>
    <nve-grid-cell data-intensity="40">38</nve-grid-cell>
    <nve-grid-cell data-intensity="40">42</nve-grid-cell>
    <nve-grid-cell data-intensity="50">46</nve-grid-cell>
    <nve-grid-cell data-intensity="50">48</nve-grid-cell>
    <nve-grid-cell data-intensity="50">50</nve-grid-cell>
    <nve-grid-cell data-intensity="40">42</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>45</nve-grid-cell>
    <nve-grid-cell data-intensity="30">28</nve-grid-cell>
    <nve-grid-cell data-intensity="40">36</nve-grid-cell>
    <nve-grid-cell data-intensity="40">42</nve-grid-cell>
    <nve-grid-cell data-intensity="50">48</nve-grid-cell>
    <nve-grid-cell data-intensity="50">52</nve-grid-cell>
    <nve-grid-cell data-intensity="60">55</nve-grid-cell>
    <nve-grid-cell data-intensity="60">58</nve-grid-cell>
    <nve-grid-cell data-intensity="50">48</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>60</nve-grid-cell>
    <nve-grid-cell data-intensity="30">30</nve-grid-cell>
    <nve-grid-cell data-intensity="40">40</nve-grid-cell>
    <nve-grid-cell data-intensity="50">46</nve-grid-cell>
    <nve-grid-cell data-intensity="50">52</nve-grid-cell>
    <nve-grid-cell data-intensity="60">58</nve-grid-cell>
    <nve-grid-cell data-intensity="60">62</nve-grid-cell>
    <nve-grid-cell data-intensity="70">65</nve-grid-cell>
    <nve-grid-cell data-intensity="50">52</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>75</nve-grid-cell>
    <nve-grid-cell data-intensity="30">32</nve-grid-cell>
    <nve-grid-cell data-intensity="40">42</nve-grid-cell>
    <nve-grid-cell data-intensity="50">50</nve-grid-cell>
    <nve-grid-cell data-intensity="60">56</nve-grid-cell>
    <nve-grid-cell data-intensity="60">62</nve-grid-cell>
    <nve-grid-cell data-intensity="70">68</nve-grid-cell>
    <nve-grid-cell data-intensity="70">72</nve-grid-cell>
    <nve-grid-cell data-intensity="60">58</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>90</nve-grid-cell>
    <nve-grid-cell data-intensity="30">34</nve-grid-cell>
    <nve-grid-cell data-intensity="50">45</nve-grid-cell>
    <nve-grid-cell data-intensity="50">52</nve-grid-cell>
    <nve-grid-cell data-intensity="60">60</nve-grid-cell>
    <nve-grid-cell data-intensity="70">66</nve-grid-cell>
    <nve-grid-cell data-intensity="70">72</nve-grid-cell>
    <nve-grid-cell data-intensity="80">78</nve-grid-cell>
    <nve-grid-cell data-intensity="60">62</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>105</nve-grid-cell>
    <nve-grid-cell data-intensity="40">36</nve-grid-cell>
    <nve-grid-cell data-intensity="50">48</nve-grid-cell>
    <nve-grid-cell data-intensity="60">56</nve-grid-cell>
    <nve-grid-cell data-intensity="60">64</nve-grid-cell>
    <nve-grid-cell data-intensity="70">70</nve-grid-cell>
    <nve-grid-cell data-intensity="80">76</nve-grid-cell>
    <nve-grid-cell data-intensity="80">82</nve-grid-cell>
    <nve-grid-cell data-intensity="70">68</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>120</nve-grid-cell>
    <nve-grid-cell data-intensity="40">38</nve-grid-cell>
    <nve-grid-cell data-intensity="50">50</nve-grid-cell>
    <nve-grid-cell data-intensity="60">58</nve-grid-cell>
    <nve-grid-cell data-intensity="70">66</nve-grid-cell>
    <nve-grid-cell data-intensity="70">74</nve-grid-cell>
    <nve-grid-cell data-intensity="80">80</nve-grid-cell>
    <nve-grid-cell data-intensity="90">85</nve-grid-cell>
    <nve-grid-cell data-intensity="70">72</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>135</nve-grid-cell>
    <nve-grid-cell data-intensity="40">40</nve-grid-cell>
    <nve-grid-cell data-intensity="50">52</nve-grid-cell>
    <nve-grid-cell data-intensity="60">60</nve-grid-cell>
    <nve-grid-cell data-intensity="70">68</nve-grid-cell>
    <nve-grid-cell data-intensity="80">76</nve-grid-cell>
    <nve-grid-cell data-intensity="80">82</nve-grid-cell>
    <nve-grid-cell data-intensity="90">88</nve-grid-cell>
    <nve-grid-cell data-intensity="80">75</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>150</nve-grid-cell>
    <nve-grid-cell data-intensity="40">42</nve-grid-cell>
    <nve-grid-cell data-intensity="50">54</nve-grid-cell>
    <nve-grid-cell data-intensity="60">62</nve-grid-cell>
    <nve-grid-cell data-intensity="70">70</nve-grid-cell>
    <nve-grid-cell data-intensity="80">78</nve-grid-cell>
    <nve-grid-cell data-intensity="80">84</nve-grid-cell>
    <nve-grid-cell data-intensity="90">90</nve-grid-cell>
    <nve-grid-cell data-intensity="80">78</nve-grid-cell>
  </nve-grid-row>
</nve-grid>
  `
};

/**
 * @summary Dynamic heatmap pattern with programmatic data generation and management via JavaScript.
 * @tags pattern test-case
 */
export const DynamicHeatmap = {
  render: () => html`
<nve-grid id="heatmap-pattern-grid" container="flat" style="max-width: 1100px">
  <nve-grid-header>
    <nve-grid-column width="150px" position="fixed">AV Module</nve-grid-column>
  </nve-grid-header>
</nve-grid>
<script type="module">
  const modules = ['Perception', 'Localization', 'Prediction', 'Planning', 'Control', 'Mapping', 'Sensor Fusion', 'Safety Monitor'];
  const scenarios = ['Highway', 'Urban', 'Intersection', 'Parking', 'Construction', 'Adverse Weather'];

  const testData = modules.map(module => ({
    name: module,
    results: scenarios.map(() => {
      const base = module === 'Safety Monitor' ? 99 : module === 'Control' ? 96 : 92;
      return Math.max(65, Math.min(100, base + (Math.random() * 35 - 27))).toFixed(1);
    })
  }));

  const grid = document.querySelector('nve-grid#heatmap-pattern-grid');
  const gridHeader = grid.querySelector('nve-grid-header');

  const columns = scenarios.map(scenario => {
    const column = document.createElement('nve-grid-column');
    column.textContent = scenario;
    column.setAttribute('column-align', 'center');
    return column;
  });

  const rows = testData.map(module => {
    const row = document.createElement('nve-grid-row');
    const moduleCell = document.createElement('nve-grid-cell');
    moduleCell.textContent = module.name;

    const resultCells = module.results.map(result => {
      const cell = document.createElement('nve-grid-cell');
      cell.textContent = result + '%';
      cell.setAttribute('data-value', Math.floor(parseFloat(result) / 10));
      return cell;
    });

    row.append(moduleCell, ...resultCells);
    return row;
  });

  const style = document.createElement('style');
  style.textContent = \`@scope {
    [data-value='0'], [data-value='1'], [data-value='2'], [data-value='3'], [data-value='4'] {
      --background: var(--nve-sys-visualization-sequential-diverging-red-green-100);
      --color: var(--nve-ref-color-neutral-100);
    }
    [data-value='5'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-200); }
    [data-value='6'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-300); }
    [data-value='7'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-400); }
    [data-value='8'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-700); }
    [data-value='9'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-800); }
    [data-value='10'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-900); --color: var(--nve-ref-color-neutral-100); }
    [data-value] { --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted); text-align: center; }
  }\`;

  gridHeader.append(...columns);
  grid.append(style, ...rows);
</script>
  `
};