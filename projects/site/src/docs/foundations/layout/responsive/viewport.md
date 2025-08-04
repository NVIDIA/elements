---
{
  title: 'Responsive Layout - Viewport',
  layout: 'docs.11ty.js',
  permalink: 'docs/internal/layout/responsive/viewport/index.html'
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

By optionally importing the responsive viewport layout module, the `nve-layout` this system is extended using [CSS Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/@media) for adaptive responsive design based on the browser viewport width rather than the container element's width.

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn more about media queries in this Mozilla <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media" target="_blank" nve-text="link">MDN</a> documentation.</nve-alert>

The responsive layout API applies conditional styling based on browser viewport width. Supported features include `gap`, `padding`, `row vs column`, `reversing` flex direction, varying `grid` structure and `hiding / showing` content across defined pixel width breakpoints.

The following set of viewport `breakpoint-values` are defined as:

- `sm = 576px`
- `md = 768px`
- `lg = 1024px`
- `xl = 1280px`
- `xxl = 1440px`

The at-symbol-based `@breakpoint-size|...` API adds the breakpoint size before the layout modifier.

Conditional gap sizing example: `nve-layout="row @sm|gap:xxxs @md|gap:md @lg|gap:xxxl"`. The size value after the `:` corresponds to one of the nine [spacing](docs/foundations/layout/#layout-gap-spacing)/[padding](docs/foundations/layout/#layout-padding) system values.

```html
<section nve-layout="row @sm|gap:xxs @md|gap:md @lg|gap:xl @xl|gap:xxxl">
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card></nve-card>
  <nve-card nve-layout="@sm|hide"></nve-card>
</section>
```

<nve-alert status="accent">
  Note that viewport-based responsive layout responds to the browser window size, not the container size. Use <a href="docs/internal/layout/responsive/container/" nve-text="link">Container Queries</a> if you need container-aware responsive behavior.
</nve-alert>

## Responsive Gap Sizing

The following media query breakpoints are available for gap, replace `...` with one of the 9 gap [spacing](docs/foundations/layout/#layout-gap-spacing) values:

- `@sm|gap:...`
- `@md|gap:...`
- `@lg|gap:...`
- `@xl|gap:...`
- `@xxl|gap:...`

{% story '@nvidia-elements/styles/responsive.stories.json', 'ViewportGapResponsive', '{ "inline": false, "resizable": true, "height": "260px" }' %}

## Responsive Padding

The following media query breakpoints are available for padding, replace `...` with one of the 9 padding [padding](docs/foundations/layout/#layout-padding) values:

- `@sm|pad:...`
- `@md|pad:...`
- `@lg|pad:...`
- `@xl|pad:...`
- `@xxl|pad:...`

{% story '@nvidia-elements/styles/responsive.stories.json', 'ViewportPadResponsive', '{ "inline": false, "resizable": true, "height": "260px" }' %}

## Hiding Elements Based on Viewport Size

The following media query breakpoints are available for hiding:

- `hide`
- `@sm|hide`
- `@md|hide`
- `@lg|hide`
- `@xl|hide`
- `@xxl|hide`

Element hiding can be reversed using the `show` attribute:

- `@sm|show`
- `@md|show`
- `@lg|show`
- `@xl|show`
- `@xxl|show`

**Note: This responsive layout system is _minimum width based_ using a mobile-first approach.
Combine `hide` and `@show|` attributes to have elements hidden by default and display at larger viewport sizes.**

The `@show|...` attribute will reverse setting of `display: none` back to `display: initial`.

{% story '@nvidia-elements/styles/responsive.stories.json', 'ViewportHideResponsive', '{ "inline": false, "resizable": true, "height": "260px" }' %}

## Breakpoints for Switching Flexbox Layout Direction

The following media query breakpoints are available for swapping flex direction:

### Horizontally

- `@sm|row`
- `@md|row`
- `@lg|row`
- `@xl|row`
- `@xxl|row`

### Vertically

- `@sm|column`
- `@md|column`
- `@lg|column`
- `@xl|column`
- `@xxl|column`

{% story '@nvidia-elements/styles/responsive.stories.json', 'ViewportFlexDirectionResponsive', '{ "inline": false, "resizable": true, "height": "360px" }' %}

### Reverse Direction

In addition to the above, you can also use the following syntax for flipping the flex direction:

- `@...|row-reverse`
- `@...|column-reverse`

{% story '@nvidia-elements/styles/responsive.stories.json', 'ViewportFlexDirectionReverse', '{ "inline": false, "resizable": true, "height": "425px" }' %}

## Responsive Grid

Grid structure can be varied based on viewport size using the following syntax with `nve-layout=grid...`:

```html
<section nve-layout="grid gap:md span-items:12 @sm|span-items:6 @md|span-items:4 @lg|span-items:3">
  <nve-logo size="lg" color="blue-cobalt">1</nve-logo>
  <nve-logo size="lg" color="blue-cobalt">2</nve-logo>
  <nve-logo size="lg" color="blue-cobalt">3</nve-logo>
  <nve-logo size="lg" color="blue-cobalt">4</nve-logo>
  <nve-logo size="lg" color="blue-cobalt">5</nve-logo>
  <nve-logo size="lg" color="blue-cobalt">6</nve-logo>
  <nve-logo size="lg" color="blue-cobalt">7</nve-logo>
  <nve-logo size="lg" color="blue-cobalt">8</nve-logo>
</section>
```

Or:

```html
<section nve-layout="grid gap:md">
  <nve-card nve-layout="span-items:12 @sm|span:4 @md|span:6 @lg|span:8"></nve-card>
  <nve-card nve-layout="span-items:12 @sm|span:8 @md|span:6 @lg|span:4"></nve-card>
  <nve-card nve-layout="span-items:12 @sm|span:8 @md|span:6 @lg|span:4"></nve-card>
  <nve-card nve-layout="span-items:12 @sm|span:4 @md|span:6 @lg|span:8"></nve-card>
</section>
```

### Responsive Grid Parent

{% story '@nvidia-elements/styles/responsive.stories.json', 'ViewportResponsiveGrid', '{ "inline": false, "resizable": true, "height": "420px" }' %}

### Responsive Grid Items

{% story '@nvidia-elements/styles/responsive.stories.json', 'ViewportResponsiveGridItems', '{ "inline": false, "resizable": true, "height": "260px" }' %}
