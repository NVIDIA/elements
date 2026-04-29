---
{
  title: 'Responsive Patterns',
  description: 'Common responsive UI patterns built with NVIDIA Elements layout primitives: sidebars, stacks, and adaptive grids.',
  layout: 'docs.11ty.js',
  permalink: 'docs/labs/layout/responsive/patterns/index.html'
}
---

<nve-alert-group status="warning">
  <nve-alert>
    <nve-icon name="beaker" slot="icon" style="--color:inherit"></nve-icon> Labs projects are experimental packages available for early feedback.
  </nve-alert>
</nve-alert-group>

# {{ title }}

## Responsive Tabs

{% example '@nvidia-elements/styles/responsive-patterns.examples.json', 'ResponsiveTabs', '{ "inline": true, "resizable": false, "height": "240px" }' %}

## Responsive Toolbar

{% example '@nvidia-elements/styles/responsive-patterns.examples.json', 'ResponsiveToolbar', '{ "inline": true, "resizable": false, "height": "240px" }' %}
