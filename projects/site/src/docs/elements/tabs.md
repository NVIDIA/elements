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

The Tabs component is composed of a `<nve-tabs>` parent element and multiple `<nve-tabs-item>` elements slotted as children. The `selected` attribute when applied to an item by the host application will give the selected tab the proper selected styles.

The `disabled` attribute can be applied to an item to get the proper visual cues and prevent interaction. All default interaction, hover and active states are handled by the elements.

Additionally, all keyboard navigation and [accessibility](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) concerns are handled out of the box. Try using left/right arrow keys on horizontal tabs or up/down on vertical tabs.

## Borderless Tabs

By default Tabs will show a blue border on the selected item. You can disable the border by setting `borderless` on the parent `<nve-tabs>`

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'BorderlessTabs' %}

## Border Styles

You can change the border styles by overriding `--indicator-background` and `--indicator-border-radius` on `<nve-tabs>`

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'BorderBackground' %}

## Tabs with Dot Indicators

Dots and icons can be added by simplply slotting in `<nve-icon>` or `<nve-dot>` into your `<nve-tabs-item>`

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'TabsWithDots' %}

## Vertical Tabs

Tabs can be used as the foundation for a side menu by enabling vertical mode. Simply set `vertical` on `<nve-tabs>`

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'VerticalTabs' %}

## Borderless Vertical Tabs with Icons

This example shows the combination of vertical tabs, set to borderless, with icons slotted.
An Icon only collapsed version of vertical tabs could be built off this system.

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'BorderlessVerticalTabs' %}

## Stateless Tabs

By default Tabs will be stateless. This means selection behavior will have to be handled by the host application.
We have provided a way to opt in to stateful selection behavior where click events and keyboard enter will trigger the selection state.

In all other examples on this page `behavior-select` is set on the parent `<nve-tabs>` to opt into stateful behavior. The following example
shows the default stateless behavior, where the host app will have to set/remove the `selected` attribute on child `<nve-tabs-item>`.

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'StatelessTabs' %}

## Links

{% example '@nvidia-elements/core/tabs/tabs.examples.json' 'Links' %}
