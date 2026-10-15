---
{
  title: 'Progress Dot',
  layout: 'docs.11ty.js',
  tag: 'nve-progress-dot'
}
---

## Installation

{% install 'nve-progress-dot' %}

## Sizing

{% api 'nve-progress-dot' 'property' 'size' %}

{% example '@nvidia-elements/core/progress-dot/progress-dot.examples.json' 'Size' %}

## Accessible Labels

The indicator provides a localized loading label by default. Set `aria-label` to describe the task, or use `aria-labelledby` to reference a visible label. Set `aria-busy="true"` on the region that loads, then remove or hide the indicator when the task finishes.

{% example '@nvidia-elements/core/progress-dot/progress-dot.examples.json' 'WithText' %}
