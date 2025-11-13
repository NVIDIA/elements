---
{
  title: 'Accordion',
  layout: 'docs.11ty.js',
  tag: 'nve-accordion',
  associatedElements: ['nve-accordion-header', 'nve-accordion-content', 'nve-accordion-group']
}
---

## Installation

{% install 'nve-accordion' %}

## Standard

{% example '@nvidia-elements/core/accordion/accordion.examples.json' 'Default' %}

## Container

{% api 'nve-accordion', 'property' 'container' %}
{% example '@nvidia-elements/core/accordion/accordion.examples.json' 'Container' %}

## Disabled

{% api 'nve-accordion', 'property' 'disabled' %}
{% example '@nvidia-elements/core/accordion/accordion.examples.json' 'Disabled' %}

## Behavior Expand Single

{% example '@nvidia-elements/core/accordion/accordion.examples.json' 'BehaviorExpandSingle' %}

### Animated

{% example '@nvidia-elements/core/accordion/accordion.examples.json' 'Animated' %}

## Icon Button

{% api 'nve-accordion', 'slot' 'icon-button' %}

{% example '@nvidia-elements/core/accordion/accordion.examples.json' 'CustomIconButtonInteractive' %}

## Actions

{% example '@nvidia-elements/core/accordion/accordion.examples.json' 'WithActions' %}
