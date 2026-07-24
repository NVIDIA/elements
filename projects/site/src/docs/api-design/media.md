---
{
  title: 'Media Components Proposal',
  description: 'Initial API proposal for NVIDIA Elements media playback components, including controller, command, and form-control contracts.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Status

This document proposes the first pass API for `@nvidia-elements/media`. The proposal is intentionally narrow. It defines the playback substrate, the command contract, and the form-control contract before adding convenience layout or media-card abstractions.

The current media patterns use existing core elements for playback transport, playback speed, volume, time scrubbers, video cards, audio cards, and full-page review layouts. The first media package should replace only the repeated playback-control mechanics.

## Goals

- Keep the media element in light DOM so consumers own `video`, `audio`, source elements, tracks, and framework bindings.
- Use the Invoker Commands API shape for user intent through `commandfor`, `command`, and `CommandEvent`.
- Use form-associated custom element behavior where the control represents a submitted value.
- Keep controller state as the source of truth. Controls request changes; media events confirm state.
- Preserve existing composition with native toolbar regions, `nve-button-group`, `nve-card`, and `nve-page`.
- Keep public properties primitive-only.

## Non Goals

- Do not create media card, audio card, video card, or page layout components.
- Do not create a media time display. Use generic formatting components from core instead.
- Do not create zoom controls. Zoom applies to viewers and canvas content, not HTML media playback.
- Do not add captions, picture-in-picture, casting, AirPlay, previews, gesture controls, or global hotkeys.

## Component Set

| Component                        | Purpose                                                                   | Form associated | Command source |
| -------------------------------- | ------------------------------------------------------------------------- | --------------- | -------------- |
| `nve-media-controller`           | Coordinates one slotted media element and handles media commands.         | No              | Command target |
| `nve-media-pause-button`         | Requests play, pause, or toggle playback and reflects paused media state. | Yes             | Yes            |
| `nve-media-mute-button`          | Requests mute, `unmute`, or toggle muted and reflects actual muted state. | Yes             | Yes            |
| `nve-media-seek-button`          | Requests relative or absolute seek actions.                               | No              | Yes            |
| `nve-media-time-range`           | Scrubs current media time.                                                | Yes             | Yes            |
| `nve-media-volume-range`         | Sets media volume.                                                        | Yes             | Yes            |
| `nve-media-playback-rate-select` | Sets media playback rate through an internal native select.               | Yes             | Yes            |
| `nve-media-fullscreen-button`    | Requests full-screen state changes for the controller.                    | No              | Yes            |

## Baseline Composition

```html
<nve-media-controller id="controller">
  <video src="recording.mp4" playsinline></video>

  <div role="toolbar" aria-label="media controls">
    <nve-media-seek-button commandfor="controller" action="start"></nve-media-seek-button>
    <nve-media-seek-button commandfor="controller" action="backward" value="10"></nve-media-seek-button>
    <nve-media-pause-button commandfor="controller" name="paused" value="true" checked></nve-media-pause-button>
    <nve-media-seek-button commandfor="controller" action="forward" value="10"></nve-media-seek-button>
    <nve-media-seek-button commandfor="controller" action="end"></nve-media-seek-button>

    <nve-divider orientation="vertical"></nve-divider>

    <nve-media-mute-button commandfor="controller" name="muted" value="true"></nve-media-mute-button>
    <nve-media-volume-range commandfor="controller" name="volume"></nve-media-volume-range>
    <nve-media-playback-rate-select commandfor="controller" name="playbackRate"></nve-media-playback-rate-select>

    <nve-media-fullscreen-button commandfor="controller"></nve-media-fullscreen-button>
  </div>
</nve-media-controller>
```

## Controller API

`nve-media-controller` coordinates exactly one slotted media element.

```html
<nve-media-controller id="controller">
  <video src="recording.mp4" playsinline></video>
</nve-media-controller>
```

### Slots

| Slot      | Description                                                                          |
| --------- | ------------------------------------------------------------------------------------ |
| `default` | The controlled `HTMLMediaElement`, followed by supporting controls or other content. |

The controller should warn and no-op when no supported media element exists. It should not throw.

### State Attributes

The controller reflects media state for styling and inspection.

| Attribute      | Type    | Source                                  |
| -------------- | ------- | --------------------------------------- |
| `paused`       | boolean | `media.paused`                          |
| `muted`        | boolean | `media.muted`                           |
| `ended`        | boolean | `media.ended`                           |
| `seeking`      | boolean | `media.seeking`                         |
| `fullscreen`   | boolean | Controller host is in full-screen mode. |
| `current-time` | number  | `media.currentTime`                     |
| `duration`     | number  | `media.duration` when finite.           |
| `volume`       | number  | `media.volume` from `0` to `1`.         |

The controller exposes the latest immutable state through `mediaState`. It dispatches a `media-state-change` event with the complete state snapshot when native media, command, slot, or full-screen updates change that state. The event does not bubble. Controls read `mediaState` when they bind to a command target and listen for later state events.

The reflected attributes remain available for styling and inspection. Controls do not observe those attributes for synchronization.

## Commands

The controller listens for `command` events and supports the following commands.

| Command               | Behavior                                     | Source value           |
| --------------------- | -------------------------------------------- | ---------------------- |
| `--play`              | Calls `media.play()`.                        | None                   |
| `--pause`             | Calls `media.pause()`.                       | None                   |
| `--toggle-play`       | Plays when paused, pauses when playing.      | None                   |
| `--mute`              | Sets `media.muted` to `true`.                | None                   |
| `--unmute`            | Sets `media.muted` to `false`.               | None                   |
| `--toggle-mute`       | Toggles `media.muted`.                       | None                   |
| `--seek`              | Sets `media.currentTime`.                    | `source.valueAsNumber` |
| `--seek-start`        | Sets `media.currentTime` to `0`.             | None                   |
| `--seek-end`          | Sets `media.currentTime` to duration.        | None                   |
| `--seek-backward`     | Decreases current time.                      | `source.valueAsNumber` |
| `--seek-forward`      | Increases current time.                      | `source.valueAsNumber` |
| `--set-volume`        | Sets `media.volume`.                         | `source.valueAsNumber` |
| `--enter-fullscreen`  | Requests full-screen mode on the controller. | None                   |
| `--exit-fullscreen`   | Exits full-screen mode.                      | None                   |
| `--toggle-fullscreen` | Toggles full-screen mode.                    | None                   |

The controller clamps time and volume values. Invalid command values warn and no-op.

## Command Sources

Every media command source supports the existing Elements command shape.

| API                 | Type                  | Description                                  |
| ------------------- | --------------------- | -------------------------------------------- |
| `commandfor`        | string                | The id reference for the target controller.  |
| `commandForElement` | `HTMLElement \| null` | Element reference for the target controller. |
| `command`           | string                | The command sent to the target controller.   |

Controls should require either `commandfor` or `commandForElement` in the first pass. Controls may live inside the controller for clearer composition, but DOM containment should not create implicit controller association.

## Form Association

Media controls split into two groups.

Value controls are form-associated:

- `nve-media-pause-button`
- `nve-media-mute-button`
- `nve-media-time-range`
- `nve-media-volume-range`

Command-only controls are not form-associated:

- `nve-media-seek-button`
- `nve-media-fullscreen-button`

Form-associated controls should implement the native form control surface:

| API                          | Description                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `formAssociated`             | Static `true` on the custom element class.                                        |
| `form`                       | Associated `HTMLFormElement`.                                                     |
| `name`                       | Form field name.                                                                  |
| `disabled`                   | Removes the control from interaction and form submission.                         |
| `required`                   | Participates in constraint validation.                                            |
| `readOnly` / `readonly`      | Property and attribute that prevent user mutation while preserving state display. |
| `validity`                   | Constraint validation state.                                                      |
| `validationMessage`          | Current validation message.                                                       |
| `willValidate`               | Native validation candidate state.                                                |
| `checkValidity()`            | Native validity check.                                                            |
| `reportValidity()`           | Native validity report.                                                           |
| `formResetCallback()`        | Restores the initial control value.                                               |
| `formStateRestoreCallback()` | Restores browser-provided state.                                                  |

User interaction dispatches `input` and `change`. Controller-driven media synchronization updates control state without dispatching `input` or `change`.

## Toggle Form Controls

`nve-media-pause-button` and `nve-media-mute-button` should follow checkbox submission semantics while using button interaction semantics.

| API        | Type    | Default | Description                                                          |
| ---------- | ------- | ------- | -------------------------------------------------------------------- |
| `checked`  | boolean | `false` | Actual media state represented by the control.                       |
| `value`    | string  | `on`    | Submitted value when checked.                                        |
| `name`     | string  | `''`    | Form field name.                                                     |
| `disabled` | boolean | `false` | Prevents interaction and command dispatch.                           |
| `required` | boolean | `false` | Requires a checked toggle.                                           |
| `readOnly` | boolean | `false` | Prevents user changes and command dispatch. Reflected as `readonly`. |

When unchecked, the control contributes `null` to `ElementInternals#setFormValue()` so `FormData` omits it. When checked, the control contributes `value`.

```html
<form>
  <nve-media-controller id="controller">
    <video src="recording.mp4"></video>
    <nve-media-pause-button commandfor="controller" name="paused" value="true" checked></nve-media-pause-button>
    <nve-media-mute-button commandfor="controller" name="muted" value="true" checked></nve-media-mute-button>
  </nve-media-controller>
</form>
```

```js
const data = new FormData(document.querySelector('form'));

data.get('paused'); // "true" when playback is paused
data.get('muted'); // "true" when muted
```

The toggle base should not use `FormControlMixin` without changes because native checkbox semantics separate `checked` from `value`. A dedicated toggle form-control base should use `ElementInternals` directly or extend the forms package with a reusable checkbox-style base.

## Range Form Controls

`nve-media-time-range` and `nve-media-volume-range` should follow range control semantics.

| API             | Type    | Description                                                          |
| --------------- | ------- | -------------------------------------------------------------------- |
| `value`         | number  | Current numeric value.                                               |
| `valueAsNumber` | number  | Native numeric alias for `value`.                                    |
| `min`           | number  | Lower bound.                                                         |
| `max`           | number  | Upper bound.                                                         |
| `step`          | number  | Increment value.                                                     |
| `name`          | string  | Form field name.                                                     |
| `disabled`      | boolean | Prevents interaction and form submission.                            |
| `required`      | boolean | Participates in constraint validation.                               |
| `readOnly`      | boolean | Prevents user changes and command dispatch. Reflected as `readonly`. |

`nve-media-time-range` defaults:

| API       | Default                          |
| --------- | -------------------------------- |
| `command` | `--seek`                         |
| `value`   | `0`                              |
| `min`     | `0`                              |
| `max`     | Controller duration when finite. |
| `step`    | `0.1`                            |

`nve-media-volume-range` defaults:

| API       | Default        |
| --------- | -------------- |
| `command` | `--set-volume` |
| `value`   | `1`            |
| `min`     | `0`            |
| `max`     | `1`            |
| `step`    | `0.01`         |

Volume uses the native `HTMLMediaElement.volume` range of `0` to `1`, not a percentage range.

```html
<nve-media-controller id="controller">
  <video src="recording.mp4"></video>
  <nve-media-time-range commandfor="controller" name="currentTime"></nve-media-time-range>
  <nve-media-volume-range commandfor="controller" name="volume" value="0.8"></nve-media-volume-range>
</nve-media-controller>
```

## Individual Components

### `nve-media-pause-button`

| API       | Type    | Default         |
| --------- | ------- | --------------- |
| `command` | string  | `--toggle-play` |
| `checked` | boolean | `false`         |
| `value`   | string  | `on`            |

`checked` means the media currently has `paused` enabled. The control requests playback changes, but media events update `checked`.

Supported explicit commands:

- `--play`
- `--pause`
- `--toggle-play`

### `nve-media-mute-button`

| API       | Type    | Default         |
| --------- | ------- | --------------- |
| `command` | string  | `--toggle-mute` |
| `checked` | boolean | `false`         |
| `value`   | string  | `on`            |

`checked` means the media currently has `muted` enabled. The control requests muted changes, but media events update `checked`.

Supported explicit commands:

- `--mute`
- `--unmute`
- `--toggle-mute`

### `nve-media-seek-button`

| API             | Type                                          | Default                | Description                                         |
| --------------- | --------------------------------------------- | ---------------------- | --------------------------------------------------- |
| `action`        | `'start' \| 'backward' \| 'forward' \| 'end'` | `forward`              | Seek action.                                        |
| `value`         | string                                        | `10`                   | Native button value used for relative seek actions. |
| `valueAsNumber` | number                                        | `10`                   | Numeric alias used by media commands.               |
| `command`       | string                                        | Derived from `action`. | Command sent to the controller.                     |
| `disabled`      | boolean                                       | `false`                | Prevents interaction.                               |
| `readOnly`      | boolean                                       | `false`                | Prevents command dispatch. Reflected as `readonly`. |

Derived commands:

| Action     | Command           |
| ---------- | ----------------- |
| `start`    | `--seek-start`    |
| `backward` | `--seek-backward` |
| `forward`  | `--seek-forward`  |
| `end`      | `--seek-end`      |

### `nve-media-time-range`

`nve-media-time-range` syncs with `media.currentTime` and `media.duration`. It should disable itself while duration is unavailable or non-finite.

User input dispatches `--seek`. Controller synchronization updates `value`, `max`, and form value without emitting `input` or `change`.

### `nve-media-volume-range`

`nve-media-volume-range` syncs with `media.volume`.

User input dispatches `--set-volume`. Controller synchronization updates `value` and form value without emitting `input` or `change`.

### `nve-media-fullscreen-button`

| API        | Type    | Default               |
| ---------- | ------- | --------------------- |
| `command`  | string  | `--toggle-fullscreen` |
| `pressed`  | boolean | `false`               |
| `disabled` | boolean | `false`               |
| `readOnly` | boolean | `false`               |

`pressed` means the controller is in full-screen mode. The component is not form-associated.

Supported explicit commands:

- `--enter-fullscreen`
- `--exit-fullscreen`
- `--toggle-fullscreen`

## Accessibility

Controls must set accessible names through `aria-label`, slotted text, or consumer-provided labels.

Toggle controls should use button accessibility semantics with `aria-pressed` because users encounter them as toolbar buttons. Their form submission follows checkbox semantics through `ElementInternals`.

Range controls should use slider semantics and mirror native range behavior for keyboard interaction.

The controller should not hide or replace native media semantics. Consumers should still own `video`, `audio`, `track`, and caption markup.

## Styling

Media controls should expose a small set of generic CSS custom properties, not media-specific token names.

Common button-like controls:

- `--background`
- `--color`
- `--border`
- `--border-radius`
- `--height`
- `--width`
- `--padding`

Range controls:

- `--background`
- `--track-background`
- `--track-height`
- `--track-border-radius`
- `--thumb-background`
- `--thumb-border`
- `--thumb-height`
- `--thumb-width`

Button-like controls expose an `icon` part for the fallback `nve-icon`, matching existing icon-button conventions. Use the default slot for icon replacement when consumers need custom icon rendering.

## Package Shape

Each component should use the standard package shape:

```text
projects/media/src/controller/
projects/media/src/pause-button/
projects/media/src/mute-button/
projects/media/src/seek-button/
projects/media/src/time-range/
projects/media/src/volume-range/
projects/media/src/fullscreen-button/
```

Each component folder should include:

- implementation
- styles
- examples
- unit tests
- accessibility tests
- visual tests
- SSR tests
- lighthouse tests where relevant
- `index.ts`
- `define.ts`

Package exports should list each entry point and each `define.js` entry point. The top-level package export should keep the current `VERSION` export and avoid side-effect registration.

## Implementation Plan

1. Add internal media command and state types.
2. Add `nve-media-controller` with slotted media discovery, command handling, state reflection, and SSR guards.
3. Add a reusable command-source controller for `commandfor`, `commandForElement`, and `command`.
4. Add a reusable toggle form-control base that matches checkbox form semantics.
5. Add `nve-media-pause-button` and `nve-media-mute-button`.
6. Add `nve-media-seek-button`.
7. Add a reusable numeric range form-control base.
8. Add `nve-media-time-range` and `nve-media-volume-range`.
9. Add `nve-media-fullscreen-button`.
10. Add examples that replace the current media pattern primitives with media components.
11. Add package exports and define entry points.
12. Add lint coverage for component export completeness if an existing rule does not cover `projects/media`.

## Test Plan

Unit tests should cover:

- definition and explicit registration
- slotted media discovery
- missing media warning and no-op behavior
- each supported command
- command source values for seek and volume
- form data for checked and unchecked toggles
- form data for time and volume ranges
- `input` and `change` only on user interaction
- no `input` or `change` on controller synchronization
- form reset and state restore behavior
- disabled and readonly command suppression
- clamping for time and volume values

Accessibility tests should cover:

- composed native toolbar regions
- accessible names
- toggle `aria-pressed`
- range keyboard behavior
- disabled states

Visual tests should cover:

- default control composition
- checked play and muted states
- disabled states
- time range with finite duration
- volume range
- full-screen pressed state

SSR tests should cover:

- rendering without `document`
- missing media element without throws
- no direct DOM access before connection

Lighthouse tests should cover:

- package import size
- representative controller composition

## Deferred Decisions

### Playback Rate Select

The playback-rate control uses `nve-media-playback-rate-select` with an internal native `select`. Keep the `rates` name and provide rate options as an array property. In HTML, pass a JSON array attribute.

```html
<nve-media-playback-rate-select
  commandfor="controller"
  name="playbackRate"
  value="1"
  rates="[0.5, 1, 1.5, 2]">
</nve-media-playback-rate-select>
```

### Time Formatting

Keep time display in core formatting APIs. Media should expose primitive time values; application code or core formatting components should render them.

### Controller Association

The first pass requires `commandfor` or `commandForElement`, even when controls live inside `nve-media-controller`. Keeping controls next to the media element improves markup readability without adding a second association model.

### Live Media

The first pass targets finite recorded media. Live media needs different timeline semantics and should not shape the initial API.
