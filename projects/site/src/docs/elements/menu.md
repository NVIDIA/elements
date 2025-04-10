---
{
  title: 'Menu',
  layout: 'docs.11ty.js',
  tag: 'nve-menu',
  associatedElements: ['nve-menu-item']
}
---

## Installation

```typescript
import '@nvidia-elements/core/menu/define.js';
```

```html
<nve-menu>
  <nve-menu-item>item 1</nve-menu-item>
  <nve-menu-item selected>item 2</nve-menu-item>
  <nve-menu-item>item 3</nve-menu-item>
  <nve-menu-item>item 4</nve-menu-item>
</nve-menu>
```

## Standard

{% story 'nve-menu', 'Default' %}

## Selected

{% api 'nve-menu-item', 'property', 'selected' %}

{% story 'nve-menu', 'Selected' %}

## Current

{% api 'nve-menu-item', 'property', 'current' %}

{% story 'nve-menu', 'Current' %}

## Border Background

By default Menu will show a blue border on the selected item. You can change the border color by setting `--border-background` on the `<nve-menu-item>`

{% story 'nve-menu', 'BorderBackground' %}

## Disabled

{% api 'nve-menu-item', 'property', 'disabled' %}

{% story 'nve-menu', 'Disabled' %}

## Icons

{% story 'nve-menu', 'Icons' %}

## Scroll

{% story 'nve-menu', 'Scroll' %}

## Dropdown

[ARIA Spec](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

{% story 'nve-menu', 'Dropdown', '{ "inline": false, "height": "600px" }' %}

## Vertical Navigation Drawer

Navigation drawers overlay the existing page content. Navigation is for out of page context navigation.

{% story 'nve-menu', 'VerticalNavigationDrawer', '{ "inline": false, "height": "300px" }' %}

## Vertical Navigation Panel

Navigation panels are inline to the page and push the existing page content to the side.
Navigation should be relevant and contextual to the page content.

{% story 'nve-menu', 'VerticalNavigationPanel' %}

## Menu Item Tooltip

{% story 'nve-menu', 'MenuItemTooltip' %}

## Complex

{% story 'nve-menu', 'Complex', '{ "inline": false, "height": "650px" }' %}

## Links

{% story 'nve-menu', 'Links' %}

## Suffix Slot

Menu item features a default slot for content, along with a suffix slot for displaying elements such as keyboard shortcuts at the end of the menu item container.

{% story 'nve-menu', 'Suffix' %}

## Danger Status

{% story 'nve-menu', 'DangerStatus' %}
