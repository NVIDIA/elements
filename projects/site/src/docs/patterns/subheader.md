---
{
  title: 'Subheader Patterns',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Intended for use at the top of pages, but below the Page Header, the following combinations of components are recommended patterns for composing subheaders.

### Standard

{% example '@internals/patterns/subheader.examples.json' 'StandardHeaderMainPage' '{ "inline": false, "height": "380px" }' %}

### Stacked Metadata

{% example '@internals/patterns/subheader.examples.json' 'StackedMetadataHeaderMainPage' '{ "inline": false, "height": "380px" }' %}

### Inline Metadata

{% example '@internals/patterns/subheader.examples.json' 'InlineMetadataHeaderMainPage' '{ "inline": false, "height": "380px" }' %}

### Tabs

{% example '@internals/patterns/subheader.examples.json' 'TabsHeaderMainPage' '{ "inline": false, "height": "380px" }' %}

### Kitchen Sink, Stacked

{% example '@internals/patterns/subheader.examples.json' 'StackedKitchenSinkHeaderMainPage' '{ "inline": false, "height": "380px" }' %}

### Kitchen Sink, Inline

{% example '@internals/patterns/subheader.examples.json' 'InlineKitchenSinkHeaderMainPage' '{ "inline": false, "height": "380px" }' %}

## Detail Page Headers

_Detail pages_ are one level deeper in the navigation and should use `<nve-card container="full">` containing a "back" icon button preceding the page title.

### Standard

{% example '@internals/patterns/subheader.examples.json' 'StandardHeaderDetailPage' '{ "inline": false, "height": "380px" }' %}

### Stacked Metadata

{% example '@internals/patterns/subheader.examples.json' 'StackedMetadataHeaderDetailPage' '{ "inline": false, "height": "380px" }' %}

### Inline Metadata

{% example '@internals/patterns/subheader.examples.json' 'InlineMetadataHeaderDetailPage' '{ "inline": false, "height": "380px" }' %}

### Tabs

{% example '@internals/patterns/subheader.examples.json' 'TabsHeaderDetailPage' '{ "inline": false, "height": "380px" }' %}

### Kitchen Sink, Stacked

{% example '@internals/patterns/subheader.examples.json' 'StackedKitchenSinkHeaderDetailPage' '{ "inline": false, "height": "380px" }' %}

### Kitchen Sink, Inline

{% example '@internals/patterns/subheader.examples.json' 'InlineKitchenSinkHeaderDetailPage' '{ "inline": false, "height": "380px" }' %}

## Viewer Page Headers

### Standard

{% example '@internals/patterns/subheader.examples.json' 'StandardHeaderViewerPage' '{ "inline": false, "height": "380px" }' %}

## Toolbar Page Headers

### Standard

{% example '@internals/patterns/subheader.examples.json' 'StandardHeaderToolbarPage' '{ "inline": false, "height": "380px" }' %}
