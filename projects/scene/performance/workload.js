// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  LABEL,
  LINE_VERTEX,
  LabelBuffer,
  MARKER,
  MarkerBuffer,
  POINT,
  PointBuffer,
  TRIANGLE_VERTEX,
  createLineVertexSource,
  createPointSource,
  createTriangleVertexSource
} from '../dist/index.js';
import '../dist/camera/define.js';
import '../dist/cubes/define.js';
import '../dist/frame/define.js';
import '../dist/lines/define.js';
import '../dist/mesh/define.js';
import '../dist/model/define.js';
import '../dist/labels/define.js';
import '../dist/points/define.js';
import '../dist/scene/define.js';
import '../dist/triangles/define.js';

const REQUIRED_POINT_COUNT = 100_000;
const MILLION_POINT_COUNT = 1_000_000;
const MARKER_COUNT = 10_000;
const MARKER_PUBLISH_COUNT = 100;
const TRIANGLE_VERTEX_COUNT = 30_000;
const LINE_VERTEX_COUNT = 600;
const SHADER_COVERAGE_COMPACT_MARKER_COUNT = 25_000;
const LABEL_COUNT = 10_000;
const MESH_GRID_SIZE = 128;
const PROFILE_CONFIG = {
  required: {
    dpr: 1,
    markerCount: MARKER_COUNT,
    mode: 'baseline',
    operations: ['point-replacement', 'marker-publication', 'automatic-pick'],
    pointCount: REQUIRED_POINT_COUNT
  },
  'stress-dpr2': {
    dpr: 2,
    markerCount: MARKER_COUNT,
    mode: 'baseline',
    operations: ['point-replacement', 'marker-publication', 'automatic-pick'],
    pointCount: REQUIRED_POINT_COUNT
  },
  'stress-million-points': {
    dpr: 1,
    markerCount: MARKER_COUNT,
    mode: 'baseline',
    operations: ['point-replacement', 'marker-publication', 'automatic-pick'],
    pointCount: MILLION_POINT_COUNT
  },
  'stress-translucent': {
    dpr: 1,
    markerCount: MARKER_COUNT,
    mode: 'translucent',
    operations: ['point-replacement', 'marker-publication', 'automatic-pick'],
    pointCount: REQUIRED_POINT_COUNT
  },
  'shader-coverage': {
    dpr: 1,
    markerCount: SHADER_COVERAGE_COMPACT_MARKER_COUNT,
    mode: 'shader-coverage',
    operations: ['shader-coverage-camera-motion'],
    pointCount: 1
  },
  'partitioned-storage': {
    dpr: 1,
    markerCount: MARKER_COUNT,
    mode: 'partitioned-storage',
    operations: ['partitioned-storage-update', 'partitioned-storage-pick'],
    pointCount: 1_000_000
  },
  'mesh-updates': {
    dpr: 1,
    markerCount: MARKER_COUNT,
    mode: 'mesh-updates',
    operations: ['mesh-instance-edit', 'mesh-derived-geometry-update', 'mesh-texture-replacement'],
    pointCount: 10_000
  },
  'labels-10k': {
    dpr: 1,
    markerCount: MARKER_COUNT,
    mode: 'labels-10k',
    operations: ['label-numeric-publication', 'label-text-preparation', 'label-glyph-pick'],
    pointCount: 10_000
  },
  'camera-composition': {
    dpr: 1,
    markerCount: MARKER_COUNT,
    mode: 'camera-composition',
    operations: ['camera-composition-edit'],
    pointCount: 10_000
  },
  'model-edits': {
    dpr: 1,
    markerCount: MARKER_COUNT,
    mode: 'model-edits',
    operations: ['model-declarative-edit', 'model-bulk-assignment'],
    pointCount: 10_000
  },
  'layer-tracking': {
    dpr: 1,
    markerCount: MARKER_COUNT,
    mode: 'layer-tracking',
    operations: ['layer-edit', 'layer-reinsertion'],
    pointCount: 10_000
  },
  'lazy-recovery': {
    dpr: 1,
    markerCount: 1,
    mode: 'lazy-recovery',
    operations: ['scene-reconnect'],
    pointCount: 1
  }
};
const navigationStart = globalThis.__webgpuTestNavigationStart ?? performance.now();
const search = new URLSearchParams(location.search);
const profileName = search.get('profile') ?? 'required';
const profile = { ...(PROFILE_CONFIG[profileName] ?? PROFILE_CONFIG.required), name: profileName };
profile.translucent = profile.mode === 'translucent';
const profileMarkerPublishCount = Math.min(MARKER_PUBLISH_COUNT, profile.markerCount);

const scene = document.createElement('nve-scene');
scene.setAttribute('aria-label', `Scene performance workload: ${profile.name}`);
const camera = document.createElement('nve-scene-camera');
camera.setAttribute('behavior', 'orbit');
camera.setAttribute('target', '[0,0,0]');
camera.setAttribute('distance', '58');
camera.setAttribute('polar-angle', '1.08');
camera.setAttribute('azimuth', '0');
const points = document.createElement('nve-scene-points');
points.setAttribute('size', '2');
const markers = document.createElement('nve-scene-cubes');
const triangles = document.createElement('nve-scene-triangles');
const lines = document.createElement('nve-scene-lines');
lines.setAttribute('width-unit', 'pixel');
lines.setAttribute('topology', 'segments');
scene.append(camera, points, markers, triangles, lines);
const profileLayers = {
  camera: null,
  frame: null,
  labels: null,
  mesh: null,
  model: null,
  part: null,
  trackingLayer: null
};
let labelSource = null;

if (profile.mode === 'camera-composition') {
  const frame = document.createElement('nve-scene-frame');
  frame.name = 'workload-target';
  frame.position = [0, 0, 0];
  const followCamera = document.createElement('nve-scene-camera');
  followCamera.setAttribute('behavior', 'follow');
  followCamera.setAttribute('frame', 'workload-target');
  scene.append(frame, followCamera);
  profileLayers.camera = followCamera;
  profileLayers.frame = frame;
}
if (profile.mode === 'mesh-updates' || profile.mode === 'shader-coverage') {
  const mesh = document.createElement('nve-scene-mesh');
  mesh.geometry = profile.mode === 'mesh-updates' ? createMeshGridGeometry(1) : createMeshGeometry(1);
  mesh.interactive = profile.mode === 'shader-coverage';
  scene.append(mesh);
  profileLayers.mesh = mesh;
}
if (profile.mode === 'model-edits') {
  const model = document.createElement('nve-scene-model');
  const part = document.createElement('nve-scene-part');
  model.append(part);
  scene.append(model);
  profileLayers.model = model;
  profileLayers.part = part;
}
if (profile.mode === 'labels-10k') {
  const labels = document.createElement('nve-scene-labels');
  labelSource = createLabelBuffer(LABEL_COUNT);
  labels.source = labelSource;
  labels.interactive = true;
  scene.append(labels);
  profileLayers.labels = labels;
}
if (profile.mode === 'layer-tracking') {
  for (let index = 0; index < 12; index += 1) {
    const layer = document.createElement(index % 2 === 0 ? 'nve-scene-points' : 'nve-scene-cubes');
    layer.setAttribute('aria-label', `Layer ${index}`);
    scene.append(layer);
    if (profileLayers.trackingLayer === null && layer.localName === 'nve-scene-points') {
      profileLayers.trackingLayer = layer;
    }
  }
}
if (profile.mode === 'shader-coverage') {
  const directMarkers = document.createElement('nve-scene-cubes');
  const directSource = new MarkerBuffer({ capacity: 2 });
  directSource.add({ color: [1, 1, 1, 1], outlineColor: [0, 0, 0, 1] });
  directSource.add({ color: [1, 1, 1, 0.5], outlineColor: [0, 0, 0, 0.5] });
  directMarkers.source = directSource;
  directMarkers.interactive = true;
  lines.topology = 'loop';
  lines.source = createLineBytes(4, 128);
  points.interactive = true;
  markers.interactive = true;
  scene.append(directMarkers);
}
if (profile.mode === 'partitioned-storage') {
  lines.setAttribute('topology', 'strip');
  points.interactive = true;
}

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
const markerSource = createMarkerSource(profile.markerCount, profile.translucent ? 128 : 255);
const triangleSources = {
  opaque: createTriangleBytes(TRIANGLE_VERTEX_COUNT, 255),
  translucent: createTriangleBytes(TRIANGLE_VERTEX_COUNT, 128)
};
const lineSources = {
  opaque: createLineBytes(LINE_VERTEX_COUNT, 255),
  translucent: createLineBytes(LINE_VERTEX_COUNT, 128)
};
const meshMarkerSource = profileLayers.mesh ? createMarkerSource(2, 255) : null;
if (profileLayers.mesh && meshMarkerSource) profileLayers.mesh.source = meshMarkerSource;

let activePointSources = profile.translucent ? translucentPointSources : opaquePointSources;
let pointSourceIndex = 0;
let markerPublishIndex = 0;
let meshGeometryRevision = 0;
let modelEditRevision = 0;
let profileOperationPending = false;
let profileOperationRevision = 0;
let textureImagePromise;
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
const markerPublishLatency = [];
const pickLatency = [];
const profileOperationLatency = {};
const profileOperationPendingFrames = [];
const profileOperationCounts = {};
const pendingPicks = new Set();
const longTasks = [];
const updateCounts = { marker: 0, pick: 0, point: 0 };

points.source = activePointSources[0];
markers.source = markerSource;
triangles.source = profile.translucent ? triangleSources.translucent : triangleSources.opaque;
lines.source = profile.translucent ? lineSources.translucent : lineSources.opaque;
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
const baselineUpdateTraffic =
  profile.mode === 'baseline' || profile.mode === 'translucent'
    ? {
        expectedDynamicBytesPerSecond:
          profile.pointCount * POINT.stride * 10 + profileMarkerPublishCount * MARKER.stride * 30,
        markerPublishBytes: profileMarkerPublishCount * MARKER.stride,
        markerPublishesPerSecond: 30,
        pointUpdateBytes: profile.pointCount * POINT.stride,
        pointUpdatesPerSecond: 10
      }
    : {
        expectedDynamicBytesPerSecond: null,
        markerPublishBytes: 0,
        markerPublishesPerSecond: 0,
        pointUpdateBytes: 0,
        pointUpdatesPerSecond: 0
      };

globalThis.__webgpuTestWorkload = {
  expectedDynamicBytesPerSecond: baselineUpdateTraffic.expectedDynamicBytesPerSecond,
  fanoutProbe,
  featureIdentityProbe,
  getCanvasSize: () => {
    const canvas = scene.shadowRoot?.querySelector('canvas');
    return canvas ? { height: canvas.height, width: canvas.width } : null;
  },
  getProfile: () => ({
    ...profile,
    ...baselineUpdateTraffic,
    lineVertexCount: LINE_VERTEX_COUNT,
    markerPublishCount: profileMarkerPublishCount,
    markerCount: profile.markerCount,
    pointStride: POINT.stride,
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
  runProfileProbe,
  shaderCoverageProbe,
  setOpaque: () => setTransparency(false),
  setInteraction,
  setTranslucent: () => setTransparency(true),
  startMeasurement,
  stopMeasurement,
  teardown,
  triggerMarkerPublish: () => triggerMarkerPublish(true),
  triggerAutomaticPointer,
  triggerPointUpdate: () => triggerPointUpdate(true),
  uniformTrafficProbe
};

async function initialize() {
  await scene.ready;
  if (profileLayers.mesh) await profileLayers.mesh.setTexture(await getTextureImage());
  initializationReadyMs = performance.now() - initializationStart;
  startWorkload();
  return { readyDuration: initializationReadyMs };
}

function startWorkload() {
  if (intervals.length > 0) return;
  if (profile.mode === 'baseline' || profile.mode === 'translucent') {
    intervals.push(setInterval(() => void triggerPointUpdate(), 100));
    intervals.push(setInterval(() => void triggerMarkerPublish(), 1000 / 30));
    intervals.push(setInterval(() => void requestPick(), 100));
  } else {
    const intervalMs = profile.mode === 'lazy-recovery' ? 5_000 : profile.mode === 'labels-10k' ? 1000 / 30 : 100;
    intervals.push(setInterval(() => void triggerProfileOperation(), intervalMs));
  }
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
      else markerPublishLatency.push(observedAt - pending.start);
    }
    while (profileOperationPendingFrames.length > 0) {
      const pending = profileOperationPendingFrames.shift();
      (profileOperationLatency[pending.name] ??= []).push(observedAt - pending.start);
    }
  }
  if (!paused) camera.azimuth = (camera.azimuth + 0.0025) % (Math.PI * 2);
  cameraHandle = requestAnimationFrame(frame);
}

async function triggerPointUpdate(force = false, operationName) {
  if (paused && !force) return;
  pointSourceIndex = (pointSourceIndex + 1) % activePointSources.length;
  if (operationName) noteProfileOperation(operationName);
  else noteUpdate('point');
  points.source = activePointSources[pointSourceIndex];
  if (force) await waitFrames(4);
}

async function triggerMarkerPublish(force = false, operationName) {
  if (paused && !force) return;
  if (operationName) noteProfileOperation(operationName);
  else noteUpdate('marker');
  const start = (markerPublishIndex * profileMarkerPublishCount) % profile.markerCount;
  markerPublishIndex += 1;
  const bytes = markerSource.mutableBytes;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const positionOffset = MARKER.fields.position.offset;
  for (let index = start; index < Math.min(start + profileMarkerPublishCount, profile.markerCount); index += 1) {
    const offset = index * MARKER.stride + positionOffset + 8;
    view.setFloat32(offset, view.getFloat32(offset, true) + 0.0005, true);
  }
  markers.publish({ count: profileMarkerPublishCount, start });
  if (force) await waitFrames(4);
}

function noteUpdate(kind) {
  if (!collecting) return;
  pendingUpdates.push({ kind, start: performance.now() });
  updateCounts[kind] += 1;
}

function noteProfileOperation(name) {
  if (!collecting) return;
  profileOperationPendingFrames.push({ name, start: performance.now() });
  profileOperationCounts[name] = (profileOperationCounts[name] ?? 0) + 1;
}

function requestPick(operationName, force = false) {
  if (paused && !force) return;
  const rect = scene.getBoundingClientRect();
  const sequence = updateCounts.pick;
  const clientX = rect.left + ((sequence * 97 + 211) % Math.max(1, rect.width));
  const clientY = rect.top + ((sequence * 53 + 107) % Math.max(1, rect.height));
  const start = performance.now();
  const measured = collecting;
  if (operationName) noteProfileOperation(operationName);
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

async function triggerProfileOperation() {
  if (paused || profileOperationPending) return;
  profileOperationPending = true;
  try {
    if (profile.mode === 'shader-coverage') {
      noteProfileOperation('shader-coverage-camera-motion');
      camera.azimuth = (camera.azimuth + 0.04) % (Math.PI * 2);
    } else if (profile.mode === 'partitioned-storage') {
      if (profileOperationRevision % 2 === 0) {
        triggerPartitionedStorageUpdate();
      } else {
        requestPick('partitioned-storage-pick');
      }
    } else if (profile.mode === 'mesh-updates') {
      await triggerMeshUpdate();
    } else if (profile.mode === 'labels-10k') {
      triggerLabelUpdate();
    } else if (profile.mode === 'camera-composition') {
      triggerCameraComposition();
    } else if (profile.mode === 'model-edits') {
      triggerModelEdit();
    } else if (profile.mode === 'layer-tracking') {
      triggerLayerTrackingUpdate();
    } else if (profile.mode === 'lazy-recovery') {
      await triggerLazyReconnect();
    }
    profileOperationRevision += 1;
  } finally {
    profileOperationPending = false;
  }
}

async function triggerMeshUpdate() {
  const mesh = profileLayers.mesh;
  if (!mesh || !meshMarkerSource) throw new Error('Mesh update profile did not create its mesh instance source.');
  const step = profileOperationRevision % 3;
  if (step === 0) {
    noteProfileOperation('mesh-instance-edit');
    const bytes = meshMarkerSource.mutableBytes;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const offset = MARKER.fields.position.offset + 8;
    view.setFloat32(offset, view.getFloat32(offset, true) + 0.01, true);
    mesh.publish({ count: 1, start: 0 });
    return;
  }
  if (step === 1) {
    noteProfileOperation('mesh-derived-geometry-update');
    meshGeometryRevision += 1;
    const position = mesh.geometry.positions;
    const vertex = meshGeometryRevision % (MESH_GRID_SIZE * MESH_GRID_SIZE);
    position[vertex * 3 + 2] = meshGeometryRevision % 2 === 0 ? 0 : 0.5;
    mesh.publishGeometry({ attribute: 'positions', count: 1, start: vertex });
    return;
  }
  noteProfileOperation('mesh-texture-replacement');
  await mesh.setTexture(await getTextureImage());
}

function triggerPartitionedStorageUpdate() {
  const source = lineSources.opaque;
  const count = 2;
  const start = (profileOperationRevision * count) % (LINE_VERTEX_COUNT - count);
  const view = new DataView(source.bytes.buffer, source.bytes.byteOffset, source.bytes.byteLength);
  const positionOffset = LINE_VERTEX.fields.position.offset;
  const offset = start * LINE_VERTEX.stride + positionOffset;
  noteProfileOperation('partitioned-storage-update');
  view.setFloat32(offset, view.getFloat32(offset, true) + 0.001, true);
  lines.publish({ count, start });
}

function triggerLabelUpdate() {
  const labels = profileLayers.labels;
  if (!labels || !labelSource) throw new Error('The label workload did not create its packed source.');
  noteProfileOperation('label-numeric-publication');
  const bytes = labelSource.mutableBytes;
  const records = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const phase = (profileOperationRevision % 120) * 0.0005;
  for (let index = 0; index < LABEL_COUNT; index += 1) {
    records.setFloat32(index * LABEL.stride + LABEL.fields.position.offset + 8, phase, true);
  }
  labels.publish({ activeCount: LABEL_COUNT, count: LABEL_COUNT, start: 0 });
  if (profileOperationRevision % 15 === 0) {
    noteProfileOperation('label-text-preparation');
    labelSource.at(0).text = profileOperationRevision % 30 === 0 ? 'value-000000' : 'label-000000';
  }
  if (profileOperationRevision % 15 === 0) requestPick('label-glyph-pick');
}

function triggerCameraComposition() {
  const { camera: followCamera, frame } = profileLayers;
  if (!followCamera || !frame)
    throw new Error('Camera composition profile did not create its camera and target frame.');
  noteProfileOperation('camera-composition-edit');
  camera.azimuth = (camera.azimuth + 0.04) % (Math.PI * 2);
  frame.position = [profileOperationRevision % 3, profileOperationRevision % 2, 0];
}

function triggerModelEdit() {
  const { model, part } = profileLayers;
  if (!model || !part) throw new Error('Model edit profile did not create a model part.');
  modelEditRevision += 1;
  if (modelEditRevision % 2 === 0) {
    noteProfileOperation('model-bulk-assignment');
    part.remove();
    model.parts = [{ position: [modelEditRevision % 5, 0, 0], shape: 'cube' }];
    return;
  }
  noteProfileOperation('model-declarative-edit');
  model.parts = null;
  if (!model.contains(part)) model.append(part);
  part.position = [modelEditRevision % 5, 0, 0];
}

function triggerLayerTrackingUpdate() {
  const layer = profileLayers.trackingLayer;
  if (!layer) throw new Error('Layer tracking profile did not create a stream layer.');
  if (profileOperationRevision % 2 === 0) {
    noteProfileOperation('layer-edit');
    layer.size = profileOperationRevision % 4 === 0 ? 3 : 4;
    return;
  }
  noteProfileOperation('layer-reinsertion');
  const parent = layer.parentElement;
  layer.remove();
  parent?.append(layer);
}

async function triggerLazyReconnect() {
  noteProfileOperation('scene-reconnect');
  await reconnectLoop(1);
}

function startMeasurement() {
  frameIntervals.length = 0;
  pointUpdateLatency.length = 0;
  markerPublishLatency.length = 0;
  pickLatency.length = 0;
  pendingUpdates.length = 0;
  profileOperationPendingFrames.length = 0;
  for (const name of Object.keys(profileOperationCounts)) delete profileOperationCounts[name];
  for (const name of Object.keys(profileOperationLatency)) delete profileOperationLatency[name];
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
    markerPublishLatency: summarize(markerPublishLatency),
    pickLatency: summarize(pickLatency),
    profileOperations: Object.fromEntries(
      profile.operations.map(name => [
        name,
        {
          count: profileOperationCounts[name] ?? 0,
          latency: summarize(profileOperationLatency[name] ?? [])
        }
      ])
    ),
    profileOperationEvidence: profileMeasurementEvidence(),
    rejectedPickCount,
    pointUpdateLatency: summarize(pointUpdateLatency),
    updateCounts: { ...updateCounts }
  };
}

function profileMeasurementEvidence() {
  if (profile.mode === 'partitioned-storage') {
    return {
      partitionAllocation: 'unavailable: clean timing does not install the observer or expose device limits',
      partitionBoundaryUpdate: 'unavailable: no observed multi-partition allocation was established'
    };
  }
  if (profile.mode === 'labels-10k') {
    return {
      numericUpload: '10,000 packed label records published at 30 Hz',
      textUpload: 'one text edit rebuilds the 10,000-label glyph run every 15 operations'
    };
  }
  return {};
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
  points.source = activePointSources[0];
  setMarkerAlpha(markerSource, translucent ? 128 : 255);
  markers.publish({ count: profile.markerCount, start: 0 });
  triangles.source = translucent ? triangleSources.translucent : triangleSources.opaque;
  lines.source = translucent ? lineSources.translucent : lineSources.opaque;
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

async function featureIdentityProbe() {
  const observer = requireObserver();
  const featureIds = new Uint32Array(profile.pointCount);
  featureIds.fill(1842);
  const capture = async (mutate, element) => {
    observer.reset();
    mutate();
    await element.updateComplete;
    await waitFrames(4);
    return observer.snapshot();
  };
  const baseline = await capture(() => (points.featureIds = 2710), points);
  const assigned = await capture(() => (points.featureIds = featureIds), points);
  const cleared = await capture(() => (points.featureIds = null), points);
  return { assigned, baseline, cleared };
}

async function uniformTrafficProbe(count) {
  const observer = requireObserver();
  const probe = createProbeScene(createPointBytes(count, 255, count));
  document.body.append(probe.scene);
  await probe.scene.ready;
  await waitFrames(8);
  observer.reset();
  probe.camera.azimuth += 0.25;
  await probe.camera.updateComplete;
  await waitFrames(4);
  const snapshot = observer.snapshot();
  probe.scene.remove();
  await waitFrames(3);
  return snapshot;
}

/** Runs one observer-backed structural operation for each named matrix profile. */
async function runProfileProbe() {
  if (profile.mode === 'shader-coverage') {
    return { profile: profile.name, snapshot: await shaderCoverageProbe() };
  }
  const observer = requireObserver();
  observer.reset();
  if (profile.mode === 'partitioned-storage') {
    triggerPartitionedStorageUpdate();
    requestPick('partitioned-storage-pick', true);
    await waitFrames(8);
    return {
      expectedPartialWriteBytes: 2 * LINE_VERTEX.stride,
      partitionEvidenceAvailable: false,
      profile: profile.name,
      snapshot: observer.snapshot()
    };
  }
  if (profile.mode === 'mesh-updates') {
    const mesh = profileLayers.mesh;
    if (!mesh || !meshMarkerSource) throw new Error('Mesh update profile did not create its mesh instance source.');
    const bytes = meshMarkerSource.mutableBytes;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const offset = MARKER.fields.position.offset + 8;
    view.setFloat32(offset, view.getFloat32(offset, true) + 0.01, true);
    mesh.publish({ count: 1, start: 0 });
    const position = mesh.geometry.positions;
    position[2] = position[2] === 0 ? 0.5 : 0;
    mesh.publishGeometry({ attribute: 'positions', count: 1, start: 0 });
    await mesh.setTexture(await getTextureImage());
    await waitFrames(6);
    return {
      expectedGeometryWriteBytes: [(MESH_GRID_SIZE - 1) ** 2 * 6 * 3 * Float32Array.BYTES_PER_ELEMENT],
      expectedInstanceWriteBytes: MARKER.stride,
      profile: profile.name,
      snapshot: observer.snapshot()
    };
  }
  if (profile.mode === 'labels-10k') {
    if (!profileLayers.labels || !labelSource) throw new Error('The label workload did not create its packed source.');
    triggerLabelUpdate();
    labelSource.at(0).text = 'value-000000';
    await waitFrames(8);
    return {
      expectedNumericWriteBytes: LABEL_COUNT * LABEL.stride,
      profile: profile.name,
      snapshot: observer.snapshot()
    };
  }
  if (profile.mode === 'camera-composition') {
    const { camera: followCamera, frame } = profileLayers;
    if (!followCamera || !frame)
      throw new Error('Camera composition profile did not create its camera and target frame.');
    const before = { framePosition: [...frame.position], orbitTheta: camera.azimuth };
    triggerCameraComposition();
    await Promise.all([camera.updateComplete, followCamera.updateComplete, frame.updateComplete]);
    await waitFrames(3);
    return {
      after: { framePosition: [...frame.position], orbitTheta: camera.azimuth },
      before,
      cameraCount: scene.querySelectorAll('nve-scene-camera').length,
      followFrame: followCamera.frame,
      profile: profile.name,
      snapshot: observer.snapshot()
    };
  }
  if (profile.mode === 'model-edits') {
    const { model, part } = profileLayers;
    if (!model || !part) throw new Error('Model edit profile did not create a model part.');
    model.parts = null;
    await model.updateComplete;
    if (!model.contains(part)) model.append(part);
    part.position = [1, 0, 0];
    await Promise.all([model.updateComplete, part.updateComplete]);
    await waitFrames(3);
    const declarativeChildPresent = model.contains(part);
    part.remove();
    await model.updateComplete;
    model.parts = [{ position: [2, 0, 0], shape: 'cube' }];
    await model.updateComplete;
    await waitFrames(3);
    return {
      bulkPartCount: model.parts?.length ?? 0,
      declarativeChildPresent,
      declarativeChildPresentDuringBulk: model.contains(part),
      declarativePosition: [...part.position],
      profile: profile.name,
      snapshot: observer.snapshot()
    };
  }
  if (profile.mode === 'layer-tracking') {
    const layer = profileLayers.trackingLayer;
    if (!layer) throw new Error('Layer tracking profile did not create a stream layer.');
    layer.size = 4;
    await layer.updateComplete;
    const parent = layer.parentElement;
    const wasConnected = layer.isConnected;
    layer.remove();
    parent?.append(layer);
    await layer.updateComplete;
    await waitFrames(3);
    return {
      layerCount: scene.querySelectorAll('nve-scene-points, nve-scene-cubes').length,
      profile: profile.name,
      reconnected: layer.isConnected,
      snapshot: observer.snapshot(),
      wasConnected
    };
  }
  if (profile.mode === 'lazy-recovery') {
    await reconnectLoop(1);
    await waitFrames(3);
    return {
      profile: profile.name,
      sceneConnected: scene.isConnected,
      snapshot: observer.snapshot()
    };
  }
  throw new Error(`No matrix probe is available for profile ${profile.name}.`);
}

function createLabelBuffer(count) {
  const source = new LabelBuffer({ capacity: count });
  for (let index = 0; index < count; index += 1) {
    const column = index % 100;
    const row = Math.floor(index / 100);
    source.add({
      color: [0.46, 0.73, 0, 0.9],
      position: [(column - 49.5) * 0.45, (row - 49.5) * 0.45, 0],
      scale: 12,
      text: `label-${String(index).padStart(6, '0')}`
    });
  }
  return source;
}

async function shaderCoverageProbe() {
  const observer = requireObserver();
  const probe = createProbeScene(createPointBytes(1, 255, 0x13579bdf));
  const markers = document.createElement('nve-scene-cubes');
  const compactMarkers = document.createElement('nve-scene-cubes');
  const triangles = document.createElement('nve-scene-triangles');
  const lines = document.createElement('nve-scene-lines');
  const mesh = document.createElement('nve-scene-mesh');
  const directSource = new MarkerBuffer({ capacity: 2 });
  directSource.add({ color: [1, 1, 1, 1], outlineColor: [0, 0, 0, 1] });
  directSource.add({ color: [1, 1, 1, 0.5], outlineColor: [0, 0, 0, 0.5] });
  markers.source = directSource;
  markers.interactive = true;
  compactMarkers.source = createMarkerSource(SHADER_COVERAGE_COMPACT_MARKER_COUNT, 255);
  triangles.source = createTriangleBytes(3, 255);
  lines.topology = 'loop';
  lines.source = createLineBytes(4, 128);
  mesh.interactive = true;
  mesh.geometry = {
    colors: new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]),
    positions: new Float32Array([-1, -1, 0, 1, -1, 0, 0, 1, 0]),
    uvs: new Float32Array([0, 0, 1, 0, 0.5, 1])
  };
  probe.points.interactive = true;
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 1;
  textureCanvas.height = 1;
  const texture = await createImageBitmap(textureCanvas);
  const textureCapture = await mesh.setTexture(texture);
  probe.scene.append(markers, compactMarkers, triangles, lines, mesh);
  observer.reset();
  document.body.append(probe.scene);
  await probe.scene.ready;
  await waitFrames(8);
  const canvas = probe.scene.shadowRoot?.querySelector('canvas');
  if (!canvas) throw new Error('The shader coverage scene canvas is unavailable.');
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
  const snapshot = observer.snapshot();
  probe.scene.remove();
  await waitFrames(3);
  if (textureCapture.status !== 'applied') throw new Error('The shader coverage texture capture did not apply.');
  return snapshot;
}

function createProbeScene(source) {
  const probeScene = document.createElement('nve-scene');
  probeScene.style.cssText = 'position:fixed;width:96px;height:96px;left:-200px;top:0';
  const probeCamera = document.createElement('nve-scene-camera');
  probeCamera.setAttribute('behavior', 'orbit');
  probeCamera.setAttribute('distance', '10');
  const probePoints = document.createElement('nve-scene-points');
  probePoints.source = source;
  probeScene.append(probeCamera, probePoints);
  return { camera: probeCamera, points: probePoints, scene: probeScene };
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
  const wasPaused = paused;
  paused = true;
  try {
    for (let iteration = 0; iteration < count; iteration += 1) {
      scene.remove();
      await waitFrames(2);
      document.body.append(scene);
      await scene.ready;
      await waitFrames(3);
    }
  } finally {
    paused = wasPaused;
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

function getTextureImage() {
  textureImagePromise ??= (async () => {
    const canvas = document.createElement('canvas');
    canvas.height = 1;
    canvas.width = 1;
    return createImageBitmap(canvas);
  })();
  return textureImagePromise;
}

function createMeshGeometry(alpha) {
  return {
    colors: new Float32Array([1, 1, 1, alpha, 1, 1, 1, alpha, 1, 1, 1, alpha]),
    positions: new Float32Array([-1, -1, 0, 1, -1, 0, 0, 1, 0]),
    uvs: new Float32Array([0, 0, 1, 0, 0.5, 1])
  };
}

function createMeshGridGeometry(alpha) {
  const vertexCount = MESH_GRID_SIZE * MESH_GRID_SIZE;
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const colors = new Float32Array(vertexCount * 4);
  const indices = new Uint32Array((MESH_GRID_SIZE - 1) ** 2 * 6);
  for (let vertex = 0; vertex < vertexCount; vertex += 1) {
    const column = vertex % MESH_GRID_SIZE;
    const row = Math.floor(vertex / MESH_GRID_SIZE);
    positions.set([column / 16 - 4, row / 16 - 4, 0], vertex * 3);
    uvs.set([column / (MESH_GRID_SIZE - 1), row / (MESH_GRID_SIZE - 1)], vertex * 2);
    colors.set([1, 1, 1, alpha], vertex * 4);
  }
  for (let cell = 0; cell < (MESH_GRID_SIZE - 1) ** 2; cell += 1) {
    const row = Math.floor(cell / (MESH_GRID_SIZE - 1));
    const column = cell % (MESH_GRID_SIZE - 1);
    const topLeft = row * MESH_GRID_SIZE + column;
    const bottomLeft = topLeft + MESH_GRID_SIZE;
    indices.set([topLeft, topLeft + 1, bottomLeft, topLeft + 1, bottomLeft + 1, bottomLeft], cell * 6);
  }
  return { colors, indices, positions, uvs };
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
  const source = createPointSource({ bytes, count });
  if (!source) throw new Error('Expected valid point workload data.');
  return source;
}

function createVersionedPointSource(count) {
  const source = new PointBuffer({ capacity: count });
  const generated = createPointBytes(count, 255, 0x12345678);
  const view = new DataView(generated.bytes.buffer, generated.bytes.byteOffset, generated.bytes.byteLength);
  for (let index = 0; index < count; index += 1) {
    const offset = index * POINT.stride;
    source.set(index, {
      color: [118 / 255, 185 / 255, 0, 1],
      position: [view.getFloat32(offset, true), view.getFloat32(offset + 4, true), view.getFloat32(offset + 8, true)]
    });
  }
  return source;
}

function createMarkerSource(count, alpha) {
  const source = new MarkerBuffer({ capacity: count });
  const bytes = source.mutableBytes;
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
  source.setCount(count);
  return source;
}

function setMarkerAlpha(source, alpha) {
  const bytes = source.mutableBytes;
  for (let index = 0; index < source.count; index += 1) {
    bytes[index * MARKER.stride + MARKER.fields.color.offset + 3] = alpha;
  }
}

function createTriangleBytes(count, alpha) {
  const bytes = new Uint8Array(count * TRIANGLE_VERTEX.stride);
  const view = new DataView(bytes.buffer);
  for (let index = 0; index < count; index += 1) {
    const triangle = Math.floor(index / 3);
    const vertex = index % 3;
    const x = (triangle % 100) * 0.45 - 22.5;
    const y = Math.floor(triangle / 100) * 0.45 - 22.5;
    const offset = index * TRIANGLE_VERTEX.stride;
    view.setFloat32(offset, x + (vertex === 1 ? 0.35 : 0), true);
    view.setFloat32(offset + 4, y + (vertex === 2 ? 0.35 : 0), true);
    view.setFloat32(offset + 8, -5, true);
    bytes.set([255, 140, 40, alpha], offset + TRIANGLE_VERTEX.fields.color.offset);
  }
  const source = createTriangleVertexSource({ bytes, count });
  if (!source) throw new Error('Expected valid triangle workload data.');
  return source;
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
  const source = createLineVertexSource({ bytes, count });
  if (!source) throw new Error('Expected valid line workload data.');
  return source;
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
