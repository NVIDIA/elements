---
{
  title: 'Data Grid Draggable Rows',
  description: 'Reorder rows in NVIDIA Elements Data Grid and transfer rows between grids with drag handles, keyboard movement, and application-owned drop handling.',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

## Draggable rows

{% api 'nve-grid' 'property' 'draggableRows' %}

{% example '@nvidia-elements/core/grid/grid.examples.json' 'DraggableRows' %}

## Rows between data grids

{% example '@nvidia-elements/core/grid/grid.examples.json' 'RowTransfers' '{ "inline": false, "height": "420px" }' %}

## Drop requests

{% api 'nve-grid' 'event' 'draggable-drop' %}

## Virtual row movement

{% example '@nvidia-elements/core/grid/grid.examples.json' 'VirtualReorder' %}
