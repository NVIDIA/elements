---
{
  title: 'Dropdown Group',
  layout: 'docs.11ty.js',
  tag: 'nve-dropdown-group'
}
---

<style>
/* Ensure wide containers for stories */
iframe {
  min-width: 850px !important;
  max-width: 100% !important;
  overflow: visible !important;
}
</style>

<nve-alert status="warning">Note: Hover-based interactions are not currently supported due to added complexity and accessibility concerns. Support may be considered in future iterations with improved popover APIs.</nve-alert>

## Installation

```typescript
import '@nvidia-elements/core/dropdown-group/define.js';
```

```html
<nve-button popovertarget="menu-1">menu</nve-button>
<nve-dropdown-group>
  <nve-dropdown id="menu-1">
    <nve-menu>
      <nve-menu-item popovertarget="menu-2">
        item 1-1 <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon>
      </nve-menu-item>
      <nve-menu-item>item 1-2</nve-menu-item>
      <nve-menu-item>item 1-3</nve-menu-item>
    </nve-menu>
  </nve-dropdown>
  <nve-dropdown id="menu-2" position="right">
    <nve-menu>
      <nve-menu-item>item 2-1</nve-menu-item>
      <nve-menu-item popovertarget="menu-3">
        item 2-2 <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon>
      </nve-menu-item>
      <nve-menu-item>item 2-3</nve-menu-item>
    </nve-menu>
  </nve-dropdown>
  <nve-dropdown id="menu-3" position="right">
    <nve-menu>
      <nve-menu-item>item 3-1</nve-menu-item>
      <nve-menu-item>item 3-2</nve-menu-item>
      <nve-menu-item>item 3-3</nve-menu-item>
    </nve-menu>
  </nve-dropdown>
</nve-dropdown-group>
```

## Standard

{% story 'nve-dropdown-group', 'Default', '{ "inline": false, "height": "300px" }' %}

## Disabled Menu Items

Disable individual menu items using the `disabled` attribute.

{% story 'nve-dropdown-group', 'WithDisabledItems', '{ "inline": false, "height": "300px" }' %}

## Icons in Menu Items

{% story 'nve-dropdown-group', 'WithIcons', '{ "inline": false, "height": "300px" }' %}
