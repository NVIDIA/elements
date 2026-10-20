---
{
  title: 'Scene Joint',
  description: 'Connections and relative motion between rigid bodies.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-joint'
}
---

## Installation

{% install 'nve-scene-joint' %}

## Independent Arms

{% example 'nve-scene-joint' 'IndependentArms' %}

## Prismatic lift

{% example 'nve-scene-joint' 'Forklift' %}

## Robot Arm

{% example 'nve-scene-model' 'Default' %}

## Robot Arm Animated

{% example 'nve-scene-model' 'RobotArmAnimated' %}

## Body connections

{% api 'nve-scene-joint' 'property' 'parent' %}

{% api 'nve-scene-joint' 'property' 'child' %}

{% api 'nve-scene-joint' 'property' 'name' %}

## Origin

{% api 'nve-scene-joint' 'property' 'position' %}

{% api 'nve-scene-joint' 'property' 'orientation' %}

## Motion

{% api 'nve-scene-joint' 'property' 'type' %}

{% api 'nve-scene-joint' 'property' 'axis' %}

{% api 'nve-scene-joint' 'property' 'value' %}

{% api 'nve-scene-joint' 'property' 'offset' %}

{% api 'nve-scene-joint' 'property' 'scale' %}

## Limits

{% api 'nve-scene-joint' 'property' 'lower' %}

{% api 'nve-scene-joint' 'property' 'upper' %}

## Mimic

{% api 'nve-scene-joint' 'property' 'mimic' %}

{% api 'nve-scene-joint' 'property' 'mimicMultiplier' %}

{% api 'nve-scene-joint' 'property' 'mimicOffset' %}

Use [coordinate frames](/docs/scene/frame/#current-poses) for application-supplied poses. Joints expose scalar motion; floating and planar joint types remain unsupported.
