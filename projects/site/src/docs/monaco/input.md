---
{
  title: 'Monaco Input',
  layout: 'docs.11ty.js',
  tag: 'nve-monaco-input',
  hideExamplesTab: true
}
---

## Installation

{% install 'nve-monaco-input' %}

## Default

{% story '@nvidia-elements/monaco/input/input.stories.json', 'Default', '{ "resizable": false }' %}

## Optional Features

{% story '@nvidia-elements/monaco/input/input.stories.json', 'WithOptionalAttributes', '{ "resizable": false }' %}

## Read Only

{% story '@nvidia-elements/monaco/input/input.stories.json', 'ReadOnly', '{ "resizable": false }' %}

## Disabled

{% story '@nvidia-elements/monaco/input/input.stories.json', 'Disabled', '{ "resizable": false }' %}

## JSON Schema Validation

{% story '@nvidia-elements/monaco/input/input.stories.json', 'JSONSchemaValidation', '{ "resizable": false }' %}

## TypeScript Validation

{% story '@nvidia-elements/monaco/input/input.stories.json', 'TypeScriptValidation', '{ "resizable": false }' %}
