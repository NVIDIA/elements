---
{
  title: 'Dropdown',
  layout: 'docs.11ty.js',
  tag: 'nve-dropdown',
  associatedElements: ['nve-dropdown-header', 'nve-dropdown-footer']
}
---

## Installation

Learn more about native [Popover APIs](docs/foundations/popovers/).

{% install 'nve-dropdown' %}

## Standard

{% story 'nve-dropdown', 'Default' %}

{% story 'nve-dropdown', 'Visual', '{ "inline": false, "height": "230px" }' %}

## Events

{% api 'nve-dropdown', 'event' 'open' %}

{% api 'nve-dropdown', 'event' 'close' %}

{% story 'nve-dropdown', 'Events', '{ "inline": false, "height": "280px" }' %}

## Closable

{% api 'nve-dropdown', 'property' 'closable' %}

{% story 'nve-dropdown', 'Closable', '{ "inline": false, "height": "280px" }' %}

## Content

{% story 'nve-dropdown', 'Content', '{ "inline": false, "height": "450px" }' %}

## Position

{% api 'nve-dropdown', 'property' 'position' %}

{% story 'nve-dropdown', 'Position', '{ "inline": false, "height": "600px" }' %}

## Alignment

{% api 'nve-dropdown', 'property' 'alignment' %}

{% story 'nve-dropdown', 'Alignment', '{ "inline": false, "height": "600px" }' %}

## Radio Group Pattern

{% story 'nve-dropdown', 'RadioGroup', '{ "inline": false, "height": "450px" }' %}

## Checkbox Group Pattern

{% story 'nve-dropdown', 'CheckboxGroup', '{ "inline": false, "height": "320px" }' %}
