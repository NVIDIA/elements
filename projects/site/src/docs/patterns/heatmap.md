---
{
  title: 'Heatmap Patterns',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Heatmap patterns visualize data intensity across a matrix using color gradients. These patterns are particularly useful in autonomous vehicle and robotics applications for displaying sensor performance, algorithm metrics, and system diagnostics.

## Heatmap

{% example '@internals/patterns/heatmap.examples.json' 'ModulePassRate' '{ "inline": false, "height": "400px" }' %}

## Sensor Coverage Analysis

{% example '@internals/patterns/heatmap.examples.json' 'SensorCoverageHeatmap' '{ "inline": false, "height": "400px" }' %}

## Path Planning Performance

{% example '@internals/patterns/heatmap.examples.json' 'PathPlanningHeatmap' '{ "inline": false, "height": "400px" }' %}

## Occupancy Detection

{% example '@internals/patterns/heatmap.examples.json' 'OccupancyDetectionHeatmap' '{ "inline": false, "height": "450px" }' %}

## Thermal Heatmap

{% example '@internals/patterns/heatmap.examples.json' 'ThermalHeatmap' '{ "inline": false, "height": "450px" }' %}

## Inference Latency

{% example '@internals/patterns/heatmap.examples.json' 'InferenceLatencyHeatmap' '{ "inline": false, "height": "400px" }' %}

## Joint Usage

{% example '@internals/patterns/heatmap.examples.json' 'JointUtilizationHeatmap' '{ "inline": false, "height": "340px" }' %}

## Dynamic Heatmap

{% example '@internals/patterns/heatmap.examples.json' 'DynamicHeatmap' '{ "inline": false, "height": "400px" }' %}
