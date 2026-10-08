---
{
  title: 'Media Loop Button',
  layout: 'docs.11ty.js',
  tag: 'nve-media-loop-button',
  hideExamplesTab: true
}
---

## Installation

{% install 'nve-media-loop-button' %}

## Default

{% example '@nvidia-elements/media/loop-button/loop-button.examples.json', 'Default' %}

## Initial State

Set `loop` on the native `video` or `audio` element to enable continuous replay before the first playback. The controller reads that setting and keeps the button in sync with changes to the native `loop` property or attribute.

{% example '@nvidia-elements/media/loop-button/loop-button.examples.json', 'InitiallyLooping' %}

## Commands

The controller supports `--enable-loop`, `--disable-loop`, and `--toggle-loop`. Use the button's `command` attribute to request a specific setting instead of toggling.

```html
<nve-media-loop-button commandfor="controller" command="--enable-loop" aria-label="enable looping"></nve-media-loop-button>
```
