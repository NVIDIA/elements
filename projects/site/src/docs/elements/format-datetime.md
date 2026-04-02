---
{
  title: 'Format Datetime',
  layout: 'docs.11ty.js',
  tag: 'nve-format-datetime'
}
---

## Installation

{% install 'nve-format-datetime' %}

By default, the component formats the date string from its text content. That text also serves as the SSR fallback. Use the `date` property or attribute when the value already comes from JavaScript or bound data. If both are present, `date` wins.

Preset `date-style` and `time-style` options take precedence over granular date and time part options. Treat `time-zone-name` as a granular option and use it only when preset styles are absent.

## Date Style

{% example '@nvidia-elements/core/format-datetime/format-datetime.examples.json', 'Default' %}

{% example '@nvidia-elements/core/format-datetime/format-datetime.examples.json', 'DateStyle' %}

## Time Style

{% example '@nvidia-elements/core/format-datetime/format-datetime.examples.json', 'TimeStyle' %}

## Granular

{% example '@nvidia-elements/core/format-datetime/format-datetime.examples.json', 'Granular' %}

## Time Only

{% example '@nvidia-elements/core/format-datetime/format-datetime.examples.json', 'TimeOnly' %}

## Locale

{% example '@nvidia-elements/core/format-datetime/format-datetime.examples.json', 'Locale' %}

## Date Attribute

{% example '@nvidia-elements/core/format-datetime/format-datetime.examples.json', 'DateAttribute' %}

## Time Zone

{% example '@nvidia-elements/core/format-datetime/format-datetime.examples.json', 'TimeZone' %}

## Time Zone Name

{% example '@nvidia-elements/core/format-datetime/format-datetime.examples.json', 'TimeZoneName' %}
