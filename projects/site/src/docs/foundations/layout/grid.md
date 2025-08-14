---
{
  title: 'Grid Layout',
  layout: 'docs.11ty.js'
}
---

<style>
  nvd-canvas {
    --padding: none;
    
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

CSS Grid provides two-dimensional control over both rows and columns. The Elements grid system implements CSS Grid through the `nve-layout` API to simplify complex layout creation.

<nve-alert-group>
  <nve-alert style="--align-items: start">
    <nve-icon slot="icon" name="academic-cap"></nve-icon>
    <div nve-text="relaxed">
      Learn more about CSS Grid in the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout" target="_blank" nve-text="link">MDN Grid Layout guide</a>, this comprehensive <a href="https://css-tricks.com/snippets/css/complete-guide-grid/" target="_blank" nve-text="link">CSS-Tricks Grid guide</a>, and practice with the interactive <a href="https://cssgridgarden.com/" target="_blank" nve-text="link">CSS Grid Garden</a> game.
    </div>
  </nve-alert>
</nve-alert-group>

## Understanding Grid Layout

Grid layout creates structured, magazine-style layouts where precise placement and alignment matter. Unlike flexbox which is primarily one-dimensional, grid provides control over both dimensions simultaneously.

The Elements grid system is based on a **12-column layout**, a standard approach that provides flexibility for common design patterns.

## When to Use Grid

Choose grid layout when you need:

- **Multi-column layouts**: Dashboards, card galleries, product listings
- **Precise alignment**: Forms with labels and inputs, data tables
- **Complex page structures**: Magazine layouts, image galleries with captions
- **Responsive design**: Layouts that reflow based on available space
- **Overlapping elements**: Layered designs with precise positioning

<nve-alert-group status="accent">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      <strong>Grid vs Flexbox:</strong> Use grid when you need to control both rows <em>and</em> columns. Use flexbox for one-dimensional layouts (either row <em>or</em> column). Both systems can be combined – use grid for overall page structure and flexbox for component internals.
    </div>
  </nve-alert>
</nve-alert-group>

## Basic Grid Setup

Set `nve-layout="grid"` on a container element and control child element sizing through either:

1. **Parent-controlled sizing** with `span-items:...` (all children same width)
2. **Child-controlled sizing** with individual `span:...` values (flexible widths)

```html
<!-- Parent controls all children to span 4 columns (3 per row) -->
<section nve-layout="grid gap:md span-items:4">
  <nve-card>Card 1</nve-card>
  <nve-card>Card 2</nve-card>
  <nve-card>Card 3</nve-card>
  <nve-card>Card 4</nve-card>
</section>

<!-- Children control their own spans for varied layouts -->
<section nve-layout="grid gap:md">
  <nve-card nve-layout="span:8">Wide content</nve-card>
  <nve-card nve-layout="span:4">Sidebar</nve-card>
  <nve-card nve-layout="span:6">Half width</nve-card>
  <nve-card nve-layout="span:6">Half width</nve-card>
</section>
```

## Column Spanning

The 12-column system offers these common patterns:

- **Full width**: `span:12` (1 item per row)
- **Half width**: `span:6` (2 items per row)
- **Thirds**: `span:4` (3 items per row)
- **Quarters**: `span:3` (4 items per row)
- **Sixths**: `span:2` (6 items per row)
- **Twelfths**: `span:1` (12 items per row)

## Grid Alignment

Similar to flexbox layouts, grid supports comprehensive alignment options that control how items are positioned within the grid container:

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

<nve-alert-group>
  <nve-alert style="--align-items: start">
    <nve-icon slot="icon" name="academic-cap"></nve-icon>
    <div nve-text="relaxed">
       Grid alignment works on the entire grid container. For individual item alignment, consider wrapping items in flexbox containers or using CSS custom properties for fine-tuned control. See the <a href="#child-controlled-spans-vs-parent-controlled-spans">child-controlled spans section</a> for more granular layout control options.
    </div>
  </nve-alert>
</nve-alert-group>

## Grid Layout Examples

### Span Items 2

{% story '@nvidia-elements/styles/layout.stories.json', 'GridSpan2' %}

### Span Items 6

{% story '@nvidia-elements/styles/layout.stories.json', 'GridSpan6' %}

## Child-controlled Spans vs Parent-controlled Spans

The Elements grid system offers two approaches for controlling column spans, each suited to different design needs:

### When to Use Parent-controlled Spans (`span-items`)

Use `span-items` on the grid container when:

- **Uniform layouts**: All items should have the same width
- **Gallery grids**: Photo galleries, card grids, or product listings
- **Predictable patterns**: Dashboard widgets, metric cards, or feature boxes
- **Simplified markup**: You want cleaner HTML without span attributes on each child
- **Dynamic content**: When items are generated dynamically and should maintain consistent sizing

```html
<!-- All children automatically span 4 columns (3 per row) -->
<section nve-layout="grid gap:md span-items:4">
  <nve-card>Feature 1</nve-card>
  <nve-card>Feature 2</nve-card>
  <nve-card>Feature 3</nve-card>
  <!-- Add more cards - they'll all be the same size -->
</section>
```

### When to Use Child-controlled Spans (`span`)

Use individual `span` attributes on grid items when:

- **Mixed layouts**: Different items need different widths
- **Editorial designs**: Magazine-style layouts with varied content sizes
- **Form layouts**: Labels, inputs, and buttons of different widths
- **Asymmetric designs**: Sidebars, main content areas, and feature blocks
- **Precise control**: Each element needs specific column spanning

```html
<!-- Each child controls its own width -->
<section nve-layout="grid gap:md">
  <header nve-layout="span:12">Full-width header</header>
  <nav nve-layout="span:3">Narrow sidebar</nav>
  <main nve-layout="span:9">Wide content area</main>
  <footer nve-layout="span:12">Full-width footer</footer>
</section>
```

### Combining Both Approaches

You can mix both approaches for maximum flexibility. Items with explicit `span` values will override the parent's `span-items` setting:

```html
<!-- Most items span 4 columns, but some override -->
<section nve-layout="grid gap:md span-items:4">
  <nve-card>Standard width</nve-card>
  <nve-card>Standard width</nve-card>
  <nve-card nve-layout="span:12">Full width featured item</nve-card>
  <nve-card>Standard width</nve-card>
  <nve-card>Standard width</nve-card>
</section>
```

### Performance Considerations

- **Parent-controlled** (`span-items`): More efficient for large grids with uniform items
- **Child-controlled** (`span`): Better for complex layouts with specific requirements
- **Mixed approach**: Use sparingly to maintain code clarity

### Child-controlled Spans Example

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

## Common Grid Patterns

### Dashboard Layout

```html
<main nve-layout="grid gap:lg">
  <!-- Header spans full width -->
  <header nve-layout="span:12">
    <h1>Dashboard</h1>
  </header>

  <!-- Metrics cards in quarters -->
  <nve-card nve-layout="span:3">Metric 1</nve-card>
  <nve-card nve-layout="span:3">Metric 2</nve-card>
  <nve-card nve-layout="span:3">Metric 3</nve-card>
  <nve-card nve-layout="span:3">Metric 4</nve-card>

  <!-- Main content with sidebar -->
  <section nve-layout="span:8">Main Content</section>
  <aside nve-layout="span:4">Sidebar</aside>
</main>
```

### Form Layout

```html
<form nve-layout="grid gap:md">
  <!-- Full width fields -->
  <nve-input nve-layout="span:12" label="Email">
    <input type="email" placeholder="Email" />
  </nve-input>

  <!-- Half width fields -->
  <nve-input nve-layout="span:6" label="First Name">
    <input type="text" placeholder="First Name" />
  </nve-input>
  <nve-input nve-layout="span:6" label="Last Name">
    <input type="text" placeholder="Last Name" />
  </nve-input>

  <!-- Third width fields -->
  <nve-input nve-layout="span:4" label="City">
    <input type="text" placeholder="City" />
  </nve-input>
  <nve-select nve-layout="span:4" label="State">
    <select>
      <option value selected disabled hidden>Select State</option>
    </select>
  </nve-select>
  <nve-input nve-layout="span:4" label="Zip">
    <input type="text" placeholder="Zip" />
  </nve-input>
</form>
```

### Card Gallery

```html
<section nve-layout="grid gap:lg span-items:4 align:stretch">
  <nve-card>
    <nve-card-header>Feature 1</nve-card-header>
    <nve-card-content>Description</nve-card-content>
  </nve-card>
  <!-- More cards... -->
</section>
```

## Best Practices

1. **Start with 12 columns**: This provides flexibility for responsive design patterns
2. **Use semantic HTML**: Apply grid to meaningful containers like `<main>`, `<section>`, `<nav>`
3. **Consistent gaps**: Use standard gap spacing throughout your layout
4. **Plan for responsiveness**: Consider how your grid will adapt on smaller screens
5. **Combine with flexbox**: Use grid for layout structure, flexbox for component details

<nve-alert-group status="warning">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      <strong>Browser Support:</strong> CSS Grid is supported in all modern browsers. For older browser support, ensure you have appropriate fallbacks or polyfills in place.
    </div>
  </nve-alert>
</nve-alert-group>

## Next Steps

- Explore [horizontal](docs/foundations/layout/horizontal/) and [vertical](docs/foundations/layout/vertical/) layouts for simpler needs
- Learn about [gap spacing](docs/foundations/layout/#gap-spacing) and [padding](docs/foundations/layout/#padding) options
