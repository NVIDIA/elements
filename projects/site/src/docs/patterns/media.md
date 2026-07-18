---
{
  title: 'Media Patterns',
  description: 'Media patterns: playback controls, player interaction patterns, and accessibility best practices for video and audio players using NVIDIA Elements.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Media patterns for video playback, sensor visualization, and robot monitoring in AV/Robotics applications.

## Video Player Card

{% example '@nvidia-elements/media/controller/controller.examples.json', 'Card' %}

## Audio Player Card

{% example '@internals/patterns/media.examples.json' 'AudioPlayerCard' %}

## Page Video Layout

{% example '@internals/patterns/media.examples.json' 'PageLayoutVideo' '{ "inline": false, "height": "680px" }' %}

## Zoom Control

{% example '@internals/patterns/media.examples.json' 'ZoomControl' %}
