---
{
  title: 'Layout Responsive',
  layout: 'docs.11ty.js'
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

You may be able to achieve fluid page layouts by simply leveraging the abstracted `flexbox` and `grid` APIs. You will notice that pages built with Elements `nve-layout` attributes will result in pages that grow and shrink with respect to browser viewport width.

However, we introduced an additional responsive layout module to our system that leverages [CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/@container) for even more adaptive responsive design, based on the width of container elements rather than just browser width.

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn more about container queries in this Google <a href="https://web.dev/articles/new-responsive#using_container_queries_today" target="_blank" nve-text="link">web.dev</a> video and article.</nve-alert>

This addition to the layout API gives you the ability to apply conditional layout styling based on the width of the parent element containing an element with `nve-layout` attributes. Currently it supports `gap`, `padding`, `row vs column`, `reversing` flex direction, varying `grid` structure and `hiding / showing` content across the following pixel width breakpoints.

The following set of container `breakpoint-values` are defined as:

- `xs = 160px`
- `sm = 320px`
- `md = 480px`
- `lg = 640px`
- `xl = 800px`
- `2xl = 960px`
- `3xl = 1200px`

The ampersand based `&breakpoint-size|...` API is introduced, where the breakpoint size is added before the layout modifier.

For example, you can add conditional based gap sizing using `nve-layout="row &sm|gap:xxxs &md|gap:md &lg|gap:xxxl"`. The size value after the `:` is one of the nine size values for the [spacing](./?path=/docs/foundations-layout-documentation--docs&anchor=layout-gap-spacing)/[padding](./?path=/docs/foundations-layout-documentation--docs&anchor=layout-padding) system.

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

The following container query breakpoints are available for gap, replace `...` with one of the 9 gap [spacing](./?path=/docs/foundations-layout-documentation--docs&anchor=layout-gap-spacing) values:

- `&xs|gap:...`
- `&sm|gap:...`
- `&md|gap:...`
- `&lg|gap:...`
- `&xl|gap:...`
- `&2xl|gap:...`
- `&3xl|gap:...`

{% story '@nvidia-elements/styles/responsive.stories.json', 'GapResponsive' %}

## Responsive Padding

The following container query breakpoints are available for padding, replace `...` with one of the 9 padding [padding](./?path=/docs/foundations-layout-documentation--docs&anchor=layout-padding) values:

- `&xs|pad:...`
- `&sm|pad:...`
- `&md|pad:...`
- `&lg|pad:...`
- `&xl|pad:...`
- `&2xl|pad:...`
- `&3xl|pad:...`

{% story '@nvidia-elements/styles/responsive.stories.json', 'PadResponsive' %}

## Hiding Elements Based on Container Size

The following container query breakpoints are available for hiding:

- `hide`
- `&xs|hide`
- `&sm|hide`
- `&md|hide`
- `&lg|hide`
- `&xl|hide`
- `&2xl|hide`
- `&3xl|hide`

You can subsequently reverse the hiding of elements with the `show@` attribute.

- `&xs|show`
- `&sm|show`
- `&md|show`
- `&lg|show`
- `&xl|show`
- `&2xl|show`
- `&3xl|show`

**Note that this responsive layout system is _minimum width based_ and takes an "upward" mobile-first approach.
You will likely need to combine `&hide|` and `&show|` to hide elements at smaller container sizes.**

The `&show|...` attribute will reverse setting of `display: none` back to `display: initial`.

{% story '@nvidia-elements/styles/responsive.stories.json', 'HideResponsive' %}

## Breakpoints for Switching Flexbox Layout Direction

The following container query breakpoints are available for swapping flex direction:

### Horizontally

- `&xs|row`
- `&sm|row`
- `&md|row`
- `&lg|row`
- `&xl|row`
- `&2xl|row`
- `&3xl|row`

### Vertically:

- `&xs|column`
- `&sm|column`
- `&md|column`
- `&lg|column`
- `&xl|column`
- `&2xl|column`
- `&3xl|column`

{% story '@nvidia-elements/styles/responsive.stories.json', 'FlexDirectionResponsive' %}

In addition to the above, you can also use the following syntax for flipping the flex direction:

- `&...|row-reverse`
- `&...|column-reverse`

{% story '@nvidia-elements/styles/responsive.stories.json', 'FlexDirectionReverse' %}

## Responsive Grid

Lastly, you can use the following syntax with `nve-layout=grid...` to vary grid structure based on container size.

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

{% story '@nvidia-elements/styles/responsive.stories.json', 'ResponsiveGrid' %}

### Responsive Grid Items

{% story '@nvidia-elements/styles/responsive.stories.json', 'ResponsiveGridItems' %}
