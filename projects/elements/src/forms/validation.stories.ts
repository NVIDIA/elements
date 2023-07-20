import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/alert/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/password/define.js';

export default {
  title: 'Foundations/Forms/Examples',
};

export const Validation = () => {
  return html`
<form id="validation" nve-layout="column gap:md" style="max-width: 350px;">
  <nve-input>
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <nve-control-message error="valueMissing">required</nve-control-message>
    <nve-control-message error="patternMismatch">invalid NVIDIA email</nve-control-message>
  </nve-input>

  <nve-password>
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
    <nve-control-message error="valueMissing">required</nve-control-message>
    <nve-control-message error="tooShort">minimum length is 6 characters</nve-control-message>
  </nve-password>

  <nve-button disabled>login to account</nve-button>

  <nve-alert-group hidden status="success">
    <nve-alert></nve-alert>
  </nve-alert-group>
</form>
<script type="module">
  const form = document.querySelector('form#validation');
  const alertGroup = document.querySelector('#validation nve-alert-group');
  const alert = document.querySelector('#validation nve-alert');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(form));
    alert.innerText = email + ' / ' + password;
    alertGroup.hidden = false;
  });

  form.addEventListener('input', e => {
    form.querySelector('nve-button').disabled = form.matches(':invalid');
  });
</script>
`;
}

export const ValidationErrorGroup = () => {
  return html`
<form nve-layout="column gap:md" style="max-width: 350px;" novalidate>
  <nve-input status="error">
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <nve-control-message status="error">invalid email</nve-control-message>
  </nve-input>

  <nve-password status="error">
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
    <nve-control-message status="error">minimum length is 6 characters</nve-control-message>
  </nve-password>

  <nve-button>login to account</nve-button>

  <nve-alert-group status="danger">
    <nve-alert>invalid email</nve-alert>
    <nve-alert>password required</nve-alert>
  </nve-alert-group>
</form>
`;
}

export const ValidationSuccessGroup = () => {
  return html`
<form nve-layout="column gap:md" style="max-width: 350px;" novalidate>
  <nve-input>
    <label>username</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <nve-control-message status="success">username available</nve-control-message>
  </nve-input>

  <nve-password status="error">
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
  </nve-password>

  <nve-button>login to account</nve-button>

  <nve-alert-group status="success">
    <nve-alert closable>account created</nve-alert>
  </nve-alert-group>
</form>
`;
}

export const ValidationReset = () => {
  return html`
<form nve-layout="column gap:md" style="max-width: 350px;">
  <nve-input>
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" value="test@nvidia.com" />
    <nve-icon-button aria-label="reset" icon-name="cancel" interaction="flat" type="button"></nve-icon-button>
    <nve-control-message error="valueMissing">required</nve-control-message>
    <nve-control-message error="patternMismatch">invalid NVIDIA email</nve-control-message>
  </nve-input>

  <nve-password status="error">
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
    <nve-control-message error="valueMissing">required</nve-control-message>
  </nve-password>

  <nve-button type="button">reset form</nve-button>
</form>
<script type="module">
  const form = document.querySelector('form');
  const input = form.querySelector('nve-input');
  const resetInput = form.querySelector('nve-icon-button[icon-name="cancel"]');
  const resetForm = form.querySelector('nve-button');

  resetInput.addEventListener('click', e => input.reset());
  resetForm.addEventListener('click', e => form.reset());
  form.addEventListener('reset', e => console.log(e));
</script>
`;
}
