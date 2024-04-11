import { html } from 'lit';
import { AlertGroup } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';

export default {
  title: 'Deprecated/Alert Banner/Examples',
  component: 'mlv-alert-banner',
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
<mlv-alert-banner .status=${args.status}>
  <mlv-alert closable>
    <span slot="prefix">Standard</span> banner message
  </mlv-alert>
</mlv-alert-banner>
    `,
    args: { status: undefined }
};

export const Status = {
  render: () => html`
<div mlv-layout="column gap:md">
  <mlv-alert-banner>
    <mlv-alert closable>
      <span slot="prefix">Standard</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="accent">
    <mlv-alert closable>
      <span slot="prefix">Accent</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="warning">
    <mlv-alert closable>
      <span slot="prefix">Warning</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="success">
    <mlv-alert closable>
      <span slot="prefix">Success</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="danger">
    <mlv-alert closable>
      <span slot="prefix">Danger</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>
</div>
  `
}

export const LightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="column gap:md pad:md">
  <mlv-alert-banner>
    <mlv-alert closable>
      <span slot="prefix">Standard</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="accent">
    <mlv-alert closable>
      <span slot="prefix">Accent</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="warning">
    <mlv-alert closable>
      <span slot="prefix">Warning</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="success">
    <mlv-alert closable>
      <span slot="prefix">Success</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="danger">
    <mlv-alert closable>
      <span slot="prefix">Danger</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="column gap:md pad:md">
<mlv-alert-banner>
    <mlv-alert closable>
      <span slot="prefix">Standard</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="accent">
    <mlv-alert closable>
      <span slot="prefix">Accent</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="warning">
    <mlv-alert closable>
      <span slot="prefix">Warning</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="success">
    <mlv-alert closable>
      <span slot="prefix">Success</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="danger">
    <mlv-alert closable>
      <span slot="prefix">Danger</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
    </mlv-alert>
  </mlv-alert-banner>
</div>
  `
}