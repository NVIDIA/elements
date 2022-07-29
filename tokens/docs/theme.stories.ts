import { html } from 'lit';

export default {
  title: 'Foundation/Examples/Themes'
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
    <div mlv-theme="${theme}" style="display: flex; flex-direction: column; gap: 24px; padding: 24px">
      <mlv-card style="width: 400px;">
        <mlv-card-header>
          <h2 slot="title">Title</h2>
          <h3 slot="subtitle">Sub Title</h3>
        </mlv-card-header>
        <p>Card Content</p>
        <mlv-card-footer>
          Proceed with Action
          <mlv-button interaction="emphasize">Proceed <mlv-icon name="navigate-to"></mlv-icon></mlv-button>
        </mlv-card-footer>
      </mlv-card>
      <div>
        <mlv-icon-button name="analytics"></mlv-icon-button>
        <mlv-icon-button name="analytics" interaction="emphasize"></mlv-icon-button>
        <mlv-icon-button name="analytics" interaction="destructive"></mlv-icon-button>
        <mlv-icon-button name="analytics" interaction="ghost"></mlv-icon-button>
        <mlv-icon-button name="analytics" disabled></mlv-icon-button>
      </div>
      <div>
        <mlv-icon name="analytics"></mlv-icon>
        <mlv-icon name="analytics" variant="inherit"></mlv-icon>
        <mlv-icon name="analytics" variant="lighter"></mlv-icon>
        <mlv-icon name="analytics" status="info"></mlv-icon>
        <mlv-icon name="analytics" status="success"></mlv-icon>
        <mlv-icon name="analytics" status="warning"></mlv-icon>
        <mlv-icon name="analytics" status="danger"></mlv-icon>
      </div>
    </div>
    `;
}