---
{
  title: 'Icon',
  layout: 'docs.11ty.js',
  tag: 'nve-icon'
}
---

## Installation

{% install 'nve-icon' %}

## All Icons

The Iconography system exposes an SVG based icon library to the `nve-icon` element.

See the searchable [Interactive Icon Catalog](/docs/foundations/iconography/)

<all-icons></all-icons>

## Status

{% api 'nve-icon', 'property', 'status' %}

{% example '@nvidia-elements/core/icon/icon.examples.json' 'Statuses' %}

## Size

{% api 'nve-icon', 'property', 'size' %}

{% example '@nvidia-elements/core/icon/icon.examples.json' 'Size' %}

## Direction

{% api 'nve-icon', 'property', 'direction' %}

{% example '@nvidia-elements/core/icon/icon.examples.json' 'Direction' %}

## Appearance

Set `appearance="solid"` to render the optional solid asset for a named icon. When no `-solid` asset is available,
the icon renders its outline form. Omit the attribute, or set `appearance="outline"`, to render the outline form.

{% api 'nve-icon', 'property', 'appearance' %}

## Themes

{% example '@nvidia-elements/core/icon/icon.examples.json' 'Themes' %}

## Registration

{% example '@nvidia-elements/core/icon/icon.examples.json' 'Registration' %}

## Alias

{% example '@nvidia-elements/core/icon/icon.examples.json' 'Alias' %}

<script type="module" src="/_internal/stories/icon/all-icons.js"></script>
