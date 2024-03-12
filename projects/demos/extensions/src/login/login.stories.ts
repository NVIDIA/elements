import { html } from 'lit';
import 'extensions-elements-starter/login/define.js';
import '@elements/elements/button/define.js';

export default {
  title: 'Login',
  component: 'domain-login'
};

export const Default = {
  render: () => html`
  <form mlv-layout="column gap:md" style="width: 400px">
    <domain-login name="login"></domain-login>
    <mlv-button interaction="emphasis" style="margin-left: auto">login</mlv-button>
  </form>
  <script type="module">
    const form = document.querySelector('form');
    form.addEventListener('submit', e => {
      console.log('submit values', getValues(e));
      console.log('submit validity', e.target.validity);
    });

    form.addEventListener('input', e => {
      console.log('input', getValues(e));
      console.log('input validity', e.target.validity);
    });

    form.addEventListener('change', e => {
      console.log('change', getValues(e));
      console.log('change validity', e.target.validity);
    });

    function getValues(e) {
      e.preventDefault();
      return JSON.parse(Object.fromEntries(new FormData(form)).login);
    }
  </script>
  `
};
