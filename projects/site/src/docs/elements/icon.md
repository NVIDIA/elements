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

<div nve-layout="row align:center full">
  <nve-button><a href="/docs/foundations/iconography/">View Full Icon Catalog</a></nve-button>
</div>

<nvd-all-icons></nvd-all-icons>

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

## Explicit Imports

```typescript
import '@nvidia-elements/core/icon/icons/person.js';
import '@nvidia-elements/core/icon/icons/person-solid.js';
import '@nvidia-elements/core/icon/define.js';
```

Each icon import registers one SVG. Import the solid variant separately when needed. Names without an explicit registration load from the built-in catalog on demand. Application builds can defer that catalog; the full browser bundle remains a single file.

## SVG URLs

{% api 'nve-icon', 'property', 'name' %}

## Registration

{% example '@nvidia-elements/core/icon/icon.examples.json' 'Registration' %}

## NVIDIA Icons

Install [NVIDIA GUI Icons](https://github.com/NVIDIA/icons/tree/main/packages/gui-icons) to use the SVG assets with `nve-icon`.

```shell
npm install @nvidia/gui-icons
```

Register custom names in `namespace:name` form, such as `nvidia-gui:gpu-card-multi`. TypeScript accepts this form and checks unqualified names against the built-in catalog.

{% example '@nvidia-elements/core/icon/icon.examples.json' 'NvidiaIcons' '{ "height": "120px" }' %}

## Alias

{% example '@nvidia-elements/core/icon/icon.examples.json' 'Alias' %}

<script type="module" src="/docs/elements/icon.ts"></script>
