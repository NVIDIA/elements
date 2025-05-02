---
{
  title: 'Layout Horizontal',
  layout: 'docs.11ty.js'
}
---

<style>
  nve-api-canvas {
    section[nve-layout~='row'][nve-layout*='align'] {
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

Horizontal _Flexbox_ based layouts can be achieved with _little to no CSS_ using the `nve-layout` attribute.

Set `nve-layout=="row"` on a container element and add additional alignment values.

- `nve-layout=="row ..."`

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
- `align:wrap`

Combine `nve-layout=` attribute values to create your desired layout. For example:

```html
<section nve-layout="row align:vertical-center align:right">
```

## Horizontal Layout Examples

```html
<section nve-layout="row align:...">
```

### Align Left

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignLeft' %}

### Align Horizontal Center

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignHorizontalCenter' %}

### Align Right

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignRight' %}

### Align Vertical Center

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignVerticalCenter' %}

### Align Center

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignCenter' %}

### Align Vertical Center & Right

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignVerticalCenterAndRight' %}

### Align Left & Bottom

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignLeftAndBottom' %}

### Align Horizontal Center & Bottom

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignHorizontalCenterAndBottom' %}

### Align Right & Bottom

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignRightAndBottom' %}

### Align Space Around

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignSpaceAround' %}

### Align Space Between

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignSpaceBetween' %}

### Align Space Evenly

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignSpaceEvenly' %}

### Align Stretch Horizontal

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignStretchHorizontal' %}

### Align Stretch Vertical

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignStretchVertical' %}

### Align Full Stretch

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignFullStretch' %}

### Align Wrap

{% story '@nvidia-elements/styles/layout.stories.json', 'HorizontalAlignWrap' %}
