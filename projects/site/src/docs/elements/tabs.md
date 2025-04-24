---
{
  title: 'Tabs',
  layout: 'docs.11ty.js',
  tag: 'nve-tabs',
  associatedElements: ['nve-tabs-item']
}
---

The Tabs component is composed of a `<nve-tabs>` parent element and multiple `<nve-tabs-item>` elements slotted as children.
The `selected` attribute when applied to an item by the host application will give the selected tab the proper selected styles.

The `disabled` attribute can be applied to an item to get the proper visual cues and prevent interaction.
All default interaction, hover and active states are handled by the elements.

Additionally, all keyboard navigation and [accessibility](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
concerns are handled out of the box. Try using left/right arrow keys on horizontal tabs or up/down on vertical tabs.

## Installation

```typescript
import '@nvidia-elements/core/tabs/define.js';
```

```html
<nve-tabs>
  <nve-tabs-item selected>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3</nve-tabs-item>
  <nve-tabs-item>Tab 4</nve-tabs-item>
  <nve-tabs-item disabled>disabled</nve-tabs-item>
</nve-tabs>
```

## Standard

{% story 'nve-tabs', 'Default' %}

## Borderless Tabs

By default Tabs will show a blue border on the selected item. You can disable the border by setting `borderless` on the parent `<nve-tabs>`

{% story 'nve-tabs', 'BorderlessTabs' %}

## Border Background

By default Tabs will show a blue border on the selected item. You can change the border color by setting `--border-background` on the `<nve-tabs-item>`

{% story 'nve-tabs', 'BorderBackground' %}

## Tabs with Dot Indicators

Dots and icons can be added by simplply slotting in `<nve-icon>` or `<nve-dot>` into your `<nve-tabs-item>`

{% story 'nve-tabs', 'TabsWithDots' %}

## Vertical Tabs

Tabs can be used as the foundation for a side menu by enabling vertical mode. Simply set `vertical` on `<nve-tabs>`

{% story 'nve-tabs', 'VerticalTabs' %}

## Borderless Vertical Tabs with Icons

This example shows the combination of vertical tabs, set to borderless, with icons slotted.
An Icon only collapsed version of vertical tabs could be built off this system.

{% story 'nve-tabs', 'BorderlessVerticalTabs' %}

## Stateless Tabs

By default Tabs will be stateless. This means selection behavior will have to be handled by the host application.
We have provided a way to opt in to stateful selection behavior where click events and keyboard enter will trigger the selection state.

In all other examples on this page `behavior-select` is set on the parent `<nve-tabs>` to opt into stateful behavior. The following example
shows the default stateless behavior, where the host app will have to set/remove the `selected` attribute on child `<nve-tabs-item>`.

{% story 'nve-tabs', 'StatelessTabs' %}

## Links

{% story 'nve-tabs', 'Links' %}
