import { html } from 'lit';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/divider/define.js';

export default {
  title: 'Elements/Alert',
  component: 'nve-alert'
};

export const Default = {
  render: () => html`<nve-alert>alert message</nve-alert>`
};

export const Status = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-alert>Standard</nve-alert>
  <nve-alert status="accent">Accent</nve-alert>
  <nve-alert status="warning">Warning</nve-alert>
  <nve-alert status="success">Success</nve-alert>
  <nve-alert status="danger">Danger</nve-alert>
</div>
  `
}

export const StatusLightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="column gap:md pad:md">
  <nve-alert>Standard</nve-alert>
  <nve-alert status="accent">Accent</nve-alert>
  <nve-alert status="warning">Warning</nve-alert>
  <nve-alert status="success">Success</nve-alert>
  <nve-alert status="danger">Danger</nve-alert>
</div>
  `
}

export const StatusDarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="column gap:md pad:md">
  <nve-alert>Standard</nve-alert>
  <nve-alert status="accent">Accent</nve-alert>
  <nve-alert status="warning">Warning</nve-alert>
  <nve-alert status="success">Success</nve-alert>
  <nve-alert status="danger">Danger</nve-alert>
</div>
  `
}

export const TaskStatus = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-alert status="scheduled">Scheduled</nve-alert>
  <nve-alert status="queued">Queued</nve-alert>
  <nve-alert status="finished">Finished</nve-alert>
  <nve-alert status="failed">Failed</nve-alert>
  <nve-alert status="unknown">Unknown</nve-alert>
  <nve-alert status="pending">Pending</nve-alert>
  <nve-alert status="starting">Starting</nve-alert>
  <nve-alert status="running">Running</nve-alert>
  <nve-alert status="restarting">Restarting</nve-alert>
  <nve-alert status="stopping">Stopping</nve-alert>
  <nve-alert status="ignored">Ignored</nve-alert>
</div>
  `
}

export const TaskStatusLightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="column gap:md pad:md">
  <nve-alert status="scheduled">Scheduled</nve-alert>
  <nve-alert status="queued">Queued</nve-alert>
  <nve-alert status="pending">Pending</nve-alert>
  <nve-alert status="starting">Starting</nve-alert>
  <nve-alert status="running">Running</nve-alert>
  <nve-alert status="restarting">Restarting</nve-alert>
  <nve-alert status="stopping">Stopping</nve-alert>
  <nve-alert status="finished">Fnished</nve-alert>
  <nve-alert status="failed">Failed</nve-alert>
  <nve-alert status="unknown">Unknown</nve-alert>
</div>
  `
}

export const TaskStatusDarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="column gap:md pad:md">
  <nve-alert status="scheduled">Scheduled</nve-alert>
  <nve-alert status="queued">Queued</nve-alert>
  <nve-alert status="pending">Pending</nve-alert>
  <nve-alert status="starting">Starting</nve-alert>
  <nve-alert status="running">Running</nve-alert>
  <nve-alert status="restarting">Restarting</nve-alert>
  <nve-alert status="stopping">Stopping</nve-alert>
  <nve-alert status="finished">Finished</nve-alert>
  <nve-alert status="failed">Failed</nve-alert>
  <nve-alert status="unknown">Unknown</nve-alert>
</div>
  `
}

export const AlertGroupDefault = {
  render: () => html`
  <nve-alert-group>
    <nve-alert>alert message</nve-alert>
  </nve-alert-group>
  `
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
