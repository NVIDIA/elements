---
{
  title: 'Accordion',
  layout: 'docs.11ty.js',
  tag: 'nve-accordion',
  associatedElements: ['nve-accordion-header', 'nve-accordion-content', 'nve-accordion-group']
}
---

## Installation

```typescript
import '@nvidia-elements/core/accordion/define.js';
```

```html
<nve-accordion>
  <nve-accordion-header>
    <div slot="title">Heading</div>
  </nve-accordion-header>

  <nve-accordion-content>
    Content
  </nve-accordion-content>
</nve-accordion>
```

## Standard

{% story 'nve-accordion', 'Default' %}

## Container

{% api 'nve-accordion', 'property' 'container' %}

{% story 'nve-accordion', 'Full' %}

### Inset

{% story 'nve-accordion', 'AccordionGroupInset' %}

### Full

{% story 'nve-accordion', 'AccordionGroupExpandSingle' %}

### Flat

{% story 'nve-accordion', 'AccordionGroupFlat' %}

## Container Single

{% api 'nve-accordion', 'property' 'container' %}

### Full

{% story 'nve-accordion', 'Full' %}

### Inset

{% story 'nve-accordion', 'Inset' %}

### Flat

{% story 'nve-accordion', 'Flat' %}

### Animated

{% story 'nve-accordion', 'Animated' %}

## Icon Button

{% api 'nve-accordion', 'slot' 'icon-button' %}

{% story 'nve-accordion', 'CustomIconButtonInteractive' %}

## Actions

{% story 'nve-accordion', 'WithActions' %}

## Disabled

{% story 'nve-accordion', 'Disabled' %}
