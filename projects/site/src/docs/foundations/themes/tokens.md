---
{
  title: 'Design Tokens',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Design tokens are the visual design atoms of the design system – specifically, they are named entities that store visual design attributes. We use these tokens in place of hard-coded values to ensure flexibility and consistency across all product experiences.

### reference tokens (foundation, `--nve-ref-*`)

- color
- space
- size
- type

### system tokens (semantic, `--nve-sys-*`)

- status
- layers (canvas, containers, overlays, popovers)
- interactions (default, emphasis, destructive)

### themes (token overrides)

- dark theme
- compact theme

### components (consumers)

- use tokens in CSS, defaulting to system tokens when possible

## Size

{% tokens 'ref-size' %}

## Space

{% tokens 'ref-space' %}

## Border Color

{% tokens 'ref-border-color' %}

## Border Width

{% tokens 'ref-border-width' %}

### Border Radius

{% tokens 'ref-border-radius' %}

## Opacity

{% tokens 'ref-opacity' %}

## Shadow

{% tokens 'ref-shadow' %}

## Text

{% tokens 'ref-font-family', 'ref-font-weight', 'ref-font-size', 'ref-font-line-height', 'sys-text' %}

## Animation

{% tokens 'ref-animation' %}

## Layer

### Canvas

{% tokens 'sys-layer-canvas' %}

### Shell

{% tokens 'sys-layer-shell' %}

### Container

{% tokens 'sys-layer-container' %}

### Overlay

{% tokens 'sys-layer-overlay' %}

### Popover

{% tokens 'sys-layer-popover' %}

## Interaction

{% tokens '=sys-interaction-color', '=sys-interaction-background'  %}

### Emphasis

{% tokens 'sys-interaction-emphasis' %}

### Destructive

{% tokens 'sys-interaction-destructive' %}

### Highlighted

{% tokens 'sys-interaction-highlighted' %}

### Selected

{% tokens 'sys-interaction-selected' %}

### Disabled

{% tokens 'sys-interaction-disabled' %}

### Field

{% tokens 'sys-interaction-field' %}

## Status

{% tokens 'sys-status' %}

## Support

{% tokens 'sys-support' %}

## Accent

{% tokens 'sys-accent' %}

## Color

{% tokens 'ref-color' %}

## Categorical

{% tokens 'sys-visualization-categorical' %}

## Sequential Diverging Viridis

{% tokens 'sys-visualization-sequential-diverging-virdis' %}

### Sequential Diverging Red Green

{% tokens 'sys-visualization-sequential-diverging-red-green' %}

### Trend

{% tokens 'sys-visualization-trend' %}
