---
{
  title: 'Responsive Patterns',
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

{% story '@nvidia-elements/styles/responsive-patterns.stories.json', 'ResponsiveTabs', '{ "inline": true, "resizable": false, "height": "240px" }' %}

## Responsive Toolbar

{% story '@nvidia-elements/styles/responsive-patterns.stories.json', 'ResponsiveToolbar', '{ "inline": true, "resizable": false, "height": "240px" }' %}
