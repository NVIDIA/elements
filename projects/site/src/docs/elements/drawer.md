---
{
  title: 'Drawer',
  layout: 'docs.11ty.js',
  tag: 'nve-drawer',
  associatedElements: ['nve-drawer-header', 'nve-drawer-footer']
}
---

## Installation

{% install 'nve-drawer' %}

## Standard

{% story 'nve-drawer', 'Default' %}

{% story 'nve-drawer', 'Visual', '{ "inline": false, "height": "500px" }' %}

## Size

{% api 'nve-drawer', 'property', 'size' %}

### Small

{% story 'nve-drawer', 'Small', '{ "inline": false, "height": "500px" }' %}

### Large

{% story 'nve-drawer', 'Large', '{ "inline": false, "height": "500px" }' %}

## Scroll

{% story 'nve-drawer', 'Scroll', '{ "inline": false, "height": "500px" }' %}

## Position

{% api 'nve-drawer', 'property', 'position' %}

{% story 'nve-drawer', 'Position', '{ "inline": false, "height": "500px" }' %}
