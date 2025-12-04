---
{
  title: 'Subheader Patterns',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Intended for use at the top of pages, but below the App Header, the following combinations of components are recommended patterns for composing subheaders.

## Main Page Headers

Page headers used for _main content pages_ should use `<nve-card container="flat">` containing sections for a `<h1>` page title, and sections for action buttons, breadcrumbs, and optional metadata.

### Standard

{% example '@nve-internals/patterns/subheader.examples.json', 'StandardHeaderMainPage' %}

### Stacked Metadata

{% example '@nve-internals/patterns/subheader.examples.json', 'StackedMetadataHeaderMainPage' %}

### Inline Metadata

{% example '@nve-internals/patterns/subheader.examples.json', 'InlineMetadataHeaderMainPage' %}

### Tabs

{% example '@nve-internals/patterns/subheader.examples.json', 'TabsHeaderMainPage' %}

### Kitchen Sink, Stacked

{% example '@nve-internals/patterns/subheader.examples.json', 'StackedKitchenSinkHeaderMainPage' %}

### Kitchen Sink, Inline

{% example '@nve-internals/patterns/subheader.examples.json', 'InlineKitchenSinkHeaderMainPage' %}

## Detail Page Headers

_Detail pages_ are one level deeper in the navigation and should use `<nve-card container="full">` containing a "back" icon button preceding the page title.

### Standard

{% example '@nve-internals/patterns/subheader.examples.json', 'StandardHeaderDetailPage' %}

### Stacked Metadata

{% example '@nve-internals/patterns/subheader.examples.json', 'StackedMetadataHeaderDetailPage' %}

### Inline Metadata

{% example '@nve-internals/patterns/subheader.examples.json', 'InlineMetadataHeaderDetailPage' %}

### Tabs

{% example '@nve-internals/patterns/subheader.examples.json', 'TabsHeaderDetailPage' %}

### Kitchen Sink, Stacked

{% example '@nve-internals/patterns/subheader.examples.json', 'StackedKitchenSinkHeaderDetailPage' %}

### Kitchen Sink, Inline

{% example '@nve-internals/patterns/subheader.examples.json', 'InlineKitchenSinkHeaderDetailPage' %}

## Viewer Page Headers

### Standard

{% example '@nve-internals/patterns/subheader.examples.json', 'StandardHeaderViewerPage' %}

## Toolbar Page Headers

### Standard

{% example '@nve-internals/patterns/subheader.examples.json', 'StandardHeaderToolbarPage' %}
