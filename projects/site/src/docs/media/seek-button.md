---
{
  title: 'Media Seek Button',
  layout: 'docs.11ty.js',
  tag: 'nve-media-seek-button',
  hideExamplesTab: true
}
---

## Installation

{% install 'nve-media-seek-button' %}

## Usage

`nve-media-seek-button` sends absolute or relative seek commands. Use `action` for the seek intent and `value` for relative movement.
The `value` property follows native button string semantics. `valueAsNumber` provides the numeric command payload.

```html
<nve-media-controller id="controller">
  <video src="/static/video/particle.mp4" playsinline></video>

  <div role="toolbar" aria-label="seek controls">
    <nve-media-seek-button commandfor="controller" action="start"></nve-media-seek-button>
    <nve-media-seek-button commandfor="controller" action="backward" value="10"></nve-media-seek-button>
    <nve-media-seek-button commandfor="controller" action="forward" value="10"></nve-media-seek-button>
    <nve-media-seek-button commandfor="controller" action="end"></nve-media-seek-button>
  </div>
</nve-media-controller>
```

## Actions

| Action     | Command           | Behavior                          |
| ---------- | ----------------- | --------------------------------- |
| `start`    | `--seek-start`    | Move playback to zero seconds.    |
| `backward` | `--seek-backward` | Move playback earlier.            |
| `forward`  | `--seek-forward`  | Move playback later.              |
| `end`      | `--seek-end`      | Move playback to finite duration. |

This control is command-only. It does not submit form values.
