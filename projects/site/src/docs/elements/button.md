---
{
  title: 'Button',
  layout: 'docs.11ty.js',
  tag: 'nve-button'
}
---

## Installation

{% install 'nve-button' %}

## Options

### Interaction

{% api 'nve-button' 'property' 'interaction' %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Interaction' %}

### Container

{% api 'nve-button' 'property' 'container' %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Container' %}

### Size

{% api 'nve-button' 'property' 'size' %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Size' %}

### Pressed

{% api 'nve-button' 'property' 'pressed' %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Pressed' %}

### Selected

{% api 'nve-button' 'property' 'selected' %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Selected' %}

### Disabled

{% api 'nve-button' 'property' 'disabled' %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Disabled' %}

## Guidelines

### Icon Usage

{% example '@nvidia-elements/core/button/button.examples.json' 'WithIcon' %}

### Triggering Custom Form Controls

{% example '@nvidia-elements/core/button/button.examples.json' 'FormControl' %}

### Disclosing Progress

{% example '@nvidia-elements/core/button/button.examples.json' 'ProgressDisclosure' %}

### Ensure Contrast on Colored Background

{% example '@nvidia-elements/core/button/button.examples.json' 'ContrastColoredBackgrounds' %}

### Creating Linked Buttons

{% dodont %}
{% example '@nvidia-elements/core/button/button.examples.json', 'ValidLinkButton' %}
{% example '@nvidia-elements/core/button/button.examples.json', 'InvalidLinkButton' %}
{% enddodont %}
