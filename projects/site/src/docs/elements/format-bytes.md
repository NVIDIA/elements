---
{
  title: 'Format Bytes',
  layout: 'docs.11ty.js',
  tag: 'nve-format-bytes'
}
---

## Installation

{% install 'nve-format-bytes' %}

Format Bytes converts byte counts into readable decimal or binary units. Supply the byte count as text content to provide an SSR fallback, or set the `value` property or attribute for JavaScript and bound data. If both are present, `value` takes precedence.

The `locale` property controls number formatting. Unit labels remain lowercase English strings in every locale.

## Default

{% example '@nvidia-elements/core/format-bytes/format-bytes.examples.json', 'Default' %}

## Unit

{% example '@nvidia-elements/core/format-bytes/format-bytes.examples.json', 'Unit' %}

## Unit Display

{% example '@nvidia-elements/core/format-bytes/format-bytes.examples.json', 'UnitDisplay' %}

## Precision

{% example '@nvidia-elements/core/format-bytes/format-bytes.examples.json', 'Precision' %}

## Locale

{% example '@nvidia-elements/core/format-bytes/format-bytes.examples.json', 'Locale' %}

## Value

{% example '@nvidia-elements/core/format-bytes/format-bytes.examples.json', 'Value' %}

## Display

{% example '@nvidia-elements/core/format-bytes/format-bytes.examples.json', 'Display' %}
