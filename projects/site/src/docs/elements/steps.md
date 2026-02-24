---
{
  title: 'Steps',
  layout: 'docs.11ty.js',
  tag: 'nve-steps',
  associatedElements: ['nve-steps-item']
}
---

## Installation

{% install 'nve-steps' %}

By showing less information at a time, multi-step workflows allow users to focus better on the content pertinent to each step and decrease the chance of errors.

The Steps component consists of a `steps` parent element and many `steps-item` elements slotted as children. The `selected` attribute applied by the host application gives the selected step the proper selected styles.

Apply the `disabled` attribute to an item to get the proper visual cues and prevent interaction. The elements handle all default interaction, hover, and active states.

Additionally, the component handles all keyboard navigation and [accessibility](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) concerns out of the box. Try using left/right arrow keys on horizontal steps or up/down arrow keys on vertical steps.

## Condensed

{% api 'nve-steps-item', 'property', 'container' %}

{% example '@nvidia-elements/core/steps/steps.examples.json' 'Condensed' %}

## Vertical Steps

{% api 'nve-steps', 'property', 'vertical' %}

{% example '@nvidia-elements/core/steps/steps.examples.json' 'VerticalSteps' %}

## Vertical Condensed Steps

{% example '@nvidia-elements/core/steps/steps.examples.json' 'VerticalCondensedSteps' %}

## Stateless Steps

By default Steps is stateless. This means the host application must handle selection behavior.
The component provides a way to opt in to stateful selection behavior where click events and keyboard enter trigger the selection state.

All other examples on this page set `behavior-select` on the parent `steps` to opt into stateful behavior. The following example
shows the default stateless behavior, where the host app has to set/remove the `selected` attribute on child `<nve-steps-item>`.

{% example '@nvidia-elements/core/steps/steps.examples.json' 'StatelessSteps' %}
