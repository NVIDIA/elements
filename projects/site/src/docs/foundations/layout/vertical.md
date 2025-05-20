---
{
  title: 'Layout Vertical',
  layout: 'docs.11ty.js'
}
---

<style>
  nvd-canvas {
    section[nve-layout~='column'][nve-layout*='align'] {
      min-height: 320px !important;
    }

    nve-card {
      --background: var(--nve-sys-layer-overlay-background);
      min-height: 60px;
      min-width: 60px;
    }
  }
</style>

# {{title}}

Vertical _Flexbox_ based layouts can be achieved with _little to no CSS_ using the `nve-layout` attribute.

Set `nve-layout="column"` on a container element and add additional alignment values.

- `nve-layout="column ..."`

- `align:left`
- `align:right`
- `align:top`
- `align:bottom`
- `align:center`
- `align:horizontal-center`
- `align:vertical-center`
- `align:stretch`
- `align:horizontal-stretch`
- `align:vertical-stretch`
- `align:space-around`
- `align:space-between`
- `align:space-evenly`

Combine `nve-layout` attribute values to create your desired layout. For example:

```html
<section nve-layout="column align:vertical-center align:right">
```

## Vertical Layout Examples

```html
<section nve-layout="column align:...">
```

### Align Top

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignTop' %}

### Align Vertical Center

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignVerticalCenter' %}

### Align Bottom

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignBottom' %}

### Align Horizontal Center

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignHorizontalCenter' %}

### Align Center

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignCenter' %}

### Align Center and Bottom

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignCenterAndBottom' %}

### Align Top and Right

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignTopAndRight' %}

### Align Center and Right

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignCenterAndRight' %}

### Align Bottom and Right

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignBottomAndRight' %}

### Align Space Around

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignSpaceAround' %}

### Align Space Between

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignSpaceBetween' %}

### Align Space Evenly

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignSpaceEvenly' %}

### Align Stretch Horizontal

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignStretchHorizontal' %}

### Align Stretch Vertical

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignStretchVertical' %}

### Align Full Stretch

{% story '@nvidia-elements/styles/layout.stories.json', 'VerticalAlignFullStretch' %}
