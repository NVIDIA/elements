---
{
  title: 'Draggable List',
  description: 'Reorder lists and transfer items with native dragging, keyboard movement, and application-owned drop handling.',
  layout: 'docs.11ty.js',
  tag: 'nve-draggable-list'
}
---

## Installation

{% install 'nve-draggable-list' %}

## Movement

{% api 'nve-draggable-list' 'description' %}

{% api 'nve-draggable-list' 'slot' '' %}

{% api 'nve-draggable-list' 'event' 'draggable-drop' %}

## Connected lists

{% example '@nvidia-elements/foundations/draggable-list/draggable-list.examples.json' 'Connected' %}

## Horizontal movement

{% api 'nve-draggable-list' 'property' 'orientation' %}

{% example '@nvidia-elements/foundations/draggable-list/draggable-list.examples.json' 'Horizontal' %}

## Disabled movement

{% api 'nve-draggable-list' 'property' 'disabled' %}

## Lifecycle events

{% api 'nve-draggable-list' 'event' 'draggable-start' %}

{% api 'nve-draggable-list' 'event' 'draggable-end' %}

## Data grid

{% api 'nve-grid' 'property' 'draggableRows' %}

{% api 'nve-grid' 'property' 'draggableColumns' %}

{% example '@nvidia-elements/core/grid/grid.examples.json' 'DraggableRows' %}

## Rows between data grids

{% example '@nvidia-elements/core/grid/grid.examples.json' 'RowTransfers' '{ "inline": false, "height": "420px" }' %}
