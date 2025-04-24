---
{
  title: 'Toggletip',
  layout: 'docs.11ty.js',
  tag: 'nve-toggletip',
  associatedElements: ['nve-toggletip-header', 'nve-toggletip-footer']
}
---

## Installation

```typescript
import '@nvidia-elements/core/toggletip/define.js';
```

```html
<nve-toggletip anchor="btn">>hello there</nve-toggletip>
<nve-button id="btn">button</nve-button>
```

## Standard

{% story 'nve-toggletip', 'Default' %}

{% story 'nve-toggletip', 'Visual', '{ "inline": false, "height": "130px" }' %}

## Position

{% api 'nve-toggletip', 'property', 'position' %}

{% story 'nve-toggletip', 'Position', '{ "inline": false, "height": "280px" }' %}

## Alignment

{% api 'nve-toggletip', 'property', 'alignment' %}

{% story 'nve-toggletip', 'Alignment', '{ "inline": false, "height": "350px" }' %}

## Events

{% api 'nve-toggletip', 'event', 'open' %}

{% api 'nve-toggletip', 'event', 'close' %}

{% story 'nve-toggletip', 'Events', '{ "inline": false, "height": "280px" }' %}

## Content

{% story 'nve-toggletip', 'Content', '{ "inline": false, "height": "400px" }' %}

## Closable

{% api 'nve-toggletip', 'property', 'closable' %}

{% story 'nve-toggletip', 'Closable', '{ "inline": false, "height": "400px" }' %}

## Alert Group

{% story 'nve-toggletip', 'AlertGroup', '{ "inline": false, "height": "400px" }' %}
