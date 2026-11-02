---
{
  title: 'Virtual List',
  description: 'Render a fixed-height window of a large dataset with consumer-owned templates and automatic slot synchronization.',
  layout: 'docs.11ty.js',
  tag: 'nve-virtual-list'
}
---

## Installation

{% install 'nve-virtual-list' %}

## Item geometry

{% api 'nve-virtual-list' 'property' 'itemCount' %}

{% api 'nve-virtual-list' 'property' 'itemHeight' %}

{% api 'nve-virtual-list' 'css-property' '--scroll-height' %}

## Rendering

{% api 'nve-virtual-list' 'event' 'virtual-change' %}

{% api 'nve-virtual-list' 'slot' '' %}

## Scheduled rendering

{% example '@nvidia-elements/foundations/virtual-list/virtual-list.examples.json' 'ScheduledRender' '{ "height": "280px" }' %}

## Buffer

{% api 'nve-virtual-list' 'property' 'itemBuffer' %}

## Scrolling

{% api 'nve-virtual-list' 'event' 'virtual-scroll' %}

{% api 'nve-virtual-list' 'method' 'scrollToIndex' %}

{% api 'nve-virtual-list' 'command' '--scroll-to-index' %}

{% example '@nvidia-elements/foundations/virtual-list/virtual-list.examples.json' 'Commands' '{ "height": "360px" }' %}

## Refresh

{% api 'nve-virtual-list' 'method' 'refresh' %}

## Data grid

{% api 'nve-grid' 'slot' '' %}

{% example '@nvidia-elements/core/grid/grid.examples.json' 'PerformanceVirtualScroll' '{ "inline": false, "height": "520px" }' %}
