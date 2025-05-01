import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/divider/define.js';

export default {
  title: 'Patterns/Examples'
};

export const ContentRow = {
  render: () => html`
  <div>
    <nve-card role="listitem" container="full">
      <nve-card-content nve-layout="grid align:vertical-center align:space-between gap:md">
        <div nve-layout="span:4 row gap:md align:vertical-center">
          <img src="https://placehold.co/600x400" alt="placeholder" style="max-width: 100px; border-radius: var(--nve-ref-border-radius-sm)" />
          <div nve-layout="column gap:sm">
            <h2 nve-text="label medium">Activity Dashboard</h2>
            <p nve-text="body sm muted">Last saved: Oct 19, 21 by Camru</p>
          </div>
        </div>
        <p nve-text="body sm" nve-layout="span:5">A dashboard displaying current project activity grouped by User, Host or IP</p>
        <div nve-layout="span:3 row gap:sm align:right">
          <div nve-layout="row gap:xs">
            <nve-icon-button icon-name="eye"></nve-icon-button>
            <nve-icon-button icon-name="copy"></nve-icon-button>
            <nve-icon-button icon-name="delete"></nve-icon-button>
          </div>
          <nve-divider orientation="vertical"></nve-divider>
          <nve-button>Add Panel</nve-button>
        </div>
      </nve-card-content>
    </nve-card>
  </div>
  `
}
