---
{
  title: 'Media Volume Range',
  layout: 'docs.11ty.js',
  tag: 'nve-media-volume-range',
  hideExamplesTab: true
}
---

## Installation

{% install 'nve-media-volume-range' %}

## Usage

`nve-media-volume-range` sends `--set-volume` on user input and syncs its value from the target controller's `mediaState` events. The value uses the native media volume scale from `0` to `1`.

```html
<nve-media-controller id="controller">
  <video src="/static/video/particle.mp4" playsinline></video>
  <nve-media-volume-range commandfor="controller" name="volume" value="0.8"></nve-media-volume-range>
</nve-media-controller>
```

## Form Behavior

The volume range submits its current numeric value when it has a `name`. Use `readonly` to display the current volume without letting the user send commands.

Controller-driven synchronization does not dispatch `input` or `change`. Those events come from user interaction.
