---
{
  title: 'Vertical Layout',
  description: 'Stack content along a vertical axis with NVIDIA Elements: alignment, gap, and overflow controls for column layouts.',
  layout: 'docs.11ty.js'
}
---

<style>
  nvd-canvas {
    --padding: none;
    
    section[nve-layout~='column'][nve-layout*='align'] {
      min-height: 320px !important;
    }

    nve-card {
      --background: var(--nve-sys-layer-overlay-background);
      min-height: 60px;
      min-width: 60px;
      width: auto;
    }
  }
</style>

# {{title}}

Vertical layouts provide top-to-bottom content flow that aligns with reading patterns. The Elements vertical layout system uses CSS Flexbox to create stackable layouts that adapt to content and container constraints.

<nve-alert-group>
  <nve-alert style="--align-items: start">
    <nve-icon slot="icon" name="academic-cap"></nve-icon>
    <div nve-text="relaxed">
      Learn flexbox concepts with the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox" target="_blank" nve-text="link">MDN Flexbox guide</a> and practice with this visual <a href="https://flexboxfroggy.com/" target="_blank" nve-text="link">Flexbox Froggy</a> game.
    </div>
  </nve-alert>
</nve-alert-group>

## Understanding Vertical Layout

Vertical flexbox layouts stack content with control over spacing, alignment, and distribution. They provide natural reading flow while supporting the layout requirements of modern interfaces.

## When to Use Vertical Layout

Choose vertical layout (`column`) for:

- **Forms**: Labels above inputs, sections stacked vertically
- **Card content**: Header, body, and footer stacked naturally
- **Sidebars**: Navigation items or widgets stacked vertically
- **Hero sections**: Centered content with title, description, CTA
- **Mobile layouts**: Natural stacking for responsive design
- **Article content**: Paragraphs, images, and headings in sequence
- **Modal dialogs**: Header, content, and actions stacked

<nve-alert-group status="accent">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      <strong>Note:</strong> vertical layouts are inherently mobile-friendly. Content that stacks vertically works naturally on narrow screens, and you can enhance it for larger displays.
    </div>
  </nve-alert>
</nve-alert-group>

## Basic Setup

Set `nve-layout="column"` on a container element to create a vertical layout:

```html
<!-- Simple vertical layout -->
<aside nve-layout="column">
  <h2>Title</h2>
  <p>Content goes here...</p>
  <footer>Published today</footer>
</article>

!-- With gap spacing -->
<form nve-layout="column gap:md">
  <nve-input label="Email">
    <input type="text" placeholder="Email..."/>
  </nve-input>
  <nve-input label="Password" type="password">
    <input type="text" placeholder="Password..."/>
  </nve-input>
  <nve-button>Sign In</nve-button>
</form>

<!-- With alignment -->
<section nve-layout="column align:center gap:xl">
  <nve-logo size="lg"></nve-logo>
  <h1 nve-text="display lg">Welcome</h1>
  <p nve-text="heading sm">Get started with our platform</p>
</section>
```

## Alignment Options

Vertical layouts support alignment along both axes:

### Primary Axis (Vertical)

- `align:top` - Items start from the top (default)
- `align:vertical-center` - Items centered vertically
- `align:bottom` - Items aligned to bottom
- `align:space-between` - Items spread with space between
- `align:space-around` - Items spread with space around
- `align:space-evenly` - Items spread with even spacing

### Cross Axis (Horizontal)

- `align:left` - Items aligned to left
- `align:horizontal-center` - Items centered horizontally
- `align:right` - Items aligned to right
- `align:horizontal-stretch` - Items stretch to container width

### Combined Alignment

- `align:center` - Center both horizontally and vertically
- `align:stretch` - Stretch in both dimensions
- You can combine many values: `align:horizontal-center align:bottom`

<nve-alert-group>
  <nve-alert style="--align-items: start">
    <nve-icon slot="icon" name="academic-cap"></nve-icon>
    <div nve-text="relaxed">
      <strong>Alignment mental model:</strong> in vertical layouts, the main axis runs top-to-bottom and the cross axis runs left-to-right. This reversal from horizontal layouts is key to understanding alignment behavior.
    </div>
  </nve-alert>
</nve-alert-group>

## Vertical Layout Examples

```html
<section nve-layout="column align:...">
```

### Align Top

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignTop' %}

### Align Vertical Center

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignVerticalCenter' %}

### Align Bottom

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignBottom' %}

### Align Horizontal Center

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignHorizontalCenter' %}

### Align Center

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignCenter' %}

### Align Center and Bottom

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignCenterAndBottom' %}

### Align Top and Right

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignTopAndRight' %}

### Align Center and Right

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignCenterAndRight' %}

### Align Bottom and Right

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignBottomAndRight' %}

### Align Space Around

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignSpaceAround' %}

### Align Space Between

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignSpaceBetween' %}

### Align Space Evenly

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignSpaceEvenly' %}

### Align Stretch Horizontal

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignStretchHorizontal' %}

### Align Stretch Vertical

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignStretchVertical' %}

### Align Full Stretch

{% example '@nvidia-elements/styles/layout.examples.json', 'VerticalAlignFullStretch' %}

## Flex Behavior in Vertical Layouts

### Flex Growth

Control how items expand vertically:

```html
<div nve-layout="column full">
  <header>Fixed height header</header>
  <main nve-layout="full">Expands to fill space</main>
  <footer>Fixed height footer</footer>
</div>
```

### Spacing Distribution

Use alignment to control vertical rhythm:

```html
<!-- Equal spacing between items -->
<aside nve-layout="column align:space-between" style="height: 400px;">
  <div>Top item</div>
  <div>Middle item</div>
  <div>Bottom item</div>
</aside>

<!-- Items grouped at top with space at bottom -->
<section nve-layout="column gap:md" style="height: 400px;">
  <div>Item 1</div>
  <div>Item 2</div>
  <div nve-layout="full"></div> <!-- Spacer -->
  <div>Footer item</div>
</section>
```

## Best Practices

1. **Embrace natural flow**: Vertical layouts match reading patterns
2. **Use consistent spacing**: Apply gap values systematically
3. **Consider viewport height**: Use `full` or `vh` units for full-screen layouts
4. **Plan for growth**: Use `flex: 1` to create expandable regions
5. **Test with varied content**: Ensure layouts work with different content lengths

<nve-alert-group status="warning">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      <strong>Performance tip:</strong> when creating scrollable regions, constrain the height of the container rather than relying on max-height. This provides better performance and more predictable behavior.
    </div>
  </nve-alert>
</nve-alert-group>

## Next Steps

- Explore [horizontal layouts](docs/foundations/layout/horizontal/) for side-by-side arrangements
- Learn about [grid layouts](docs/foundations/layout/grid/) for multi-dimensional designs
- Understand [gap](docs/foundations/layout/#gap-spacing) and [padding](docs/foundations/layout/#padding) spacing options
