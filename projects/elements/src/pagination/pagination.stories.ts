import { html } from 'lit';
import '@elements/elements/pagination/define.js';
import '@elements/elements/button/define.js';

export default {
  title: 'Elements/Pagination/Examples',
  component: 'nve-pagination',
};

export const Default = {
  render: () => html`
  <nve-pagination value="1" items="100" step="10"></nve-pagination>
  <script type="module">
    const pagination = document.querySelector('nve-pagination');
    pagination.addEventListener('change', e => console.log(e.target.value));
  </script>
  `
};

export const Skippable = {
  render: () => html`
    <nve-pagination value="1" items="100" step="10" skippable></nve-pagination>
  `
};

export const Disabled = {
  render: () => html`
    <nve-pagination disabled value="1" items="100" step="10" skippable></nve-pagination>
  `
};

export const Forms = {
  render: () => html`
    <form id="pagination-form" nve-layout="column gap:md">
      <nve-pagination name="page" value="1" items="100" step="10" aria-label="pagination controls"></nve-pagination>
      <nve-button>submit page 10</nve-button>
    </form>
    <script type="module">
      const form = document.querySelector('form');
      const button = document.querySelector('nve-button');
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
<div nve-theme="root light pad:md">
  <nve-pagination disabled value="1" items="100" step="10" skippable></nve-pagination>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark pad:md">
  <nve-pagination disabled value="1" items="100" step="10" skippable></nve-pagination>
</div>
  `
}