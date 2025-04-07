import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import type { Panel } from '@nvidia-elements/core/panel';
import '@nvidia-elements/core/panel/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/notification/define.js';

export default {
  title: 'Elements/Panel/Examples',
  component: 'nve-panel',
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
  const notification = document.createElement('nve-notification');
  notification.closable = true;
  notification.status = 'success';
  notification.innerHTML = `<h3 nve-text="label">Clicked!</h3><p nve-text="body">Custom action triggered.</p>`;
  notification.addEventListener('close', () => notification.remove(), { once: true });


  document.querySelector('nve-notification-group')?.prepend(notification);
  setTimeout(() => notification.remove(), 2000 * (document.querySelectorAll('nve-notification').length));
}

const togglePanel = (isClosable?: boolean) => {
  const panel = document.querySelector(`nve-panel#trigger-closable-${isClosable}`) as Panel;
  panel.expanded = !panel.expanded;
}

export const Default = {
  render: (args: ArgTypes) => html`
    <section nve-layout="row align:space-between pad:sm">
      <div nve-theme="root ${args.theme}">
        <nve-panel behavior-expand id=${args.showTrigger ? `trigger-closable-${args.closable}` : ''} ?expanded=${args.expanded} ?closable=${args.closable} @close=${() => togglePanel(args.closable)} side=${args.side} style=${'width:' + args.width + 'px; height:' + args.height + 'px'}>
        ${when(
            args.showHeader,
            () => html`
            <nve-panel-header>
              <div slot="title">${args.title}</div>
              <div slot="subtitle">${args.subtitle}</div>

              ${when(
                args.showActionIcon,
                () => html`<nve-icon-button container="flat" slot="action-icon" icon-name="more-actions" @click=${() => customActionHandler()}></nve-icon-button>`
              )}
            </nve-panel-header>
            `
          )}

          <nve-panel-content nve-layout="column gap:md">
            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Release</label>
              <p nve-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Date</label>
              <p nve-text="label semibold sm">2021-08-18</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">State</label>
              <nve-badge status="finished">Indexed</nve-badge>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Driver</label>
              <p nve-text="label semibold sm">Kenjiro Ono</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Copilot</label>
              <p nve-text="label semibold sm">Kenichi Yoshii</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">GVS</label>
              <a href="#" nve-text="link body sm">http://testbot/testbot/view/content...</a>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Session ID</label>
              <a href="#" nve-text="link body sm">Experiment 12345</a>
            </div>
          </nve-panel-content>

          ${when(
            args.showFooter,
            () => html`
            <nve-panel-footer>
              <nve-button interaction="destructive" container="flat">Destructive</nve-button>
              <nve-button>Default</nve-button>
            </nve-panel-footer>
            `
          )}
        </nve-panel>
      </div>

      ${when(
          args.showTrigger,
          () => html`
            <nve-button interaction="emphasis" @click=${() => togglePanel(args.closable)}>Toggle Panel</nve-button>
          `
        )}
    </section>

    ${when(
      args.showActionIcon,
      () => html`<nve-notification-group position="bottom" alignment="end"></nve-notification-group>`
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

export const CollapsedLeftPanel = {
  ...Default,
  args: { title: 'Collapsed Left Panel', side: 'left', expanded: false, closable: false, width: 280, height: 550 }
};

export const CollapsedRightPanel = {
  ...Default,
  args: { title: 'Collapsed Right Panel', side: 'right', expanded: false, closable: false, width: 280, height: 550 }
};