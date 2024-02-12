import { html } from 'lit';
import { AlertGroup } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/divider/define.js';

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
    <div mlv-layout="column gap:md">
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
    <div mlv-layout="column gap:md">
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
  <div mlv-layout="column gap:md">
    <mlv-alert-group>
      <mlv-alert>
        Standard <mlv-button slot="actions" interaction="flat">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
    <mlv-alert-group status="accent">
      <mlv-alert>
        Standard <mlv-button slot="actions" interaction="flat">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
    <mlv-alert-group status="warning">
      <mlv-alert>
        Warning <mlv-button slot="actions" interaction="flat">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
    <mlv-alert-group status="success">
      <mlv-alert>
        Success <mlv-button slot="actions" interaction="flat">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
    <mlv-alert-group status="danger">
      <mlv-alert>
        Danger <mlv-button slot="actions" interaction="flat">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
  </div>
  `
}

export const Themes = {
  render: () => html`
    <div mlv-theme="root light" mlv-layout="column gap:md pad:md">
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
    <div mlv-theme="root dark" mlv-layout="column gap:md pad:md">
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
        <div slot="content" mlv-layout="column gap:sm align:stretch">
          <p mlv-text="body sm">Failed to verify drives. <a href="#" mlv-text="link">Check Status</a></p>
          <mlv-divider style="--color: var(--mlv-sys-text-muted-color)"></mlv-divider>
          <pre mlv-text="code sm" style="background: transparent !important; margin: 0;">
10:06:01 AM [verify] update /virtual:/verify/
10:06:11 AM [build] update /virtual:/build/
10:06:22 AM [error] update /virtual:/error/ - failed to connect to remote
          </pre>
        </div>
      </mlv-alert>
    </mlv-alert-group>
  `
}
