---
{
  title: 'Dropdown Group',
  layout: 'docs.11ty.js',
  tag: 'nve-dropdown-group'
}
---

<nve-alert status="warning">Note: Hover-based interactions are not currently supported due to added complexity and accessibility concerns. Support may be considered in future iterations with improved popover APIs.</nve-alert>

## Installation

{% install 'nve-dropdown-group' %}

## Disabled Menu Items

Disable individual menu items using the `disabled` attribute.

{% example '@nvidia-elements/core/dropdown-group/dropdown-group.examples.json' 'WithDisabledItems' %}

## Icons in Menu Items

{% example '@nvidia-elements/core/dropdown-group/dropdown-group.examples.json' 'WithIcons' %}
