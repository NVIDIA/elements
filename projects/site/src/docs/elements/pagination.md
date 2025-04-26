---
{
  title: 'Pagination',
  layout: 'docs.11ty.js',
  tag: 'nve-pagination'
}
---

## Installation

```typescript
import '@nvidia-elements/core/pagination/define.js';
```

```html
<nve-pagination value="1" items="100" step="20"></nve-pagination>
```

## Standard

{% story 'nve-pagination', 'Default' %}

## Skippable

{% story 'nve-pagination', 'Skippable' %}

## Disabled

{% story 'nve-pagination', 'Disabled' %}

## Flat

{% story 'nve-pagination', 'Flat' %}

## Inline

{% story 'nve-pagination', 'Inline' %}

## Disable Step

{% story 'nve-pagination', 'DisableStep' %}

## Dynamic Items

If the upper bound of items is unknown the `last-page` event can be used to determine when
to load additional data and update the pagination with the latest total of items.

{% story 'nve-pagination', 'DynamicItems' %}

## Dynamic Step Size

When custom step is provided, the select options dynamically adapt to the step and is appended to the default option list

{% story 'nve-pagination', 'DynamicStepSize' %}

## Forms

Pagination is [form associated component](https://web.dev/more-capable-form-controls/#defining-a-form-associated-custom-element) and can be used within FormData.

{% story 'nve-pagination', 'Forms', '{ "inline": false, "height": 300 }' %}

## No Provided Items Count

{% story 'nve-pagination', 'NoItemsCount', '{ "inline": false, "height": 200 }' %}
