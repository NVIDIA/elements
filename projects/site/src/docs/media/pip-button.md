---
{
  title: 'Media Picture-in-Picture Button',
  layout: 'docs.11ty.js',
  tag: 'nve-media-pip-button',
  hideExamplesTab: true
}
---

## Installation

{% install 'nve-media-pip-button' %}

## Usage

`nve-media-pip-button` sends `--toggle-pip` to the target controller. The controller requests picture-in-picture mode on its slotted video. Click again to return the video to the page. The controller supports `--enter-pip`, `--exit-pip`, and `--toggle-pip`. These commands operate on the controller's video. An exit command does not close another video's picture-in-picture window.

{% example '@nvidia-elements/media/pip-button/pip-button.examples.json' 'Default' %}

## Browser Support

This control uses the standard [Picture-in-Picture API](https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API). It requires browser support, loaded video metadata, and user activation for entry. Browser compatibility and permissions policy can limit availability.

This component does not use Safari-specific presentation APIs, the Document Picture-in-Picture API, or Media Session action handlers. Browser actions that do not emit standard picture-in-picture events might not update the mirrored state immediately.
