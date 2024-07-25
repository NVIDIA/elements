import { html } from 'lit';
import { AlertGroup } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/divider/define.js';

export default {
  title: 'Elements/Alert Group/Examples',
  component: 'mlv-alert-group',
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
    <mlv-alert-group .status=${args.status}>
      <mlv-alert>alert message</mlv-alert>
    </mlv-alert-group>
    `,
    args: { status: undefined }
};

export const Status = {
  render: () => html`
    <div nve-layout="column gap:md">
      <mlv-alert-group>
        <mlv-alert>Standard</mlv-alert>
        <mlv-alert>Standard</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="accent">
        <mlv-alert>Accent</mlv-alert>
        <mlv-alert>Accent</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="warning">
        <mlv-alert>Warning</mlv-alert>
        <mlv-alert>Warning</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="success">
        <mlv-alert>Success</mlv-alert>
        <mlv-alert>Success</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="danger">
        <mlv-alert>Danger</mlv-alert>
        <mlv-alert>Danger</mlv-alert>
      </mlv-alert-group>
    </div>
  `
}

export const Closable = {
  render: () => html`
    <div nve-layout="column gap:md">
      <mlv-alert-group>
        <mlv-alert closable>Standard</mlv-alert>
        <mlv-alert closable>Standard</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="accent">
        <mlv-alert closable>Accent</mlv-alert>
        <mlv-alert closable>Accent</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="warning">
        <mlv-alert closable>Warning</mlv-alert>
        <mlv-alert closable>Warning</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="success">
        <mlv-alert closable>Success</mlv-alert>
        <mlv-alert closable>Success</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="danger">
        <mlv-alert closable>Danger</mlv-alert>
        <mlv-alert closable>Danger</mlv-alert>
      </mlv-alert-group>
    </div>
  `
}

export const Actions = {
  render: () => html`
  <div nve-layout="column gap:md">
    <mlv-alert-group>
      <mlv-alert>
        Standard <mlv-button slot="actions" container="flat">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
    <mlv-alert-group status="accent">
      <mlv-alert>
        Standard <mlv-button slot="actions" container="flat">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
    <mlv-alert-group status="warning">
      <mlv-alert>
        Warning <mlv-button slot="actions" container="flat">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
    <mlv-alert-group status="success">
      <mlv-alert>
        Success <mlv-button slot="actions" container="flat">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
    <mlv-alert-group status="danger">
      <mlv-alert>
        Danger <mlv-button slot="actions" container="flat">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
  </div>
  `
}

export const Prominence = {
  render: () => html`
    <div nve-layout="column gap:md">
      <mlv-alert-group prominence="emphasis" container="full">
        <mlv-alert closable><span slot="prefix">Standard</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="accent" prominence="emphasis" container="full">
        <mlv-alert closable><span slot="prefix">Accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="warning" prominence="emphasis" container="full">
        <mlv-alert closable><span slot="prefix">Warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="success" prominence="emphasis" container="full">
        <mlv-alert closable><span slot="prefix">Success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="danger" prominence="emphasis" container="full">
        <mlv-alert closable><span slot="prefix">Danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></mlv-alert>
      </mlv-alert-group>
    </div>
  `
}

export const Themes = {
  render: () => html`
    <div mlv-theme="root light" nve-layout="column gap:md pad:md">
      <mlv-alert-group>
        <mlv-alert>Standard</mlv-alert>
        <mlv-alert>Standard</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="accent">
        <mlv-alert>Accent</mlv-alert>
        <mlv-alert>Accent</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="warning">
        <mlv-alert>Warning</mlv-alert>
        <mlv-alert>Warning</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="success">
        <mlv-alert>Success</mlv-alert>
        <mlv-alert>Success</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="danger">
        <mlv-alert>Danger</mlv-alert>
        <mlv-alert>Danger</mlv-alert>
      </mlv-alert-group>
    </div>
    <div mlv-theme="root dark" nve-layout="column gap:md pad:md">
      <mlv-alert-group>
        <mlv-alert>default</mlv-alert>
        <mlv-alert>default</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="accent">
        <mlv-alert>Accent</mlv-alert>
        <mlv-alert>Accent</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="warning">
        <mlv-alert>Warning</mlv-alert>
        <mlv-alert>Warning</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="success">
        <mlv-alert>Success</mlv-alert>
        <mlv-alert>Success</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="danger">
        <mlv-alert>Danger</mlv-alert>
        <mlv-alert>Danger</mlv-alert>
      </mlv-alert-group>
    </div>
  `
}

export const Multiline = {
  render: () => html`
    <mlv-alert-group status="danger">
      <mlv-alert>
        Session Paused:
        <div slot="content" nve-layout="column gap:sm align:stretch">
          <p nve-text="body sm">Failed to verify drives. <a href="#" nve-text="link">Check Status</a></p>
          <mlv-divider style="--color: var(--mlv-sys-text-muted-color)"></mlv-divider>
          <pre nve-text="code sm" style="background: transparent !important; margin: 0;">
10:06:01 AM [verify] update /virtual:/verify/
10:06:11 AM [build] update /virtual:/build/
10:06:22 AM [error] update /virtual:/error/ - failed to connect to remote
          </pre>
        </div>
      </mlv-alert>
    </mlv-alert-group>
  `
}
