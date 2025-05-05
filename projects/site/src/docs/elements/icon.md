---
{
  title: 'Icon',
  layout: 'docs.11ty.js',
  tag: 'nve-icon'
}
---

The Iconography system is based on exposing an SVG based icon library to a the `icon` element.
See the searchable [Interactive Icon Catalog](./docs/foundations/iconography/)

## Installation

```typescript
import '@nvidia-elements/core/icon/define.js';
```

```html
<nve-icon name="person"></nve-icon>
```

## Standard

{% story 'nve-icon', 'Default' %}

## All Icons

<all-icons></all-icons>

## Status

{% api 'nve-icon', 'property', 'status' %}

{% story 'nve-icon', 'Statuses' %}

## Size

{% api 'nve-icon', 'property', 'size' %}

{% story 'nve-icon', 'Size' %}

## Direction

{% api 'nve-icon', 'property', 'direction' %}

{% story 'nve-icon', 'Direction' %}

## Themes

{% story 'nve-icon', 'Themes' %}

## Registration

SVG paths can be registered and made accessible to the `<nve-icon>` element. Icons can be defined via a string or async function returning the resulting string.

{% story 'nve-icon', 'Registration' %}

## Alias

Icons can be aliased to a different name. This can be useful for context specific names or migrations between icon sets.

{% story 'nve-icon', 'Alias' %}

## Source

Direct SVG paths can be provided for rendering.

{% story 'nve-icon', 'Source' %}

<script type="module" src="/_internal/stories/icon/all-icons.js"></script>
