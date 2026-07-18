---
{
  title: 'Media Playback Rate Select',
  layout: 'docs.11ty.js',
  tag: 'nve-media-playback-rate-select',
  hideExamplesTab: true
}
---

## Installation

{% install 'nve-media-playback-rate-select' %}

## Usage

`nve-media-playback-rate-select` sends `--set-playback-rate` when the user commits a selected rate. It uses an internal native `select` and syncs from the target controller's `mediaState` events.

```html
<nve-media-controller id="controller">
  <video src="/static/video/particle.mp4" playsinline></video>
  <div role="toolbar" aria-label="media controls">
    <nve-media-pause-button commandfor="controller"></nve-media-pause-button>
    <nve-media-playback-rate-select
      commandfor="controller"
      name="playbackRate"
      value="1"
      rates="[0.5, 1, 1.5, 2]">
    </nve-media-playback-rate-select>
  </div>
</nve-media-controller>
```

## Rates

Use the `rates` property to provide positive numeric options. In HTML, pass a JSON array attribute.

```html
<nve-media-playback-rate-select rates="[0.25, 0.5, 1, 1.5, 2]"></nve-media-playback-rate-select>
```

## Form Behavior

The playback rate select submits the selected string value when it has a `name`. Use `readonly` to display the current rate without allowing user changes or command dispatch.

Controller-driven synchronization does not dispatch `input` or `change`. Those events come from user interaction.
