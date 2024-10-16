import { html } from 'lit';
import type { AlertGroup } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';

export default {
  title: 'Deprecated/Alert Banner/Examples',
  component: 'nve-alert-banner',
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
<nve-alert-banner .status=${args.status}>
  <nve-alert closable>
    <span slot="prefix">Standard</span> banner message
  </nve-alert>
</nve-alert-banner>
    `,
    args: { status: undefined }
};

export const Status = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-alert-banner>
    <nve-alert closable>
      <span slot="prefix">Standard</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="accent">
    <nve-alert closable>
      <span slot="prefix">Accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="warning">
    <nve-alert closable>
      <span slot="prefix">Warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="success">
    <nve-alert closable>
      <span slot="prefix">Success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="danger">
    <nve-alert closable>
      <span slot="prefix">Danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>
</div>
  `
}

export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="column gap:md pad:md">
  <nve-alert-banner>
    <nve-alert closable>
      <span slot="prefix">Standard</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="accent">
    <nve-alert closable>
      <span slot="prefix">Accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="warning">
    <nve-alert closable>
      <span slot="prefix">Warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="success">
    <nve-alert closable>
      <span slot="prefix">Success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="danger">
    <nve-alert closable>
      <span slot="prefix">Danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="column gap:md pad:md">
<nve-alert-banner>
    <nve-alert closable>
      <span slot="prefix">Standard</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="accent">
    <nve-alert closable>
      <span slot="prefix">Accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="warning">
    <nve-alert closable>
      <span slot="prefix">Warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="success">
    <nve-alert closable>
      <span slot="prefix">Success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="danger">
    <nve-alert closable>
      <span slot="prefix">Danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>
</div>
  `
}