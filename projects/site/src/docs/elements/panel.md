---
{
  title: 'Panels',
  layout: 'docs.11ty.js',
  tag: 'nve-panel',
  associatedElements: ['nve-panel-header', 'nve-panel-content', 'nve-panel-footer']
}
---

Panels provide a way to make additional content available alongside the primary page layout,
in a way that is accessible and minimizable.

Panels will always be minimizable, either by closing or collapsing. The proper close/collapse icon button will display depending on the
whether or not the `closable` attribute is set. By default `closable` is false and the panel will collapse down to just an expand icon.

Additionally, `nve-panel` can be have its `side` property set to `left` or `right` to get the proper collapse/expand icon and animation.

## Installation

```typescript
import '@nvidia-elements/core/panel/define.js';
```

```html
<nve-panel>
  <nve-panel-content>
    Panel Content
  </nve-panel-content>
</nve-panel>
```

## Standard

{% story 'nve-panel', 'Default' %}

## Left / Right Side Panels

{% api 'nve-panel', 'property', 'side' %}

{% story 'nve-panel', 'LeftSidePanel' %}

{% story 'nve-panel', 'RightSidePanel' %}

## Collapsible Panel with External Trigger

An external trigger can be used to expand/collapse or hide/show a panel. In this example clicking the button toggles the `expanded` attribute on the `nve-panel` between `true` and `false`.

<nve-alert status="warning">
  Collapsible Panel with External Trigger is for use with a fixed position when collapsed, otherwise the button may have a flat side and not be on the edge of the page.
</nve-alert>

{% story 'nve-panel', 'PanelWithTrigger', '{ "inline": false, "height": "650px" }' %}

## Closable Panel with External Trigger

{% api 'nve-panel', 'property', 'closable' %}

{% story 'nve-panel', 'ClosablePanel', '{ "inline": false, "height": "650px" }' %}

## Panel with Header

The `nve-panel-header` sub-component can be slotted into `nve-panel` to get default border styling, and additional sub slots within the header.
In this example `nve-panel-header` is further slotted with elements for `slot="title"`, `slot="subtitle"`, `icon-button` with `slot="action-icon"`

{% story 'nve-panel', 'PanelWithFullHeader' %}

## Panel with Footer

{% story 'nve-panel', 'PanelWithFooter' %}
