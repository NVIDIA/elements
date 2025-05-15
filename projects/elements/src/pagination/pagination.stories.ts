import { html } from 'lit';
import '@nvidia-elements/core/pagination/define.js';
import '@nvidia-elements/core/button/define.js';

export default {
  title: 'Elements/Pagination',
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

export const Flat = {
  render: () => html`
    <nve-pagination container="flat" value="1" items="100" step="10" skippable></nve-pagination>
  `
};

export const Inline = {
  render: () => html`
    <nve-pagination container="inline" value="1" items="100" step="10"></nve-pagination>
  `
};

export const DisableStep = {
  render: () => html`
    <nve-pagination disable-step container="inline" value="1" items="100" step="10"></nve-pagination>
  `
};

export const Forms = {
  render: () => html`
    <form id="pagination-form" nve-layout="column gap:md">
      <nve-pagination name="page" value="1" items="100" step="10" aria-label="pagination controls"></nve-pagination>
      <nve-button>submit page 10</nve-button>
      <pre></pre>
    </form>
    <script type="module">
      const form = document.querySelector('form');
      const pre = document.querySelector('form pre');

      form.addEventListener('change', updateValues);
      form.addEventListener('input', updateValues);
      form.addEventListener('submit', updateValues);
      form.addEventListener('step-change', updateValues);

      function updateValues(e) {
        e.preventDefault();
        console.log(e);
        pre.innerText = JSON.stringify({ ...Object.fromEntries(new FormData(form)), step: form.elements.page.step }, null, 2);
      }
    </script>
  `
};

export const NoItemsCount = {
  render: () => html`
    <form id="pagination-form" nve-layout="column gap:md">
      <nve-pagination name="page" value="1" step="10" aria-label="pagination controls"></nve-pagination>
      <pre></pre>
    </form>
    <script type="module">
      const form = document.querySelector('form');
      const pre = document.querySelector('form pre');
      form.addEventListener('input', updateValues);
      form.addEventListener('step-change', updateValues);
      function updateValues(e) {
        e.preventDefault();
        pre.innerText = JSON.stringify({ ...Object.fromEntries(new FormData(form)), step: form.elements.page.step }, null, 2);
      }
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

export const LargeValues = {
  render: () => html`
    <nve-pagination container="inline" value="1" items="10000" step="100"></nve-pagination>
  `
}

export const DynamicItems = {
  render: () => html`
    <nve-pagination disable-step container="inline" value="1" items="100" step="20"></nve-pagination>

    <script type="module">
      const pagination = document.querySelector('nve-pagination');
      let items = loadItems();

      pagination.addEventListener('last-page', async () => {
        items = [...items, ...loadItems()];
        pagination.items = items.length;
      });

      function loadItems() {
        return new Array(100).fill('');
      }
    </script>
  `
}

export const DynamicStepSize = {
  render: () => html`
  <!-- javascript property binding -->
  <nve-pagination value="1" items="10000" step="100" step-sizes="[100, 500, 1000]"></nve-pagination>
  `
};
