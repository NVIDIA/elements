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

The Steps component is composed of a `steps` parent element and multiple `steps-item` elements slotted as children. The `selected` attribute applied by the host application will give the selected step the proper selected styles.

The `disabled` attribute can be applied to an item to get the proper visual cues and prevent interaction. All default interaction, hover and active states are handled by the elements.

Additionally, all keyboard navigation and [accessibility](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) concerns are handled out of the box. Try using left/right arrow keys on horizontal steps or up/down arrow keys on vertical steps.

## Standard

{% story 'nve-steps', 'Default' %}

## Condensed

Steps can be displayed in a condensed view where the text labels are hidden. Set `container="condensed"` on `<nve-steps>`

{% story 'nve-steps', 'Condensed' %}

## Vertical Steps

Steps can be used as the foundation for a side menu by enabling vertical mode. Simply set `vertical` on `<nve-steps>`

{% story 'nve-steps', 'VerticalSteps' %}

## Vertical Condensed Steps

{% story 'nve-steps', 'VerticalCondensedSteps' %}

## Stateless Steps

By default Steps will be stateless. This means selection behavior will have to be handled by the host application.
We have provided a way to opt in to stateful selection behavior where click events and keyboard enter will trigger the selection state.

In all other examples on this page `behavior-select` is set on the parent `steps` to opt into stateful behavior. The following example
shows the default stateless behavior, where the host app will have to set/remove the `selected` attribute on child `<nve-steps-item>`.

{% story 'nve-steps', 'StatelessSteps' %}
