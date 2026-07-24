---
{
  title: 'Media Time Range',
  layout: 'docs.11ty.js',
  tag: 'nve-media-time-range',
  hideExamplesTab: true
}
---

## Installation

{% install 'nve-media-time-range' %}

## Usage

`nve-media-time-range` sends `--seek` on user input and syncs its value and bounds from the target controller's `mediaState` events.

```html
<nve-media-controller id="controller">
  <video src="/static/video/particle.mp4" playsinline></video>
  <nve-media-time-range commandfor="controller" name="currentTime"></nve-media-time-range>
</nve-media-controller>
```

## Form Behavior

The time range submits its current numeric value when it has a `name`. It exposes `valueAsNumber`, `min`, `max`, and `step` using range-control semantics.

Controller-driven synchronization does not dispatch `input` or `change`. Those events come from user interaction.
