---
{
  title: 'Panels',
  layout: 'docs.11ty.js',
  tag: 'nve-panel',
  associatedElements: ['nve-panel-header', 'nve-panel-content', 'nve-panel-footer']
}
---

Panels provide a way to make extra content available alongside the primary page layout,
in a way that is accessible and minimizable.

Panels are always minimizable, either by closing or collapsing. The proper close/collapse icon button displays depending on the
whether you set the `closable` attribute. By default `closable` is false and the panel collapses down to just an expand icon.

Additionally, `nve-panel` can be have its `side` property set to `left` or `right` to get the proper collapse/expand icon and animation.

## Installation

{% install 'nve-panel' %}

## Left / Right Side Panels

{% api 'nve-panel', 'property', 'side' %}

{% example '@nvidia-elements/core/panel/panel.examples.json' 'LeftSidePanel' %}

{% example '@nvidia-elements/core/panel/panel.examples.json' 'RightSidePanel' %}

## Collapsible Panel with External Trigger

An external trigger supports expanding/collapsing or hiding/showing a panel. In this example clicking the button toggles the `expanded` attribute on the `nve-panel` between `true` and `false`.

<nve-alert status="warning">
  Collapsible Panel with External Trigger is for use with a fixed position when collapsed, otherwise the button may have a flat side and not be on the edge of the page.
</nve-alert>

{% example '@nvidia-elements/core/panel/panel.examples.json' 'WithTrigger' '{ "inline": false, "height": "650px" }' %}

## Closable Panel with External Trigger

{% api 'nve-panel', 'property', 'closable' %}

{% example '@nvidia-elements/core/panel/panel.examples.json' 'ClosablePanel' '{ "inline": false, "height": "650px" }' %}

## Panel with Header

The `nve-panel-header` sub-component can be slotted into `nve-panel` to get default border styling, and extra sub slots within the header.
In this example `nve-panel-header` is further slotted with elements for `slot="title"`, `slot="subtitle"`, `icon-button` with `slot="action-icon"`

{% example '@nvidia-elements/core/panel/panel.examples.json' 'WithFullHeader' %}

## Panel with Footer

{% example '@nvidia-elements/core/panel/panel.examples.json' 'WithFooter' %}
