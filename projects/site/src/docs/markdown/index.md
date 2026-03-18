---
{
  title: 'Markdown',
  layout: 'docs.11ty.js',
  tag: 'nve-markdown'
}
---

The `nve-markdown` component renders markdown content with Elements styling. It supports both programmatic content via the `source` property and template-based content via slots.

## Installation

{% install 'nve-markdown' %}

## Basic Usage

### Markdown from Source Property

{% example '@nvidia-elements/markdown/markdown/markdown.examples.json', 'FromSource' %}

### Markdown from Template

{% example '@nvidia-elements/markdown/markdown/markdown.examples.json', 'FromTemplate' %}

## Advanced Examples

### Combined Markdown and HTML

{% example '@nvidia-elements/markdown/markdown/markdown.examples.json', 'CombinedFromTemplate' %}

## Interactive Examples

### Dynamic Content Updates

{% example '@nvidia-elements/markdown/markdown/markdown.examples.json', 'DynamicSource' %}

### Streaming Content

{% example '@nvidia-elements/markdown/markdown/markdown.examples.json', 'JavaScriptDriven' %}

## Features

- **Markdown Processing**: The markdown parser processes all content
- **HTML Support**: The renderer preserves and renders HTML tags within markdown
- **Two Input Methods**:
  - `source` property for programmatic content
  - `<template>` slot for declarative content
- **Elements Styling**: Comprehensive CSS styling that matches the Elements design system
- **Lazy Loading**: Markdown parser is only loaded when needed for optimal performance

<!-- The below tests direct use of component rather than markdown.examples.ts processing  -->
<!--

<nve-markdown>
  <template>
# Markdown from ewef

This content is **markdown** inside a template element.

- Template list item 1
  - Template list item 2
- Template list item 3
  </template>
</nve-markdown> -->
