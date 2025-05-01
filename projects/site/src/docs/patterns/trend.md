---
{
  title: 'Trend Patterns',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Standard

{% story '@internals/patterns/patterns.stories.json', 'Trend' %}

## Top Badge

{% story '@internals/patterns/patterns.stories.json', 'TrendTopBadge' %}

## Bottom Badge

{% story '@internals/patterns/patterns.stories.json', 'TrendBottomBadge' %}
