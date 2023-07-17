/* eslint-disable guard-for-in */
import { html, LitElement, unsafeCSS } from 'lit';
import { state } from 'lit/decorators/state.js';
import { customElement } from 'lit/decorators/custom-element.js';
import layout from '@elements/elements/css/module.layout.css?inline';
import typography from '@elements/elements/css/module.typography.css?inline';
import { Icon, IconName, ICON_NAMES } from '@elements/elements/icon';
import '@elements/elements/button/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/search/define.js';
import '@elements/elements/notification/define.js';

export default {
  title: 'Elements/Icon/Examples',
  component: 'nve-icon',
  argTypes: {
    name: {
      control: 'inline-radio',
      options: ICON_NAMES
    },
    status: {
      control: 'inline-radio',
      options: ['default', 'success', 'warning', 'danger', 'accent']
    },
  }
};

interface ArgTypes {
  status: Icon['status'];
  name: IconName;
}

export const Default = {
  render: (args: ArgTypes) =>
    html`<nve-icon
      .name=${args.name}
      .status=${args.status}
    ></nve-icon>`,
  args: { name: 'user' }
};

export const IconCatalog = {
  render: () => html`
    <icon-demo></icon-demo>

    <nve-notification-group position="bottom" alignment="end"></nve-notification-group>
  `
};

@customElement('icon-demo')
class IconDemo extends LitElement {
  static styles = [unsafeCSS(layout), unsafeCSS(typography)];

  @state() iconSearchKey = '';

  render() {
    return html`
    <style>
      nve-button {
        --border-radius: var(--nve-ref-border-radius-sm);
        --height: 100px;
      }
    </style>

    <div nve-layout="column gap:lg">
      <nve-search>
        <input type="search" @input=${e => this.iconSearchKey = e.target.value} aria-label="Search the Icon Catalog" placeholder="Search the Icon Catalog" />
      </nve-search>

      <div nve-layout="grid gap:md span-items:2">
        ${ICON_NAMES.filter((iconName) => iconName.includes(this.iconSearchKey)).map((iconName) => html`
          <nve-button @click=${() => this.#copyIcon(iconName)} title="Copy '${iconName}' to clipboard.">
            <div nve-layout="column align:center gap:md">
              <nve-icon size="lg" name=${iconName as IconName}></nve-icon>
              <h3 nve-text="label sm">${iconName}</h3>
            </div>
          </nve-button>`
        )}
      </div>
    </div>
  `;
  }

  #copyIcon(iconName: string) {
    const iconCode = `<nve-icon name="${iconName}"></nve-icon>`;
    navigator.clipboard.writeText(iconCode);

    const notification = document.createElement('nve-notification');
    notification.closable = true;
    // notification.status = 'success';
    notification.innerHTML = `<h3 nve-text="label">Copied!</h3><p nve-text="body">${iconCode} icon code copied to clipboard.</p>`;
    notification.addEventListener('close', () => notification.remove(), { once: true });

    console.log(notification, document);
    console.log(`${iconCode} Copied!`);

    document.querySelector('nve-notification-group').prepend(notification);
    setTimeout(() => notification.remove(), 2000 * (document.querySelectorAll('nve-notification').length));
  }
}

export const PreviewAllIcons = {
  render: () => html`
    ${ICON_NAMES.map((iconName) => html`<nve-icon name=${iconName as IconName}></nve-icon>\n`
    )}
  `,
  args: { name: 'user' }
};

export const Statuses = {
  render: () => html`
    <nve-icon name="user"></nve-icon>
    <nve-icon name="user" status="accent"></nve-icon>
    <nve-icon name="user" status="success"></nve-icon>
    <nve-icon name="user" status="warning"></nve-icon>
    <nve-icon name="user" status="danger"></nve-icon>
  `
}

export const Size = {
  render: () => html`
    <nve-icon name="user" size="sm"></nve-icon>
    <nve-icon name="user"></nve-icon>
    <nve-icon name="user" size="lg"></nve-icon>
  `
}

export const Direction = {
  render: () => html`
    <nve-icon name="expand-panel"></nve-icon>
    <nve-icon name="collapse-panel"></nve-icon>
    <nve-icon name="arrow" direction="up"></nve-icon>
    <nve-icon name="arrow" direction="down"></nve-icon>
    <nve-icon name="arrow" direction="left"></nve-icon>
    <nve-icon name="arrow" direction="right"></nve-icon>
    <nve-icon name="caret" direction="up"></nve-icon>
    <nve-icon name="caret" direction="down"></nve-icon>
    <nve-icon name="caret" direction="left"></nve-icon>
    <nve-icon name="caret" direction="right"></nve-icon>
    <nve-icon name="chevron" direction="up"></nve-icon>
    <nve-icon name="chevron" direction="down"></nve-icon>
    <nve-icon name="chevron" direction="left"></nve-icon>
    <nve-icon name="chevron" direction="right"></nve-icon>
  `
}

export const Themes = {
  render: () => html`
    <div nve-theme="root light">
      <nve-icon name="user"></nve-icon>
      <nve-icon name="user" status="accent"></nve-icon>
      <nve-icon name="user" status="success"></nve-icon>
      <nve-icon name="user" status="warning"></nve-icon>
      <nve-icon name="user" status="danger"></nve-icon>
    </div>
    <div nve-theme="root dark">
      <nve-icon name="user"></nve-icon>
      <nve-icon name="user" status="accent"></nve-icon>
      <nve-icon name="user" status="success"></nve-icon>
      <nve-icon name="user" status="warning"></nve-icon>
      <nve-icon name="user" status="danger"></nve-icon>
    </div>
  `
}


export const Registration = {
  render: () => html`
    <nve-icon name="inference-ai-posters" style="--width: 75px; --height: 75px;"></nve-icon>
    <nve-icon name="automotive-vehicles-autonomous-car-side" style="--width: 75px; --height: 75px;"></nve-icon>

    <script type="module">
      customElements.get('nve-icon').add({
        'inference-ai-posters': {
          svg: () => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48"><g clip-path="url(#inference-ai-posters__a)"><path fill="currentColor" d="M40.5 11.5h-33v25h33v-25Zm-1 24h-31v-23h31v23ZM5.5 9.325V38.5h37V9.325h-37Zm36 28.175h-35V10.325h35V37.5Zm-26-10.908a1.477 1.477 0 0 0-1.23.093 1.5 1.5 0 1 0 1.908 2.233L22.5 32.04a1.5 1.5 0 0 0 2.992 0l6.326-3.122a1.506 1.506 0 1 0 .679-2.326l-1.927-2.623 1.853-2.585a1.5 1.5 0 1 0-.5-2.42l-6.432-2.842c0-.041.012-.08.012-.122a1.5 1.5 0 1 0-3 0c0 .042.009.081.012.122l-6.435 2.842a1.5 1.5 0 1 0-.5 2.42l1.853 2.585-1.933 2.623Zm8-9.184a1.4 1.4 0 0 0 1 0l3.246 4.41-2.567 1.265a1.482 1.482 0 0 0-2.356 0l-2.567-1.265 3.244-4.41Zm8 10.552-5.869 2.9 3.035-4.235 2.842 1.255c.002.02-.008.052-.008.08Zm-15.016-.084 2.842-1.255 3.035 4.235L16.5 27.96c0-.028-.01-.06-.012-.084h-.004Zm7.852 2.666a1.4 1.4 0 0 0-.68 0l-3.267-4.39 2.526-1.116a1.492 1.492 0 0 0 2.162 0l2.526 1.116-3.267 4.39ZM24.5 24a.5.5 0 0 1-.038.189v.011a.5.5 0 0 1-.914 0v-.011A.5.5 0 1 1 24.5 24Zm.988.122c0-.027.007-.054.008-.081l2.852-1.4.932 1.259-1.06 1.425-2.732-1.203Zm-2.988-.081c0 .027.006.054.008.081l-2.728 1.207-1.06-1.429.932-1.267 2.848 1.408Zm-3.769 1.75-2.081.919 1.388-1.886.693.967ZM14.5 28a.5.5 0 1 1 .999.002A.5.5 0 0 1 14.5 28Zm9.5 4.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Zm9.5-4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm-2.154-1.29-2.081-.919.693-.967 1.388 1.886Zm-2.087-4.522 2.048-1.008-1.4 1.884-.648-.876ZM33.5 20a.5.5 0 0 1-.692.461l-.172-.123-.011-.017-.1-.206A.492.492 0 0 1 32.5 20a.5.5 0 0 1 .998.007L33.5 20Zm-2-.031-2.846 1.4-3-4.081 5.858 2.588c-.002.032-.012.062-.012.093ZM24 15.5a.5.5 0 0 1 .463.685l-.009.019a.507.507 0 0 1-.1.149h-.006a.495.495 0 0 1-.7 0h-.006a.507.507 0 0 1-.1-.149l-.009-.019A.5.5 0 0 1 24 15.5Zm-1.654 1.789-3 4.081-2.846-1.4c0-.03-.007-.06-.009-.091l5.855-2.59ZM14.5 20a.5.5 0 1 1 1 0 .459.459 0 0 1-.024.117l-.1.2-.013.02-.172.123a.49.49 0 0 1-.545-.106A.5.5 0 0 1 14.5 20Zm2.193 1.18 2.048 1.008-.646.876-1.402-1.884Z"/></g><defs><clipPath id="inference-ai-posters__a"><path fill="currentColor" d="M0 0h48v48H0z"/></clipPath></defs></svg>'
        },
        'automotive-vehicles-autonomous-car-side': {
          svg: () => fetch('https://brand-assets.cne.ngc.nvidia.com/assets/marketing-icons/1.2.0/automotive-vehicles-autonomous-car-side.svg').then(r => r.text())
        }
      });
    </script>
  `
}

export const Alias = {
  render: () => html`
    <nve-icon name="chevron"></nve-icon>
    <nve-icon name="chevron-up"></nve-icon>

    <script type="module">
      customElements.get('nve-icon').alias({
        'chevron': 'chevron-up'
      });
    </script>
  `
}

export const Source = {
  render: () => html`
    <nve-icon name="https://brand-assets.cne.ngc.nvidia.com/assets/marketing-icons/1.2.0/automotive-vehicles-autonomous-car-side.svg" style="--width: 75px; --height: 75px;"></nve-icon>
  `
}
