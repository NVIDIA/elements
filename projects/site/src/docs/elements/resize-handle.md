---
{
  title: 'Resize Handle',
  layout: 'docs.11ty.js',
  tag: 'nve-resize-handle'
}
---

## Installation

```typescript
import '@nvidia-elements/core/resize-handle/define.js';
```

```html
<nve-resize-handle min="0" max="100" value="50" step="10"></nve-resize-handle>
```

## Standard

{% story 'nve-resize-handle', 'Default' %}

## Vertical

{% story 'nve-resize-handle', 'Vertical' %}

## Split Horizontal

{% story 'nve-resize-handle', 'SplitHorizontal', '{ "inline": false, "height": "250px" }' %}

## Split Vertical

{% story 'nve-resize-handle', 'SplitVertical', '{ "inline": false, "height": "250px" }' %}

## Form

{% story 'nve-resize-handle', 'Form', '{ "inline": false, "height": "300px" }' %}

## Line Width

{% story 'nve-resize-handle', 'LineWidth' %}
