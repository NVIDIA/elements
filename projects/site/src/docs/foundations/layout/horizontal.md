---
{
  title: 'Horizontal Layout',
  layout: 'docs.11ty.js'
}
---

<style>
  nvd-canvas {
    --padding: none;
    
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

Horizontal layouts support common UI patterns like navigation bars and button groups. The Elements horizontal layout system uses CSS Flexbox to create one-dimensional layouts that adapt to content and container constraints.

<nve-alert-group>
  <nve-alert style="--align-items: start">
    <nve-icon slot="icon" name="academic-cap"></nve-icon>
    <div nve-text="relaxed">
      Deep dive into flexbox with the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox" target="_blank" nve-text="link">MDN Flexbox guide</a> and this visual <a href="https://flexboxfroggy.com/" target="_blank" nve-text="link">Flexbox Froggy</a> game.
    </div>
  </nve-alert>
</nve-alert-group>

## Understanding Horizontal Layout

Horizontal flexbox layouts distribute space along a single axis while maintaining alignment control. Unlike grid layouts that manage both dimensions, horizontal layouts focus on arranging items in a row with configurable spacing and alignment.

## When to Use Horizontal Layout

Choose horizontal layout (`row`) for:

- **Navigation bars**: Logo left, menu items right
- **Button groups**: Actions that belong together
- **Toolbars**: Icon buttons with consistent spacing
- **Form controls**: Label and input on the same line
- **Card layouts**: Side-by-side content cards
- **Media objects**: Image with text alongside
- **Split layouts**: Content on one side, actions on the other

<nve-alert-group status="accent">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      <strong>Note:</strong> Horizontal layouts work well for components that need to respond to available space. Items can wrap, stretch, or maintain fixed sizes while the layout handles spacing automatically.
    </div>
  </nve-alert>
</nve-alert-group>

## Basic Setup

Set `nve-layout="row"` on a container element to create a horizontal layout:

```html
<!-- Simple horizontal layout -->
<nav nve-layout="row">
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>

<!-- With gap spacing -->
<div nve-layout="row gap:md">
  <nve-button>Save</nve-button>
  <nve-button>Cancel</nve-button>
</div>

<!-- With alignment -->
<header nve-layout="row align:vertical-center align:space-between">
  <nve-logo></nve-logo>
  <h1>Menu items</h1>
</header>
```

## Alignment Options

Horizontal layouts support alignment along both axes:

### Primary Axis (Horizontal)

- `align:left` - Items start from the left (default)
- `align:horizontal-center` - Items centered horizontally
- `align:right` - Items aligned to the right
- `align:space-between` - Items spread with space between
- `align:space-around` - Items spread with space around
- `align:space-evenly` - Items spread with even spacing

### Cross Axis (Vertical)

- `align:top` - Items aligned to top
- `align:vertical-center` - Items centered vertically
- `align:bottom` - Items aligned to bottom
- `align:vertical-stretch` - Items stretch to container height

### Combined Alignment

- `align:center` - Center both horizontally and vertically
- `align:stretch` - Stretch in both dimensions
- Multiple values can be combined: `align:vertical-center align:right`

### Special Options

- `align:wrap` - Allow items to wrap to multiple lines when needed

<nve-alert-group>
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      <strong>Alignment mental model:</strong> Think of horizontal layouts as having a main axis (left-to-right) and a cross axis (top-to-bottom). This helps predict how alignment values will behave.
    </div>
  </nve-alert>
</nve-alert-group>

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

## Best Practices

1. **Use semantic HTML**: Apply layouts to meaningful elements (`<nav>`, `<header>`, `<section>`)
2. **Let flexbox do the work**: Avoid fixed widths unless necessary
3. **Consider mobile**: Horizontal layouts may need to stack vertically on small screens
4. **Use gap for spacing**: More maintainable than margins on individual items
5. **Combine alignments thoughtfully**: Test how items behave with different content lengths

<nve-alert-group status="warning">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      <strong>Accessibility note:</strong> Ensure logical tab order when using visual reordering with flexbox. Screen readers follow DOM order, not visual order.
    </div>
  </nve-alert>
</nve-alert-group>

## Next Steps

- Explore [vertical layouts](docs/foundations/layout/vertical/) for stacked content
- Learn about [grid layouts](docs/foundations/layout/grid/) for two-dimensional control
- Understand [gap](docs/foundations/layout/#gap-spacing) and [padding](docs/foundations/layout/#padding) spacing options
