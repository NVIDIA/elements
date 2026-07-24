---
{
  title: 'Media Pause Button',
  layout: 'docs.11ty.js',
  tag: 'nve-media-pause-button',
  hideExamplesTab: true
}
---

## Installation

{% install 'nve-media-pause-button' %}

## Usage

`nve-media-pause-button` sends `--toggle-play` by default. It syncs `checked` from the target controller's `mediaState` events. Paused or ended media sets the button to its checked play state.

```html
<nve-media-controller id="controller">
  <video src="/static/video/particle.mp4" playsinline></video>
  <nve-media-pause-button commandfor="controller" name="paused" value="true" checked></nve-media-pause-button>
</nve-media-controller>
```

## Form Behavior

The pause button follows checkbox form submission. When `checked`, it submits its `value`. When unchecked, it contributes no form value.

Use `required` when the form accepts paused playback only. Use `readonly` when the button should display playback state without sending commands.
