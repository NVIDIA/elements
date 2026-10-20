---
{
  title: 'Scene Model',
  description: 'An entity frame grouping scoped bodies and joints.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-model'
}
---

## Installation

{% install 'nve-scene-model' %}

A model groups rigid bodies and their joint connections. Bodies own named coordinate frames and geometry; joints identify parent and child bodies. Body frame names and joint names occupy separate namespaces, scoped to the nearest model. Two models can reuse internal names. The model pose places its root bodies.

## Joint access

{% api 'nve-scene-model' 'property' 'joints' %}

Pass a record to set more than one joint with one membership lookup. The record has the same shape that `values()` returns.

```js
arm.joints.set({ shoulder: 0.4, elbow: -0.8 });
```

## Body access

{% api 'nve-scene-model' 'property' 'bodies' %}

```js
const tip = arm.bodies.get('forearm')?.getWorldPoint([0, 0, 0.8]);
```

## Body tint

{% api 'nve-scene-model' 'property' 'tint' %}

## Animated arm

{% example 'nve-scene-model' 'RobotArmAnimated' %}

See [frames](/docs/scene/frame/) for transform authority and [joints](/docs/scene/joint/) for motion and limits.
