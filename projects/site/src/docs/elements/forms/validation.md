---
{
  title: 'Form Validation',
  layout: 'docs.11ty.js',
  tag: 'nve-control',
  permalink: 'docs/foundations/forms/validation/index.html'
}
---

# Form Validation

The `control` supports various validation statuses such as error and success. These statuses can be toggle by any framework level forms API. However the `control` component does also support the native [HTML Validation API](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation). Defining a Validity State on a `control-message` will allow messages to be
shown conditionally based on the current input validity state.

[MDN Validity State](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)

To manage validation manually use the `novalidate` attribute to disable HTML5 validation. If you are using a framework that manages valdiation like Angular, then `novalidate` is automatically applied.

<!-- <Canvas of={ValidationStories.LitForms} /> -->

```html
<form>
  <nve-input>
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <nve-control-message error="valueMissing">required</nve-control-message>
    <nve-control-message error="patternMismatch">invalid NVIDIA email</nve-control-message>
  </nve-input>
<script>
  const form = document.querySelector('form');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    console.log(values); // { email: '...' }
  });
</script>
```

## Reset

Individual controls can be reset by calling the `reset()` method on the control element. If controls are in a HTML Form then calling `reset()` on the form will reset all child controls.

{% story '@nvidia-elements/core/forms/validation.stories.json', 'ValidationReset' %}

## Error Groups

{% story '@nvidia-elements/core/forms/validation.stories.json', 'ValidationErrorGroup' %}

## Success Groups

{% story '@nvidia-elements/core/forms/validation.stories.json', 'ValidationSuccessGroup' %}
