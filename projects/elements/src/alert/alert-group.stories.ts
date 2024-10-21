import { html } from 'lit';
import type { AlertGroup } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/divider/define.js';

export default {
  title: 'Elements/Alert/Examples',
  component: 'nve-alert-group',
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['', 'accent', 'warning', 'danger', 'success']
    }
  }
};

type ArgTypes = AlertGroup;

export const AlertGroupDefault = {
  render: (args: ArgTypes) =>
    html`
    <nve-alert-group .status=${args.status}>
      <nve-alert>alert message</nve-alert>
    </nve-alert-group>
    `,
    args: { status: undefined }
};

export const AlertGroupStatus = {
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
        Standard <nve-button slot="actions" container="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="accent">
      <nve-alert>
        Standard <nve-button slot="actions" container="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="warning">
      <nve-alert>
        Warning <nve-button slot="actions" container="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="success">
      <nve-alert>
        Success <nve-button slot="actions" container="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="danger">
      <nve-alert>
        Danger <nve-button slot="actions" container="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
  </div>
  `
}

export const Prominence = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert-group prominence="emphasis" container="full">
        <nve-alert closable><span slot="prefix">Standard</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></nve-alert>
      </nve-alert-group>

      <nve-alert-group status="accent" prominence="emphasis" container="full">
        <nve-alert closable><span slot="prefix">Accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning" prominence="emphasis" container="full">
        <nve-alert closable><span slot="prefix">Warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success" prominence="emphasis" container="full">
        <nve-alert closable><span slot="prefix">Success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger" prominence="emphasis" container="full">
        <nve-alert closable><span slot="prefix">Danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></nve-alert>
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
10:06:22 AM [error] update /virtual:/error/ - failed to connect to remote</pre>
        </div>
      </nve-alert>
    </nve-alert-group>
  `
}
