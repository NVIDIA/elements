---
{
  title: 'Drag Handle',
  description: 'Use the NVIDIA Elements drag handle for labeled move controls with keyboard selection and application-defined dragging or reordering.',
  layout: 'docs.11ty.js',
  tag: 'nve-drag-handle'
}
---

## Installation

{% install 'nve-drag-handle' %}

## Default

{% example '@nvidia-elements/core/drag-handle/drag-handle.examples.json' 'Default' %}

Dragging the handle shows the browser's native drag preview. Listen to `dragstart`, `drag`, and `dragend` to connect it to application movement. In `dragstart`, use `event.dataTransfer.setData()` to supply drag data or `event.dataTransfer.setDragImage()` to customize the preview. The application manages drop targets and item positions.

## Pressed

{% example '@nvidia-elements/core/drag-handle/drag-handle.examples.json' 'Pressed' %}

Space, Enter, and click activation toggle `pressed`. Space also prevents page scrolling. Native dragging leaves `pressed` unchanged. Applications can set `pressed` directly. Keep the accessible label the same in both states.

## Disabled

{% example '@nvidia-elements/core/drag-handle/drag-handle.examples.json' 'Disabled' %}
