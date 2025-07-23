---
{
  title: 'Grid Layout',
  layout: 'docs.11ty.js'
}
---

<style>
  nvd-canvas {
    section[nve-layout~='grid'][nve-layout*='align'] {
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

CSS _Grid_ based layouts can be achieved with _little to no CSS_ using the `nve-layout` attribute. The system is based on a 12 column layout.

Set `nve-layout="grid"` on a container element and add additional item spanning (`span-items:...`) and `gap:...` values.

- `nve-layout="grid gap:md span-items:1"`
- `nve-layout="grid gap:md span-items:2"`
- `nve-layout="grid gap:md span-items:3"`
- `nve-layout="grid gap:md span-items:..."`
- `nve-layout="grid gap:md span-items:12"`

Or specify column spanning (`span:...`) on the individual items (1-12):

- `nve-layout="span:1"`
- `nve-layout="span:2"`
- `nve-layout="span:3"`
- `nve-layout="span:..."`
- `nve-layout="span:12"`

Similar to the Horizontal and Vertical _Flexbox_ based system you can also add alignment values:

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

## Grid Layout Examples

```html
<!--  Specify column spanning on the parent -->
<section nve-layout="grid span-items:3">
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
</section>

<!--  Specify column spanning on the children -->
<section nve-layout="grid gap:md">
  <nve-card nve-layout="span:6"></nve-card>
  <nve-card nve-layout="span:6"></nve-card>
  <nve-card nve-layout="span:4"></nve-card>
  <nve-card nve-layout="span:4"></nve-card>
  <nve-card nve-layout="span:4"></nve-card>
  <nve-card nve-layout="span:4"></nve-card>
</section>

<!--  Grid with alignment options -->
<section nve-layout="grid gap:md align:center">
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
</section>
```

### Span Items 2

{% story '@nvidia-elements/styles/layout.stories.json', 'GridSpan2' %}

### Span Items 6

{% story '@nvidia-elements/styles/layout.stories.json', 'GridSpan6' %}

### Span Item

{% story '@nvidia-elements/styles/layout.stories.json', 'GridVariableSpans' %}

### Align Top

{% story '@nvidia-elements/styles/layout.stories.json', 'GridAlignTop' %}

### Align Vertical Center

{% story '@nvidia-elements/styles/layout.stories.json', 'GridAlignVerticalCenter' %}

### Align Bottom

{% story '@nvidia-elements/styles/layout.stories.json', 'GridAlignBottom' %}

### Align Horizontal Center

{% story '@nvidia-elements/styles/layout.stories.json', 'GridAlignHorizontalCenter' %}

### Align Center

{% story '@nvidia-elements/styles/layout.stories.json', 'GridAlignCenter' %}

### Align Center and Bottom

{% story '@nvidia-elements/styles/layout.stories.json', 'GridAlignCenterAndBottom' %}

### Align Top and Right

{% story '@nvidia-elements/styles/layout.stories.json', 'GridAlignTopAndRight' %}

### Align Center and Right

{% story '@nvidia-elements/styles/layout.stories.json', 'GridAlignCenterAndRight' %}

### Align Bottom and Right

{% story '@nvidia-elements/styles/layout.stories.json', 'GridAlignBottomAndRight' %}

### Align Horizontal Stretch

{% story '@nvidia-elements/styles/layout.stories.json', 'GridAlignHorizontalStretch' %}

### Align Vertical Stretch

{% story '@nvidia-elements/styles/layout.stories.json', 'GridAlignVerticalStretch' %}

### Align Full Stretch

{% story '@nvidia-elements/styles/layout.stories.json', 'GridAlignFullStretch' %}
