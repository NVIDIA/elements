import { html } from 'lit';

export default {
  title: 'Foundations/Themes/Examples'
};

export const Default = {
  render: () => getThemeDemo('light')
}

export const Dark = {
  render: () => getThemeDemo('dark')
}

export const HighContrast = {
  render: () => getThemeDemo('high-contrast')
}

function getThemeDemo(theme) {
  return html`
    <div nve-theme="${theme}" style="display: flex; flex-direction: column; gap: 24px; padding: 24px">
      <nve-card style="width: 400px;">
        <nve-card-header>
          <h2 slot="title">Title</h2>
          <h3 slot="subtitle">Sub Title</h3>
        </nve-card-header>
        <nve-card-content>
          <p nve-text="content">Card Content</p>
        </nve-card-content>
        <nve-card-footer>
          Proceed with Action
          <nve-button interaction="emphasize">Proceed <nve-icon name="navigate-to"></nve-icon></nve-button>
        </nve-card-footer>
      </nve-card>
      <div>
        <nve-icon-button icon-name="analytics"></nve-icon-button>
        <nve-icon-button icon-name="analytics" interaction="emphasize"></nve-icon-button>
        <nve-icon-button icon-name="analytics" interaction="destructive"></nve-icon-button>
        <nve-icon-button icon-name="analytics" interaction="ghost"></nve-icon-button>
        <nve-icon-button icon-name="analytics" disabled></nve-icon-button>
      </div>
      <div>
        <nve-icon name="analytics"></nve-icon>
        <nve-icon name="analytics" variant="inherit"></nve-icon>
        <nve-icon name="analytics" variant="lighter"></nve-icon>
        <nve-icon name="analytics" status="info"></nve-icon>
        <nve-icon name="analytics" status="success"></nve-icon>
        <nve-icon name="analytics" status="warning"></nve-icon>
        <nve-icon name="analytics" status="danger"></nve-icon>
      </div>
    </div>
    `;
}