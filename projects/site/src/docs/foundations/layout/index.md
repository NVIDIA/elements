---
{
  title: 'Layout',
  description: 'Layout primitives in NVIDIA Elements: utilities for horizontal, vertical, and grid arrangements that scale across viewports.',
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

The Elements layout system provides a declarative approach to creating layouts using CSS flexbox and grid. This system enables complex, adaptive layouts with minimal markup and custom CSS.

<nve-alert-group>
  <nve-alert style="--align-items: start">
    <nve-icon slot="icon" name="academic-cap"></nve-icon>
    <div nve-text="relaxed">
      Learn more about CSS layout fundamentals in the <a href="https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout" target="_blank" nve-text="link">MDN CSS Layout guide</a> and <a href="https://css-tricks.com/snippets/css/a-guide-to-flexbox/" target="_blank" nve-text="link">CSS-Tricks Flexbox guide</a>.
    </div>
  </nve-alert>
</nve-alert-group>

## Installation

The layout system is part of the core Elements styles package:

```shell
npm install @nvidia-elements/styles @nvidia-elements/themes
```

```css
/* Import the layout CSS into your project */
@import '@nvidia-elements/styles/dist/layout.css';
```

<nve-alert-group status="accent">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      The base layout system provides static layouts. For responsive behavior, the team plans extra modules for container and viewport breakpoint-based responsive design.
    </div>
  </nve-alert>
</nve-alert-group>

## Layout System Overview

The `nve-layout` attribute provides a unified API for three layout modes:

- **[Horizontal Layout](docs/foundations/layout/horizontal/)** (`row`): Flexbox-based horizontal arrangements
- **[Vertical Layout](docs/foundations/layout/vertical/)** (`column`): Flexbox-based vertical stacking
- **[Grid Layout](docs/foundations/layout/grid/)** (`grid`): CSS Grid-based multi-dimensional layouts

Each layout mode supports spacing, alignment, and responsive behavior through a consistent syntax.

```html
<!-- Simple horizontal layout with spacing -->
<div nve-layout="row gap:sm">
  <nve-button>Save</nve-button>
  <nve-button>Cancel</nve-button>
  <nve-button>Delete</nve-button>
</div>

<!-- Centered vertical layout with padding -->
<section nve-layout="column gap:md pad:lg align:center">
  <h2>Welcome</h2>
  <p>Create beautiful layouts with ease</p>
  <nve-button>Get Started</nve-button>
</section>

<!-- Responsive grid layout using semantic HTML -->
<section nve-layout="grid gap:md span-items:3 pad:xl">
  <nve-card>Feature 1</nve-card>
  <nve-card>Feature 2</nve-card>
  <nve-card>Feature 3</nve-card>
</section>
```

## Apply Layout to Native HTML Elements

<nve-alert-group status="warning">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      Elements components use Web Components with Shadow DOM encapsulation. Many components manage their own internal layout, for example: <code>nve-card</code> components have built-in layout for <code>nve-card-header</code>, <code>nve-card-content</code>, and <code>nve-card-footer</code>. Applying <code>nve-layout</code> directly to these components may not work as expected due to Shadow DOM boundaries.
    </div>
  </nve-alert>
</nve-alert-group>

Apply the `nve-layout` attribute to **native HTML elements** rather than Elements components. Use semantic HTML elements like `<section>`, `<main>`, `<nav>`, `<aside>`, or generic containers like `<div>` as your layout containers. Similarly, [form components have built-in layout capabilities](/elements/docs/elements/forms/#form-layouts).

For more details, see the documentation on the [internal-host pattern](/elements/docs/api-design/styles/#internal-host) and [slots](/elements/docs/api-design/slots/) which the library uses in development, as well as [MDN docs](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) on the Shadow DOM.

```html
<!-- ✓ Correct: Apply to native HTML elements -->
<section nve-layout="row gap:md">
  <nve-card>Card 1</nve-card>
  <nve-card>Card 2</nve-card>
</section>

<!-- ✗ Incorrect: Don't apply directly to Elements components -->
<nve-card nve-layout="row gap:md">
  Content...
</nve-card>
```

## When to Use Each Layout Type

### Use Horizontal Layout (`row`) when:

- Arranging items side-by-side (navigation bars, button groups, toolbars)
- Creating inline forms or control groups
- Building card layouts that flow horizontally
- Aligning items along a single horizontal axis

### Use Vertical Layout (`column`) when:

- Stacking content vertically (forms, card content, sidebars)
- Creating centered hero sections or landing pages
- Building mobile-first layouts that stack naturally
- Organizing content in a top-to-bottom flow

### Use Grid Layout (`grid`) when:

- Creating multi-column layouts (dashboards, galleries)
- Building complex page structures with precise control
- Implementing magazine-style layouts
- Needing both row and column control simultaneously

## Core Features

The layout system provides consistent features across all layout types:

## Gap Spacing

Control the space between elements using t-shirt sizing values that maintain visual consistency:

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

{% example '@nvidia-elements/styles/layout.examples.json', 'GapXxxs' %}

### Gap xxs

{% example '@nvidia-elements/styles/layout.examples.json', 'GapXxs' %}

### Gap xs

{% example '@nvidia-elements/styles/layout.examples.json', 'GapXs' %}

### Gap sm

{% example '@nvidia-elements/styles/layout.examples.json', 'GapSm' %}

### Gap md

{% example '@nvidia-elements/styles/layout.examples.json', 'GapMd' %}

### Gap lg

{% example '@nvidia-elements/styles/layout.examples.json', 'GapLg' %}

### Gap xl

{% example '@nvidia-elements/styles/layout.examples.json', 'GapXl' %}

### Gap xxl

{% example '@nvidia-elements/styles/layout.examples.json', 'GapXxl' %}

### Gap xxxl

{% example '@nvidia-elements/styles/layout.examples.json', 'GapXxxl' %}

### No Gap

{% example '@nvidia-elements/styles/layout.examples.json', 'GapNone' %}

## Padding

Add internal spacing to containers using the same t-shirt sizing system:

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

By default padding applies to all 4 sides of container, to specify padding on a single side use:

- `pad-top:md`
- `pad-right:md`
- `pad-bottom:md`
- `pad-left:md`

Or use the short hand to just pad the x and y axes.

- `pad-x:md`
- `pad-y:md`

```html
<section nve-layout="row pad-left:md">
```

### Padding Top

{% example '@nvidia-elements/styles/layout.examples.json', 'PadTop' %}

### Padding Left

{% example '@nvidia-elements/styles/layout.examples.json', 'PadLeft' %}

### Padding Right

{% example '@nvidia-elements/styles/layout.examples.json', 'PadRight' %}

### Padding Bottom

{% example '@nvidia-elements/styles/layout.examples.json', 'PadBottom' %}

### Padding X

{% example '@nvidia-elements/styles/layout.examples.json', 'PadX' %}

### Padding Y

{% example '@nvidia-elements/styles/layout.examples.json', 'PadY' %}

### Padding xxxs

{% example '@nvidia-elements/styles/layout.examples.json', 'PadXxxs' %}

### Padding xxs

{% example '@nvidia-elements/styles/layout.examples.json', 'PadXxs' %}

### Padding xs

{% example '@nvidia-elements/styles/layout.examples.json', 'PadXs' %}

### Padding sm

{% example '@nvidia-elements/styles/layout.examples.json', 'PadSm' %}

### Padding md

{% example '@nvidia-elements/styles/layout.examples.json', 'PadMd' %}

### Padding lg

{% example '@nvidia-elements/styles/layout.examples.json', 'PadLg' %}

### Padding xl

{% example '@nvidia-elements/styles/layout.examples.json', 'PadXl' %}

### Padding xxl

{% example '@nvidia-elements/styles/layout.examples.json', 'PadXxl' %}

### Padding xxxl

{% example '@nvidia-elements/styles/layout.examples.json', 'PadXxxl' %}

### No Padding

{% example '@nvidia-elements/styles/layout.examples.json', 'PadNone' %}

<nve-alert-group>
  <nve-alert style="--align-items: start">
    <nve-icon slot="icon" name="academic-cap"></nve-icon>
    <div nve-text="relaxed">
      Gap affects space <em>between</em> child elements, while padding affects space <em>inside</em> the container. Use gap for consistent spacing between items and padding for breathing room around content.
    </div>
  </nve-alert>
</nve-alert-group>

## Full width/height on container

For convenience you can set a `full` option to give the container 100% width & height. This is often useful for giving the root element of a page full height.

```html
<section nve-layout="full">
```

{% example '@nvidia-elements/styles/layout.examples.json', 'Full' %}

## Layout Composition

You can compose layout attributes to create sophisticated designs:

```html
<!-- Centered hero section with vertical layout -->
<section nve-layout="column gap:lg pad:xxxl align:center full">
  <nve-logo size="xl"></nve-logo>
  <h1 nve-text="heading xl">Build Faster</h1>
  <p nve-text="lg muted">Create stunning layouts without writing CSS</p>
  <div nve-layout="row gap:sm">
    <nve-button variant="primary">Start Building</nve-button>
    <nve-button>Learn More</nve-button>
  </div>
</section>

<!-- Complex dashboard layout using semantic HTML -->
<div nve-layout="row gap:md pad:lg align:horizontal-stretch full">
  <aside style="width: 250px">
    <nve-panel expanded>
      <nve-panel-header>
        <div slot="title">Navigation menu</div>
      </nve-panel-header>
      <nve-panel-content>
        User profile
      </nve-panel-content>
    </nve-panel>
  </aside>

  <main nve-layout="column gap:lg pad:xl">
    <header nve-layout="row gap:md align:vertical-center align:space-between">
      <h1>Dashboard</h1>
      <nve-button>Settings</nve-button>
    </header>

    <section nve-layout="grid gap:md span-items:3">
      <nve-card>Metric 1</nve-card>
      <nve-card>Metric 2</nve-card>
      <nve-card>Metric 3</nve-card>
    </section>
  </main>
</div>
```

## Best Practices

1. **Apply to native HTML**: Use `nve-layout` on HTML elements, not Elements components
2. **Start with semantic HTML**: Use appropriate elements (`<nav>`, `<main>`, `<aside>`) with layout attributes
3. **Mobile-first approach**: Design for narrow screens first, then enhance for larger displays
4. **Consistent spacing**: Use the t-shirt sizing system rather than custom values
5. **Combine thoughtfully**: Layer layout attributes to achieve complex designs
6. **Test responsively**: Ensure layouts work across all device sizes

<nve-alert-group status="accent">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      While the layout system is highly optimized, avoid deeply nested layouts when simpler structures suffice. Modern browsers handle flexbox and grid efficiently, but excessive nesting can impact performance on lower-end devices.
    </div>
  </nve-alert>
</nve-alert-group>

## Next Steps

- Explore [Horizontal Layouts](docs/foundations/layout/horizontal/) for side-by-side arrangements
- Learn about [Vertical Layouts](docs/foundations/layout/vertical/) for stacked content
- Understand [Grid Layouts](docs/foundations/layout/grid/) for multi-dimensional designs
