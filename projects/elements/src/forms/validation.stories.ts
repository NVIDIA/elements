import { html } from 'lit';
import '@elements/elements/input/define.js';
import '@elements/elements/password/define.js';

export default {
  title: 'Foundations/Forms/Examples',
  parameters: { badges: ['alpha'] }
};

export const Validation = () => {
  return html`
<form mlv-layout="column gap:md" style="max-width: 350px;">
  <mlv-input>
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <mlv-control-message error="valueMissing">required</mlv-control-message>
    <mlv-control-message error="patternMismatch">invalid NVIDIA email</mlv-control-message>
  </mlv-input>

  <mlv-password>
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
    <mlv-control-message error="valueMissing">required</mlv-control-message>
    <mlv-control-message error="tooShort">minimum length is 6 characters</mlv-control-message>
  </mlv-password>

  <mlv-button disabled>login to account</mlv-button>

  <mlv-alert-group hidden status="success">
    <mlv-alert></mlv-alert>
  </mlv-alert-group>
</form>
<script>
  const form = document.querySelector('form');
  const alertGroup = document.querySelector('mlv-alert-group');
  const alert = document.querySelector('mlv-alert');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    alert.innerText = values.email + ' / ' + values.password;
    alertGroup.hidden = false;
  });

  form.addEventListener('input', e => {
    form.querySelector('mlv-button').disabled = form.matches(':invalid');
  });
</script>
`;
}

export const ValidationErrorGroup = () => {
  return html`
<form mlv-layout="column gap:md" style="max-width: 350px;" novalidate>
  <mlv-input status="error">
    <label>email</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <mlv-control-message status="error">invalid email</mlv-control-message>
  </mlv-input>

  <mlv-password status="error">
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
    <mlv-control-message status="error">minimum length is 6 characters</mlv-control-message>
  </mlv-password>

  <mlv-button>login to account</mlv-button>

  <mlv-alert-group status="danger">
    <mlv-alert>invalid email</mlv-alert>
    <mlv-alert>password required</mlv-alert>
  </mlv-alert-group>
</form>
`;
}

export const ValidationSuccessGroup = () => {
  return html`
<form mlv-layout="column gap:md" style="max-width: 350px;" novalidate>
  <mlv-input>
    <label>username</label>
    <input type="email" name="email" required pattern=".+@nvidia\.com" autocomplete="off" />
    <mlv-control-message status="success">username available</mlv-control-message>
  </mlv-input>

  <mlv-password status="error">
    <label>password</label>
    <input type="password" name="password" required minlength="6" autocomplete="off" />
  </mlv-password>

  <mlv-button>login to account</mlv-button>

  <mlv-alert-group status="success">
    <mlv-alert closable>account created</mlv-alert>
  </mlv-alert-group>
</form>
`;
}