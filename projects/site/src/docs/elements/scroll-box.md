---
{
  title: 'Scroll Box',
  layout: 'docs.11ty.js',
  tag: 'nve-scroll-box'
}
---

## Installation

{% install 'nve-scroll-box' %}

## Both axes

The host scrolls in both directions by default. Constrain its height or width with CSS to create a scrollable area. Arrange content using light DOM elements.

{% example '@nvidia-elements/core/scroll-box/scroll-box.examples.json' 'Default' %}

## Vertical

{% example '@nvidia-elements/core/scroll-box/scroll-box.examples.json' 'Vertical' %}

## Horizontal

{% example '@nvidia-elements/core/scroll-box/scroll-box.examples.json' 'Horizontal' %}

## Scroll bars and shadows

{% example '@nvidia-elements/core/scroll-box/scroll-box.examples.json' 'HiddenScrollbar' %}

## Native scrolling APIs

Use the host's native methods, properties, and events. Listen for `scroll` and `scrollend` directly on the host; element scroll events do not bubble. RTL scrolling retains native coordinates.

```javascript
const scrollBox = document.querySelector('nve-scroll-box');
scrollBox.scrollTo({ top: 100, behavior: 'smooth' });
scrollBox.addEventListener('scroll', () => {
  console.log(scrollBox.scrollTop);
});
```

Apply `scroll-snap-type`, `scroll-padding`, `scroll-behavior`, and `overscroll-behavior` to the host. Apply `scroll-snap-align` to content elements.

## Keyboard access

The scroll container joins the tab order when content overflows an enabled axis. It removes its automatic tab stop when all content fits. Author-supplied `tabindex` takes precedence. Keyboard scrolling follows native browser behavior, and focus remains under application control.
