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

Some frameworks and libraries may require additional configuration to use the `nve-text` attribute. See the links below for specific integration patterns for the following frameworks:

<div nve-layout="row align:center">
  <nve-button>
    <a href="./?path=/docs/integrations-lit--docs&anchor=css-utilities"><svg width="20" height="20"><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#lit-svg"></use></svg> Lit Integration</a>
  </nve-button>
</div>

## Types

{% story '@nvidia-elements/styles/typography.stories.json', 'Type' %}

## Colors

{% story '@nvidia-elements/styles/typography.stories.json', 'Color' %}

## Weights

{% story '@nvidia-elements/styles/typography.stories.json', 'Weights' %}

## Transforms

{% story '@nvidia-elements/styles/typography.stories.json', 'Transforms' %}

## Link

{% story '@nvidia-elements/styles/typography.stories.json', 'Link' %}

## List

{% story '@nvidia-elements/styles/typography.stories.json', 'List' %}

## Ordered List

{% story '@nvidia-elements/styles/typography.stories.json', 'OrderedList' %}

## Unstyled List

{% story '@nvidia-elements/styles/typography.stories.json', 'UnstyledList' %}

## Navigation List

{% story '@nvidia-elements/styles/typography.stories.json', 'NavList' %}

```html
<!-- Navigation List -->
<ul nve-text="list nav">
  ...
  <li></li>
  ...
</ul>
```

## Headings

{% story '@nvidia-elements/styles/typography.stories.json', 'Headings' %}

## Size

{% story '@nvidia-elements/styles/typography.stories.json', 'Size' %}

## Line height

Use different attributes with `nve-text` like `loose`, `relaxed`, `moderate`, `snug`, and `tight` to give an element a relative line-height based on its current font-size.

{% story '@nvidia-elements/styles/typography.stories.json', 'LineHeightRelative' %}

Use different attributes with `nve-text` like `line-height-3` and `line-height-4` to give an element a fixed line-height, irrespective of the current font-size. These are useful when you need very precise control over an element’s final size.

{% story '@nvidia-elements/styles/typography.stories.json', 'LineHeightFixed' %}

<!-- TODO ## Tokens

{% story '@nvidia-elements/styles/typography.stories.json', 'Text' %} -->
