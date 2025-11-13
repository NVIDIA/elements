---
{
  title: 'Page',
  layout: 'docs.11ty.js',
  tag: 'nve-page',
  associatedElements: ['nve-page-panel', 'nve-page-panel-header', 'nve-page-panel-content', 'nve-page-panel-footer']
}
---

## Installation

To enable smooth transitions between page view, see our [View Transition API](./docs/foundations/view-transitions/) documentation.

{% install 'nve-page' %}

{% example 'nve-page', 'Content', '{ "inline": false, "height": "480px" }' %}

## Header

{% api 'nve-page', 'slot', '' %}

It's recommended to leverage the new [nve-page-header](./docs/elements/page-header/) instead of `nve-app-header` when using the `nve-page` Element.

{% example 'nve-page', 'Default', '{ "inline": false, "height": "480px" }' %}

## Subheader

{% api 'nve-page', 'slot', 'subheader' %}

{% example 'nve-page', 'SlotSubheader', '{ "inline": false, "height": "480px" }' %}

## Subheader Large

{% api 'nve-page', 'slot', 'subheader' %}

{% example 'nve-page', 'SlotSubheaderLarge', '{ "inline": false, "height": "480px" }' %}

## Banner

{% api 'nve-page', 'slot', 'header' %}

{% example 'nve-page', 'SlotBanner', '{ "inline": false, "height": "480px" }' %}

## Left Aside

{% api 'nve-page', 'slot', 'left-aside' %}

{% example 'nve-page', 'SlotLeftAside', '{ "inline": false, "height": "480px" }' %}

## Right Aside

{% api 'nve-page', 'slot', 'right-aside' %}

{% example 'nve-page', 'SlotRightAside', '{ "inline": false, "height": "480px" }' %}

## Footer

{% api 'nve-page', 'slot', 'footer' %}

{% example 'nve-page', 'SlotFooter', '{ "inline": false, "height": "480px" }' %}

## Sub Footer

{% api 'nve-page', 'slot', 'subfooter' %}

{% example 'nve-page', 'SlotSubfooter', '{ "inline": false, "height": "480px" }' %}

## Panels

### Left Panel

{% api 'nve-page', 'slot', 'left' %}

{% example 'nve-page', 'SlotLeft', '{ "inline": false, "height": "480px" }' %}

### Right Panel

{% api 'nve-page', 'slot', 'right' %}

{% example 'nve-page', 'SlotRight', '{ "inline": false, "height": "480px" }' %}

### Bottom Panel

{% api 'nve-page', 'slot', 'bottom' %}

{% example 'nve-page', 'SlotBottom', '{ "inline": false, "height": "480px" }' %}

### Expandable Panel

{% api 'nve-page-panel', 'property', 'expandable' %}

{% example 'nve-page', 'PagePanelExpandable', '{ "inline": false, "height": "480px" }' %}

### Closable Panel

{% api 'nve-page-panel', 'property', 'closable' %}

{% example 'nve-page', 'PagePanelClosable', '{ "inline": false, "height": "480px" }' %}

## Page Panel Tabs

{% example 'nve-page', 'PagePanelTabs', '{ "inline": false, "height": "480px" }' %}

## Page Panel Headings

{% example 'nve-page', 'PagePanelHeadings', '{ "inline": false, "height": "480px" }' %}

## Interaction Panel

{% example 'nve-page', 'InteractionPanel', '{ "inline": false, "height": "480px" }' %}

## Interaction Panel Navigation

{% example 'nve-page', 'InteractionPanelNavigation', '{ "inline": false, "height": "480px" }' %}

## Interaction Drawer

{% example 'nve-page', 'InteractionDrawer', '{ "inline": false, "height": "480px" }' %}

## Panel Resize

{% example 'nve-page', 'Resize', '{ "inline": false, "height": "480px" }' %}

## Panel Resize Multi

{% example 'nve-page', 'ResizeMulti', '{ "inline": false, "height": "560px" }' %}

## Panel Resize Snap

{% example 'nve-page', 'ResizeSnap', '{ "inline": false, "height": "560px" }' %}

## Document Scroll

{% example 'nve-page', 'DocumentScroll', '{ "inline": false, "height": "480px" }' %}

## Kitchen Sink

{% example 'nve-page', 'KitchenSink', '{ "inline": false, "height": "780px" }' %}
