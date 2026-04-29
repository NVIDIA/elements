---
{
  title: 'Registration',
  description: 'Custom-element tag naming and registration patterns used by NVIDIA Elements: the nve- prefix, scoped registries, and define order.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Prefix

Custom Element tags register globally in the browser so you must scope elements to prevent collisions.

- nve-\* Elements
- [plugin/app abbrev]-\* Plugins/Apps

## Conventions

Tag names should avoid using verbs or actions within the name. The properties and events of the element should describe verbs or actions. Examples:

{% dodont %}

```html
<nve-select></nve-select>
```

```html
<nve-selection></nve-selection>
```

{% enddodont %}

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn: elements should follow common and established names for existing UI patterns. See &nbsp;<a href="https://open-ui.org" nve-text="link">openui.org</a>&nbsp; for more details on upcoming specs.</nve-alert>

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn: learn common component names from the Open UI &nbsp;<a href="https://open-ui.org/research/component-matrix" nve-text="link">component name matrix</a>.</nve-alert>
