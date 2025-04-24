---
{
  title: 'Toast',
  layout: 'docs.11ty.js',
  tag: 'nve-toast'
}
---

## Installation

```typescript
import '@nvidia-elements/core/toast/define.js';
```

```html
<nve-toast id="toast" close-timeout="1500">hello there</nve-toast>
<nve-button popovertarget="toast">button</nve-button>
```

## Standard

{% story 'nve-toast', 'Default' %}

{% story 'nve-toast', 'Visual', '{ "inline": false, "height": "130px" }' %}

## Status

{% api 'nve-toast', 'property', 'status' %}

{% story 'nve-toast', 'Status', '{ "inline": false, "height": "300px" }' %}

## Close Timeout

{% api 'nve-toast', 'property', 'closeTimeout' %}

{% story 'nve-toast', 'Default', '{ "inline": false, "height": "200px" }' %}

## Events

{% api 'nve-toast', 'event', 'open' %}

{% api 'nve-toast', 'event', 'close' %}

{% story 'nve-toast', 'Events', '{ "inline": false, "height": "200px" }' %}

## Actions

{% story 'nve-toast', 'Actions', '{ "inline": false, "height": "200px" }' %}

## Position

{% api 'nve-toast', 'property', 'position' %}

{% story 'nve-toast', 'Position', '{ "inline": false, "height": "200px" }' %}

## Alignment

{% api 'nve-toast', 'property', 'alignment' %}

{% story 'nve-toast', 'Alignment', '{ "inline": false, "height": "600px" }' %}
