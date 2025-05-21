---
{
  title: 'Progressive Filter Chip',
  layout: 'docs.11ty.js',
  tag: 'nve-progressive-filter-chip'
}
---

## Installation

{% install 'nve-progressive-filter-chip' %}

## Standard

{% story 'nve-progressive-filter-chip', 'Default' %}

## Text Input

{% story 'nve-progressive-filter-chip', 'TextInput' %}

## Multiple

{% story 'nve-progressive-filter-chip', 'Multiple' %}

## Date Range

{% story 'nve-progressive-filter-chip', 'DateRange' %}

## Layer

{% story 'nve-progressive-filter-chip', 'Layer' %}

## Custom

Custom filter chips can be created by using the `slot` attribute. A `nve-button` can be used to trigger custom UI.

{% story 'nve-progressive-filter-chip', 'Custom', '{ "inline": false, "height": "400px" }' %}

## Validation

{% story 'nve-progressive-filter-chip', 'Validation' %}
