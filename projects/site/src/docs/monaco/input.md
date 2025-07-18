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

{% story '@nvidia-elements/monaco/input/input.stories.json', 'Default', '{ "resizable": false, "inline": true }' %}

## Optional Features

{% story '@nvidia-elements/monaco/input/input.stories.json', 'WithOptionalAttributes', '{ "resizable": false, "inline": true }' %}

## Read Only

{% story '@nvidia-elements/monaco/input/input.stories.json', 'ReadOnly', '{ "resizable": false, "inline": true }' %}

## Disabled

{% story '@nvidia-elements/monaco/input/input.stories.json', 'Disabled', '{ "resizable": false, "inline": true }' %}

## JSON Schema Validation

{% story '@nvidia-elements/monaco/input/input.stories.json', 'JSONSchemaValidation', '{ "resizable": false, "inline": true }' %}

## TypeScript Validation

{% story '@nvidia-elements/monaco/input/input.stories.json', 'TypeScriptValidation', '{ "resizable": false, "inline": true }' %}
