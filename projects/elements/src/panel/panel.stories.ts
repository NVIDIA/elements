import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import type { Panel } from '@elements/elements/panel';
import '@elements/elements/panel/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/notification/define.js';

export default {
  title: 'Elements/Panel/Examples',
  component: 'mlv-panel',
  argTypes: {
    width: {
      control: { type: 'range', min: 280, max: 500 }
    },
    height: {
      control: { type: 'range', min: 50, max: 500 }
    },
    side: {
      control: { type: 'inline-radio', options: ['left', 'right'] }
    }
  }
};

interface ArgTypes {
  width?: number;
  height?: number;
  expanded?: boolean;
  closable?: boolean;
  showActionIcon?: boolean;
  showTrigger?: boolean;
  showFooter?: boolean;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  side: 'left' | 'right';
  theme?: string;
}

const customActionHandler = () => {
  const notification = document.createElement('mlv-notification');
  notification.closable = true;
  notification.status = 'success';
  notification.innerHTML = `<h3 mlv-text="label">Clicked!</h3><p mlv-text="body">Custom action triggered.</p>`;
  notification.addEventListener('close', () => notification.remove(), { once: true });


  document.querySelector('mlv-notification-group')?.prepend(notification);
  setTimeout(() => notification.remove(), 2000 * (document.querySelectorAll('mlv-notification').length));
}

const togglePanel = (isClosable?: boolean) => {
  const panel = document.querySelector(`mlv-panel#trigger-closable-${isClosable}`) as Panel;
  panel.expanded = !panel.expanded;
}

export const Default = {
  render: (args: ArgTypes) => html`
    <section mlv-layout="row align:space-between pad:sm">
      <div mlv-theme="root ${args.theme}">
        <mlv-panel behavior-expand id=${args.showTrigger ? `trigger-closable-${args.closable}` : ''} ?expanded=${args.expanded} ?closable=${args.closable} @close=${() => togglePanel(args.closable)} .side=${args.side} style=${'width:' + args.width + 'px; height:' + args.height + 'px'}>
        ${when(
            args.showHeader,
            () => html`
            <mlv-panel-header>
              <div slot="title">${args.title}</div>
              <div slot="subtitle">${args.subtitle}</div>

              ${when(
                args.showActionIcon,
                () => html`<mlv-icon-button container="flat" slot="action-icon" icon-name="more-actions" @click=${() => customActionHandler()}></mlv-icon-button>`
              )}
            </mlv-panel-header>
            `
          )}

          <mlv-panel-content mlv-layout="column gap:md">
            <div mlv-layout="column gap:xs">
              <label mlv-text="body sm medium muted">Release</label>
              <p mlv-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
            </div>

            <div mlv-layout="column gap:xs">
              <label mlv-text="body sm medium muted">Date</label>
              <p mlv-text="label semibold sm">2021-08-18</p>
            </div>

            <div mlv-layout="column gap:xs">
              <label mlv-text="body sm medium muted">State</label>
              <mlv-badge status="finished">Indexed</mlv-badge>
            </div>

            <div mlv-layout="column gap:xs">
              <label mlv-text="body sm medium muted">Driver</label>
              <p mlv-text="label semibold sm">Kenjiro Ono</p>
            </div>

            <div mlv-layout="column gap:xs">
              <label mlv-text="body sm medium muted">Copilot</label>
              <p mlv-text="label semibold sm">Kenichi Yoshii</p>
            </div>

            <div mlv-layout="column gap:xs">
              <label mlv-text="body sm medium muted">GVS</label>
              <a href="#" mlv-text="link body sm">http://testbot/testbot/view/content...</a>
            </div>

            <div mlv-layout="column gap:xs">
              <label mlv-text="body sm medium muted">Session ID</label>
              <a href="#" mlv-text="link body sm">Experiment 12345</a>
            </div>
          </mlv-panel-content>

          ${when(
            args.showFooter,
            () => html`
            <mlv-panel-footer>
              <mlv-button interaction="destructive" container="flat">Destructive</mlv-button>
              <mlv-button>Default</mlv-button>
            </mlv-panel-footer>
            `
          )}
        </mlv-panel>
      </div>

      ${when(
          args.showTrigger,
          () => html`
            <mlv-button interaction="emphasis" @click=${() => togglePanel(args.closable)}>Toggle Panel</mlv-button>
          `
        )}
    </section>

    ${when(
      args.showActionIcon,
      () => html`<mlv-notification-group position="bottom" alignment="end"></mlv-notification-group>`
    )}
  `,
  args: { title: 'Title', side: 'left', expanded: true, closable: false, showHeader: true, width: 280, height: 550 }
};

export const LeftSidePanel = {
  ...Default,
  args: { title: 'Left Side Panel', side: 'left', expanded: true, closable: false, width: 280, height: 550 }
};

export const RightSidePanel = {
  ...Default,
  args: { title: 'Right Side Panel', side: 'right', expanded: true, closable: false, width: 280, height: 550 }
};

export const ClosablePanel = {
  ...Default,
  args: { title: 'Closable Panel', side: 'left', expanded: true, closable: true, showTrigger: true, width: 280, height: 550 }
};

export const PanelWithTrigger = {
  ...Default,
  args: { title: 'Panel with Trigger', side: 'left', expanded: true, closable: false, showTrigger: true, width: 280, height: 550 }
};

export const PanelWithHeader = {
  ...Default,
  args: { title: 'Title', side: 'left', expanded: true, closable: false, showHeader: true, width: 280, height: 550 }
};

export const PanelWithFullHeader = {
  ...Default,
  args: { title: 'Title', subtitle: 'Subtitle', side: 'left', expanded: true, closable: false, showHeader: true, showActionIcon: true, width: 280, height: 550 }
};

export const PanelWithFooter = {
  ...Default,
  args: { title: 'Panel Title', side: 'left', expanded: true, closable: false, showFooter: true, width: 280, height: 600 }
};


export const LightTheme = {
  ...Default,
  args: { title: 'Light Theme', side: 'left', expanded: true, showHeader: true, theme: 'light', width: 280, height: 600 }
};

export const DarkTheme = {
  ...Default,
  args: { title: 'Dark Theme', side: 'left', expanded: true, showHeader: true, theme: 'dark', width: 280, height: 600 }
};

export const HighContrastTheme = {
  ...Default,
  args: { title: 'High Contrast Theme', side: 'left', expanded: true, showHeader: true, theme: 'high-contrast', width: 280, height: 600 }
};