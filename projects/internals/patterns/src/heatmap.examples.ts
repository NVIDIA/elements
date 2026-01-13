import { html } from 'lit';

export default {
  title: 'Patterns/Heatmap',
  component: 'nve-internal-patterns'
};

/**
 * @summary Grid heatmap displaying simulation test pass rates for AV software modules across driving scenarios.
 * Ideal for CI/CD dashboards tracking autonomous vehicle stack validation using red-green diverging tokens.
 * @tags pattern
 */
export const HeatmapPattern = {
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

/**
 * @summary Grid heatmap showing sensor coverage for autonomous vehicle perception systems across distance ranges.
 * Useful for AV engineers analyzing LiDAR, radar, and camera fusion performance to identify blind spots.
 * @tags pattern
 */
export const SensorCoverage = {
  render: () => html`
<nve-grid id="sensor-coverage-grid" container="flat" style="max-width: 1100px">
  <nve-grid-header>
    <nve-grid-column width="140px" position="fixed">Sensor</nve-grid-column>
  </nve-grid-header>
</nve-grid>
<script type="module">
  const sensors = ['LiDAR Front', 'LiDAR Rear', 'Radar Front', 'Radar Side L', 'Radar Side R', 'Camera Front', 'Camera Rear', 'Camera Side L', 'Camera Side R'];
  const distanceRanges = ['0-10m', '10-30m', '30-50m', '50-100m', '100-150m', '150-200m'];

  const coverageData = sensors.map(sensor => ({
    name: sensor,
    coverage: distanceRanges.map((_, i) => {
      const baseCoverage = sensor.includes('LiDAR') ? 95 : sensor.includes('Radar') ? 85 : 75;
      const distancePenalty = i * (sensor.includes('Camera') ? 12 : 8);
      return Math.max(0, Math.min(100, baseCoverage - distancePenalty + (Math.random() * 10 - 5))).toFixed(1);
    })
  }));

  const grid = document.querySelector('nve-grid#sensor-coverage-grid');
  const gridHeader = grid.querySelector('nve-grid-header');

  const columns = distanceRanges.map(range => {
    const column = document.createElement('nve-grid-column');
    column.textContent = range;
    column.setAttribute('column-align', 'center');
    return column;
  });

  const rows = coverageData.map(sensor => {
    const row = document.createElement('nve-grid-row');
    const nameCell = document.createElement('nve-grid-cell');
    nameCell.textContent = sensor.name;

    const coverageCells = sensor.coverage.map(value => {
      const cell = document.createElement('nve-grid-cell');
      cell.textContent = value + '%';
      cell.setAttribute('data-coverage', Math.floor(parseFloat(value) / 10));
      return cell;
    });

    row.append(nameCell, ...coverageCells);
    return row;
  });

  const style = document.createElement('style');
  style.textContent = \`@scope {
    [data-coverage='0'], [data-coverage='1'], [data-coverage='2'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-100); --color: var(--nve-ref-color-neutral-100); }
    [data-coverage='3'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-200); }
    [data-coverage='4'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-300); }
    [data-coverage='5'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-400); }
    [data-coverage='6'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-600); }
    [data-coverage='7'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-700); }
    [data-coverage='8'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-800); }
    [data-coverage='9'], [data-coverage='10'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-900); --color: var(--nve-ref-color-neutral-100); }
    [data-coverage] { --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted); text-align: center; }
  }\`;

  gridHeader.append(...columns);
  grid.append(style, ...rows);
</script>
  `
};

/**
 * @summary Grid heatmap visualizing object detection latency for robotics perception pipelines using viridis colors.
 * Helps robotics engineers identify inference bottlenecks across object classes and model configurations.
 * @tags pattern
 */
export const InferenceLatency = {
  render: () => html`
<nve-grid id="inference-latency-grid" container="flat" style="max-width: 1100px">
  <nve-grid-header>
    <nve-grid-column width="140px" position="fixed">Object Class</nve-grid-column>
  </nve-grid-header>
</nve-grid>
<script type="module">
  const objectClasses = ['Pedestrian', 'Vehicle', 'Cyclist', 'Traffic Sign', 'Traffic Light', 'Road Marking', 'Construction Zone', 'Animal'];
  const modelConfigs = ['FP32 CPU', 'FP16 GPU', 'INT8 GPU', 'TensorRT', 'ONNX Runtime'];

  const latencyData = objectClasses.map(objClass => ({
    name: objClass,
    latencies: modelConfigs.map((config, i) => {
      const baseLatency = config.includes('CPU') ? 45 : config.includes('TensorRT') ? 8 : 20;
      const classComplexity = objClass === 'Pedestrian' ? 1.2 : objClass === 'Vehicle' ? 1.0 : 1.1;
      return (baseLatency * classComplexity + Math.random() * 5).toFixed(1);
    })
  }));

  const grid = document.querySelector('nve-grid#inference-latency-grid');
  const gridHeader = grid.querySelector('nve-grid-header');

  const columns = modelConfigs.map(config => {
    const column = document.createElement('nve-grid-column');
    column.textContent = config;
    column.setAttribute('column-align', 'center');
    return column;
  });

  const rows = latencyData.map(obj => {
    const row = document.createElement('nve-grid-row');
    const nameCell = document.createElement('nve-grid-cell');
    nameCell.textContent = obj.name;

    const latencyCells = obj.latencies.map(value => {
      const cell = document.createElement('nve-grid-cell');
      cell.textContent = value + 'ms';
      const latencyBucket = Math.min(15, Math.floor(parseFloat(value) / 4));
      cell.setAttribute('data-latency', latencyBucket);
      return cell;
    });

    row.append(nameCell, ...latencyCells);
    return row;
  });

  const style = document.createElement('style');
  style.textContent = \`@scope {
    [data-latency='0'], [data-latency='1'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-100); }
    [data-latency='2'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-200); }
    [data-latency='3'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-300); }
    [data-latency='4'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-400); }
    [data-latency='5'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-500); }
    [data-latency='6'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-600); }
    [data-latency='7'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-700); }
    [data-latency='8'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-800); }
    [data-latency='9'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-900); --color: var(--nve-ref-color-neutral-100); }
    [data-latency='10'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1000); --color: var(--nve-ref-color-neutral-100); }
    [data-latency='11'], [data-latency='12'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1100); --color: var(--nve-ref-color-neutral-100); }
    [data-latency='13'], [data-latency='14'], [data-latency='15'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1200); --color: var(--nve-ref-color-neutral-100); }
    [data-latency] { --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted); text-align: center; }
  }\`;

  gridHeader.append(...columns);
  grid.append(style, ...rows);
</script>
  `
};

/**
 * @summary Grid heatmap showing path planning success rates for autonomous navigation across environmental conditions.
 * Ideal for AV validation teams comparing planner behavior in edge cases like fog, snow, and night driving.
 * @tags pattern
 */
export const PathPlanning = {
  render: () => html`
<nve-grid id="path-planning-grid" container="flat" style="max-width: 1100px">
  <nve-grid-header>
    <nve-grid-column width="160px" position="fixed">Scenario</nve-grid-column>
  </nve-grid-header>
</nve-grid>
<script type="module">
  const scenarios = ['Highway Merge', 'Intersection Turn', 'Pedestrian Crossing', 'Construction Zone', 'Parking Lot', 'Emergency Vehicle', 'School Zone', 'Roundabout'];
  const conditions = ['Clear Day', 'Rain', 'Night', 'Fog', 'Snow', 'Glare'];

  const planningData = scenarios.map(scenario => ({
    name: scenario,
    rates: conditions.map((condition, i) => {
      const baseRate = scenario === 'Highway Merge' ? 98 : scenario === 'Parking Lot' ? 88 : 93;
      const conditionPenalty = condition === 'Clear Day' ? 0 : condition === 'Rain' ? 8 : condition === 'Night' ? 12 : condition === 'Fog' ? 18 : condition === 'Snow' ? 25 : 10;
      return Math.max(65, Math.min(100, baseRate - conditionPenalty + (Math.random() * 10 - 5))).toFixed(1);
    })
  }));

  const grid = document.querySelector('nve-grid#path-planning-grid');
  const gridHeader = grid.querySelector('nve-grid-header');

  const columns = conditions.map(condition => {
    const column = document.createElement('nve-grid-column');
    column.textContent = condition;
    column.setAttribute('column-align', 'center');
    return column;
  });

  const rows = planningData.map(scenario => {
    const row = document.createElement('nve-grid-row');
    const nameCell = document.createElement('nve-grid-cell');
    nameCell.textContent = scenario.name;

    const rateCells = scenario.rates.map(value => {
      const cell = document.createElement('nve-grid-cell');
      cell.textContent = value + '%';
      cell.setAttribute('data-rate', Math.floor(parseFloat(value) / 10));
      return cell;
    });

    row.append(nameCell, ...rateCells);
    return row;
  });

  const style = document.createElement('style');
  style.textContent = \`@scope {
    [data-rate='6'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-200); }
    [data-rate='7'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-400); }
    [data-rate='8'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-600); }
    [data-rate='9'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-800); }
    [data-rate='10'] { --background: var(--nve-sys-visualization-sequential-diverging-red-green-900); --color: var(--nve-ref-color-neutral-100); }
    [data-rate] { --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted); text-align: center; }
  }\`;

  gridHeader.append(...columns);
  grid.append(style, ...rows);
</script>
  `
};

/**
 * @summary Grid heatmap displaying robot joint utilization for multi-axis manipulator arms across motion profiles.
 * Essential for robotics engineers optimizing arm trajectories and preventing mechanical wear using viridis scale.
 * @tags pattern
 */
export const JointUtilization = {
  render: () => html`
<nve-grid id="joint-utilization-grid" container="flat" style="max-width: 1100px">
  <nve-grid-header>
    <nve-grid-column width="120px" position="fixed">Joint</nve-grid-column>
  </nve-grid-header>
</nve-grid>
<script type="module">
  const joints = ['J1 Base', 'J2 Shoulder', 'J3 Elbow', 'J4 Wrist 1', 'J5 Wrist 2', 'J6 Wrist 3'];
  const motionProfiles = ['Pick Light', 'Pick Heavy', 'Place', 'Transport', 'Inspection', 'Home'];

  const utilizationData = joints.map((joint, jIdx) => ({
    name: joint,
    loads: motionProfiles.map((profile, pIdx) => {
      const baseLoad = jIdx < 2 ? 65 : jIdx < 4 ? 45 : 30;
      const profileMultiplier = profile === 'Pick Heavy' ? 1.4 : profile === 'Transport' ? 1.2 : 1.0;
      return Math.min(100, (baseLoad * profileMultiplier + Math.random() * 15)).toFixed(0);
    })
  }));

  const grid = document.querySelector('nve-grid#joint-utilization-grid');
  const gridHeader = grid.querySelector('nve-grid-header');

  const columns = motionProfiles.map(profile => {
    const column = document.createElement('nve-grid-column');
    column.textContent = profile;
    column.setAttribute('column-align', 'center');
    return column;
  });

  const rows = utilizationData.map(joint => {
    const row = document.createElement('nve-grid-row');
    const nameCell = document.createElement('nve-grid-cell');
    nameCell.textContent = joint.name;

    const loadCells = joint.loads.map(value => {
      const cell = document.createElement('nve-grid-cell');
      cell.textContent = value + '%';
      cell.setAttribute('data-load', Math.floor(parseInt(value) / 10));
      return cell;
    });

    row.append(nameCell, ...loadCells);
    return row;
  });

  const style = document.createElement('style');
  style.textContent = \`@scope {
    [data-load='0'], [data-load='1'], [data-load='2'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-100); }
    [data-load='3'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-300); }
    [data-load='4'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-500); }
    [data-load='5'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-600); }
    [data-load='6'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-700); }
    [data-load='7'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-900); --color: var(--nve-ref-color-neutral-100); }
    [data-load='8'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1100); --color: var(--nve-ref-color-neutral-100); }
    [data-load='9'], [data-load='10'] { --background: var(--nve-sys-visualization-sequential-diverging-virdis-1400); --color: var(--nve-ref-color-neutral-100); }
    [data-load] { --border-right: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted); text-align: center; }
  }\`;

  gridHeader.append(...columns);
  grid.append(style, ...rows);
</script>
  `
};
