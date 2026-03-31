---
{
  title: 'Form Validation',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

The `control` supports validation statuses such as error and success. These statuses can be toggle by any framework level forms API. But the `control` component does also support the native [HTML Validation API](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation). Defining a Validity State on a `control-message` allows messages to appear conditionally based on the current input validity state.

To manage validation manually use the `novalidate` attribute to disable HTML5 validation. If you are using a framework that manages validation like Angular, then `novalidate` is automatically applied. [MDN Validity State](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)

{% example '@nvidia-elements/core/forms/validation.examples.json' 'LoginForm' %}

```html
<form>
  <nve-input>
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <nve-control-message error="valueMissing">required</nve-control-message>
    <nve-control-message error="patternMismatch">invalid NVIDIA email</nve-control-message>
  </nve-input>
<script type="module">
  const form = document.querySelector('form');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    console.log(values); // { email: '...' }
  });
</script>
```

## Reset

Individual controls can be reset by calling the `reset()` method on the control element. If controls are in a HTML Form then calling `reset()` on the form resets all child controls.

{% example '@nvidia-elements/core/forms/validation.examples.json' 'ResetForm' %}

## Error Groups

{% example '@nvidia-elements/core/forms/validation.examples.json' 'ErrorGroup' %}

## Success Groups

{% example '@nvidia-elements/core/forms/validation.examples.json' 'SuccessGroup' %}
