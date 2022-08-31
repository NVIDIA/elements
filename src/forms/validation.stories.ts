import { html } from 'lit';
// import '@elements/elements/input/define.js';
// import '@elements/elements/password/define.js';

export default {
  title: 'Forms/Validation/Examples'
};

export const Validation = () => {
  return html`
<form style="display: flex; flex-direction: column; gap: 24px; max-width: 350px;">
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

  <mlv-button>login to account</mlv-button>

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
</script>
`;
}
