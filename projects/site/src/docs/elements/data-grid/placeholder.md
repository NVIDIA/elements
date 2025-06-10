---
{
  title: 'Data Grid Placeholder',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

{% api 'nve-grid-placeholder', 'description' %}

```html
<nve-grid style="min-height: 400px">
  <nve-grid-header>
    <nve-grid-column></nve-grid-column>
  </nve-grid-header>
  <nve-grid-placeholder>
    <nve-progress-ring status="accent" size="lg"></nve-progress-ring>
  </nve-grid-placeholder>
</nve-grid>
```

## Loading

{% story 'nve-grid', 'Placeholder' %}

## Retry

{% story 'nve-grid', 'PlaceholderRetry' %}
