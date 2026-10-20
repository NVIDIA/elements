---
{
  title: 'Scene Joint',
  description: 'One degree of freedom in a Scene coordinate frame.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-joint'
}
---

## Installation

{% install 'nve-scene-joint' %}

A joint specialises a [frame](../frame/). Its local pose is the origin (`position` and `orientation`) followed
by motion about `axis`. Revolute and continuous values use radians; prismatic values use metres; fixed joints
add no motion. The default is revolute, axis `[1,0,0]`, and value zero. Scene normalises the axis on capture.

`value` applies synchronously and reflects to its attribute. Rendering observes assignments at its next boundary.
Calibration applies `scale * value + offset`. `setPose` overrides origin and motion until `setPose(null)` releases
authority; values assigned during that authority take effect on release.

Optional `lower` and `upper` limits report `joint-limit` once per crossing while applying the value.
Scene never clamps. Reversed limits disable checking; continuous joints ignore limits.

`mimic` names a non-mimic joint through the [model name scopes](../model/). It replaces the joint's own value
with `mimic-multiplier * target.effectiveValue + mimic-offset`. Dependents update synchronously.
Scene supports one level only; a target cannot itself mimic. Invalid types, axes, numeric inputs, or mimic
references invalidate that joint's transform and its dependent chains, leaving unrelated content usable.

{% example 'nve-scene-joint' 'Pendulum' %}

Mimic resolution can read enclosing scopes; it cannot bind into a different entity's private scope.
