import { html } from 'lit';
import { AlertGroup } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

export default {
  title: 'Elements/Alert Banner/Examples',
  component: 'mlv-alert-banner',
  parameters: { badges: ['alpha'] },
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
  <mlv-alert>alert message</mlv-alert>
</mlv-alert-banner>
    `,
    args: { status: undefined }
};

export const Status = {
  render: () => html`
<div mlv-layout="column gap:md">
  <mlv-alert-banner>
    <mlv-alert closable>
      default banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="accent">
    <mlv-alert closable>
      accent banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="warning">
    <mlv-alert closable>
      warning banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="success">
    <mlv-alert closable>
      success banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="danger">
    <mlv-alert closable>
      danger banner message <a href="#" mlv-text="link">action</a>
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
      default banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="accent">
    <mlv-alert closable>
      accent banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="warning">
    <mlv-alert closable>
      warning banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="success">
    <mlv-alert closable>
      success banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="danger">
    <mlv-alert closable>
      danger banner message <a href="#" mlv-text="link">action</a>
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
      default banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="accent">
    <mlv-alert closable>
      accent banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="warning">
    <mlv-alert closable>
      warning banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="success">
    <mlv-alert closable>
      success banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>

  <mlv-alert-banner status="danger">
    <mlv-alert closable>
      danger banner message <a href="#" mlv-text="link">action</a>
    </mlv-alert>
  </mlv-alert-banner>
</div>
  `
}