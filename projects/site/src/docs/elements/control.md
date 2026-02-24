---
{
  title: 'Controls',
  layout: 'docs.11ty.js',
  tag: 'nve-control',
  associatedElements: ['nve-control-message', 'nve-control-group']
}
---

## Installation

```typescript
import '@nvidia-elements/core/forms/define.js';
```

The `<nve-control>` element is the base control that the `<nve-*` form controls extend. It works for generic input type as well as custom or third party form controls.

## Responsive

All control elements are responsive and adjust to one of the set layouts based on the available space.

The element breakpoints use the available space to the element rather than the viewport.

{% example '@nvidia-elements/core/forms/control/control.examples.json', 'Responsive' %}

## Prominence Muted

{% example '@nvidia-elements/core/forms/forms.examples.json', 'ProminenceMuted' %}

## Custom Controls

Custom inputs work with and leverage the same form layouts and validation statuses as the built in controls.

Place the `nve-control` attribute on the element that is the custom input.

```html
<nve-control>
  <label>custom control</label>
  <my-custom-form-control nve-control></my-custom-form-control>
  <nve-control-message>message</nve-control-message>
</nve-control>
```

## Form Associated Elements

Many of the form controls wrap the native HTML form element or `<input>` element with the corresponding `type` attribute set.

```html
<nve-input>
  <label>label</label>
  <input type="text" value="12345" />
</nve-input>

<nve-textarea>
  <label>label</label>
  <textarea value="123456789"></textarea>
</nve-textarea>

<nve-switch>
  <label>label</label>
  <input type="checkbox" checked />
</nve-switch>

<nve-range>
  <label>label</label>
  <input type="range" min="0" max="100" step="10" value="50" />
</nve-range>
```

But Elements includes [Form Associated Elements](https://web.dev/more-capable-form-controls) which emit `change` / `input`
events and work with native HTML `<form>` validation and [FormData](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_FormData_Objects) submission.

On these elements, subscribe to event changes and set the `value` directly on the custom `<nve-*` elements rather than on an `<input>`:

```html
<nve-resize-handle min="0" max="100" step="10" value="50"></nve-resize-handle>

<nve-preferences-input name="theme" value="{ 'theme': 'dark' }"></nve-preferences-input>
```

All form elements display the `Form Control` badge in the docs.
