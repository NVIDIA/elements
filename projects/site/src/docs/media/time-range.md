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

## Buffered Ranges

{% example '@nvidia-elements/media/time-range/time-range.examples.json', 'BufferedRanges' %}
