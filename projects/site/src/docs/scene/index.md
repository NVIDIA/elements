---
{
  title: 'Scene',
  description: 'WebGPU-backed declarative 3D scenes for NVIDIA Elements.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene'
}
---

## Installation

Import the root entrypoint for classes, layouts, types, and helpers without custom-element registration. Import a focused `define.js` entrypoint for one element, or use the all-elements bundle at an app host boundary.

{% example 'nve-scene-cubes' 'Default' %}

## Streaming Marker Instances

The `instances` property accepts an `ArrayBufferView`, not an `ArrayBuffer`. The byte view makes layout stride explicit and supports partial `commit` uploads.

{% example 'nve-scene-cubes' 'Streaming' %}

## Overlapping volumes

Scene geometry uses weighted blended order-independent transparency so intersecting translucent layers do not depend on document order. Cube markers support separate face and outline colors for readable volume boundaries.

{% example 'nve-scene-cubes' 'Volumes' %}

## Compose Models

{% example 'nve-scene-model' 'Default' %}

## Camera

{% example 'nve-scene-camera' 'BehaviorFollow' %}

## Picking

{% example 'nve-scene-marker' 'Interactions' %}

## Replay

{% example 'nve-scene' 'EpisodeReplay' %}
