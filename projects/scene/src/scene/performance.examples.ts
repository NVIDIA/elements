// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/scene/camera/define.js';
import '@nvidia-elements/scene/cubes/define.js';
import '@nvidia-elements/scene/lines/define.js';
import '@nvidia-elements/scene/scene/define.js';
import '@nvidia-elements/scene/spheres/define.js';
import '@nvidia-elements/scene/triangles/define.js';

export default {
  title: 'Elements/Scene/Performance',
  component: 'nve-scene'
};

/**
 * @summary Static, animated marker loads isolate main-thread frame cadence from record generation and streaming updates. Use this diagnostic to compare opaque and translucent rendering at controlled instance counts.
 */
export const RenderLoad = {
  render: () => html`
    <section id="scene-render-load" nve-layout="column gap:sm">
      <div nve-layout="row gap:sm align:wrap">
        <nve-select layout="vertical-inline" fit-content>
          <label for="scene-render-load-count">Cubes</label>
          <select id="scene-render-load-count">
            <option value="1000">1,000</option>
            <option value="10000" selected>10,000</option>
            <option value="50000">50,000</option>
            <option value="100000">100,000</option>
          </select>
        </nve-select>
        <nve-select layout="vertical-inline" fit-content>
          <label for="scene-render-load-alpha">Surface</label>
          <select id="scene-render-load-alpha">
            <option value="255" selected>opaque</option>
            <option value="128">translucent</option>
          </select>
        </nve-select>
        <nve-button id="scene-render-load-toggle" type="button">Start</nve-button>
      </div>
      <nve-scene aria-label="static render load" style="display:block;height:420px;">
        <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="95" phi="1.1"></nve-scene-camera>
        <nve-scene-cubes></nve-scene-cubes>
      </nve-scene>
      <p nve-text="body sm muted">Frame cadence measures the page animation loop, not confirmed GPU presentation.</p>
      <output nve-text="code">paused</output>
    </section>
    <script type="module">
      import { MARKER, MarkerBuffer } from '@nvidia-elements/scene';

      const root = document.querySelector('#scene-render-load');
      const countControl = root.querySelector('#scene-render-load-count');
      const alphaControl = root.querySelector('#scene-render-load-alpha');
      const toggle = root.querySelector('#scene-render-load-toggle');
      const camera = root.querySelector('nve-scene-camera');
      const cubes = root.querySelector('nve-scene-cubes');
      const output = root.querySelector('output');
      const samples = [];
      const sampleLimit = 300;
      const positionOffset = MARKER.fields.position.offset;
      const scaleOffset = MARKER.fields.scale.offset;
      const colorOffset = MARKER.fields.color.offset;
      let animationFrame = 0;
      let lastFrame;
      let reportAt = 0;
      let running = false;
      let longTaskCount = 0;
      let longTaskDuration = 0;

      const longTaskObserver = globalThis.PerformanceObserver?.supportedEntryTypes?.includes('longtask')
        ? new PerformanceObserver(entries => {
            for (const entry of entries.getEntries()) {
              longTaskCount += 1;
              longTaskDuration += entry.duration;
            }
          })
        : undefined;
      longTaskObserver?.observe({ entryTypes: ['longtask'] });

      const percentile = (values, fraction) => {
        if (values.length === 0) return 0;
        const sorted = values.toSorted((left, right) => left - right);
        return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
      };
      const pushSample = value => {
        samples.push(value);
        if (samples.length > sampleLimit) samples.shift();
      };
      const report = () => {
        const total = samples.reduce((sum, value) => sum + value, 0);
        const cadence = total > 0 ? (samples.length * 1000) / total : 0;
        const baseline = percentile(samples, 0.1);
        const dropped = baseline > 0 ? samples.filter(value => value > baseline * 1.5).length : 0;
        output.value =
          'main-thread fps ' + cadence.toFixed(1) +
          ' · frame ms p50/p95/p99 ' + [0.5, 0.95, 0.99].map(fraction => percentile(samples, fraction).toFixed(2)).join('/') +
          ' · delayed frames ' + dropped + '/' + samples.length +
          ' · long tasks ' + longTaskCount + ' (' + longTaskDuration.toFixed(0) + ' ms) · ' +
          Number(countControl.value).toLocaleString() + ' opaque/translucent cubes ' + (alphaControl.value === '255' ? 'opaque' : 'translucent');
      };

      function rebuild() {
        const count = Number(countControl.value);
        const alpha = Number(alphaControl.value);
        const columns = Math.ceil(Math.sqrt(count));
        const spacing = 80 / columns;
        const bytes = new MarkerBuffer({ capacity: count }).bytes;
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        for (let index = 0; index < count; index += 1) {
          const offset = index * MARKER.stride;
          const column = index % columns;
          const row = Math.floor(index / columns);
          view.setFloat32(offset + positionOffset, (column - columns / 2) * spacing, true);
          view.setFloat32(offset + positionOffset + 4, (row - columns / 2) * spacing, true);
          view.setFloat32(offset + positionOffset + 8, Math.sin(index * 0.17) * 2, true);
          view.setFloat32(offset + scaleOffset, spacing * 0.72, true);
          view.setFloat32(offset + scaleOffset + 4, spacing * 0.72, true);
          view.setFloat32(offset + scaleOffset + 8, 0.5 + (index % 11) * 0.12, true);
          bytes[offset + colorOffset] = 118;
          bytes[offset + colorOffset + 1] = 185;
          bytes[offset + colorOffset + 2] = 0;
          bytes[offset + colorOffset + 3] = alpha;
        }
        cubes.instances = bytes;
        samples.length = 0;
        lastFrame = undefined;
        longTaskCount = 0;
        longTaskDuration = 0;
        report();
      }

      function frame(time) {
        if (!running || !root.isConnected) return;
        if (lastFrame !== undefined) pushSample(time - lastFrame);
        lastFrame = time;
        camera.theta = time * 0.00012;
        if (time >= reportAt) {
          report();
          reportAt = time + 500;
        }
        animationFrame = requestAnimationFrame(frame);
      }

      function stop() {
        running = false;
        cancelAnimationFrame(animationFrame);
        toggle.textContent = 'Start';
        report();
      }

      toggle.addEventListener('click', () => {
        if (running) {
          stop();
          return;
        }
        samples.length = 0;
        lastFrame = undefined;
        running = true;
        toggle.textContent = 'Pause';
        reportAt = 0;
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(frame);
      });
      countControl.addEventListener('change', rebuild);
      alphaControl.addEventListener('change', rebuild);
      rebuild();

      const removalObserver = new MutationObserver(() => {
        if (!root.isConnected) {
          stop();
          longTaskObserver?.disconnect();
          removalObserver.disconnect();
        }
      });
      removalObserver.observe(document, { childList: true, subtree: true });
    </script>
  `
};

/**
 * @summary Replacement, full-commit, and ranged-commit modes update identical packed marker data. Use this diagnostic to separate producer work from Scene ingestion and identify when small ranged commits reduce update cost.
 */
export const UpdateStrategy = {
  render: () => html`
    <section id="scene-update-strategy" nve-layout="column gap:sm">
      <div nve-layout="row gap:sm align:wrap">
        <nve-select layout="vertical-inline" fit-content>
          <label for="scene-update-strategy-mode">Update</label>
          <select id="scene-update-strategy-mode">
            <option value="replace">full replacement</option>
            <option value="full">full commit</option>
            <option value="ranged" selected>1% commit</option>
          </select>
        </nve-select>
        <nve-select layout="vertical-inline" fit-content>
          <label for="scene-update-strategy-count">Cubes</label>
          <select id="scene-update-strategy-count">
            <option value="10000">10,000</option>
            <option value="50000" selected>50,000</option>
            <option value="100000">100,000</option>
          </select>
        </nve-select>
        <nve-button id="scene-update-strategy-toggle" type="button">Start</nve-button>
      </div>
      <nve-scene aria-label="streaming update strategy" style="display:block;height:420px;">
        <nve-scene-camera behavior="orbit" target="[0,0,1]" distance="95" phi="1.1"></nve-scene-camera>
        <nve-scene-cubes></nve-scene-cubes>
      </nve-scene>
      <output nve-text="code">paused</output>
    </section>
    <script type="module">
      import { MARKER, MarkerBuffer } from '@nvidia-elements/scene';

      const root = document.querySelector('#scene-update-strategy');
      const modeControl = root.querySelector('#scene-update-strategy-mode');
      const countControl = root.querySelector('#scene-update-strategy-count');
      const toggle = root.querySelector('#scene-update-strategy-toggle');
      const cubes = root.querySelector('nve-scene-cubes');
      const output = root.querySelector('output');
      const durations = [];
      const sampleLimit = 240;
      const positionOffset = MARKER.fields.position.offset;
      const scaleOffset = MARKER.fields.scale.offset;
      const colorOffset = MARKER.fields.color.offset;
      let buffers = [];
      let active = 0;
      let animationFrame = 0;
      let nextUpdate = 0;
      let reportAt = 0;
      let rangeStart = 0;
      let running = false;
      let bytesUpdated = 0;
      let byteWindowStarted = performance.now();

      const percentile = (values, fraction) => {
        if (values.length === 0) return 0;
        const sorted = values.toSorted((left, right) => left - right);
        return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
      };
      const pushDuration = value => {
        durations.push(value);
        if (durations.length > sampleLimit) durations.shift();
      };

      function initialize(bytes, count) {
        const columns = Math.ceil(Math.sqrt(count));
        const spacing = 80 / columns;
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        for (let index = 0; index < count; index += 1) {
          const offset = index * MARKER.stride;
          const column = index % columns;
          const row = Math.floor(index / columns);
          view.setFloat32(offset + positionOffset, (column - columns / 2) * spacing, true);
          view.setFloat32(offset + positionOffset + 4, (row - columns / 2) * spacing, true);
          view.setFloat32(offset + positionOffset + 8, 0.5, true);
          view.setFloat32(offset + scaleOffset, spacing * 0.7, true);
          view.setFloat32(offset + scaleOffset + 4, spacing * 0.7, true);
          view.setFloat32(offset + scaleOffset + 8, 1, true);
          view.setUint32(offset + colorOffset, 0xff00b976, true);
        }
      }

      function mutate(bytes, start, count, tick) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        for (let index = start; index < start + count; index += 1) {
          const offset = index * MARKER.stride;
          const height = 0.5 + (Math.sin(index * 0.13 + tick * 0.2) + 1) * 1.5;
          view.setFloat32(offset + positionOffset + 8, height / 2, true);
          view.setFloat32(offset + scaleOffset + 8, height, true);
        }
      }

      function rebuild() {
        stop();
        const count = Number(countControl.value);
        buffers = [new MarkerBuffer({ capacity: count }).bytes, new MarkerBuffer({ capacity: count }).bytes];
        for (const bytes of buffers) initialize(bytes, count);
        active = 0;
        rangeStart = 0;
        cubes.instances = buffers[0];
        resetMetrics();
        report(performance.now());
      }

      function update(time) {
        const count = Number(countControl.value);
        const mode = modeControl.value;
        const updateCount = mode === 'ranged' ? Math.max(1, Math.floor(count / 100)) : count;
        const started = performance.now();
        if (mode === 'replace') {
          active = active === 0 ? 1 : 0;
          mutate(buffers[active], 0, count, time * 0.03);
          cubes.instances = buffers[active];
        } else {
          const source = buffers[0];
          const start = mode === 'ranged' ? rangeStart : 0;
          mutate(source, start, updateCount, time * 0.03);
          cubes.commit(start, updateCount);
          rangeStart = (start + updateCount) % count;
        }
        pushDuration(performance.now() - started);
        bytesUpdated += updateCount * MARKER.stride;
      }

      function report(time) {
        const elapsed = Math.max(1, time - byteWindowStarted);
        const mibPerSecond = (bytesUpdated * 1000) / elapsed / 1048576;
        output.value =
          modeControl.selectedOptions[0].textContent + ' · update ms p50/p95/p99 ' +
          [0.5, 0.95, 0.99].map(fraction => percentile(durations, fraction).toFixed(3)).join('/') +
          ' · producer bytes ' + mibPerSecond.toFixed(1) + ' MiB/s · ' +
          Number(countControl.value).toLocaleString() + ' cubes · ' + (running ? 'running' : 'paused');
        bytesUpdated = 0;
        byteWindowStarted = time;
      }

      function resetMetrics() {
        durations.length = 0;
        bytesUpdated = 0;
        byteWindowStarted = performance.now();
      }

      function frame(time) {
        if (!running || !root.isConnected) return;
        if (time >= nextUpdate) {
          update(time);
          nextUpdate = time + 33;
        }
        if (time >= reportAt) {
          report(time);
          reportAt = time + 500;
        }
        animationFrame = requestAnimationFrame(frame);
      }

      function stop() {
        running = false;
        cancelAnimationFrame(animationFrame);
        toggle.textContent = 'Start';
      }

      toggle.addEventListener('click', () => {
        if (running) {
          stop();
          report(performance.now());
          return;
        }
        resetMetrics();
        running = true;
        toggle.textContent = 'Pause';
        nextUpdate = 0;
        reportAt = 0;
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(frame);
      });
      modeControl.addEventListener('change', rebuild);
      countControl.addEventListener('change', rebuild);
      rebuild();

      const removalObserver = new MutationObserver(() => {
        if (!root.isConnected) {
          stop();
          removalObserver.disconnect();
        }
      });
      removalObserver.observe(document, { childList: true, subtree: true });
    </script>
  `
};

/**
 * @summary One, four, or nine Scene viewports reproduce a deterministic mixed-layer replacement workload. Use this diagnostic to study how scene count, layer fan-out, viewport pixels, and full-source ingestion scale together.
 */
export const ViewportScaling = {
  render: () => html`
    <section id="scene-viewport-scaling" nve-layout="column gap:sm">
      <div nve-layout="row gap:sm align:wrap">
        <nve-select layout="vertical-inline" fit-content>
          <label for="scene-viewport-scaling-count">Scenes</label>
          <select id="scene-viewport-scaling-count">
            <option value="1" selected>1</option>
            <option value="4">4</option>
            <option value="9">9</option>
          </select>
        </nve-select>
        <nve-button id="scene-viewport-scaling-toggle" type="button">Start</nve-button>
      </div>
      <div data-scenes style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;"></div>
      <p nve-text="body sm muted" data-config></p>
      <output nve-text="code">paused</output>
    </section>
    <script type="module">
      import { LINE_VERTEX, MARKER, TRI_VERTEX, LineVertexBuffer, MarkerBuffer, TriangleVertexBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/cubes/define.js';
      import '@nvidia-elements/scene/lines/define.js';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/spheres/define.js';
      import '@nvidia-elements/scene/triangles/define.js';

      const root = document.querySelector('#scene-viewport-scaling');
      const scenesContainer = root.querySelector('[data-scenes]');
      const countControl = root.querySelector('#scene-viewport-scaling-count');
      const toggle = root.querySelector('#scene-viewport-scaling-toggle');
      const configOutput = root.querySelector('[data-config]');
      const metricsOutput = root.querySelector('output');
      const seed = 90173;
      const sampleLimit = 240;
      const workloads = {
        lines: { cadence: 50, count: 600, stride: LINE_VERTEX.stride, buffers: [], active: 0, layers: [], tick: 0, next: 0 },
        triangles: { cadence: 50, count: 30000, stride: TRI_VERTEX.stride, buffers: [], active: 0, layers: [], tick: 0, next: 0 },
        cubes: { cadence: 33, count: 5000, stride: MARKER.stride, buffers: [], active: 0, layers: [], tick: 0, next: 0 },
        spheres: { cadence: 33, count: 450, stride: MARKER.stride, buffers: [], active: 0, layers: [], tick: 0, next: 0 }
      };
      const frameIntervals = [];
      const updateDurations = [];
      const touches = [];
      let animationFrame = 0;
      let lastFrame;
      let reportAt = 0;
      let running = false;
      let longTasks = 0;

      const longTaskObserver = globalThis.PerformanceObserver?.supportedEntryTypes?.includes('longtask')
        ? new PerformanceObserver(entries => (longTasks += entries.getEntries().length))
        : undefined;
      longTaskObserver?.observe({ entryTypes: ['longtask'] });

      const pushSample = (samples, value) => {
        samples.push(value);
        if (samples.length > sampleLimit) samples.shift();
      };
      const percentile = (samples, fraction) => {
        if (samples.length === 0) return 0;
        const sorted = samples.toSorted((left, right) => left - right);
        return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
      };
      const summary = samples => [0.5, 0.95, 0.99].map(fraction => percentile(samples, fraction).toFixed(2)).join('/');
      const hash = value => {
        let next = (value + seed) >>> 0;
        next = Math.imul(next ^ (next >>> 16), 2246822507);
        next = Math.imul(next ^ (next >>> 13), 3266489909);
        return ((next ^ (next >>> 16)) >>> 0) / 4294967296;
      };

      function sourcesFor(index) {
        const sources = [];
        if (index < 6) sources.push('lines');
        if (index >= 3) sources.push('triangles');
        if (index % 3 === 1) sources.push('cubes');
        if (index % 3 === 2 || index === 4) sources.push('spheres');
        return sources;
      }

      function createScene(index) {
        const scene = document.createElement('nve-scene');
        scene.setAttribute('aria-label', 'Performance scene ' + (index + 1));
        scene.style.cssText = 'display:block;min-width:0;height:220px;';
        const camera = document.createElement('nve-scene-camera');
        camera.setAttribute('behavior', 'orbit');
        camera.setAttribute('target', '[0,0,5]');
        camera.setAttribute('distance', '115');
        camera.setAttribute('phi', '1.1');
        scene.append(camera);
        for (const source of sourcesFor(index)) {
          const layer = document.createElement('nve-scene-' + source);
          if (source === 'lines') {
            layer.setAttribute('topology', 'segments');
            layer.setAttribute('width-unit', 'pixel');
          }
          workloads[source].layers.push(layer);
          scene.append(layer);
        }
        return scene;
      }

      function fillLines(bytes, tick) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const positionOffset = LINE_VERTEX.fields.position.offset;
        const colorOffset = LINE_VERTEX.fields.color.offset;
        for (let index = 0; index < workloads.lines.count; index += 1) {
          const offset = index * LINE_VERTEX.stride;
          const item = Math.floor(index / 2);
          const endpoint = index % 2;
          const x = hash(item * 7 + tick * 101) * 100 - 50 + endpoint * 0.2;
          const y = hash(item * 11 + tick * 103) * 100 - 50 + endpoint * 0.2;
          view.setFloat32(offset + positionOffset, x, true);
          view.setFloat32(offset + positionOffset + 4, y, true);
          view.setFloat32(offset + positionOffset + 8, endpoint - 0.5, true);
          bytes[offset + colorOffset] = 117;
          bytes[offset + colorOffset + 1] = 184;
          bytes[offset + colorOffset + 2] = 0;
          bytes[offset + colorOffset + 3] = 255;
        }
      }

      function fillTriangles(bytes, tick) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const positionOffset = TRI_VERTEX.fields.position.offset;
        const colorOffset = TRI_VERTEX.fields.color.offset;
        for (let index = 0; index < workloads.triangles.count; index += 1) {
          const offset = index * TRI_VERTEX.stride;
          const item = Math.floor(index / 3);
          const vertex = index % 3;
          const x = hash(item * 13 + tick * 107) * 100 - 50 + (vertex === 1 ? 0.5 : vertex === 2 ? -0.5 : 0);
          const y = hash(item * 17 + tick * 109) * 100 - 50 + (vertex === 0 ? 0 : 0.6);
          view.setFloat32(offset + positionOffset, x, true);
          view.setFloat32(offset + positionOffset + 4, y, true);
          view.setFloat32(offset + positionOffset + 8, vertex === 0 ? hash(item + tick) * 0.25 : 0, true);
          bytes[offset + colorOffset] = 38;
          bytes[offset + colorOffset + 1] = 173;
          bytes[offset + colorOffset + 2] = 242;
          bytes[offset + colorOffset + 3] = 255;
        }
      }

      function fillMarkers(bytes, tick, kind) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const positionOffset = MARKER.fields.position.offset;
        const scaleOffset = MARKER.fields.scale.offset;
        const colorOffset = MARKER.fields.color.offset;
        const count = workloads[kind].count;
        for (let index = 0; index < count; index += 1) {
          const size = kind === 'spheres' ? 0.25 + hash(index * 19 + tick * 113) * 2 : 0.75;
          const offset = index * MARKER.stride;
          view.setFloat32(offset + positionOffset, hash(index * 23 + tick * 127) * 80 - 40, true);
          view.setFloat32(offset + positionOffset + 4, hash(index * 29 + tick * 131) * 80 - 40, true);
          view.setFloat32(offset + positionOffset + 8, hash(index * 31 + tick * 137) * 20, true);
          view.setFloat32(offset + scaleOffset, kind === 'spheres' ? size : 0.75, true);
          view.setFloat32(offset + scaleOffset + 4, kind === 'spheres' ? size : 0.25 + hash(index + tick) * 0.5, true);
          view.setFloat32(offset + scaleOffset + 8, kind === 'spheres' ? size : 0.5, true);
          bytes[offset + colorOffset] = 230;
          bytes[offset + colorOffset + 1] = kind === 'cubes' ? 89 : 179;
          bytes[offset + colorOffset + 2] = 51;
          bytes[offset + colorOffset + 3] = hash(index * 37 + tick) < 0.5 ? 128 : 255;
        }
      }

      function createBuffer(name) {
        if (name === 'lines') return new LineVertexBuffer({ capacity: workloads[name].count });
        if (name === 'triangles') return new TriangleVertexBuffer({ capacity: workloads[name].count });
        return new MarkerBuffer({ capacity: workloads[name].count });
      }

      function fillWorkload(name, buffer, tick) {
        const bytes = buffer.bytes;
        if (name === 'lines') fillLines(bytes, tick);
        else if (name === 'triangles') fillTriangles(bytes, tick);
        else fillMarkers(bytes, tick, name);
        buffer.commit();
      }

      function createBuffers(name) {
        const workload = workloads[name];
        if (workload.layers.length === 0) {
          workload.buffers = [];
          return;
        }
        workload.buffers = [createBuffer(name), createBuffer(name)];
        for (const buffer of workload.buffers) fillWorkload(name, buffer, 0);
        workload.active = 0;
        workload.tick = 0;
        for (const layer of workload.layers) {
          if (name === 'lines' || name === 'triangles') layer.vertices = workload.buffers[0];
          else layer.instances = workload.buffers[0];
        }
      }

      function updateWorkload(name, time) {
        const workload = workloads[name];
        const started = performance.now();
        workload.active = workload.active === 0 ? 1 : 0;
        workload.tick += 1;
        const buffer = workload.buffers[workload.active];
        fillWorkload(name, buffer, workload.tick);
        for (const layer of workload.layers) {
          if (name === 'lines' || name === 'triangles') layer.vertices = buffer;
          else layer.instances = buffer;
        }
        pushSample(updateDurations, performance.now() - started);
        touches.push([time, workload.count * workload.layers.length]);
      }

      function rebuild() {
        stop();
        for (const workload of Object.values(workloads)) workload.layers = [];
        scenesContainer.replaceChildren(...Array.from({ length: Number(countControl.value) }, (_, index) => createScene(index)));
        for (const name of Object.keys(workloads)) createBuffers(name);
        resetMetrics();
        report(performance.now());
      }

      function report(time) {
        while (touches[0]?.[0] < time - 1000) touches.shift();
        const totalInterval = frameIntervals.reduce((total, value) => total + value, 0);
        const cadence = totalInterval > 0 ? (frameIntervals.length * 1000) / totalInterval : 0;
        const firstScene = scenesContainer.querySelector('nve-scene');
        const viewport = Math.round(firstScene?.clientWidth ?? 0) + 'x' + Math.round(firstScene?.clientHeight ?? 0) + ' @' + devicePixelRatio + 'x each';
        const ownedBytes = Object.values(workloads).reduce((total, workload) => total + workload.count * workload.stride * workload.layers.length, 0);
        configOutput.textContent =
          'seed ' + seed + ' · viewport ' + viewport + ' · ' + countControl.value + ' scenes · versioned full replacement · estimated staging ' +
          (ownedBytes / 1048576).toFixed(2) + ' MiB · ' + (running ? 'running' : 'paused');
        metricsOutput.value =
          'main-thread fps ' + cadence.toFixed(1) + ' · frame ms p50/p95/p99 ' + summary(frameIntervals) +
          ' · update ms p50/p95/p99 ' + summary(updateDurations) + ' · records touched/s ' +
          touches.reduce((total, entry) => total + entry[1], 0).toLocaleString() + ' · long tasks ' + longTasks;
      }

      function resetMetrics() {
        frameIntervals.length = 0;
        updateDurations.length = 0;
        touches.length = 0;
        lastFrame = undefined;
        longTasks = 0;
        for (const workload of Object.values(workloads)) workload.next = 0;
      }

      function stop() {
        running = false;
        cancelAnimationFrame(animationFrame);
        toggle.textContent = 'Start';
      }

      function frame(time) {
        if (!running || !root.isConnected) return;
        if (lastFrame !== undefined) pushSample(frameIntervals, time - lastFrame);
        lastFrame = time;
        for (const [name, workload] of Object.entries(workloads)) {
          if (workload.layers.length > 0 && time >= workload.next) {
            updateWorkload(name, time);
            workload.next = time + workload.cadence;
          }
        }
        if (time >= reportAt) {
          report(time);
          reportAt = time + 500;
        }
        animationFrame = requestAnimationFrame(frame);
      }

      toggle.addEventListener('click', () => {
        if (running) {
          stop();
          report(performance.now());
          return;
        }
        resetMetrics();
        running = true;
        toggle.textContent = 'Pause';
        reportAt = 0;
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(frame);
      });
      countControl.addEventListener('change', rebuild);
      rebuild();

      const removalObserver = new MutationObserver(() => {
        if (!root.isConnected) {
          stop();
          longTaskObserver?.disconnect();
          removalObserver.disconnect();
        }
      });
      removalObserver.observe(document, { childList: true, subtree: true });
    </script>
  `
};

/**
 * @summary Compare raw and versioned sources under controlled scene and instance counts. Use this diagnostic to measure the CPU and GPU memory saved when compatible layers share an immutable prepared snapshot.
 */
export const MemoryPressure = {
  render: () => html`
    <section id="scene-memory-pressure" nve-layout="column gap:sm">
      <div nve-layout="row gap:sm align:wrap">
        <nve-select layout="vertical-inline" fit-content>
          <label for="scene-memory-pressure-scenes">Scenes</label>
          <select id="scene-memory-pressure-scenes">
            <option value="1" selected>1</option>
            <option value="4">4</option>
            <option value="9">9</option>
          </select>
        </nve-select>
        <nve-select layout="vertical-inline" fit-content>
          <label for="scene-memory-pressure-count">Cubes per scene</label>
          <select id="scene-memory-pressure-count">
            <option value="10000" selected>10,000</option>
            <option value="50000">50,000</option>
            <option value="100000">100,000</option>
          </select>
        </nve-select>
        <nve-select layout="vertical-inline" fit-content>
          <label for="scene-memory-pressure-source">Source</label>
          <select id="scene-memory-pressure-source">
            <option value="versioned" selected>Versioned buffer</option>
            <option value="raw">Raw bytes</option>
          </select>
        </nve-select>
        <nve-button id="scene-memory-pressure-allocate" type="button">Allocate</nve-button>
        <nve-button id="scene-memory-pressure-release" type="button" container="flat">Release</nve-button>
      </div>
      <div data-scenes style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;"></div>
      <output nve-text="code" aria-live="polite">No pressure workload allocated.</output>
    </section>
    <script type="module">
      import { MARKER, MarkerBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/cubes/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const root = document.querySelector('#scene-memory-pressure');
      const sceneControl = root.querySelector('#scene-memory-pressure-scenes');
      const countControl = root.querySelector('#scene-memory-pressure-count');
      const sourceControl = root.querySelector('#scene-memory-pressure-source');
      const allocateButton = root.querySelector('#scene-memory-pressure-allocate');
      const releaseButton = root.querySelector('#scene-memory-pressure-release');
      const scenesContainer = root.querySelector('[data-scenes]');
      const output = root.querySelector('output');
      let producer;

      const readPageMemory = async () => {
        if (typeof performance.measureUserAgentSpecificMemory !== 'function') return undefined;
        try {
          const result = await performance.measureUserAgentSpecificMemory();
          return result.bytes;
        } catch {
          return undefined;
        }
      };

      async function allocate() {
        const sceneCount = Number(sceneControl.value);
        const recordCount = Number(countControl.value);
        const sourceMode = sourceControl.value;
        const markerBuffer = new MarkerBuffer({ capacity: recordCount });
        const bytes = markerBuffer.bytes;
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const positionOffset = MARKER.fields.position.offset;
        const colorOffset = MARKER.fields.color.offset;
        for (let index = 0; index < recordCount; index += 1) {
          const offset = index * MARKER.stride;
          view.setFloat32(offset + positionOffset, index % 500, true);
          view.setFloat32(offset + positionOffset + 4, Math.floor(index / 500), true);
          bytes[offset + colorOffset] = 118;
          bytes[offset + colorOffset + 1] = 185;
          bytes[offset + colorOffset + 2] = 0;
          bytes[offset + colorOffset + 3] = 255;
        }
        markerBuffer.commit();
        producer = sourceMode === 'versioned' ? markerBuffer : bytes;
        const scenes = Array.from({ length: sceneCount }, (_, index) => {
          const scene = document.createElement('nve-scene');
          scene.setAttribute('aria-label', 'Memory pressure scene ' + (index + 1));
          scene.style.cssText = 'display:block;min-width:0;height:220px;';
          const camera = document.createElement('nve-scene-camera');
          camera.setAttribute('behavior', 'orbit');
          camera.setAttribute('target', '[250,100,0]');
          camera.setAttribute('distance', '600');
          camera.setAttribute('max-distance', '800');
          const cubes = document.createElement('nve-scene-cubes');
          cubes.instances = producer;
          scene.append(camera, cubes);
          return scene;
        });
        scenesContainer.replaceChildren(...scenes);
        const sourceBytes = bytes.byteLength;
        const sharedCopies = sourceMode === 'versioned' ? 1 : sceneCount;
        const sceneOwnedBytes = sourceBytes * sharedCopies;
        const gpuBytes = sourceBytes * sharedCopies;
        const pageBytes = await readPageMemory();
        output.value =
          (sourceMode === 'versioned' ? 'versioned prepared source' : 'raw byte source') +
          ' · producer ' + (sourceBytes / 1048576).toFixed(2) + ' MiB · estimated Scene staging ' +
          (sceneOwnedBytes / 1048576).toFixed(2) + ' MiB · estimated GPU instances ' +
          (gpuBytes / 1048576).toFixed(2) + ' MiB · known total ' +
          ((sourceBytes + sceneOwnedBytes + gpuBytes) / 1048576).toFixed(2) + ' MiB' +
          (pageBytes === undefined ? ' · page memory API unavailable' : ' · page memory ' + (pageBytes / 1048576).toFixed(1) + ' MiB');
      }

      async function release() {
        scenesContainer.replaceChildren();
        producer = undefined;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const pageBytes = await readPageMemory();
        output.value =
          'Pressure workload released; collection is nondeterministic' +
          (pageBytes === undefined ? ' and the page memory API is unavailable.' : ' · page memory ' + (pageBytes / 1048576).toFixed(1) + ' MiB');
      }

      allocateButton.addEventListener('click', allocate);
      releaseButton.addEventListener('click', release);

      const removalObserver = new MutationObserver(() => {
        if (!root.isConnected) {
          scenesContainer.replaceChildren();
          producer = undefined;
          removalObserver.disconnect();
        }
      });
      removalObserver.observe(document, { childList: true, subtree: true });
    </script>
  `
};

/**
 * @summary Repeated scene creation, rendering, and disconnection probes whether lifecycle memory returns toward a stable baseline. Use this diagnostic with browser memory tooling; collection and finalization counts are informative rather than pass/fail results.
 */
export const LifecycleChurn = {
  render: () => html`
    <section id="scene-lifecycle-churn" nve-layout="column gap:sm">
      <div nve-layout="row gap:sm align:wrap">
        <nve-select layout="vertical-inline" fit-content>
          <label for="scene-lifecycle-churn-cycles">Cycles</label>
          <select id="scene-lifecycle-churn-cycles">
            <option value="10" selected>10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </nve-select>
        <nve-select layout="vertical-inline" fit-content>
          <label for="scene-lifecycle-churn-count">Cubes</label>
          <select id="scene-lifecycle-churn-count">
            <option value="1000" selected>1,000</option>
            <option value="10000">10,000</option>
          </select>
        </nve-select>
        <nve-button id="scene-lifecycle-churn-run" type="button">Run</nve-button>
        <nve-button id="scene-lifecycle-churn-stop" type="button" container="flat">Stop</nve-button>
      </div>
      <div data-scene></div>
      <output nve-text="code" aria-live="polite">ready</output>
    </section>
    <script type="module">
      import { MARKER, MarkerBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/cubes/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const root = document.querySelector('#scene-lifecycle-churn');
      const cyclesControl = root.querySelector('#scene-lifecycle-churn-cycles');
      const countControl = root.querySelector('#scene-lifecycle-churn-count');
      const runButton = root.querySelector('#scene-lifecycle-churn-run');
      const stopButton = root.querySelector('#scene-lifecycle-churn-stop');
      const sceneContainer = root.querySelector('[data-scene]');
      const output = root.querySelector('output');
      let generation = 0;
      let finalized = 0;
      const registry = typeof FinalizationRegistry === 'function' ? new FinalizationRegistry(() => (finalized += 1)) : undefined;

      const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
      const readPageMemory = async () => {
        if (typeof performance.measureUserAgentSpecificMemory !== 'function') return undefined;
        try {
          const result = await performance.measureUserAgentSpecificMemory();
          return result.bytes;
        } catch {
          return undefined;
        }
      };

      function createSource(count) {
        const bytes = new MarkerBuffer({ capacity: count }).bytes;
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const positionOffset = MARKER.fields.position.offset;
        const colorOffset = MARKER.fields.color.offset;
        for (let index = 0; index < count; index += 1) {
          const offset = index * MARKER.stride;
          view.setFloat32(offset + positionOffset, index % 100, true);
          view.setFloat32(offset + positionOffset + 4, Math.floor(index / 100), true);
          bytes[offset + colorOffset] = 118;
          bytes[offset + colorOffset + 1] = 185;
          bytes[offset + colorOffset + 2] = 0;
          bytes[offset + colorOffset + 3] = 255;
        }
        return bytes;
      }

      async function run() {
        const token = ++generation;
        const cycles = Number(cyclesControl.value);
        const source = createSource(Number(countControl.value));
        const before = await readPageMemory();
        finalized = 0;
        runButton.disabled = true;
        for (let cycle = 0; cycle < cycles && token === generation && root.isConnected; cycle += 1) {
          const scene = document.createElement('nve-scene');
          scene.setAttribute('aria-label', 'Lifecycle probe scene');
          scene.style.cssText = 'display:block;height:280px;';
          const camera = document.createElement('nve-scene-camera');
          camera.setAttribute('behavior', 'orbit');
          camera.setAttribute('target', '[50,50,0]');
          camera.setAttribute('distance', '180');
          const cubes = document.createElement('nve-scene-cubes');
          cubes.instances = source;
          scene.append(camera, cubes);
          registry?.register(scene, cycle);
          sceneContainer.replaceChildren(scene);
          await Promise.race([scene.ready.catch(() => undefined), new Promise(resolve => setTimeout(resolve, 1000))]);
          await nextFrame();
          scene.remove();
          await nextFrame();
          output.value = 'cycle ' + (cycle + 1) + '/' + cycles + ' · finalized when observed ' + finalized;
        }
        sceneContainer.replaceChildren();
        await nextFrame();
        await nextFrame();
        const after = await readPageMemory();
        if (token === generation) {
          const memorySummary =
            before === undefined || after === undefined
              ? 'page memory API unavailable'
              : 'page memory delta ' + ((after - before) / 1048576).toFixed(1) + ' MiB';
          output.value = 'complete · finalized when observed ' + finalized + '/' + cycles + ' · ' + memorySummary + ' · use a heap snapshot for leak assertions';
          runButton.disabled = false;
        }
      }

      function stop() {
        generation += 1;
        sceneContainer.replaceChildren();
        runButton.disabled = false;
        output.value = 'stopped';
      }

      runButton.addEventListener('click', run);
      stopButton.addEventListener('click', stop);

      const removalObserver = new MutationObserver(() => {
        if (!root.isConnected) {
          stop();
          removalObserver.disconnect();
        }
      });
      removalObserver.observe(document, { childList: true, subtree: true });
    </script>
  `
};
