import { html } from 'lit';
import '@nvidia-elements/core/page-loader/define.js';

export default {
  title: 'Elements/Page Loader/Examples',
  component: 'mlv-page-loader',
};

export const Default = {
  render: () => html`
    <mlv-page-loader></mlv-page-loader>
  `
};

export const Interactive = {
  inline: false,
  render: () => html`
    <mlv-button id="loader-btn">trigger loader</mlv-button>
    <mlv-page-loader hidden></mlv-page-loader>

    <script type="module">
      let loader = document.querySelector('mlv-page-loader');
      let btn = document.querySelector('#loader-btn');
      btn.addEventListener('click', () => loader.hidden = false);
    </script>
  `
};