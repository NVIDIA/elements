---
{
  title: 'Page',
  layout: 'docs.11ty.js',
  tag: 'nve-page',
  associatedElements: ['nve-page-panel', 'nve-page-panel-header', 'nve-page-panel-content', 'nve-page-panel-footer']
}
---

## Installation

To enable smooth transitions between page view, see the [View Transition API](./docs/foundations/view-transitions/) documentation.

{% install 'nve-page' %}

## Slots

{% example '@nvidia-elements/core/page/page.examples.json' 'Content' '{ "inline": false, "height": "540px" }' %}

### Header

{% example '@nvidia-elements/core/page/page.examples.json' 'Default' '{ "inline": false, "height": "480px" }' %}

### Subheader

{% api 'nve-page', 'slot', 'subheader' %}

{% example '@nvidia-elements/core/page/page.examples.json' 'SlotSubheader' '{ "inline": false, "height": "480px" }' %}

### Subheader Large

{% api 'nve-page', 'slot', 'subheader' %}

{% example '@nvidia-elements/core/page/page.examples.json' 'SlotSubheaderLarge' '{ "inline": false, "height": "480px" }' %}

### Banner

{% api 'nve-page', 'slot', 'header' %}

{% example '@nvidia-elements/core/page/page.examples.json' 'SlotBanner' '{ "inline": false, "height": "480px" }' %}

### Left Aside

{% api 'nve-page', 'slot', 'left-aside' %}

{% example '@nvidia-elements/core/page/page.examples.json' 'SlotLeftAside' '{ "inline": false, "height": "480px" }' %}

### Right Aside

{% api 'nve-page', 'slot', 'right-aside' %}

{% example '@nvidia-elements/core/page/page.examples.json' 'SlotRightAside' '{ "inline": false, "height": "480px" }' %}

### Footer

{% api 'nve-page', 'slot', 'footer' %}

{% example '@nvidia-elements/core/page/page.examples.json' 'SlotFooter' '{ "inline": false, "height": "480px" }' %}

### Sub Footer

{% api 'nve-page', 'slot', 'subfooter' %}

{% example '@nvidia-elements/core/page/page.examples.json' 'SlotSubfooter' '{ "inline": false, "height": "480px" }' %}

### Left Panel

{% api 'nve-page', 'slot', 'left' %}

{% example '@nvidia-elements/core/page/page.examples.json' 'SlotLeft' '{ "inline": false, "height": "480px" }' %}

### Right Panel

{% api 'nve-page', 'slot', 'right' %}

{% example '@nvidia-elements/core/page/page.examples.json' 'SlotRight' '{ "inline": false, "height": "480px" }' %}

### Bottom Panel

{% api 'nve-page', 'slot', 'bottom' %}

{% example '@nvidia-elements/core/page/page.examples.json' 'SlotBottom' '{ "inline": false, "height": "480px" }' %}

## Invoker Command

{% example '@nvidia-elements/core/page/page.examples.json' 'InvokerCommand' '{ "inline": false, "height": "480px" }' %}

### Expandable Panel

{% example '@nvidia-elements/core/page/page.examples.json' 'PanelExpandable' '{ "inline": false, "height": "480px" }' %}

### Closable Panel

{% example '@nvidia-elements/core/page/page.examples.json' 'PanelClosable' '{ "inline": false, "height": "480px" }' %}

### Interaction Drawer

{% example '@nvidia-elements/core/page/page.examples.json' 'InteractionDrawer' '{ "inline": false, "height": "480px" }' %}

### Interaction Panel Navigation

{% example '@nvidia-elements/core/page/page.examples.json' 'InteractionPanelNavigation' '{ "inline": false, "height": "480px" }' %}

## Panel Resize

{% example '@nvidia-elements/core/page/page.examples.json' 'Resize' '{ "inline": false, "height": "480px" }' %}

### Panel Resize Multi

{% example '@nvidia-elements/core/page/page.examples.json' 'ResizeMulti' '{ "inline": false, "height": "560px" }' %}

### Panel Resize Snap

{% example '@nvidia-elements/core/page/page.examples.json' 'ResizeSnap' '{ "inline": false, "height": "560px" }' %}

## Layouts

### Page Panel Tabs

{% example '@nvidia-elements/core/page/page.examples.json' 'PanelTabs' '{ "inline": false, "height": "480px" }' %}

### Page Panel Headings

{% example '@nvidia-elements/core/page/page.examples.json' 'PanelHeadings' '{ "inline": false, "height": "480px" }' %}

### Document Scroll

{% example '@nvidia-elements/core/page/page.examples.json' 'DocumentScroll' '{ "inline": false, "height": "480px" }' %}

## Kitchen Sink

{% example '@nvidia-elements/core/page/page.examples.json' 'KitchenSink' '{ "inline": false, "height": "780px" }' %}
