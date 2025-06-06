---
{
  title: 'Menu',
  layout: 'docs.11ty.js',
  tag: 'nve-menu',
  associatedElements: ['nve-menu-item']
}
---

## Installation

{% install 'nve-menu' %}

## Standard

{% story 'nve-menu', 'Default' %}

## Selected

{% api 'nve-menu-item', 'property', 'selected' %}

{% story 'nve-menu', 'Selected' %}

## Current

{% api 'nve-menu-item', 'property', 'current' %}

{% story 'nve-menu', 'Current' %}

## Border Background

{% story 'nve-menu', 'BorderBackground' %}

## Disabled

{% api 'nve-menu-item', 'property', 'disabled' %}

{% story 'nve-menu', 'Disabled' %}

## Icons

{% story 'nve-menu', 'Icons' %}

## Scroll

{% story 'nve-menu', 'Scroll' %}

## Dropdown

{% story 'nve-menu', 'Dropdown', '{ "inline": false, "height": "380px" }' %}

## Vertical Navigation Drawer

{% story 'nve-menu', 'VerticalNavigationDrawer', '{ "inline": false, "height": "380px" }' %}

## Vertical Navigation Panel

{% story 'nve-menu', 'VerticalNavigationPanel' %}

## Menu Item Tooltip

{% story 'nve-menu', 'MenuItemTooltip' %}

## Complex

{% story 'nve-menu', 'Complex', '{ "inline": false, "height": "300px" }' %}

## Links

{% story 'nve-menu', 'Links' %}

## Suffix Slot

{% story 'nve-menu', 'Suffix' %}

## Danger Status

{% story 'nve-menu', 'DangerStatus' %}
