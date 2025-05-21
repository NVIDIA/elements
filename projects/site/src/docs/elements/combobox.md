---
{
  title: 'Combobox',
  layout: 'docs.11ty.js',
  tag: 'nve-combobox'
}
---

## Installation

{% install 'nve-combobox' %}

## Standard

{% story 'nve-combobox', 'Default' %}

## Multi Select

The multiple option behavior preserves the native select value behavior. The `value` on the select
will only reflect the first selected value. To get all selected options check the `selected` property
on each `<option>` element or the select property [selectedOptions](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedOptions).

{% story 'nve-combobox', 'MultiSelect' %}

## Single Select

Single select is similar to the default datalist behavior. However, by using a single selection select,
the combobox will enforce and only allow values from the select to be used. If a invalid value is entered
that does not match a option in the select, the value will be cleared.

{% story 'nve-combobox', 'Select' %}

## Option Label

Options by default provide a value for the user input. However, an optional label can be provided as well.
If an option label is provided, the label will be displayed to the user rather than the value.

<nve-alert status="warning">
  When using labels the text input value will be the option label rather than the option value.
  The select input will continue to use option value.
</nve-alert>

{% story 'nve-combobox', 'Label' %}

## Overflow

If the multiple tags overflow the parent container a simple text label will be shown instead.

{% story 'nve-combobox', 'Overflow' %}

## Layout

{% api 'nve-combobox', 'property', 'layout' %}

### Vertical

{% story 'nve-combobox', 'Vertical' %}

### Horizontal

{% story 'nve-combobox', 'Horizontal' %}

## Container

{% api 'nve-combobox', 'property', 'container' %}

### Flat

{% story 'nve-combobox', 'Flat' %}

## Footer

{% api 'nve-combobox', 'slot', 'footer' %}

{% story 'nve-combobox', 'Footer' %}

## Form

{% api 'nve-combobox', 'property', 'name' %}

{% story 'nve-combobox', 'Form' %}

## Reset

{% api 'nve-combobox', 'property', 'reset' %}

{% story 'nve-combobox', 'Reset' %}

## Disabled Options

{% story 'nve-combobox', 'DisabledOptions' %}

## No Tags

{% api 'nve-combobox', 'property', 'notags' %}

{% story 'nve-combobox', 'NoTags' %}

## Select All

{% api 'nve-combobox', 'property', 'selectAll' %}

{% story 'nve-combobox', 'SelectAll' %}
