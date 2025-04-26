---
{
  title: 'Tooltip',
  layout: 'docs.11ty.js',
  tag: 'nve-tooltip'
}
---

## Installation

```typescript
import '@nvidia-elements/core/tooltip/define.js';
```

```html
<nve-tooltip id="tooltip">tooltip</nve-tooltip>
<nve-button popovertarget="tooltip">button</nve-button>
```

## Standard

{% story 'nve-tooltip', 'Default' %}

{% story 'nve-tooltip', 'Visual', '{ "inline": false, "height": "130px" }' %}

## Position

{% api 'nve-tooltip', 'property', 'position' %}

{% story 'nve-tooltip', 'Position', '{ "inline": false, "height": "280px" }' %}

## Alignment

{% api 'nve-tooltip', 'property', 'alignment' %}

{% story 'nve-tooltip', 'Alignment', '{ "inline": false, "height": "350px" }' %}

## Events

{% api 'nve-tooltip', 'event', 'open' %}

{% api 'nve-tooltip', 'event', 'close' %}

{% story 'nve-tooltip', 'Events', '{ "inline": false, "height": "280px" }' %}

## Dynamic Trigger

A popover can be recycled for multiple triggers.

{% story 'nve-tooltip', 'DynamicTrigger', '{ "inline": false, "height": "300px" }' %}

## Open Delay

Optionally, add a delay to tooltip opening, with `open-delay` attribute (set in milliseconds) -
useful when displaying tooltips on datagrid items to avoid overwhelming the UX as the user hovers over rows.

{% story 'nve-tooltip', 'OpenDelay', '{ "inline": false, "height": "300px" }' %}

## Wrap

{% story 'nve-tooltip', 'Wrap', '{ "inline": false, "height": "280px" }' %}

## Content

{% story 'nve-tooltip', 'Content', '{ "inline": false, "height": "280px" }' %}

## Status

{% story 'nve-tooltip', 'Status', '{ "inline": false, "height": "300px" }' %}

## Hint

{% story 'nve-tooltip', 'Hint', '{ "inline": false, "height": "200px" }' %}

## Dynamic Anchor Position

A popover will follow its assigned anchor event when the anchor position is dynamically changed.

<!-- {% story 'nve-tooltip', 'DynamicAnchorPosition' %} -->

```typescript
@customElement('dynamic-anchor-position-demo')
class DynamicAnchorPositionDemo extends LitElement {
  #anchor: Ref<HTMLElement> = createRef();

  render() {
    return html`
      <div ${ref(this.#anchor)} id="anchor"></div>
      <nve-tooltip anchor="anchor">tooltip</nve-tooltip>
    `;
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.addEventListener('mousemove', e => this.#anchor.value.style.inset = `${e.clientY - 15}px auto auto ${e.clientX - 15}px`);
  }
}
```

<script type="module" src="/_internal/stories/tooltip/dynamic-anchor.js"></script>
