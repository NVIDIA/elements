// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LINE_VERTEX, MARKER, MarkerBuffer, POINT, PointBuffer, TRI_VERTEX } from '../dist/index.js';
import '../dist/camera/define.js';
import '../dist/cubes/define.js';
import '../dist/lines/define.js';
import '../dist/points/define.js';
import '../dist/scene/define.js';
import '../dist/triangles/define.js';

const REQUIRED_POINT_COUNT = 100_000;
const MILLION_POINT_COUNT = 1_000_000;
const MARKER_COUNT = 10_000;
const MARKER_COMMIT_COUNT = 100;
const TRIANGLE_VERTEX_COUNT = 30_000;
const LINE_VERTEX_COUNT = 600;
const navigationStart = globalThis.__webgpuTestNavigationStart ?? performance.now();
const search = new URLSearchParams(location.search);
const profileName = search.get('profile') ?? 'required';
const profile = {
  dpr: profileName === 'stress-dpr2' ? 2 : 1,
  name: profileName,
  pointCount: profileName === 'stress-million-points' ? MILLION_POINT_COUNT : REQUIRED_POINT_COUNT,
  translucent: profileName === 'stress-translucent'
};

const scene = document.createElement('nve-scene');
scene.setAttribute('aria-label', `Scene performance workload: ${profile.name}`);
const camera = document.createElement('nve-scene-camera');
camera.setAttribute('behavior', 'orbit');
camera.setAttribute('target', '[0,0,0]');
camera.setAttribute('distance', '58');
camera.setAttribute('phi', '1.08');
camera.setAttribute('theta', '0');
const points = document.createElement('nve-scene-points');
points.setAttribute('size', '2');
const markers = document.createElement('nve-scene-cubes');
const triangles = document.createElement('nve-scene-triangles');
const lines = document.createElement('nve-scene-lines');
lines.setAttribute('width-unit', 'pixel');
lines.setAttribute('topology', 'segments');
scene.append(camera, points, markers, triangles, lines);

const pointSources = [
  createPointBytes(profile.pointCount, profile.translucent ? 128 : 255, 0x1a2b3c4d),
  createPointBytes(profile.pointCount, profile.translucent ? 128 : 255, 0x5e6f7788)
];
const opaquePointSources = profile.translucent
  ? [createPointBytes(profile.pointCount, 255, 0x1a2b3c4d), createPointBytes(profile.pointCount, 255, 0x5e6f7788)]
  : pointSources;
const translucentPointSources = profile.translucent
  ? pointSources
  : [createPointBytes(profile.pointCount, 128, 0x1a2b3c4d), createPointBytes(profile.pointCount, 128, 0x5e6f7788)];
const markerSource = createMarkerSource(MARKER_COUNT, profile.translucent ? 128 : 255);
const triangleSources = {
  opaque: createTriangleBytes(TRIANGLE_VERTEX_COUNT, 255),
  translucent: createTriangleBytes(TRIANGLE_VERTEX_COUNT, 128)
};
const lineSources = {
  opaque: createLineBytes(LINE_VERTEX_COUNT, 255),
  translucent: createLineBytes(LINE_VERTEX_COUNT, 128)
};

let activePointSources = profile.translucent ? translucentPointSources : opaquePointSources;
let pointSourceIndex = 0;
let markerCommitIndex = 0;
let cameraHandle = 0;
let paused = false;
let collecting = false;
let measurementStart = 0;
let initializationReadyMs = 0;
let lastFrame;
let rejectedPickCount = 0;
const pendingUpdates = [];
const intervals = [];
const frameIntervals = [];
const pointUpdateLatency = [];
const markerCommitLatency = [];
const pickLatency = [];
const pendingPicks = new Set();
const longTasks = [];
const updateCounts = { marker: 0, pick: 0, point: 0 };

points.instances = activePointSources[0];
markers.instances = markerSource;
triangles.vertices = profile.translucent ? triangleSources.translucent : triangleSources.opaque;
lines.vertices = profile.translucent ? lineSources.translucent : lineSources.opaque;
const workloadPreparationMs = performance.now() - navigationStart;
const initializationStart = performance.now();
document.body.append(scene);

const longTaskObserver = globalThis.PerformanceObserver?.supportedEntryTypes?.includes('longtask')
  ? new PerformanceObserver(list => {
      if (!collecting) return;
      for (const entry of list.getEntries()) longTasks.push({ duration: entry.duration, startTime: entry.startTime });
    })
  : undefined;
longTaskObserver?.observe({ entryTypes: ['longtask'] });

const ready = initialize();

globalThis.__webgpuTestWorkload = {
  expectedDynamicBytesPerSecond: profile.pointCount * POINT.stride * 10 + MARKER_COMMIT_COUNT * MARKER.stride * 30,
  fanoutProbe,
  getCanvasSize: () => {
    const canvas = scene.shadowRoot?.querySelector('canvas');
    return canvas ? { height: canvas.height, width: canvas.width } : null;
  },
  getProfile: () => ({
    ...profile,
    expectedDynamicBytesPerSecond: profile.pointCount * POINT.stride * 10 + MARKER_COMMIT_COUNT * MARKER.stride * 30,
    lineVertexCount: LINE_VERTEX_COUNT,
    markerCommitCount: MARKER_COMMIT_COUNT,
    markerCommitBytes: MARKER_COMMIT_COUNT * MARKER.stride,
    markerCommitsPerSecond: 30,
    markerCount: MARKER_COUNT,
    pointStride: POINT.stride,
    pointUpdateBytes: profile.pointCount * POINT.stride,
    pointUpdatesPerSecond: 10,
    markerStride: MARKER.stride,
    triangleVertexCount: TRIANGLE_VERTEX_COUNT
  }),
  pause,
  ready,
  recoverDevice,
  reconnectLoop,
  report,
  resize,
  resume,
  setOpaque: () => setTransparency(false),
  setInteraction,
  setTranslucent: () => setTransparency(true),
  startMeasurement,
  stopMeasurement,
  teardown,
  triggerMarkerCommit: () => triggerMarkerCommit(true),
  triggerAutomaticPointer,
  triggerPointUpdate: () => triggerPointUpdate(true),
  uniformTrafficProbe
};

async function initialize() {
  await scene.ready;
  initializationReadyMs = performance.now() - initializationStart;
  startWorkload();
  return { readyDuration: initializationReadyMs };
}

function startWorkload() {
  if (intervals.length > 0) return;
  intervals.push(setInterval(() => void triggerPointUpdate(), 100));
  intervals.push(setInterval(() => void triggerMarkerCommit(), 1000 / 30));
  intervals.push(setInterval(() => void requestPick(), 100));
  cameraHandle = requestAnimationFrame(frame);
}

function frame(now) {
  const observedAt = performance.now();
  if (collecting) {
    if (lastFrame !== undefined) frameIntervals.push(now - lastFrame);
    lastFrame = now;
    while (pendingUpdates.length > 0) {
      const pending = pendingUpdates.shift();
      if (pending.kind === 'point') pointUpdateLatency.push(observedAt - pending.start);
      else markerCommitLatency.push(observedAt - pending.start);
    }
  }
  if (!paused) camera.theta = (camera.theta + 0.0025) % (Math.PI * 2);
  cameraHandle = requestAnimationFrame(frame);
}

async function triggerPointUpdate(force = false) {
  if (paused && !force) return;
  pointSourceIndex = (pointSourceIndex + 1) % activePointSources.length;
  noteUpdate('point');
  points.instances = activePointSources[pointSourceIndex];
  if (force) await waitFrames(4);
}

async function triggerMarkerCommit(force = false) {
  if (paused && !force) return;
  noteUpdate('marker');
  const start = (markerCommitIndex * MARKER_COMMIT_COUNT) % MARKER_COUNT;
  markerCommitIndex += 1;
  const bytes = markerSource.bytes;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const positionOffset = MARKER.fields.position.offset;
  for (let index = start; index < start + MARKER_COMMIT_COUNT; index += 1) {
    const offset = index * MARKER.stride + positionOffset + 8;
    view.setFloat32(offset, view.getFloat32(offset, true) + 0.0005, true);
  }
  markerSource.commit(start, MARKER_COMMIT_COUNT);
  markers.commit(start, MARKER_COMMIT_COUNT);
  if (force) await waitFrames(4);
}

function noteUpdate(kind) {
  if (!collecting) return;
  pendingUpdates.push({ kind, start: performance.now() });
  updateCounts[kind] += 1;
}

function requestPick() {
  if (paused) return;
  const rect = scene.getBoundingClientRect();
  const sequence = updateCounts.pick;
  const clientX = rect.left + ((sequence * 97 + 211) % Math.max(1, rect.width));
  const clientY = rect.top + ((sequence * 53 + 107) % Math.max(1, rect.height));
  const start = performance.now();
  const measured = collecting;
  const pick = scene
    .pick(clientX, clientY)
    .then(() => {
      if (measured) pickLatency.push(performance.now() - start);
    })
    .catch(() => {
      if (measured) rejectedPickCount += 1;
    })
    .finally(() => pendingPicks.delete(pick));
  pendingPicks.add(pick);
  if (collecting) updateCounts.pick += 1;
}

function startMeasurement() {
  frameIntervals.length = 0;
  pointUpdateLatency.length = 0;
  markerCommitLatency.length = 0;
  pickLatency.length = 0;
  pendingUpdates.length = 0;
  longTasks.length = 0;
  updateCounts.marker = 0;
  updateCounts.pick = 0;
  updateCounts.point = 0;
  rejectedPickCount = 0;
  measurementStart = performance.now();
  lastFrame = undefined;
  collecting = true;
}

async function stopMeasurement() {
  collecting = false;
  await Promise.allSettled([...pendingPicks]);
  return report();
}

function report() {
  const elapsedMs = measurementStart === 0 ? 0 : performance.now() - measurementStart;
  return {
    elapsedMs,
    expectedDynamicBytesPerSecond: globalThis.__webgpuTestWorkload.expectedDynamicBytesPerSecond,
    frameIntervals: summarize(frameIntervals, profile.name === 'required' ? 33.3 : 66.7),
    initialization: { readyMs: initializationReadyMs, workloadPreparationMs },
    longTasks: {
      available: longTaskObserver !== undefined,
      count: longTasks.length,
      maxMs: Math.max(0, ...longTasks.map(task => task.duration)),
      totalMs: longTasks.reduce((total, task) => total + task.duration, 0)
    },
    markerCommitLatency: summarize(markerCommitLatency),
    pickLatency: summarize(pickLatency),
    rejectedPickCount,
    pointUpdateLatency: summarize(pointUpdateLatency),
    updateCounts: { ...updateCounts }
  };
}

function summarize(values, longFrameThreshold) {
  const sorted = [...values].sort((left, right) => left - right);
  const missed = longFrameThreshold === undefined ? 0 : sorted.filter(value => value > longFrameThreshold).length;
  return {
    available: sorted.length > 0,
    count: sorted.length,
    missed,
    missedPercent: sorted.length === 0 ? 0 : (missed / sorted.length) * 100,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99)
  };
}

function percentile(sorted, fraction) {
  if (sorted.length === 0) return null;
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}

async function pause() {
  paused = true;
  await Promise.allSettled([...pendingPicks]);
  await waitFrames(3);
}

function resume() {
  paused = false;
}

async function setTransparency(translucent) {
  activePointSources = translucent ? translucentPointSources : opaquePointSources;
  pointSourceIndex = 0;
  points.instances = activePointSources[0];
  setMarkerAlpha(markerSource, translucent ? 128 : 255);
  markerSource.commit(0, MARKER_COUNT);
  markers.commit(0, MARKER_COUNT);
  triangles.vertices = translucent ? triangleSources.translucent : triangleSources.opaque;
  lines.vertices = translucent ? lineSources.translucent : lineSources.opaque;
  await waitFrames(5);
}

async function resize(width, height) {
  scene.style.width = `${width}px`;
  scene.style.height = `${height}px`;
  await waitFrames(5);
  return globalThis.__webgpuTestWorkload.getCanvasSize();
}

async function setInteraction(enabled) {
  points.interactive = enabled;
  await points.updateComplete;
  await waitFrames(4);
}

async function triggerAutomaticPointer() {
  const canvas = scene.shadowRoot?.querySelector('canvas');
  if (!canvas) throw new Error('The scene canvas is unavailable.');
  const rect = canvas.getBoundingClientRect();
  canvas.dispatchEvent(
    new PointerEvent('pointermove', {
      bubbles: true,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      composed: true
    })
  );
  await waitFrames(8);
}

async function fanoutProbe(count = 12_345) {
  const observer = requireObserver();
  const source = createVersionedPointSource(count);
  observer.reset();
  const probes = [createProbeScene(source), createProbeScene(source)];
  probes.forEach(probe => document.body.append(probe.scene));
  await Promise.all(probes.map(probe => probe.scene.ready));
  await waitFrames(8);
  const snapshot = observer.snapshot();
  probes.forEach(probe => probe.scene.remove());
  await waitFrames(3);
  return snapshot;
}

async function uniformTrafficProbe(count) {
  const observer = requireObserver();
  const probe = createProbeScene(createPointBytes(count, 255, count));
  document.body.append(probe.scene);
  await probe.scene.ready;
  await waitFrames(8);
  observer.reset();
  probe.camera.theta += 0.25;
  await probe.camera.updateComplete;
  await waitFrames(4);
  const snapshot = observer.snapshot();
  probe.scene.remove();
  await waitFrames(3);
  return snapshot;
}

function createProbeScene(source) {
  const probeScene = document.createElement('nve-scene');
  probeScene.style.cssText = 'position:fixed;width:96px;height:96px;left:-200px;top:0';
  const probeCamera = document.createElement('nve-scene-camera');
  probeCamera.setAttribute('behavior', 'orbit');
  probeCamera.setAttribute('distance', '10');
  const probePoints = document.createElement('nve-scene-points');
  probePoints.instances = source;
  probeScene.append(probeCamera, probePoints);
  return { camera: probeCamera, scene: probeScene };
}

async function recoverDevice() {
  const observer = requireObserver();
  const lost = new Promise(resolve => scene.addEventListener('nve-scene-error', resolve, { once: true }));
  observer.destroyLatestDevice();
  await lost;
  await scene.ready;
  await waitFrames(5);
}

async function reconnectLoop(count) {
  paused = true;
  for (let iteration = 0; iteration < count; iteration += 1) {
    scene.remove();
    await waitFrames(2);
    document.body.append(scene);
    await scene.ready;
    await waitFrames(3);
  }
}

async function teardown() {
  collecting = false;
  paused = true;
  intervals.splice(0).forEach(clearInterval);
  cancelAnimationFrame(cameraHandle);
  await Promise.allSettled([...pendingPicks]);
  scene.remove();
  longTaskObserver?.disconnect();
  await waitFrames(3);
}

function requireObserver() {
  if (!globalThis.__webgpuTestObserver) throw new Error('The external WebGPU observer is not installed.');
  return globalThis.__webgpuTestObserver;
}

function createPointBytes(count, alpha, seed) {
  const bytes = new Uint8Array(count * POINT.stride);
  const view = new DataView(bytes.buffer);
  let state = seed >>> 0;
  for (let index = 0; index < count; index += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const x = ((state & 0xffff) / 0xffff - 0.5) * 48;
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const y = ((state & 0xffff) / 0xffff - 0.5) * 28;
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const z = ((state & 0xffff) / 0xffff - 0.5) * 10;
    const offset = index * POINT.stride;
    view.setFloat32(offset, x, true);
    view.setFloat32(offset + 4, y, true);
    view.setFloat32(offset + 8, z, true);
    bytes.set([118, 185, 0, alpha], offset + POINT.fields.color.offset);
  }
  return bytes;
}

function createVersionedPointSource(count) {
  const source = new PointBuffer({ capacity: count });
  const bytes = source.bytes;
  bytes.set(createPointBytes(count, 255, 0x12345678));
  source.commit(0, count);
  return source;
}

function createMarkerSource(count, alpha) {
  const source = new MarkerBuffer({ capacity: count });
  const bytes = source.bytes;
  const view = new DataView(bytes.buffer);
  for (let index = 0; index < count; index += 1) {
    const offset = index * MARKER.stride;
    const angle = index * 0.017;
    view.setFloat32(offset, Math.cos(angle) * (8 + (index % 100) * 0.14), true);
    view.setFloat32(offset + 4, Math.sin(angle) * (8 + (index % 100) * 0.14), true);
    view.setFloat32(offset + 8, ((index % 31) - 15) * 0.12, true);
    view.setFloat32(offset + MARKER.fields.orientation.offset + 12, 1, true);
    view.setFloat32(offset + MARKER.fields.scale.offset, 0.08, true);
    view.setFloat32(offset + MARKER.fields.scale.offset + 4, 0.08, true);
    view.setFloat32(offset + MARKER.fields.scale.offset + 8, 0.08, true);
    bytes.set([90, 150, 255, alpha], offset + MARKER.fields.color.offset);
  }
  source.commit(0, count);
  return source;
}

function setMarkerAlpha(source, alpha) {
  const bytes = source.bytes;
  for (let index = 0; index < source.count; index += 1) {
    bytes[index * MARKER.stride + MARKER.fields.color.offset + 3] = alpha;
  }
}

function createTriangleBytes(count, alpha) {
  const bytes = new Uint8Array(count * TRI_VERTEX.stride);
  const view = new DataView(bytes.buffer);
  for (let index = 0; index < count; index += 1) {
    const triangle = Math.floor(index / 3);
    const vertex = index % 3;
    const x = (triangle % 100) * 0.45 - 22.5;
    const y = Math.floor(triangle / 100) * 0.45 - 22.5;
    const offset = index * TRI_VERTEX.stride;
    view.setFloat32(offset, x + (vertex === 1 ? 0.35 : 0), true);
    view.setFloat32(offset + 4, y + (vertex === 2 ? 0.35 : 0), true);
    view.setFloat32(offset + 8, -5, true);
    bytes.set([255, 140, 40, alpha], offset + TRI_VERTEX.fields.color.offset);
  }
  return bytes;
}

function createLineBytes(count, alpha) {
  const bytes = new Uint8Array(count * LINE_VERTEX.stride);
  const view = new DataView(bytes.buffer);
  for (let index = 0; index < count; index += 1) {
    const offset = index * LINE_VERTEX.stride;
    const pair = Math.floor(index / 2);
    view.setFloat32(offset, (index % 2 === 0 ? -1 : 1) * 24, true);
    view.setFloat32(offset + 4, (pair / (count / 2) - 0.5) * 28, true);
    view.setFloat32(offset + 8, 5, true);
    bytes.set([255, 255, 255, alpha], offset + LINE_VERTEX.fields.color.offset);
    view.setFloat32(offset + LINE_VERTEX.fields.normal.offset + 8, 1, true);
    view.setFloat32(offset + LINE_VERTEX.fields.width.offset, 1, true);
  }
  return bytes;
}

function waitFrames(count) {
  return new Promise(resolve => {
    const next = () => {
      if (count <= 0) resolve();
      else {
        count -= 1;
        requestAnimationFrame(next);
      }
    };
    requestAnimationFrame(next);
  });
}
