import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { Panel } from './panel';
import '@elements/elements/panel/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/notification/define.js';

export default {
  title: 'Elements/Panel/Examples',
  component: 'mlv-panel',
  parameters: { badges: ['alpha'] },
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
  title?: string;
  subtitle?: string;
  side?: string;
  theme?: string;
}

const customActionHandler = () => {
  const notification = document.createElement('mlv-notification');
  notification.closable = true;
  notification.status = 'success';
  notification.innerHTML = `<h3 mlv-text="label">Clicked!</h3><p mlv-text="body">Custom action triggered.</p>`;
  notification.addEventListener('close', () => notification.remove(), { once: true });


  document.querySelector('mlv-notification-group').prepend(notification);
  setTimeout(() => notification.remove(), 2000 * (document.querySelectorAll('mlv-notification').length));
}

const togglePanel = (isClosable: boolean) => {
  const panel = document.querySelector(`mlv-panel#trigger-closable-${isClosable}`) as Panel;
  panel.expanded = !panel.expanded;
}

export const Default = {
  render: (args: ArgTypes) => html`
    <div mlv-theme="root ${args.theme}" mlv-layout="row align:space-between pad:sm">
      <mlv-panel id=${args.showTrigger ? `trigger-closable-${args.closable}` : ''} ?expanded=${args.expanded} ?closable=${args.closable} @close=${() => togglePanel(args.closable)} title=${args.title} subtitle=${args.subtitle} side=${args.side} style=${'width:' + args.width + 'px; height:' + args.height + 'px'}>
        ${when(
          args.showActionIcon,
          () => html`<mlv-icon-button interaction="ghost" slot="action-icon" icon-name="additional-actions" @click=${() => customActionHandler()}></mlv-icon-button>`
        )}

        <mlv-panel-content mlv-layout="column gap:xl">
          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">Release</label>
            <p mlv-text="eyebrow sm">RainbowBridge/08-18-2021AM/A2A</p>
          </div>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">Date</label>
            <p mlv-text="eyebrow sm">2021-08-18</p>
          </div>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">State</label>
            <mlv-button mlv-control>Indexed</mlv-button>
          </div>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">Driver</label>
            <p mlv-text="eyebrow sm">Kenjiro Ono</p>
          </div>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">Copilot</label>
            <p mlv-text="eyebrow sm">Kenichi Yoshii</p>
          </div>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">GVS</label>
            <a href="#" mlv-text="link body sm">http://testbot/testbot/view/content...</a>
          </div>

          <div mlv-layout="column gap:xs">
            <label mlv-text="body sm default muted">Session ID</label>
            <a href="#" mlv-text="link body sm">Experiment 12345</a>
          </div>
        </mlv-panel-content>

        ${when(
          args.showFooter,
          () => html`
          <mlv-panel-footer>
            <mlv-button interaction="ghost-destructive">Destructive</mlv-button>
            <mlv-button interaction="default">Default</mlv-button>
          </mlv-panel-footer>
          `
        )}
      </mlv-panel>

      ${when(
          args.showTrigger,
          () => html`
            <mlv-button interaction="emphasize" @click=${() => togglePanel(args.closable)}>Toggle Panel</mlv-button>
          `
        )}
    </div>

    <mlv-notification-group position="bottom" alignment="end"></mlv-notification-group>
  `,
  args: { title: 'Details', side: 'left', expanded: true, closable: false, width: 280, height: 550 }
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

export const PanelWithSubtitleAndActionIcon = {
  ...Default,
  args: { title: 'Title', subtitle: 'Subtitle', side: 'left', expanded: true, closable: false, showActionIcon: true, width: 280, height: 550 }
};

export const PanelWithFooter = {
  ...Default,
  args: { title: 'Panel Title', side: 'left', expanded: true, closable: false, showFooter: true, width: 280, height: 600 }
};


export const LightTheme = {
  ...Default,
  args: { title: 'Light Theme', side: 'left', expanded: true, closable: false, theme: 'light', width: 280, height: 600 }
};

export const DarkTheme = {
  ...Default,
  args: { title: 'Dark Theme', side: 'left', expanded: true, closable: false, theme: 'dark', width: 280, height: 600 }
};

export const HighContrastTheme = {
  ...Default,
  args: { title: 'High Contrast Theme', side: 'left', expanded: true, closable: false, theme: 'high-contrast', width: 280, height: 600 }
};