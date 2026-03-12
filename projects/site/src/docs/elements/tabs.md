---
{
  title: 'Tabs',
  layout: 'docs.11ty.js',
  tag: 'nve-tabs',
  associatedElements: ['nve-tabs-item']
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
