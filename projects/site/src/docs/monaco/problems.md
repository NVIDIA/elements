---
{
  title: 'Monaco Problems',
  layout: 'docs.11ty.js',
  tag: 'nve-monaco-problems',
  hideExamplesTab: true
}
---

## Installation

{% install 'nve-monaco-problems' %}

## Default

{% story '@nvidia-elements/monaco/problems/problems.stories.json', 'Default', '{ "resizable": false, "inline": true }' %}

## Empty

{% story '@nvidia-elements/monaco/problems/problems.stories.json', 'Empty', '{ "resizable": false, "inline": true }' %}

## Custom Empty Slot

{% story '@nvidia-elements/monaco/problems/problems.stories.json', 'CustomEmptySlot', '{ "resizable": false, "inline": true }' %}
