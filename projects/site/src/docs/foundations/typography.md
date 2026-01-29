---
{
  title: 'Typography',
  layout: 'docs.11ty.js'
}
---

# Typography

The Typography utilities provides a flexible API to apply typography styles explicitly to elements. This enables full control of the visual styling of an element separate from the HTML semantics.

```html
<p nve-text="display">display</p>
<p nve-text="heading">heading</p>
<p nve-text="body">body</p>
<p nve-text="label">label</p>
<p nve-text="code">cmd+c</p>
```

## Installation

```shell
npm install @nvidia-elements/themes @nvidia-elements/styles
```

```css
/* import the global CSS into your project (import may vary based on build tools) */
@import '@nvidia-elements/styles/dist/typography.css';
```

## Framework Integrations

Some frameworks and libraries may require additional configuration to use the `nve-text` attribute.

See the links below for specific integration patterns for the following frameworks:

<div nve-layout="row align:left gap:md">
  <nve-button>
    <a href="./docs/integrations/lit/#css-utilities">{% svg-logo 'lit' '20' %} Lit Integration</a>
  </nve-button>

  <nve-button>
    <a href="./docs/integrations/angular/#advanced-import-css-source">{% svg-logo 'angular' '20' %} Angular Integration</a>
  </nve-button>
</div>

## Types

{% example '@nvidia-elements/styles/typography.examples.json' 'Default' %}

## Colors

{% example '@nvidia-elements/styles/typography.examples.json' 'Color' %}

## Weights

{% example '@nvidia-elements/styles/typography.examples.json' 'Weights' %}

## Transforms

{% example '@nvidia-elements/styles/typography.examples.json' 'Transforms' %}

## Link

{% example '@nvidia-elements/styles/typography.examples.json' 'Link' %}

## List

{% example '@nvidia-elements/styles/typography.examples.json' 'List' %}

## Ordered List

{% example '@nvidia-elements/styles/typography.examples.json' 'OrderedList' %}

## Unstyled List

{% example '@nvidia-elements/styles/typography.examples.json' 'UnstyledList' %}

## Description List

{% example '@nvidia-elements/styles/typography.examples.json' 'DescriptionList' %}

## Navigation List

{% example '@nvidia-elements/styles/typography.examples.json' 'NavList' %}

## Headings

{% example '@nvidia-elements/styles/typography.examples.json' 'Headings' %}

## Size

{% example '@nvidia-elements/styles/typography.examples.json' 'Size' %}

## Line height

Use different attributes with `nve-text` like `loose`, `relaxed`, `moderate`, `snug`, and `tight` to give an element a relative line-height based on its current font-size.

{% example '@nvidia-elements/styles/typography.examples.json' 'LineHeightRelative' %}

Use different attributes with `nve-text` like `line-height-3` and `line-height-4` to give an element a fixed line-height, irrespective of the current font-size. These are useful when you need very precise control over an element’s final size.

{% example '@nvidia-elements/styles/typography.examples.json' 'LineHeightFixed' %}
