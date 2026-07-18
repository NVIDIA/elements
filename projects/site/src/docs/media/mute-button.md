---
{
  title: 'Media Mute Button',
  layout: 'docs.11ty.js',
  tag: 'nve-media-mute-button',
  hideExamplesTab: true
}
---

## Installation

{% install 'nve-media-mute-button' %}

## Usage

`nve-media-mute-button` sends `--toggle-mute` by default. It syncs `checked` from the target controller's `mediaState` events.

```html
<nve-media-controller id="controller">
  <video src="/static/video/particle.mp4" playsinline muted></video>
  <nve-media-mute-button commandfor="controller" name="muted" value="true"></nve-media-mute-button>
</nve-media-controller>
```

## Form Behavior

The mute button follows checkbox form submission. When `checked`, it submits its `value`. When unchecked, it contributes no form value.

Use this control when a form should capture the current muted state with other media review or playback settings.
