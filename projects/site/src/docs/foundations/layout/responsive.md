---
{
  title: 'Responsive Layout',
  layout: 'docs.11ty.js',
  permalink: 'docs/internal/layout-responsive/index.html',
}
---

<style>
  nve-card {
    --background: var(--nve-sys-layer-overlay-background);
    min-height: 60px;
    min-width: 60px;
  }
</style>

<nve-badge container="flat" status="warning">Pre-Release</nve-badge>

# {{title}}

Fluid page layouts are achieved through the abstracted CSS flexbox and grid APIs, allowing pages built with Elements `nve-layout` attributes to automatically grow and shrink with the browser viewport width.

By optionally importing the responsive layout module, this system is extended using [CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/@container) for adaptive responsive design based on the container element's width rather than just the browser width.

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn more about container queries in this Google <a href="https://web.dev/articles/new-responsive#using_container_queries_today" target="_blank" nve-text="link">web.dev</a> video and article.</nve-alert>

The responsive layout API applies conditional styling based on parent element width. Supported features include `gap`, `padding`, `row vs column`, `reversing` flex direction, varying `grid` structure and `hiding / showing` content across defined pixel width breakpoints.

The following set of container `breakpoint-values` are defined as:

- `xs = 160px`
- `sm = 320px`
- `md = 480px`
- `lg = 640px`
- `xl = 800px`
- `xxl = 960px`
- `xxxl = 1200px`

The ampersand-based `&breakpoint-size|...` API adds the breakpoint size before the layout modifier.

Conditional gap sizing example: `nve-layout="row &sm|gap:xxxs &md|gap:md &lg|gap:xxxl"`. The size value after the `:` corresponds to one of the nine [spacing](docs/foundations/layout/#layout-gap-spacing)/[padding](docs/foundations/layout/#layout-padding) system values.

```html
<div>
  <section nve-layout="row &sm|gap:xxs &md|gap:md &lg|gap:xl &xl|gap:xxxl">
    <nve-card></nve-card>
    <nve-card></nve-card>
    <nve-card></nve-card>
    <nve-card></nve-card>
    <nve-card nve-layout="&sm|hide"></nve-card>
  </section>
</div>
```

<nve-alert status="accent">
  Note the inclusion of an extra `div` element wrapping the `nve-layout` element to ensure the parent element that receives the container query not the page.
 </nve-alert>

## Responsive Gap Sizing

The following container query breakpoints are available for gap, replace `...` with one of the 9 gap [spacing](docs/foundations/layout/#layout-gap-spacing) values:

- `&xs|gap:...`
- `&sm|gap:...`
- `&md|gap:...`
- `&lg|gap:...`
- `&xl|gap:...`
- `&xxl|gap:...`
- `&xxxl|gap:...`

{% story '@nvidia-elements/styles/responsive.stories.json', 'GapResponsive', '{ "inline": false, "resizable": true, "height": "400px" }' %}

## Responsive Padding

The following container query breakpoints are available for padding, replace `...` with one of the 9 padding [padding](docs/foundations/layout/#layout-padding) values:

- `&xs|pad:...`
- `&sm|pad:...`
- `&md|pad:...`
- `&lg|pad:...`
- `&xl|pad:...`
- `&xxl|pad:...`
- `&xxxl|pad:...`

{% story '@nvidia-elements/styles/responsive.stories.json', 'PadResponsive', '{ "inline": false, "resizable": true, "height": "400px" }' %}

## Hiding Elements Based on Container Size

The following container query breakpoints are available for hiding:

- `hide`
- `&xs|hide`
- `&sm|hide`
- `&md|hide`
- `&lg|hide`
- `&xl|hide`
- `&xxl|hide`
- `&xxxl|hide`

Element hiding can be reversed using the `show` attribute:

- `&xs|show`
- `&sm|show`
- `&md|show`
- `&lg|show`
- `&xl|show`
- `&xxl|show`
- `&xxxl|show`

**Note: This responsive layout system is _minimum width based_ using a mobile-first approach.
Combine `&hide|` and `&show|` attributes to hide elements at smaller container sizes.**

The `&show|...` attribute will reverse setting of `display: none` back to `display: initial`.

{% story '@nvidia-elements/styles/responsive.stories.json', 'HideResponsive', '{ "inline": false, "resizable": true, "height": "400px" }' %}

## Breakpoints for Switching Flexbox Layout Direction

The following container query breakpoints are available for swapping flex direction:

### Horizontally

- `&xs|row`
- `&sm|row`
- `&md|row`
- `&lg|row`
- `&xl|row`
- `&xxl|row`
- `&xxxl|row`

### Vertically

- `&xs|column`
- `&sm|column`
- `&md|column`
- `&lg|column`
- `&xl|column`
- `&xxl|column`
- `&xxxl|column`

{% story '@nvidia-elements/styles/responsive.stories.json', 'FlexDirectionResponsive', '{ "inline": false, "resizable": true, "height": "400px" }' %}

In addition to the above, you can also use the following syntax for flipping the flex direction:

- `&...|row-reverse`
- `&...|column-reverse`

{% story '@nvidia-elements/styles/responsive.stories.json', 'FlexDirectionReverse', '{ "inline": false, "resizable": true, "height": "400px" }' %}

## Responsive Grid

Grid structure can be varied based on container size using the following syntax with `nve-layout=grid...`:

```html
<section nve-layout="grid gap:md span-items:12 &sm|span-items:6 &md|span-items:4 &lg|span-items:3">
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
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

{% story '@nvidia-elements/styles/responsive.stories.json', 'ResponsiveGrid', '{ "inline": false, "resizable": true, "height": "400px" }' %}

### Responsive Grid Items

{% story '@nvidia-elements/styles/responsive.stories.json', 'ResponsiveGridItems', '{ "inline": false, "resizable": true, "height": "400px" }' %}
