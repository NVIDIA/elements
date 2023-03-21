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
  .animation[nve-theme] {
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
    animation: slide-demo var(--nve-ref-animation-duration-400);
    animation-timing-function: var(--nve-ref-animation-easing-100);
    animation-iteration-count: infinite;
    animation-delay: 500ms;
    width: 25px;
    height: 50px;
    position: absolute;
    left: 0;
  }
</style>
<div nve-layout="row gap:md">
  <section nve-layout="column gap:sm">
    <code>nve-theme=""</code>
    <div class="animation" nve-theme="">
      <div></div>
    </div>
  </section>
  <section nve-layout="column gap:sm">
    <code>nve-theme="reduced-motion"</code>
    <div class="animation" nve-theme="reduced-motion">
      <div></div>
    </div>
  </section>
</div>`
}

function getThemeDemo(theme) {
  return html`
    <div nve-theme="root ${theme}" nve-layout="grid span-items:6 gap:md pad:md">
      <nve-card>${getThemeContent()}</nve-card>
      ${getThemeContent()}
    </div>
  `;
}

function getThemeContent() {
  return html`
    <div style="display: flex; flex-direction: column; gap: 24px; padding: 24px">
    <div nve-layout="row gap:sm">
        <nve-icon-button icon-name="user"></nve-icon-button>
        <nve-icon-button icon-name="user" interaction="emphasize"></nve-icon-button>
        <nve-icon-button icon-name="user" interaction="destructive"></nve-icon-button>
        <nve-icon-button icon-name="user" interaction="ghost"></nve-icon-button>
        <nve-icon-button icon-name="user" disabled></nve-icon-button>
      </div>
      <div nve-layout="row gap:sm">
        <nve-icon name="user"></nve-icon>
        <nve-icon name="user" status="accent"></nve-icon>
        <nve-icon name="user" status="success"></nve-icon>
        <nve-icon name="user" status="warning"></nve-icon>
        <nve-icon name="user" status="danger"></nve-icon>
      </div>
      <div nve-layout="row gap:sm">
        <nve-button>default</nve-button>
        <nve-button interaction="emphasize">emphasize</nve-button>
        <nve-button interaction="destructive">destructive</nve-button>
        <nve-button disabled="">disabled</nve-button>
      </div>
      <div nve-layout="column gap:md">
        <nve-input>
          <label>label</label>
          <input type="text" value="text">
          <nve-control-message>message</nve-control-message>
        </nve-input>
        <nve-select>
          <label>label</label>
          <select>
            <option value="1">option 1</option>
            <option value="2">option 2</option>
            <option value="3">option 3</option>
          </select>
          <nve-control-message>message</nve-control-message>
        </nve-select>
      </div>
      <div nve-layout="column gap:md">
        <nve-alert>default</nve-alert>
        <nve-alert status="accent">accent</nve-alert>
        <nve-alert status="warning">warning</nve-alert>
        <nve-alert status="success">success</nve-alert>
        <nve-alert status="danger">danger</nve-alert>
      </div>
      <div nve-layout="column gap:md">
        <nve-alert-group>
          <nve-alert>default</nve-alert>
          <nve-alert>default</nve-alert>
        </nve-alert-group>

        <nve-alert-group status="accent">
          <nve-alert>accent</nve-alert>
          <nve-alert>accent</nve-alert>
        </nve-alert-group>

        <nve-alert-group status="warning">
          <nve-alert>warning</nve-alert>
          <nve-alert>warning</nve-alert>
        </nve-alert-group>

        <nve-alert-group status="success">
          <nve-alert>success</nve-alert>
          <nve-alert>success</nve-alert>
        </nve-alert-group>

        <nve-alert-group status="danger">
          <nve-alert>danger</nve-alert>
          <nve-alert>danger</nve-alert>
        </nve-alert-group>
      </div>
    </div>
    `;
}