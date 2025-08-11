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

The Elements layout system provides a declarative approach to creating layouts using CSS flexbox and grid. This system enables complex, adaptive layouts with minimal markup and custom CSS.

<nve-alert-group>
  <nve-alert>
    <nve-icon slot="icon">🎓</nve-icon> Learn more about CSS layout fundamentals in the <a href="https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout" target="_blank" nve-text="link">MDN CSS Layout guide</a> and <a href="https://css-tricks.com/snippets/css/a-guide-to-flexbox/" target="_blank" nve-text="link">CSS-Tricks Flexbox guide</a>.
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
  <nve-alert>
    <nve-icon slot="icon">💡</nve-icon> The base layout system provides static layouts. For responsive behavior, additional modules will be made available for container and viewport breakpoint-based responsive design.
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
      <strong>Important:</strong> Elements components are built using Web Components with Shadow DOM encapsulation. Many components manage their own internal layout, for example: <code>nve-card</code> components have built-in layout for <code>nve-card-header</code>, <code>nve-card-content</code>, and <code>nve-card-footer</code>. Applying <code>nve-layout</code> directly to these components may not work as expected due to Shadow DOM boundaries. 
    </div>
  </nve-alert>
</nve-alert-group>

The `nve-layout` attribute is designed to be applied to **native HTML elements** rather than Elements components. Use semantic HTML elements like `<section>`, `<main>`, `<nav>`, `<aside>`, or generic containers like `<div>` as your layout containers. Similarly, [form components have built-in layout capabilities](/elements/docs/foundations/forms/#form-layouts).

For more details, see our documentation on the [internal-host pattern](/elements/docs/api-design/styles/#internal-host) and [slots](/elements/docs/api-design/slots/) which is used in the development of our library, as well as [MDN docs](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) on the Shadow DOM.

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

<nve-alert-group>
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      <strong>Tip:</strong> Gap affects space <em>between</em> child elements, while padding affects space <em>inside</em> the container. Use gap for consistent spacing between items and padding for breathing room around content.
    </div>
  </nve-alert>
</nve-alert-group>

## Full width/height on container

For convenience a `full` option can be set to give the container 100% width & height. This is often useful for giving the root element of a page full height.

```html
<section nve-layout="full">
```

{% story '@nvidia-elements/styles/layout.stories.json', 'Full' %}

## Layout Composition

Layout attributes can be composed to create sophisticated designs:

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

<nve-alert-group status="warning">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      <strong>Performance Note:</strong> While the layout system is highly optimized, avoid deeply nested layouts when simpler structures suffice. Modern browsers handle flexbox and grid efficiently, but excessive nesting can impact performance on lower-end devices.
    </div>
  </nve-alert>
</nve-alert-group>

## Next Steps

- Explore [Horizontal Layouts](docs/foundations/layout/horizontal/) for side-by-side arrangements
- Learn about [Vertical Layouts](docs/foundations/layout/vertical/) for stacked content
- Understand [Grid Layouts](docs/foundations/layout/grid/) for multi-dimensional designs
