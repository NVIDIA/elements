import { html } from 'lit';
import '@elements/elements/pagination/define.js';
import '@elements/elements/button/define.js';

export default {
  title: 'Elements/Pagination/Examples',
  component: 'mlv-pagination',
};

export const Default = {
  render: () => html`
  <mlv-pagination value="1" items="100" step="10"></mlv-pagination>
  <script type="module">
    const pagination = document.querySelector('mlv-pagination');
    pagination.addEventListener('change', e => console.log(e.target.value));
  </script>
  `
};

export const Skippable = {
  render: () => html`
    <mlv-pagination value="1" items="100" step="10" skippable></mlv-pagination>
  `
};

export const Disabled = {
  render: () => html`
    <mlv-pagination disabled value="1" items="100" step="10" skippable></mlv-pagination>
  `
};

export const Flat = {
  render: () => html`
    <mlv-pagination container="flat" value="1" items="100" step="10" skippable></mlv-pagination>
  `
};

export const Inline = {
  render: () => html`
    <mlv-pagination container="inline" value="1" items="100" step="10"></mlv-pagination>
  `
};

export const DisableStep = {
  render: () => html`
    <mlv-pagination disable-step container="inline" value="1" items="100" step="10"></mlv-pagination>
  `
};

export const Forms = {
  render: () => html`
    <form id="pagination-form" mlv-layout="column gap:md">
      <mlv-pagination name="page" value="1" items="100" step="10" aria-label="pagination controls"></mlv-pagination>
      <mlv-button>submit page 10</mlv-button>
    </form>
    <script type="module">
      const form = document.querySelector('form');
      const button = document.querySelector('mlv-button');
      form.addEventListener('change', () => {
        button.innerText = 'submit page ' + Object.fromEntries(new FormData(form)).page;
      });

      form.addEventListener('submit', e => {
        e.preventDefault();
        alert(Object.fromEntries(new FormData(form)).page);
      });
    </script>
  `
};

export const LightTheme = {
  render: () => html`
<div mlv-theme="root light pad:md">
  <mlv-pagination disabled value="1" items="100" step="10" skippable></mlv-pagination>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div mlv-theme="root dark pad:md">
  <mlv-pagination disabled value="1" items="100" step="10" skippable></mlv-pagination>
</div>
  `
}