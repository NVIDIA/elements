---
{
  title: 'Scene Camera',
  description: 'Camera poses, orbit, follow, and top behaviors, plus bounds queries and explicit fitting for Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-camera'
}
---

## Installation

{% install 'nve-scene-camera' %}

See [Scene Frame](/docs/scene/frame/) for world coordinates and [Scene Interaction](/docs/scene/interaction/#convert-coordinates) for projection queries.

## Behavior-specific properties

{% api 'nve-scene-camera' 'property' 'behavior' %}

## Behavior Orbit

{% example 'nve-scene-camera' 'BehaviorOrbit' %}

## Behavior Follow

{% api 'nve-scene-camera' 'property' 'frame' %}

{% api 'nve-scene-camera' 'property' 'followMode' %}

{% example 'nve-scene-camera' 'BehaviorFollow' %}

## Behavior Top

{% api 'nve-scene-camera' 'property' 'altitude' %}

{% api 'nve-scene-camera' 'property' 'frustumHeight' %}

{% example 'nve-scene-camera' 'BehaviorTop' %}

## Bounds and camera fitting

```typescript
// Capture initial content, then wait for declarative frame inputs and layout.
await Promise.all([scene.updateComplete, vehicleFrame.updateComplete]);
const bounds = scene.getBounds({ content: [vehicleFrame] });
scene.fitCamera(camera, bounds, { padding: 0.1 });
```

### Query snapshot

{% api 'nve-scene' 'method' 'getBounds' %}

```typescript
const bounds = scene.getBounds({ content: [scene], exclude: [grid, axes] });
scene.fitCamera(camera, bounds);
```

### Explicit fitting

{% api 'nve-scene' 'method' 'fitCamera' %}
