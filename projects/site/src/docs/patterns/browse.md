---
{
  title: 'Browse Patterns',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Card Grid

{% story '@internals/patterns/browse.stories.json', 'PageLayoutCardGrid', '{ "inline": false, "height": "640px" }' %}

## Content Row

{% story '@internals/patterns/browse.stories.json', 'ContentRow' %}
