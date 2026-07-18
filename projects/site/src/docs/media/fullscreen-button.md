---
{
  title: 'Media Full-screen Button',
  layout: 'docs.11ty.js',
  tag: 'nve-media-fullscreen-button',
  hideExamplesTab: true
}
---

## Installation

{% install 'nve-media-fullscreen-button' %}

## Usage

`nve-media-fullscreen-button` sends `--toggle-fullscreen` by default. It syncs `pressed` from the target controller's `mediaState` events.

```html
<nve-media-controller id="controller">
  <video src="/static/video/particle.mp4" playsinline></video>
  <nve-media-fullscreen-button commandfor="controller"></nve-media-fullscreen-button>
</nve-media-controller>
```

## Behavior

The button requests full-screen mode on the controller element, not on the media element. This keeps composed controls inside the full-screen region.

This control is command-only. It does not submit form values.
