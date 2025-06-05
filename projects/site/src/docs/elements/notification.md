---
{
  title: 'Notification Snackbar',
  layout: 'docs.11ty.js',
  tag: 'nve-notification',
  associatedElements: ['nve-notification-group']
}
---

## Installation

Learn more about native [Popover APIs](docs/foundations/popovers/).

{% install 'nve-notification' %}

## Standard

{% story 'nve-notification', 'Default', '{ "height": "300px" }' %}

{% story 'nve-notification', 'Visual', '{ "inline": false, "height": "250px" }' %}

## Events

{% api 'nve-notification', 'event', 'open' %}

{% api 'nve-notification', 'event', 'close' %}

{% story 'nve-notification', 'Events', '{ "inline": false, "height": "250px" }' %}

## Status

{% api 'nve-notification', 'property', 'status' %}

{% story 'nve-notification', 'Status', '{ "inline": false, "height": "400px" }' %}

## Interactive Group

{% story 'nve-notification', 'InteractiveGroup', '{ "inline": false, "height": "400px" }' %}

## Drawer

{% api 'nve-notification', 'property', 'container' %}

{% story 'nve-notification', 'Drawer', '{ "inline": false, "height": "600px" }' %}

## Alignment

{% api 'nve-notification-group', 'property', 'alignment' %}

{% story 'nve-notification', 'Alignment', '{ "inline": false, "height": "600px" }' %}

## Position

{% api 'nve-notification-group', 'property', 'position' %}

{% story 'nve-notification', 'Position', '{ "inline": false, "height": "400px" }' %}

## Position Group

{% api 'nve-notification-group', 'property', 'position' %}

{% story 'nve-notification', 'PositionGroup', '{ "inline": false, "height": "700px" }' %}

## Content Wrap

{% story 'nve-notification', 'ContentWrap', '{ "inline": false, "height": "250px" }' %}
