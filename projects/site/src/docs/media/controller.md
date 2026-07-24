---
{
  title: 'Media Controller',
  layout: 'docs.11ty.js',
  tag: 'nve-media-controller',
  hideExamplesTab: true
}
---

## Installation

{% install 'nve-media-controller' %}

## Usage

`nve-media-controller` is the command target for a consumer-owned `video` or `audio` element. Put the media element in the default slot and keep sources, tracks, posters, captions, and framework bindings on the native element.

```html
<nve-media-controller id="controller">
  <video src="/static/video/particle.mp4" playsinline></video>
</nve-media-controller>
```

## Form Values

{% example '@nvidia-elements/media/controller/controller.examples.json', 'FormValues' %}

## Card

{% example '@nvidia-elements/media/controller/controller.examples.json', 'Card' %}

## State

Read the latest immutable state from `mediaState`. The state includes `paused`, `muted`, `ended`, `seeking`, `fullscreen`, `currentTime`, `duration`, `volume`, and `playbackRate`.

The controller dispatches `media-state-change` when that snapshot changes. The event detail contains the complete state snapshot and does not bubble. Listen on the controller directly.

```js
const controller = document.querySelector('nve-media-controller');

console.log(controller.mediaState);
controller.addEventListener('media-state-change', event => console.log(event.detail));
```

The controller continues to reflect `paused`, `muted`, `ended`, `seeking`, `fullscreen`, `current-time`, `duration`, `volume`, and `playback-rate` for styling and inspection. The native media element still emits events such as `play`, `pause`, `timeupdate`, `durationchange`, `volumechange`, and `ratechange`.

The controller does not include `src`, `poster`, `autoplay`, track, or caption APIs. Use native media markup for media ownership and compose the Elements controls around it.
