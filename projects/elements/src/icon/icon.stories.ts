/* eslint-disable guard-for-in */
import { html, LitElement, unsafeCSS } from 'lit';
import { state } from 'lit/decorators/state.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { ComponentStatuses, generateDefaultStoryParameters } from '@elements/elements/internal';
import layout from '@elements/elements/css/module.layout.css';
import typography from '@elements/elements/css/module.typography.css';
import { Icon, IconName, ICON_NAMES } from '@elements/elements/icon';
import '@elements/elements/icon/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/search/define.js';
import '@elements/elements/notification/define.js';

const reviewDocBookmark = 'id.zckm5su0hyrd';
const status: ComponentStatuses = 'beta';
const description = `
  ## The MagLev Icon Component
`;

export default {
  title: 'Elements/Icon/Examples',
  component: 'mlv-icon',
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description),
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
    html`<mlv-icon
      .name=${args.name}
      .status=${args.status}
    ></mlv-icon>`,
  args: { name: 'user' }
};

export const IconCatalog = {
  render: () => html`
    <icon-demo></icon-demo>

    <mlv-notification-group position="bottom" alignment="end"></mlv-notification-group>
  `
};

@customElement('icon-demo')
class IconDemo extends LitElement {
  static styles = [unsafeCSS(layout), unsafeCSS(typography)];

  @state() iconSearchKey = '';

  render() {
    return html`
    <style>
      mlv-button {
        --border-radius: var(--mlv-ref-border-radius-sm);
        --height: 100px;
      }
    </style>

    <div mlv-layout="column gap:lg">
      <mlv-search>
        <input type="search" @input=${e => this.iconSearchKey = e.target.value} aria-label="Search the Icon Catalog" placeholder="Search the Icon Catalog" />
      </mlv-search>

      <div mlv-layout="grid gap:md span-items:2">
        ${ICON_NAMES.filter((iconName) => iconName.includes(this.iconSearchKey)).map((iconName) => html`
          <mlv-button @click=${() => this.#copyIcon(iconName)} title="Copy '${iconName}' to clipboard.">
            <div mlv-layout="column align:center gap:md">
              <mlv-icon size="lg" name=${iconName as IconName}></mlv-icon>
              <h3 mlv-text="label sm">${iconName}</h3>
            </div>
          </mlv-button>`
        )}
      </div>
    </div>
  `;
  }

  #copyIcon(iconName: string) {
    const iconCode = `<mlv-icon name="${iconName}"></mlv-icon>`;
    navigator.clipboard.writeText(iconCode);

    const notification = document.createElement('mlv-notification');
    notification.closable = true;
    // notification.status = 'success';
    notification.innerHTML = `<h3 mlv-text="label">Copied!</h3><p mlv-text="body">${iconCode} icon code copied to clipboard.</p>`;
    notification.addEventListener('close', () => notification.remove(), { once: true });

    console.log(notification, document);
    console.log(`${iconCode} Copied!`);

    document.querySelector('mlv-notification-group').prepend(notification);
    setTimeout(() => notification.remove(), 2000 * (document.querySelectorAll('mlv-notification').length));
  }
}

export const PreviewAllIcons = {
  render: () => html`
    ${ICON_NAMES.map((iconName) => html`<mlv-icon .name=${iconName as IconName}></mlv-icon>\n`
    )}
  `,
  args: { name: 'user' }
};

export const statuses = {
  render: () => html`
    <mlv-icon name="user"></mlv-icon>
    <mlv-icon name="user" status="accent"></mlv-icon>
    <mlv-icon name="user" status="success"></mlv-icon>
    <mlv-icon name="user" status="warning"></mlv-icon>
    <mlv-icon name="user" status="danger"></mlv-icon>
  `
}

export const size = {
  render: () => html`
    <mlv-icon name="user" size="sm"></mlv-icon>
    <mlv-icon name="user"></mlv-icon>
    <mlv-icon name="user" size="lg"></mlv-icon>
  `
}

export const direction = {
  render: () => html`
    <mlv-icon name="expand-panel"></mlv-icon>
    <mlv-icon name="collapse-panel"></mlv-icon>
    <mlv-icon name="arrow" direction="up"></mlv-icon>
    <mlv-icon name="arrow" direction="down"></mlv-icon>
    <mlv-icon name="arrow" direction="left"></mlv-icon>
    <mlv-icon name="arrow" direction="right"></mlv-icon>
    <mlv-icon name="caret" direction="up"></mlv-icon>
    <mlv-icon name="caret" direction="down"></mlv-icon>
    <mlv-icon name="caret" direction="left"></mlv-icon>
    <mlv-icon name="caret" direction="right"></mlv-icon>
    <mlv-icon name="chevron" direction="up"></mlv-icon>
    <mlv-icon name="chevron" direction="down"></mlv-icon>
    <mlv-icon name="chevron" direction="left"></mlv-icon>
    <mlv-icon name="chevron" direction="right"></mlv-icon>
  `
}

export const themes = {
  render: () => html`
    <div mlv-theme="root light">
      <mlv-icon name="user"></mlv-icon>
      <mlv-icon name="user" status="accent"></mlv-icon>
      <mlv-icon name="user" status="success"></mlv-icon>
      <mlv-icon name="user" status="warning"></mlv-icon>
      <mlv-icon name="user" status="danger"></mlv-icon>
    </div>
    <div mlv-theme="root dark">
      <mlv-icon name="user"></mlv-icon>
      <mlv-icon name="user" status="accent"></mlv-icon>
      <mlv-icon name="user" status="success"></mlv-icon>
      <mlv-icon name="user" status="warning"></mlv-icon>
      <mlv-icon name="user" status="danger"></mlv-icon>
    </div>
  `
}
