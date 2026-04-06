---
{
  title: 'Tabs',
  layout: 'docs.11ty.js',
  tag: 'nve-tabs',
  associatedElements: ['nve-tabs-item', 'nve-tabs-group']
}
---

## Installation

{% install 'nve-tabs' %}

The Tabs component consists of a `<nve-tabs>` parent element and many `<nve-tabs-item>` elements slotted as children. The `selected` attribute when applied to an item by the host application gives the selected tab the proper selected styles.

Apply the `disabled` attribute to an item to get the proper visual cues and prevent interaction. The elements handle all default interaction, hover, and active states.

Additionally, the component handles all keyboard navigation and [accessibility](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) concerns out of the box. Try using left/right arrow keys on horizontal tabs or up/down on vertical tabs.

## Borderless Tabs

By default Tabs shows a blue border on the selected item. You can disable the border by setting `borderless` on the parent `<nve-tabs>`

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'BorderlessTabs' %}

## Border Styles

You can change the border styles by overriding `--indicator-background` and `--indicator-border-radius` on `<nve-tabs>`

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'BorderBackground' %}

## Tabs with Dot Indicators

Add dots and icons by simply slotting in `<nve-icon>` or `<nve-dot>` into your `<nve-tabs-item>`

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'WithDots' %}

## Vertical Tabs

Tabs work as the foundation for a side menu by enabling vertical mode. Simply set `vertical` on `<nve-tabs>`

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'VerticalTabs' %}

## Borderless Vertical Tabs with Icons

This example shows the combination of vertical tabs, set to borderless, with icons slotted.
You can build an Icon only collapsed version of vertical tabs off this system.

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'BorderlessVerticalTabs' %}

## Stateless Tabs

By default Tabs is stateless. This means the host application must handle selection behavior.
The component provides a way to opt in to stateful selection behavior where click events and keyboard enter trigger the selection state.

All other examples on this page set `behavior-select` on the parent `<nve-tabs>` to opt into stateful behavior. The following example
shows the default stateless behavior, where the host app has to set/remove the `selected` attribute on child `<nve-tabs-item>`.

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'StatelessTabs' %}

## Links

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'Links' %}

## Grouped Tabs

Use `<nve-tabs-group>` when a selected tab should also reveal matching panel content. The group keeps selection and panel visibility in sync by matching each tab item `value` to a named panel slot on the group.

Wrap a single `<nve-tabs>` in the default slot, add `command="--toggle"` and `commandfor="<group-id>"` to each `<nve-tabs-item>`, and provide panel elements with `slot="<value>"`. Most consumers only need `slot`, `value`, `command`, and `commandfor`. The group handles the tab panel role and ARIA linkage internally, so consumer markup can stay focused on content.

Do not use `behavior-select` on `<nve-tabs>` when the group is present. Let the group coordinate selection.

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'GroupPanels' %}

## External Controls

`<nve-tabs-group>` also accepts external invokers such as `<nve-button>` as long as they target the group with `commandfor` and provide a matching `value`. This works well when secondary controls elsewhere on the page should reveal the same tab panel content.

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'ExternalControls' %}
