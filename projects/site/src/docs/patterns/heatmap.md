---
{
  title: 'Heatmap Patterns',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Heatmap patterns visualize data intensity across a matrix using color gradients. These patterns are particularly useful in autonomous vehicle and robotics applications for displaying sensor performance, algorithm metrics, and system diagnostics.

## Sensor Coverage Analysis

{% example '@internals/patterns/heatmap.examples.json' 'SensorCoverage' '{ "inline": false, "height": "400px" }' %}

## Path Planning Performance

{% example '@internals/patterns/heatmap.examples.json' 'PathPlanning' '{ "inline": false, "height": "400px" }' %}

## Test Pipeline Results

{% example '@internals/patterns/heatmap.examples.json' 'HeatmapPattern' '{ "inline": false, "height": "400px" }' %}

## Inference Latency

{% example '@internals/patterns/heatmap.examples.json' 'InferenceLatency' '{ "inline": false, "height": "400px" }' %}

## Joint Utilization

{% example '@internals/patterns/heatmap.examples.json' 'JointUtilization' '{ "inline": false, "height": "340px" }' %}
