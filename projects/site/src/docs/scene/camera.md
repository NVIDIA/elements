---
{
  title: 'Scene Camera',
  description: 'Static optical pose cameras with explicit orbit, follow, and top behaviors for Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-camera'
}
---

## Installation

{% install 'nve-scene-camera' %}

## Camera conventions

Scene uses the REP-103 optical basis for camera-local view calculations: +X points right in the image, +Y points down in the image, and +Z points forward through the image plane. World-space Scene data continues to use +X forward, +Y left, and +Z up. See the authoritative [coordinate and frame conventions](/docs/scene/frame/#coordinate-and-unit-conventions).

Camera target positions, direct camera positions, clipping distances, and orbit distances use meters. Heading, polar angle, azimuth, and vertical field of view use radians. Every resolved camera snapshot contains a world-space optical pose and either a perspective or orthographic projection with explicit `near` and `far` clipping distances.

A pose camera accepts an XYZW world-from-camera quaternion and preserves roll. Set `frame` to compose the pose with one uniquely named frame that has a valid transform chain. Duplicate, unresolved, and invalid frame references remain inert until they recover. Built-in pointer, touch, wheel, and keyboard controls don't change an active pose camera.

## Behavior Orbit

{% example 'nve-scene-camera' 'BehaviorOrbit' %}

Set `behavior="orbit"` to add pointer, touch, wheel, and keyboard navigation around a target.

## Behavior Follow

{% example 'nve-scene-camera' 'BehaviorFollow' %}

## Behavior Top

{% example 'nve-scene-camera' 'BehaviorTop' %}
