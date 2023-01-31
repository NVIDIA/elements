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

export const ReducedMotion = {
  render: () => html`
<style>
  @keyframes slide-demo {
    0% {
      left: 0;
    }

    50% {
      left: calc(100% - 25px);
    }

    100% {
      left: 0;
    }
  }

  .animation,
  .animation[mlv-theme] {
    width: 150px;
    height: 50px;
    border: 1px solid #ccc;
    position: relative;
    padding: 0;
  }

  .animation div {
    width: 20px;
    height: 50px;
    background-color: #ccc;
    animation: slide-demo var(--mlv-ref-animation-duration-400);
    animation-timing-function: var(--mlv-ref-animation-easing-100);
    animation-iteration-count: infinite;
    animation-delay: 500ms;
    width: 25px;
    height: 50px;
    position: absolute;
    left: 0;
  }
</style>
<div mlv-layout="row gap:md">
  <section mlv-layout="column gap:sm">
    <code>mlv-theme=""</code>
    <div class="animation" mlv-theme="">
      <div></div>
    </div>
  </section>
  <section mlv-layout="column gap:sm">
    <code>mlv-theme="reduced-motion"</code>
    <div class="animation" mlv-theme="reduced-motion">
      <div></div>
    </div>
  </section>
</div>`
}

function getThemeDemo(theme) {
  return html`
    <div mlv-theme="root ${theme}" mlv-layout="grid span-items:6 gap:md pad:md">
      <mlv-card>${getThemeContent()}</mlv-card>
      ${getThemeContent()}
    </div>
  `;
}

function getThemeContent() {
  return html`
    <div style="display: flex; flex-direction: column; gap: 24px; padding: 24px">
    <div mlv-layout="row gap:sm">
        <mlv-icon-button icon-name="user"></mlv-icon-button>
        <mlv-icon-button icon-name="user" interaction="emphasize"></mlv-icon-button>
        <mlv-icon-button icon-name="user" interaction="destructive"></mlv-icon-button>
        <mlv-icon-button icon-name="user" interaction="ghost"></mlv-icon-button>
        <mlv-icon-button icon-name="user" disabled></mlv-icon-button>
      </div>
      <div mlv-layout="row gap:sm">
        <mlv-icon name="user"></mlv-icon>
        <mlv-icon name="user" status="info"></mlv-icon>
        <mlv-icon name="user" status="success"></mlv-icon>
        <mlv-icon name="user" status="warning"></mlv-icon>
        <mlv-icon name="user" status="danger"></mlv-icon>
      </div>
      <div mlv-layout="row gap:sm">
        <mlv-button>default</mlv-button>
        <mlv-button interaction="emphasize">emphasize</mlv-button>
        <mlv-button interaction="destructive">destructive</mlv-button>
        <mlv-button disabled="">disabled</mlv-button>
      </div>
      <div mlv-layout="column gap:md">
        <mlv-input>
          <label>label</label>
          <input type="text" value="text">
          <mlv-control-message>message</mlv-control-message>
        </mlv-input>
        <mlv-select>
          <label>label</label>
          <select>
            <option value="1">option 1</option>
            <option value="2">option 2</option>
            <option value="3">option 3</option>
          </select>
          <mlv-control-message>message</mlv-control-message>
        </mlv-select>
      </div>
      <div mlv-layout="column gap:md">
        <mlv-alert>default</mlv-alert>
        <mlv-alert status="warning">warning</mlv-alert>
        <mlv-alert status="success">success</mlv-alert>
        <mlv-alert status="danger">danger</mlv-alert>
      </div>
      <div mlv-layout="column gap:md">
        <mlv-alert-group>
          <mlv-alert>default</mlv-alert>
          <mlv-alert>default</mlv-alert>
        </mlv-alert-group>

        <mlv-alert-group status="warning">
          <mlv-alert>warning</mlv-alert>
          <mlv-alert>warning</mlv-alert>
        </mlv-alert-group>

        <mlv-alert-group status="success">
          <mlv-alert>success</mlv-alert>
          <mlv-alert>success</mlv-alert>
        </mlv-alert-group>

        <mlv-alert-group status="danger">
          <mlv-alert>danger</mlv-alert>
          <mlv-alert>danger</mlv-alert>
        </mlv-alert-group>
      </div>
    </div>
    `;
}