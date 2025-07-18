---
{
  title: 'Browse Patterns',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Card Grid

{% story '@nvidia-elements/core/page/page.stories.json', 'PageLayoutCardGrid', '{ "inline": false, "height": "640px" }' %}

## Content Row

{% story '@nve-internals/patterns/browse.stories.json', 'ContentRow' %}
