---
{
  title: 'Scene',
  description: 'WebGPU-backed declarative 3D scenes for NVIDIA Elements.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene'
}
---

Scene is a curated, high-performance visualization foundation for operational robotics and spatial-monitoring applications. Scene uses declarative Web Components for stable scene structure and packed data paths for frequently updated geometry.

## Installation

{% install 'nve-scene' %}

## Streaming marker instances

The `source` property accepts a matching record buffer or typed external source adapter. Use `publish()` to capture later source changes. See [Record Buffers](/docs/scene/record-buffers/) for marker and vertex construction, mutation, and cache guidance.

{% example 'nve-scene-cubes' 'Streaming' %}

## Overlapping volumes

Scene geometry uses weighted blended order-independent transparency so intersecting translucent layers do not depend on document order. Cube markers support separate face and outline colors for readable volume boundaries.

{% example 'nve-scene-cubes' 'Volumes' %}

## Compose models

{% example 'nve-scene-model' 'Default' %}

## Camera

{% example 'nve-scene-camera' 'BehaviorFollow' %}

## Application replay

The app owns replay state and selects the current scene snapshot. Scene renders each update without retaining a timeline.

{% example 'nve-scene' 'EpisodeReplay' '{ "inline": false, "height": "540px" }' %}

## State ownership

The application owns:

- Transport and `middleware` integration.
- Source timestamps and clocks.
- Buffering and retention.
- Interpolation and bounded extrapolation.
- Replay controls and timeline state.
- Selection of one coherent set of transforms, sensor buffers, and annotations for the current render.

Scene owns:

- Validation and normalization of the current snapshot.
- Scene-local frame composition.
- CPU staging and GPU resource management.
- Render scheduling, drawing, label projection, and picking.
- Device-loss cleanup and restoration from the latest assigned state.

Scene does not store transform history, infer synchronization between independent assignments, or reinterpret wall-clock time as render time. To make an atomic update, prepare the complete next snapshot before assigning its transforms, sensor buffers, and annotations to Scene.

## Readiness and failures

The initial `scene.ready` promise resolves after Scene can encode and submit the required valid geometry in its initialization snapshot. It doesn't wait for GPU queue completion. Empty scenes resolve normally, while invalid layers remain inert and don't keep initialization pending.

Content added after readiness initializes lazily and doesn't replace the settled promise. A required rendering failure reports one `nve-scene-error` diagnostic for its current failure episode and leaves unavailable content inert. Disconnecting rejects unsettled readiness; reconnecting and device recovery create a new cycle.

Use the focused guidance for [coordinate frames](/docs/scene/frame/), [record buffers](/docs/scene/record-buffers/), and [camera behavior](/docs/scene/camera/) when building a snapshot-driven integration.
