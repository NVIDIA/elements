---
{
  title: 'Dialog',
  layout: 'docs.11ty.js',
  tag: 'nve-dialog',
  associatedElements: ['nve-dialog-header', 'nve-dialog-footer']
}
---

## Installation

```typescript
import '@nvidia-elements/core/dialog/define.js';
```

```html
<nve-dialog id="dialog" modal closable>
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
  </nve-dialog-header>
  <p nve-text="body">some text content in a closable dialog</p>
</nve-dialog>

<nve-button popovertarget="dialog">button</nve-button>
```

## Standard

{% story 'nve-dialog' 'Default' %}

{% story 'nve-dialog' 'Visual', '{ "inline": false, "height": "400px" }' %}

## Content

{% story 'nve-dialog' 'Content', '{ "inline": false, "height": "400px" }' %}

## Small

{% story 'nve-dialog' 'Small', '{ "inline": false, "height": "400px" }' %}

## Medium

{% story 'nve-dialog' 'Medium', '{ "inline": false, "height": "400px" }' %}

## Large

{% story 'nve-dialog' 'Large', '{ "inline": false, "height": "400px" }' %}

## Text Wrap

{% story 'nve-dialog' 'TextWrap', '{ "inline": false, "height": "400px" }' %}

## Position

{% story 'nve-dialog' 'Position', '{ "inline": false, "height": "400px" }' %}

## Scroll Content

{% story 'nve-dialog' 'ScrollContent', '{ "inline": false, "height": "650px" }' %}
