---
{
  title: 'Registration',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Prefix

Custom Element tags are globally registered to the browser so elements must be scoped to prevent collisions.

- nve-\* Elements
- [plugin/app abbrev]-\* Plugins/Apps

## Conventions

Tag names should avoid using verbs or actions within the name. Verbs or actions should be described by the properties and events of the element. Exmaples:

<nve-alert status="success">Do:</nve-alert>

```html
<nve-select></nve-select>
```

<nve-alert status="danger">Don't:</nve-alert>

```html
<nve-selection></nve-selection>
```

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn: Elements should follow common and established names for existing UI patterns. See &nbsp;<a href="https://open-ui.org" nve-text="link">openui.org</a>&nbsp; for more details on upcoming specs.</nve-alert>

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn: learn common component names from the Open UI &nbsp;<a href="https://open-ui.org/research/component-matrix" nve-text="link">component name matrix</a>.</nve-alert>
