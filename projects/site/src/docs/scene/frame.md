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
- Matrices are column-major `Float32Array` values. Nested frames compose as `world = parent × local`.

These conventions apply to frames, markers, meshes, models, labels, picking results, camera targets, and internal layer prototypes unless an API documents a specialized local basis. The [camera optical basis](/docs/scene/camera/#optical-local-basis) uses image-oriented axes. See [direct byte writes](/docs/scene/record-buffers/#direct-byte-writes) for the packed record descriptors, field offsets, and strides that carry frame-local values.

Mesh front faces use counterclockwise triangle winding and outward-facing normals. Scene passes UV coordinates through unchanged. It uploads an `ImageBitmap` without vertical flipping, so the texture origin follows the browser image that the app provides.

## Current transforms

Frames are rigid and never include scale. Each frame stores one current translation and orientation snapshot. A frame without a transform is a valid identity frame. Assign `transform` or call `setTransform()` to replace the snapshot. `getWorldMatrix()` composes the frame's transform with its parent frames and returns a new column-major matrix. Public transform and matrix snapshots are defensive copies.

```ts
import type { FrameTransform } from '@nvidia-elements/scene';

const transform: FrameTransform = {
  position: [2, 3, 0],
  orientation: [0, 0, 0, 1]
};

robotFrame.setTransform(transform);
const worldMatrix = robotFrame.getWorldMatrix();
```

`setTransform()` validates synchronously. A rejected assignment throws and preserves the prior valid snapshot.

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

Invalid declarative `position` or `orientation` data makes the frame invalid. Scene reports one recoverable `frame-transform` error for the active invalid episode and suppresses renderable layers, nested frames, labels, and frame-relative camera contributions beneath that frame. Scene doesn't substitute identity or move the content to the world origin. Invalid declarative input doesn't replace the last valid transform snapshot, but programmatic snapshot updates can't reactivate the frame while the declarative input remains invalid.

`getWorldMatrix()` throws an `InvalidStateError` while the frame or any frame ancestor is invalid. Restore valid values, or remove both transform attributes to restore the valid identity state. Recovery clears the active diagnostic, so a later invalid episode can report again.

```js
robotFrame.setAttribute('position', '[1, 2]');
// The robot subtree is suppressed, and getWorldMatrix() throws InvalidStateError.

robotFrame.position = [1, 2, 0];
// The frame and its subtree participate in the next Scene snapshot again.
```

## Application-owned playback

Scene does not store transform timestamps or history, manage time, interpolate, extrapolate, or apply a staleness policy. Apps that support live data or replay select the current pose and write it to the frame. This keeps rendering snapshot-driven and lets the host choose its own clock, buffering, retention, interpolation, and coherent snapshot policy.
