---
{
  title: 'Drawer',
  layout: 'docs.11ty.js',
  tag: 'nve-drawer',
  associatedElements: ['nve-drawer-header', 'nve-drawer-footer']
}
---

## Installation

```typescript
import '@nvidia-elements/core/drawer/define.js';
```

```html
<nve-drawer id="drawer" closable modal>
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">drawer header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>

<nve-button popovertarget="drawer">button</nve-button>
```

## Standard

{% story 'nve-drawer', 'Default' %}

{% story 'nve-drawer', 'Visual', '{ "inline": false, "height": "700px" }' %}

## Size

{% api 'nve-drawer', 'property', 'size' %}

### Small

{% story 'nve-drawer', 'Small', '{ "inline": false, "height": "700px" }' %}

### Large

{% story 'nve-drawer', 'Large', '{ "inline": false, "height": "700px" }' %}

## Scroll

{% story 'nve-drawer', 'Scroll', '{ "inline": false, "height": "700px" }' %}

## Position

{% api 'nve-drawer', 'property', 'position' %}

{% story 'nve-drawer', 'Position', '{ "inline": false, "height": "700px" }' %}
