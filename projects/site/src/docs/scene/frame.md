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

{% api 'nve-scene-frame' 'property' 'position' %}

{% api 'nve-scene-frame' 'property' 'orientation' %}

Convert URDF roll, pitch, and yaw radians to an orientation quaternion with `quaternionFromRpy`.

```js
import { quaternionFromRpy } from '@nvidia-elements/scene';

frame.orientation = quaternionFromRpy([0, 0, Math.PI / 2]);
```

See [camera behavior](/docs/scene/camera/), [mesh geometry](/docs/scene/mesh/), and [packed record layouts](/docs/scene/record-buffers/#direct-byte-writes) for their specialized inputs.

## Named parent references

{% api 'nve-scene-frame' 'property' 'frame' %}

```html
<nve-scene-frame name="base" position="[1,0,0]"></nve-scene-frame>
<nve-scene-frame name="tool" frame="base" position="[0,0,1]"></nve-scene-frame>
<nve-scene-body frame="tool">
  <nve-scene-shape type="cube"></nve-scene-shape>
</nve-scene-body>
```

## Current poses

Assigning `position` or `orientation` applies immediately, so queries in the same task read the new pose.

{% api 'nve-scene-frame' 'property' 'pose' %}

{% api 'nve-scene-frame' 'method' 'getWorldMatrix' %}

```js
robotFrame.position = [2, 3, 0];
robotFrame.orientation = [0, 0, 0, 1];

const currentPose = robotFrame.pose; // { position: [2, 3, 0], orientation: [0, 0, 0, 1] }
const worldMatrix = robotFrame.getWorldMatrix();
```

## Convert points

{% api 'nve-scene-frame' 'method' 'getWorldPoint' %}

{% api 'nve-scene-frame' 'method' 'getLocalPoint' %}

```js
const sensorPoint = [1, 0, 0];
const worldPoint = sensorFrame.getWorldPoint(sensorPoint);
const roundTrip = worldPoint ? sensorFrame.getLocalPoint(worldPoint) : null;
```

## Frame names

{% api 'nve-scene-frame' 'property' 'name' %}

See [models](/docs/scene/model/) for name scopes and [joints](/docs/scene/joint/) for articulated motion.
