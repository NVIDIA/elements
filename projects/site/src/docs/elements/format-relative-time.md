---
{
  title: 'Format Relative Time',
  layout: 'docs.11ty.js',
  tag: 'nve-format-relative-time'
}
---

## Installation

{% install 'nve-format-relative-time' %}

By default, the component formats the date string from its text content. That text also serves as the SSR fallback. Use the `date` property or attribute when the value already comes from JavaScript or bound data. If both are present, `date` wins.

If you omit `locale`, the component uses `document.documentElement.lang`. If that value is empty, `Intl.RelativeTimeFormat` uses the browser default locale.

## Default

{% example '@nvidia-elements/core/format-relative-time/format-relative-time.examples.json', 'Default' %}

## Numeric

{% example '@nvidia-elements/core/format-relative-time/format-relative-time.examples.json', 'Numeric' %}

## Format Style

{% example '@nvidia-elements/core/format-relative-time/format-relative-time.examples.json', 'FormatStyle' %}

## Unit

{% example '@nvidia-elements/core/format-relative-time/format-relative-time.examples.json', 'Unit' %}

## Locale

{% example '@nvidia-elements/core/format-relative-time/format-relative-time.examples.json', 'Locale' %}

## Date Attribute

{% example '@nvidia-elements/core/format-relative-time/format-relative-time.examples.json', 'DateAttribute' %}

## Sync

{% example '@nvidia-elements/core/format-relative-time/format-relative-time.examples.json', 'Sync' %}
