---
{
  title: 'Scene Model',
  description: 'Compound primitive model instances for Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-model',
  associatedElements: ['nve-scene-part']
}
---

## Installation

{% install 'nve-scene-model' %}

`nve-scene-part` children define shared model geometry. They don't define placements. A model without a source uses one identity placement; assign a `MarkerBuffer` or a JSON `source` attribute to place many instances.

## Robot Arm Animated

{% example 'nve-scene-model' 'RobotArmAnimated' %}
