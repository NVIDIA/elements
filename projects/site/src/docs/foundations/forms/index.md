---
{
  title: 'Forms',
  layout: 'docs.11ty.js',
  tag: 'nve-control'
}
---

The form control elements leverage the native browser inputs as its public API.
This approach allows any framework or library to use the form elements and keeps
the API simple without obfuscating the native browser APIs.

## Installation

The form elements are split into individual sub imports/entrypoints.

```typescript
import '@nvidia-elements/core/input/define.js';
```

```html
<nve-input>
  <label>label</label>
  <input type="text" />
  <nve-control-message>message</nve-control-message>
</nve-input>
```

## Framework Integrations

Each frontend framework typically provides its own guidance and best practices for creating forms.

See the links below for specific integration patterns for the following frameworks:

{% svg-logos 'lit' 'angular' %}

<section nve-layout="row align:left gap:md">
  <nve-button>
    <a href="./docs/integrations/lit/#forms"><svg width="20" height="20"><use href="#lit-svg"></use></svg> Lit Integration</a>
  </nve-button>

  <nve-button>
    <a href="./docs/integrations/angular/#forms"><svg width="20" height="20"><use href="#angular-svg"></use></svg> Angular Integration</a>
  </nve-button>
</section>

## Form layouts

All form elements support the following layouts for label placement, `horizontal`, `horizontal-inline`, `vertical` and `vertical-inline`.
Vertical is the default label layout for all elements.

### Horizontal Inline

{% api 'nve-control', 'property' 'layout' %}

{% story '@nvidia-elements/core/forms/forms.stories.json', 'HorizontalInline' %}

### Horizontal

{% api 'nve-control', 'property' 'layout' %}

{% story '@nvidia-elements/core/forms/forms.stories.json', 'Horizontal' %}

### Vertical

{% api 'nve-control', 'property' 'layout' %}

{% story '@nvidia-elements/core/forms/forms.stories.json', 'Vertical' %}

### Vertical Inline

{% api 'nve-control', 'property' 'layout' %}

{% story '@nvidia-elements/core/forms/forms.stories.json', 'VerticalInline' %}

## Fit Text

{% api 'nve-control', 'property' 'fitText' %}

{% story '@nvidia-elements/core/forms/control/control.stories.json', 'FitText' %}

## Kitchen Sink

{% story '@nvidia-elements/core/forms/forms.stories.json', 'KitchenSink' %}
