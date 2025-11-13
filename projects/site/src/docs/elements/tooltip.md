---
{
  title: 'Tooltip',
  layout: 'docs.11ty.js',
  tag: 'nve-tooltip'
}
---

## Installation

Learn more about native [Popover APIs](docs/foundations/popovers/).

{% install 'nve-tooltip' %}

## Standard

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'Default' %}

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'Visual' '{ "inline": false, "height": "130px" }' %}

## Position

{% api 'nve-tooltip', 'property', 'position' %}

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'Position' '{ "inline": false, "height": "280px" }' %}

## Alignment

{% api 'nve-tooltip', 'property', 'alignment' %}

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'Alignment' '{ "inline": false, "height": "350px" }' %}

## Events

{% api 'nve-tooltip', 'event' %}

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'Events' '{ "inline": false, "height": "280px" }' %}

## Open Delay

{% api 'nve-tooltip', 'property' 'openDelay' %}

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'OpenDelay' '{ "inline": false, "height": "300px" }' %}

## Dynamic Trigger

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'DynamicTrigger' '{ "inline": false, "height": "300px" }' %}

## Wrap

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'Wrap' '{ "inline": false, "height": "280px" }' %}

## Content

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'Content' '{ "inline": false, "height": "280px" }' %}

## Status

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'Status' '{ "inline": false, "height": "300px" }' %}

## Hint

{% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'Hint' '{ "inline": false, "height": "200px" }' %}

## Dynamic Anchor Position

A popover will follow its assigned anchor event when the anchor position is dynamically changed.

<!-- {% example '@nvidia-elements/core/tooltip/tooltip.examples.json' 'DynamicAnchorPosition' %} -->

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
