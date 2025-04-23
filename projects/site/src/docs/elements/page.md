---
{
  title: 'Page',
  layout: 'docs.11ty.js',
  tag: 'nve-page',
  associatedElements: ['nve-page-panel', 'nve-page-panel-header', 'nve-page-panel-content', 'nve-page-panel-footer']
}
---

## Installation

To enable smooth transitions between page view, see our [View Transition API](/docs/foundations/view-transitions/) documentation.

```typescript
import '@nvidia-elements/core/page/define.js';
```

```html
<nve-page>
  <div slot="header">header</div>
  <div slot="subheader">subheader</div>
  <div slot="left-aside">left-aside</div>
  <div slot="left">left</div>
  <div>main</div>
  <div slot="bottom">bottom</div>
  <div slot="right">right</div>
  <div slot="right-aside">right-aside</div>
  <div slot="subfooter">subfooter</div>
  <div slot="footer">footer</div>
</nve-page>
```

{% story 'nve-page', 'Content', '{ "height": "480px", "padding": 0 }' %}

## Header

{% api 'nve-page', 'slot', '' %}

It's recommended to leverage the new [nve-page-header](/docs/elements/page-header/) instead of `nve-app-header` when using the `nve-page` Element.

{% story 'nve-page', 'Default', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Subheader

{% api 'nve-page', 'slot', 'subheader' %}

{% story 'nve-page', 'SlotSubheader', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Subheader Large

{% api 'nve-page', 'slot', 'subheader' %}

{% story 'nve-page', 'SlotSubheaderLarge', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Banner

{% api 'nve-page', 'slot', 'header' %}

{% story 'nve-page', 'SlotBanner', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Left Aside

{% api 'nve-page', 'slot', 'left-aside' %}

{% story 'nve-page', 'SlotLeftAside', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Right Aside

{% api 'nve-page', 'slot', 'right-aside' %}

{% story 'nve-page', 'SlotRightAside', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Footer

{% api 'nve-page', 'slot', 'footer' %}

{% story 'nve-page', 'SlotFooter', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Sub Footer

{% api 'nve-page', 'slot', 'subfooter' %}

{% story 'nve-page', 'SlotSubfooter', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Panels

### Left Panel

{% api 'nve-page', 'slot', 'left' %}

{% story 'nve-page', 'SlotLeft', '{ "inline": false, "height": "480px", "padding": 0 }' %}

### Right Panel

{% api 'nve-page', 'slot', 'right' %}

{% story 'nve-page', 'SlotRight', '{ "inline": false, "height": "480px", "padding": 0 }' %}

### Bottom Panel

{% api 'nve-page', 'slot', 'bottom' %}

{% story 'nve-page', 'SlotBottom', '{ "inline": false, "height": "480px", "padding": 0 }' %}

### Expandable Panel

{% api 'nve-page-panel', 'property', 'expandable' %}

{% story 'nve-page', 'PagePanelExpandable', '{ "inline": false, "height": "480px", "padding": 0 }' %}

### Closable Panel

{% api 'nve-page-panel', 'property', 'closable' %}

{% story 'nve-page', 'PagePanelClosable', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Page Panel Tabs

{% api 'nve-page', 'story', 'PagePanelTabs' %}

{% story 'nve-page', 'PagePanelTabs', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Page Panel Headings

{% api 'nve-page', 'story', 'PagePanelHeadings' %}

{% story 'nve-page', 'PagePanelHeadings', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Interaction Panel

{% api 'nve-page', 'story', 'InteractionPanel' %}

{% story 'nve-page', 'InteractionPanel', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Interaction Panel Navigation

{% api 'nve-page', 'story', 'InteractionPanelNavigation' %}

{% story 'nve-page', 'InteractionPanelNavigation', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Interaction Drawer

{% api 'nve-page', 'story', 'InteractionDrawer' %}

{% story 'nve-page', 'InteractionDrawer', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Panel Resize

{% story 'nve-page', 'Resize', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Panel Resize Multi

{% story 'nve-page', 'ResizeMulti', '{ "inline": false, "height": "560px", "padding": 0 }' %}

## Panel Resize Snap

{% story 'nve-page', 'ResizeSnap', '{ "inline": false, "height": "560px", "padding": 0 }' %}

## Document Scroll

{% api 'nve-page', 'story', 'DocumentScroll' %}

{% story 'nve-page', 'DocumentScroll', '{ "inline": false, "height": "480px", "padding": 0 }' %}

## Kitchen Sink

{% api 'nve-page', 'story', 'KitchenSink' %}

{% story 'nve-page', 'KitchenSink', '{ "inline": false, "height": "780px", "padding": 0 }' %}
