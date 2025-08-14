---
{
  title: 'Responsive Layout - Container',
  layout: 'docs.11ty.js',
  permalink: 'docs/internal/layout/responsive/container/index.html'
}
---

# {{title}}

<nve-alert-group status="warning">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      This responsive layout module is marked <em>Pre-Release</em> and is not yet ready for consumer adoption, its API is subject to breaking changes.
    </div>
  </nve-alert>
</nve-alert-group>

By optionally importing the responsive container layout module, the `nve-layout` system is extended using [CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/@container) for adaptive responsive design based on the container element's width rather than just the browser width.

<nve-alert-group>
  <nve-alert style="--align-items: start">
    <nve-icon slot="icon" name="academic-cap"></nve-icon>
    <div nve-text="relaxed">
      Learn more about container queries in this Google <a href="https://web.dev/articles/new-responsive#responsive_to_the_container" target="_blank" nve-text="link">web.dev</a> video and article.
    </div>
  </nve-alert>
</nve-alert-group>

The responsive layout API applies conditional styling based on parent element width. Supported features include `gap`, `padding`, `row vs column`, `reversing` flex direction, and varying `grid` structure across defined pixel width breakpoints.

The following set of container `breakpoint-values` are defined as:

- `xs = 160px`
- `sm = 320px`
- `md = 480px`
- `lg = 640px`
- `xl = 800px`
- `xxl = 960px`

The ampersand-based `&breakpoint-size|...` API adds the breakpoint size before the layout modifier.

Conditional gap sizing example: `nve-layout="row &sm|gap:xxxs &md|gap:md &lg|gap:xxl"`. The size value after the `:` corresponds to one of the nine [spacing](docs/foundations/layout/#layout-gap-spacing)/[padding](docs/foundations/layout/#layout-padding) system values.

```html
<div> <!-- This parent div element is the containing element - its width will be queried -->
  <section nve-layout="row &sm|gap:xxs &md|gap:md &lg|gap:xl &xl|gap:xxxl">
    <nve-card></nve-card>
    <nve-card></nve-card>
    <nve-card></nve-card>
    <nve-card></nve-card>
    <nve-card nve-display="&sm|hide"></nve-card>
  </section>
</div>
```

<nve-alert-group status="accent">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      The extra <code>div</code> wrapper explicitly defines the container element for queries. This design keeps the utility minimal — elements with <code>&</code> syntax automatically use their parent as the container without requiring manual container specification.
    </div>
  </nve-alert>
</nve-alert-group>

## Responsive Gap Sizing

The following container query breakpoints are available for gap, replace `...` with one of the 9 gap [spacing](docs/foundations/layout/#layout-gap-spacing) values:

- `&xs|gap:...`
- `&sm|gap:...`
- `&md|gap:...`
- `&lg|gap:...`
- `&xl|gap:...`
- `&xxl|gap:...`

{% story '@nvidia-elements/styles/responsive.stories.json', 'GapResponsive', '{ "inline": false, "resizable": true, "height": "260px" }' %}

## Responsive Padding

The following container query breakpoints are available for padding, replace `...` with one of the 9 padding [padding](docs/foundations/layout/#layout-padding) values:

- `&xs|pad:...`
- `&sm|pad:...`
- `&md|pad:...`
- `&lg|pad:...`
- `&xl|pad:...`
- `&xxl|pad:...`

{% story '@nvidia-elements/styles/responsive.stories.json', 'PadResponsive', '{ "inline": false, "resizable": true, "height": "260px" }' %}

## Breakpoints for Switching Flexbox Layout Direction

The following container query breakpoints are available for swapping flex direction:

### Horizontally

- `&xs|row`
- `&sm|row`
- `&md|row`
- `&lg|row`
- `&xl|row`
- `&xxl|row`

### Vertically

- `&xs|column`
- `&sm|column`
- `&md|column`
- `&lg|column`
- `&xl|column`
- `&xxl|column`

{% story '@nvidia-elements/styles/responsive.stories.json', 'FlexDirectionResponsive', '{ "inline": false, "resizable": true, "height": "360px" }' %}

### Reverse Direction

In addition to the above, you can also use the following syntax for flipping the flex direction:

- `&...|row-reverse`
- `&...|column-reverse`

{% story '@nvidia-elements/styles/responsive.stories.json', 'FlexDirectionReverse', '{ "inline": false, "resizable": true, "height": "425px" }' %}

## Responsive Grid

Grid structure can be varied based on container size using the following syntax with `nve-layout=grid...`:

```html
<section nve-layout="grid gap:md span-items:12 &sm|span-items:6 &md|span-items:4 &lg|span-items:3">
  <nve-logo size="lg" color="green-mint">1</nve-logo>
  <nve-logo size="lg" color="green-mint">2</nve-logo>
  <nve-logo size="lg" color="green-mint">3</nve-logo>
  <nve-logo size="lg" color="green-mint">4</nve-logo>
  <nve-logo size="lg" color="green-mint">5</nve-logo>
  <nve-logo size="lg" color="green-mint">6</nve-logo>
  <nve-logo size="lg" color="green-mint">7</nve-logo>
  <nve-logo size="lg" color="green-mint">8</nve-logo>
</section>
```

Or:

```html
<section nve-layout="grid gap:md">
  <nve-card nve-layout="span-items:12 &sm|span:4 &md|span:6 &lg|span:8"></nve-card>
  <nve-card nve-layout="span-items:12 &sm|span:8 &md|span:6 &lg|span:4"></nve-card>
  <nve-card nve-layout="span-items:12 &sm|span:8 &md|span:6 &lg|span:4"></nve-card>
  <nve-card nve-layout="span-items:12 &sm|span:4 &md|span:6 &lg|span:8"></nve-card>
</section>
```

### Responsive Grid Parent

{% story '@nvidia-elements/styles/responsive.stories.json', 'ResponsiveGrid', '{ "inline": false, "resizable": true, "height": "420px" }' %}

### Responsive Grid Items

{% story '@nvidia-elements/styles/responsive.stories.json', 'ResponsiveGridItems', '{ "inline": false, "resizable": true, "height": "260px" }' %}

## Hiding Elements Based on Container Size

Since hiding elements only affects the display of the element itself and not the layout of its children, we use the `nve-display` attribute for responsive visibility control.

<nve-alert-group status="accent">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      Element visibility (hiding) uses the separate <code>nve-display</code> attribute rather than <code>nve-layout</code>. This distinction exists because visibility control only affects the element itself, while layout properties affect how children are arranged.
    </div>
  </nve-alert>
</nve-alert-group>

The following container query breakpoints are available for hiding:

- `nve-display="hide"`
- `nve-display="&xs|hide"`
- `nve-display="&sm|hide"`
- `nve-display="&md|hide"`
- `nve-display="&lg|hide"`
- `nve-display="&xl|hide"`
- `nve-display="&xxl|hide"`

{% story '@nvidia-elements/styles/responsive.stories.json', 'HideResponsive', '{ "inline": false, "resizable": true, "height": "260px" }' %}

## Summary

The container query responsive system allows elements to adapt based on their container's width using the `&` prefix. Remember:

- **Layout properties** (`gap`, `padding`, `row/column`, `grid`) use `nve-layout`
- **Visibility control** (`hide`/`show`) uses `nve-display`
- Container queries **use the parent element** to establish the container context
- Breakpoints range from `xs` (160px) to `xxl` (960px)

Example combining both:

```html
<div>
  <section nve-layout="row &md|gap:lg">
    <div>Always visible</div>
    <div nve-display="&sm|hide">Hidden when container ≥ 320px</div>
  </section>
</div>
```
