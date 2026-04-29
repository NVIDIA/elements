---
{
  title: 'Data Grid Display Settings',
  description: 'User-controlled display settings in NVIDIA Elements Data Grid: column visibility, density, and saved presets.',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  hideStatus: true
}
---

```html
<section nve-layout="row gap:md align:stretch">
  <nve-panel expanded closable>
    ...
  </nve-panel>

  <div nve-layout="column gap:md">
    <nve-button>display settings</nve-button>
    <nve-grid>
      ...
    </nve-grid>
  </div>
</section>
```

{% example '@nvidia-elements/core/grid/grid.examples.json' 'DisplaySettings' %}
