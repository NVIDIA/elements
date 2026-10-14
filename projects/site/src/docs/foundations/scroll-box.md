---
{
  title: 'Scroll Box',
  layout: 'docs.11ty.js',
  tag: 'nve-scroll-box'
}
---

## Installation

{% install 'nve-scroll-box' '{ "layer": "container" }' %}

## Both Axes

{% example '@nvidia-elements/foundations/scroll-box/scroll-box.examples.json' 'Axes' '{ "layer": "container" }' %}

## Vertical

{% example '@nvidia-elements/foundations/scroll-box/scroll-box.examples.json' 'Vertical' '{ "layer": "container" }' %}

## Horizontal

{% example '@nvidia-elements/foundations/scroll-box/scroll-box.examples.json' 'Horizontal' '{ "layer": "container" }' %}

## Scroll Bars and Shadows

{% example '@nvidia-elements/foundations/scroll-box/scroll-box.examples.json' 'HiddenScrollbar' '{ "layer": "container" }' %}

## Native Scrolling APIs

Use the host's native methods, properties, and events. Listen for `scroll` and `scrollend` directly on the host; element scroll events do not bubble. RTL scrolling retains native coordinates.

```javascript
const scrollBox = document.querySelector('nve-scroll-box');
scrollBox.scrollTo({ top: 100, behavior: 'smooth' });
scrollBox.addEventListener('scroll', () => {
  console.log(scrollBox.scrollTop);
});
```

## Automatic Scrolling

{% example '@nvidia-elements/foundations/scroll-box/scroll-box.examples.json' 'Follow' '{ "layer": "container" }' %}
