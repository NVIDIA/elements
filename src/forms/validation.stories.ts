import { html } from 'lit';
// import '@elements/elements/input/define.js';
// import '@elements/elements/password/define.js';

export default {
  title: 'Forms/Validation/Examples'
};

export const Validation = () => {
  return html`
<form style="display: flex; flex-direction: column; gap: 24px; max-width: 350px;">
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

  <nve-button>login to account</nve-button>

  <nve-alert-group hidden status="success">
    <nve-alert></nve-alert>
  </nve-alert-group>
</form>
<script>
  const form = document.querySelector('form');
  const alertGroup = document.querySelector('nve-alert-group');
  const alert = document.querySelector('nve-alert');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    alert.innerText = values.email + ' / ' + values.password;
    alertGroup.hidden = false;
  });
</script>
`;
}
