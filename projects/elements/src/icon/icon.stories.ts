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
  component: 'nve-icon',
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description),
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['inherit', 'default']
    },
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
  variant: Icon['variant'];
  status: Icon['status'];
  name: IconName;
}

export const Default = {
  render: (args: ArgTypes) =>
    html`<nve-icon
      .name=${args.name}
      .variant=${args.variant}
      .status=${args.status}
    ></nve-icon>`,
  args: { name: 'user' }
};

export const PreviewAllIcons = {
  render: (args: ArgTypes) => html`
    ${ICON_NAMES.map((iconName) => html`<nve-icon .name=${iconName as IconName} .variant=${args.variant}></nve-icon>\n`
    )}
  `,
  args: { name: 'user' }
};

export const IconCatalog = {
  render: () => html`
    <icon-demo></icon-demo>

    <nve-notification-group position="bottom" alignment="end"></nve-notification-group>
  `
};

@customElement('icon-demo')
export class IconDemo extends LitElement {
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

export const variants = {
  render: () => html`
    <nve-icon name="user"></nve-icon>
    <nve-icon name="user" variant="inherit"></nve-icon>
  `
}

export const statuses = {
  render: () => html`
    <nve-icon name="user"></nve-icon>
    <nve-icon name="user" status="accent"></nve-icon>
    <nve-icon name="user" status="success"></nve-icon>
    <nve-icon name="user" status="warning"></nve-icon>
    <nve-icon name="user" status="danger"></nve-icon>
  `
}

export const size = {
  render: () => html`
    <nve-icon name="user" size="sm"></nve-icon>
    <nve-icon name="user"></nve-icon>
    <nve-icon name="user" size="lg"></nve-icon>
  `
}

export const direction = {
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

export const themes = {
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
