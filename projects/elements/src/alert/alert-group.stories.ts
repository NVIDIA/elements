import { html } from 'lit';
import { AlertGroup } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/divider/define.js';

export default {
  title: 'Elements/Alert Group/Examples',
  component: 'nve-alert-group',
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['', 'accent', 'warning', 'danger', 'success']
    }
  }
};

type ArgTypes = AlertGroup;

export const Default = {
  render: (args: ArgTypes) =>
    html`
    <nve-alert-group .status=${args.status}>
      <nve-alert>alert message</nve-alert>
    </nve-alert-group>
    `,
    args: { status: undefined }
};

export const Status = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert-group>
        <nve-alert>Standard</nve-alert>
        <nve-alert>Standard</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="accent">
        <nve-alert>Accent</nve-alert>
        <nve-alert>Accent</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert>Warning</nve-alert>
        <nve-alert>Warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert>Success</nve-alert>
        <nve-alert>Success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert>Danger</nve-alert>
        <nve-alert>Danger</nve-alert>
      </nve-alert-group>
    </div>
  `
}

export const Closable = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert-group>
        <nve-alert closable>Standard</nve-alert>
        <nve-alert closable>Standard</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="accent">
        <nve-alert closable>Accent</nve-alert>
        <nve-alert closable>Accent</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert closable>Warning</nve-alert>
        <nve-alert closable>Warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert closable>Success</nve-alert>
        <nve-alert closable>Success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert closable>Danger</nve-alert>
        <nve-alert closable>Danger</nve-alert>
      </nve-alert-group>
    </div>
  `
}

export const Actions = {
  render: () => html`
  <div nve-layout="column gap:md">
    <nve-alert-group>
      <nve-alert>
        Standard <nve-button slot="actions" interaction="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="accent">
      <nve-alert>
        Standard <nve-button slot="actions" interaction="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="warning">
      <nve-alert>
        Warning <nve-button slot="actions" interaction="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="success">
      <nve-alert>
        Success <nve-button slot="actions" interaction="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="danger">
      <nve-alert>
        Danger <nve-button slot="actions" interaction="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
  </div>
  `
}

export const Themes = {
  render: () => html`
    <div nve-theme="root light" nve-layout="column gap:md pad:md">
      <nve-alert-group>
        <nve-alert>Standard</nve-alert>
        <nve-alert>Standard</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="accent">
        <nve-alert>Accent</nve-alert>
        <nve-alert>Accent</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert>Warning</nve-alert>
        <nve-alert>Warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert>Success</nve-alert>
        <nve-alert>Success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert>Danger</nve-alert>
        <nve-alert>Danger</nve-alert>
      </nve-alert-group>
    </div>
    <div nve-theme="root dark" nve-layout="column gap:md pad:md">
      <nve-alert-group>
        <nve-alert>default</nve-alert>
        <nve-alert>default</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="accent">
        <nve-alert>Accent</nve-alert>
        <nve-alert>Accent</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert>Warning</nve-alert>
        <nve-alert>Warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert>Success</nve-alert>
        <nve-alert>Success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert>Danger</nve-alert>
        <nve-alert>Danger</nve-alert>
      </nve-alert-group>
    </div>
  `
}

export const Multiline = {
  render: () => html`
    <nve-alert-group status="danger">
      <nve-alert>
        Session Paused:
        <div slot="content" nve-layout="column gap:sm align:stretch">
          <p nve-text="body sm">Failed to verify drives. <a href="#" nve-text="link">Check Status</a></p>
          <nve-divider style="--color: var(--nve-sys-text-muted-color)"></nve-divider>
          <pre nve-text="code sm" style="background: transparent !important; margin: 0;">
10:06:01 AM [verify] update /virtual:/verify/
10:06:11 AM [build] update /virtual:/build/
10:06:22 AM [error] update /virtual:/error/ - failed to connect to remote
          </pre>
        </div>
      </nve-alert>
    </nve-alert-group>
  `
}
