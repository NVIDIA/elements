---
{
  title: 'Scene',
  description: 'WebGPU-backed declarative 3D scenes for NVIDIA Elements.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene'
}
---

## Installation

{% install 'nve-scene' %}

## Streaming instances

See [record buffers](/docs/scene/record-buffers/) for source construction, publication, and cache guidance.

{% example 'nve-scene-cubes' 'Streaming' %}

## Overlapping volumes

{% example 'nve-scene-cubes' 'Volumes' %}

## Compose bodies

{% example 'nve-scene-body' 'Default' %}

See [Scene Body](/docs/scene/body/) for geometry and file loading.

## Camera

Use [bounds queries and explicit camera fitting](/docs/scene/camera/#bounds-and-camera-fitting) to frame selected spatial content.

{% example 'nve-scene-camera' 'BehaviorFollow' %}

## Application replay

{% example '@nvidia-elements/scene/scene/replay.examples.json' 'EpisodeReplay' '{ "inline": false, "height": "700px" }' %}

## Readiness and failures

{% api 'nve-scene' 'property' 'ready' %}

{% api 'nve-scene' 'event' 'nve-scene-error' %}

See [coordinate frames](/docs/scene/frame/), [record buffers](/docs/scene/record-buffers/), and [interaction](/docs/scene/interaction/) for snapshot-driven integration.
