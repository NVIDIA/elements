import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/preferences-input/define.js';

export default {
  title: 'Elements/Preferences Input/Examples',
  component: 'nve-preferences-input'
};

export const Default = {
  render: () => {
    return html`
      <nve-preferences-input name="theme" value='{ "theme": "dark", "scale": "compact", "reduced-motion": "true" }'></nve-preferences-input>
    `
  }
};

export const Forms = {
  render: () => {
    return html`
      <form id="preferences-input-form" nve-layout="row gap:md">
        <div nve-layout="column gap:md">
          <nve-preferences-input name="theme" value='{ "theme": "light" }'></nve-preferences-input>
          <nve-button>submit</nve-button>
        </div>
        <pre></pre>
      </form>
      <script type="module">
        const form = document.querySelector('form');
        const pre = document.querySelector('form pre');

        form.addEventListener('change', renderValues);
        form.addEventListener('input', renderValues);
        form.addEventListener('submit', renderValues);

        function renderValues(e) {
          e.preventDefault();
          console.log(e);
          pre.innerText = JSON.stringify({
            ...Object.fromEntries(new FormData(form)), event: e.type
          }, null, 2);
        }
      </script>
    `
  }
}

export const Dropdown = {
  render: () => {
    return html`
      <nve-page-header>
        <nve-logo slot="prefix" size="sm"></nve-logo>
        <h2 slot="prefix" nve-text="heading sm">NVIDIA</h2>
        <nve-icon-button slot="suffix" icon-name="gear" size="sm" popovertarget="preferences-input"></nve-icon-button>
      </nve-page-header>
      <nve-dropdown id="preferences-input" position="bottom" alignment="end">
        <nve-preferences-input name="theme" value='{ "theme": "dark" }'></nve-preferences-input>
      </nve-dropdown>
    `
  }
}
