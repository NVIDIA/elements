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

## Behavior-specific properties

Scene reports a `camera-property-inactive` warning when an application explicitly supplies a property that the selected behavior ignores. Defaults alone don't warn. HTML attributes and JavaScript property assignments both express intent, including an assignment equal to a default value.

| Behavior | Active inputs                                                                |
| -------- | ---------------------------------------------------------------------------- |
| `pose`   | Position, orientation, optional frame, projection, and clipping              |
| `orbit`  | Target, heading, distance, angles, distance limits, projection, and clipping |
| `follow` | Frame and follow mode                                                        |
| `top`    | Target, heading, altitude, orthographic extent, and clipping                 |

Numeric range failures remain separate from compatibility warnings. An invalid active value makes that camera contribution inert. An inactive but valid property doesn't disable the selected behavior.

## Behavior Orbit

{% example 'nve-scene-camera' 'BehaviorOrbit' %}

Set `behavior="orbit"` to add pointer, touch, wheel, and keyboard navigation around a target.

An orbit contribution can compose with one `follow` contribution. The follow camera supplies the moving target, while the orbit camera continues to own its distance, viewing angles, and projection.

## Behavior Follow

{% example 'nve-scene-camera' 'BehaviorFollow' %}

## Behavior Top

{% example 'nve-scene-camera' 'BehaviorTop' %}

A top camera always uses an orthographic projection. `altitude` controls the physical camera distance above its target. `frustumHeight` controls the visible vertical extent, so changing zoom doesn't move the camera.

```html
<nve-scene-camera
  behavior="top"
  target="[0,0,0]"
  altitude="80"
  frustum-height="34"
></nve-scene-camera>
```

Top cameras use `altitude` for their physical distance and `frustumHeight` for their visible orthographic extent. Configure either value independently.
