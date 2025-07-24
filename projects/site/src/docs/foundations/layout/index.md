---
{
  title: 'Layout',
  layout: 'docs.11ty.js'
}
---

<style>
  nvd-canvas {
    --padding: none;

    section {
      min-height: 220px !important;
    }

    nve-card {
      --background: var(--nve-sys-layer-overlay-background);
      min-height: 60px;
      min-width: 60px;
    }
  }
</style>

# {{title}}

Grid, horizontal and vertical based layouts can be achieved with _little to no CSS_ using the `nve-layout` attribute. Layouts support `column`, `row` and `grid` based layouts as well as `align` and `gap` adjustments.

```html
<div nve-layout="row gap:sm">
  <nve-button></nve-button>
  <nve-button></nve-button>
  <nve-button></nve-button>
</div>
```

## Installation

```shell
npm install @nvidia-elements/styles @nvidia-elements/themes
```

```css
/* import the global CSS into your project (import may vary based on build tools) */
@import '@nvidia-elements/styles/dist/layout.css';
```

## Layout Gap Spacing

Add the `gap` value to `nve-layout` to set spacing between elements. For example:

```html
<section nve-layout="row gap:md">

<section nve-layout="grid gap:md">
```

The following "t-shirt" spacing values are available:

- `gap:none`
- `gap:xxxs`
- `gap:xxs`
- `gap:xs`
- `gap:sm`
- `gap:md`
- `gap:lg`
- `gap:xl`
- `gap:xxl`
- `gap:xxxl`

### Gap xxxs

{% story '@nvidia-elements/styles/layout.stories.json', 'GapXxxs' %}

### Gap xxs

{% story '@nvidia-elements/styles/layout.stories.json', 'GapXxs' %}

### Gap xs

{% story '@nvidia-elements/styles/layout.stories.json', 'GapXs' %}

### Gap sm

{% story '@nvidia-elements/styles/layout.stories.json', 'GapSm' %}

### Gap md

{% story '@nvidia-elements/styles/layout.stories.json', 'GapMd' %}

### Gap lg

{% story '@nvidia-elements/styles/layout.stories.json', 'GapLg' %}

### Gap xl

{% story '@nvidia-elements/styles/layout.stories.json', 'GapXl' %}

### Gap xxl

{% story '@nvidia-elements/styles/layout.stories.json', 'GapXxl' %}

### Gap xxxl

{% story '@nvidia-elements/styles/layout.stories.json', 'GapXxxl' %}

### No Gap

{% story '@nvidia-elements/styles/layout.stories.json', 'GapNone' %}

## Layout Padding

Add the `pad` value to `nve-layout` to set spacing between elements. For example:

```html
<section nve-layout="row pad:md">

<section nve-layout="grid pad:md">
```

The following "t-shirt" spacing values are available:

- `pad:none`
- `pad:xxxs`
- `pad:xxs`
- `pad:xs`
- `pad:sm`
- `pad:md`
- `pad:lg`
- `pad:xl`
- `pad:xxl`
- `pad:xxxl`

By default padding will apply to all 4 sides of container, to specify padding on a single side use:

- `pad-top:md`
- `pad-right:md`
- `pad-bottom:md`
- `pad-left:md`

Or alternatively use the short hand to just pad the x and y axes.

- `pad-x:md`
- `pad-y:md`

```html
<section nve-layout="row pad-left:md">
```

### Padding Top

{% story '@nvidia-elements/styles/layout.stories.json', 'PadTop' %}

### Padding Left

{% story '@nvidia-elements/styles/layout.stories.json', 'PadLeft' %}

### Padding Right

{% story '@nvidia-elements/styles/layout.stories.json', 'PadRight' %}

### Padding Bottom

{% story '@nvidia-elements/styles/layout.stories.json', 'PadBottom' %}

### Padding X

{% story '@nvidia-elements/styles/layout.stories.json', 'PadX' %}

### Padding Y

{% story '@nvidia-elements/styles/layout.stories.json', 'PadY' %}

### Padding xxxs

{% story '@nvidia-elements/styles/layout.stories.json', 'PadXxxs' %}

### Padding xxs

{% story '@nvidia-elements/styles/layout.stories.json', 'PadXxs' %}

### Padding xs

{% story '@nvidia-elements/styles/layout.stories.json', 'PadXs' %}

### Padding sm

{% story '@nvidia-elements/styles/layout.stories.json', 'PadSm' %}

### Padding md

{% story '@nvidia-elements/styles/layout.stories.json', 'PadMd' %}

### Padding lg

{% story '@nvidia-elements/styles/layout.stories.json', 'PadLg' %}

### Padding xl

{% story '@nvidia-elements/styles/layout.stories.json', 'PadXl' %}

### Padding xxl

{% story '@nvidia-elements/styles/layout.stories.json', 'PadXxl' %}

### Padding xxxl

{% story '@nvidia-elements/styles/layout.stories.json', 'PadXxxl' %}

### No Padding

{% story '@nvidia-elements/styles/layout.stories.json', 'PadNone' %}

## Full width/height on container

For convenience a `full` option can be set to give the container 100% width & height. This is often useful for giving the root element of a page full height.

```html
<section nve-layout="full">
```

{% story '@nvidia-elements/styles/layout.stories.json', 'Full' %}
