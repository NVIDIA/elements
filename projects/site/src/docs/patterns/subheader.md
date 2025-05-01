---
{
  title: 'Subheader Patterns',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Intended for use at the top of pages, but below the [App Header](/docs/elements/page-header-main-page/), the following combinations of components are recommended patterns for composing subheaders.

## Main Page Headers

Page headers used for _main content pages_ should use `<nve-card container="flat">` cotaining sections for a `<h1>` page title, and sections for action buttons, breadcrumbs, and optional metadata.

### Standard

{% story '@internals/patterns/subheader.stories.json', 'StandardHeaderMainPage' %}

### Stacked Metadata

{% story '@internals/patterns/subheader.stories.json', 'StackedMetadataHeaderMainPage' %}

### Inline Metadata

{% story '@internals/patterns/subheader.stories.json', 'InlineMetadataHeaderMainPage' %}

### Tabs

{% story '@internals/patterns/subheader.stories.json', 'TabsHeaderMainPage' %}

### Kitchen Sink, Stacked

{% story '@internals/patterns/subheader.stories.json', 'StackedKitchenSinkHeaderMainPage' %}

### Kitchen Sink, Inline

{% story '@internals/patterns/subheader.stories.json', 'InlineKitchenSinkHeaderMainPage' %}

## Detail Page Headers

_Detail pages_ are one level deeper in the navigation and should use `<nve-card container="full">` containing a "back" icon button preceding the page title.

### Standard

{% story '@internals/patterns/subheader.stories.json', 'StandardHeaderDetailPage' %}

### Stacked Metadata

{% story '@internals/patterns/subheader.stories.json', 'StackedMetadataHeaderDetailPage' %}

### Inline Metadata

{% story '@internals/patterns/subheader.stories.json', 'InlineMetadataHeaderDetailPage' %}

### Tabs

{% story '@internals/patterns/subheader.stories.json', 'TabsHeaderDetailPage' %}

### Kitchen Sink, Stacked

{% story '@internals/patterns/subheader.stories.json', 'StackedKitchenSinkHeaderDetailPage' %}

### Kitchen Sink, Inline

{% story '@internals/patterns/subheader.stories.json', 'InlineKitchenSinkHeaderDetailPage' %}

## Viewer Page Headers

### Standard

{% story '@internals/patterns/subheader.stories.json', 'StandardHeaderViewerPage' %}

## Toolbar Page Headers

### Standard

{% story '@internals/patterns/subheader.stories.json', 'StandardHeaderToolbarPage' %}
