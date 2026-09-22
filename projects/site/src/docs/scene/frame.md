---
{
  title: 'Scene Frame',
  description: 'Named, nested coordinate frames for Scene data.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-frame'
}
---

## Installation

{% install 'nve-scene-frame' %}

## Coordinate and unit conventions

Scene uses a right-handed, REP-103-aligned world coordinate system:

- +X points forward, +Y points left, and +Z points up.
- Linear values use meters. Angular values use radians.
- Positive rotation is counterclockwise when viewed along the positive axis toward the origin.
- Quaternions use XYZW component order. Scene normalizes finite, nonzero quaternions when it ingests them and rejects zero-length values or values that aren't finite.
- Public matrices are column-major `Float32Array` values. Nested frames compose as `world = parent × local`.

These conventions apply to frames, markers, meshes, models, labels, picking results, camera targets, and internal layer prototypes unless an API documents a specialized local basis. The [camera optical basis](/docs/scene/camera/#optical-local-basis) uses image-oriented axes. See [direct byte writes](/docs/scene/record-buffers/#direct-byte-writes) for the packed record descriptors, field offsets, and strides that carry frame-local values.

Mesh front faces use counterclockwise triangle winding and outward-facing normals. Scene passes UV coordinates through unchanged. It uploads an `ImageBitmap` without vertical flipping, so the texture origin follows the browser image that the app provides.

## Current poses

Frames are rigid and never include scale. Each frame stores one current translation and orientation snapshot. A frame without an authored pose is a valid identity frame. Scene composes frame and camera poses with double-precision CPU values before it converts render values for the GPU. `pose` returns a defensive copy of the current effective pose, and `getWorldMatrix()` returns a compatible column-major `Float32Array`, so it can round small offsets at large world origins.

Use `setPose()` for live application updates. A valid call captures a complete pose synchronously and keeps explicit authority until `setPose(null)` releases it.

```ts
import type { ScenePose } from '@nvidia-elements/scene';

const pose: ScenePose = {
  position: [2, 3, 0],
  orientation: [0, 0, 0, 1]
};

robotFrame.setPose(pose);
const currentPose = robotFrame.pose;
const worldMatrix = robotFrame.getWorldMatrix();
```

While explicit authority is active, declarative `position` and `orientation` changes update fallback inputs without changing the effective pose. Release resolves the latest fallback values immediately, even when a Lit update is pending. Missing position defaults to zero, missing orientation defaults to identity, and two missing values resolve to an identity frame.

```js
robotFrame.position = [1, 0, 0];
robotFrame.setPose({ position: [4, 0, 0], orientation: [0, 0, 0, 1] });

robotFrame.position = [2, 0, 0]; // Updates the fallback only.
robotFrame.setPose(null); // The effective position is now [2, 0, 0].
```

Invalid `setPose()` input doesn't throw. It establishes invalid explicit authority, reports `frame-transform`, and suppresses the frame and its descendants. A valid call recovers it. Releasing to invalid fallback input keeps the frame inert.

## Convert points

`getWorldPoint()` converts a frame-local point through the current valid ancestor chain. `getLocalPoint()` performs the inverse conversion from Scene world coordinates.

```js
const sensorPoint = [1, 0, 0];
const worldPoint = sensorFrame.getWorldPoint(sensorPoint);
const roundTrip = worldPoint ? sensorFrame.getLocalPoint(worldPoint) : null;
```

Both methods return a fresh immutable tuple. They return `null` for invalid input, a disconnected frame, a frame outside a Scene, or an invalid frame chain. They use the precise current CPU transform rather than the public `Float32Array` matrix or a historical pick snapshot.

Keep packed `Float32Array` positions near their frame origin and express large translations with frames. Scene can preserve a `0.01` local offset when a frame translates it to `1,000,000`, but it can't recover detail that a producer already lost by storing large absolute values in a packed float buffer.

{% example 'nve-scene-frame' 'Default' %}

## Frame names

Scene trims leading and trailing whitespace from frame names. Every nonempty name must be unique within its owning Scene. If a name occurs more than once, Scene excludes every occurrence from name-based camera and label resolution and reports a recoverable `frame-name-duplicate` warning. Structurally nested content under each duplicate frame continues to render when its transform chain remains valid.

```js
toolFrame.name = 'tool';
duplicateFrame.name = ' tool ';
// Neither frame resolves by name, but valid children under both frames still render.

duplicateFrame.name = 'sensor';
// Both names now resolve independently.
```

Nested Scene elements own independent name registries. A frame in an inner Scene neither conflicts with nor resolves from
an outer Scene.

## Invalid transforms

Invalid declarative `position` or `orientation` data makes the frame invalid when explicit pose authority isn't active. Scene reports one recoverable `frame-transform` error for the active invalid episode and suppresses renderable layers, nested frames, labels, and frame-relative camera contributions beneath that frame. Scene doesn't substitute identity or move the content to the world origin. Invalid declarative input doesn't replace the last valid transform snapshot.

The `pose` getter throws an `InvalidStateError` while that frame is invalid. `getWorldMatrix()` also throws while the frame or any frame ancestor is invalid. Restore valid values, or remove both pose attributes to restore the valid identity state. Recovery clears the active diagnostic, so a later invalid episode can report again.

```js
robotFrame.setAttribute('position', '[1, 2]');
// The robot subtree is suppressed, and getWorldMatrix() throws InvalidStateError.

robotFrame.position = [1, 2, 0];
// The frame and its subtree participate in the next Scene snapshot again.
```

## Application-owned playback

Scene does not store transform timestamps or history, manage time, interpolate, extrapolate, or apply a staleness policy. Apps that support live data or replay select the current pose and pass it to `setPose()`. This keeps rendering snapshot-driven and lets the host choose its own clock, buffering, retention, interpolation, and coherent snapshot policy.
