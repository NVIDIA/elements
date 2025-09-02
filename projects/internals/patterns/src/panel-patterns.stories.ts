import { html } from 'lit';
import '@nvidia-elements/core/accordion/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/notification/define.js';
import '@nvidia-elements/core/panel/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/tag/define.js';

export default {
  title: 'Patterns/Examples'
};

/* eslint-disable @html-eslint/no-restricted-attrs */

export const PanelKeyValue = {
  render: () => html`
    <nve-panel behavior-expand expanded style="width:280px; height:550px">
      <nve-panel-header>
        <div slot="title">Details</div>
      </nve-panel-header>

      <nve-panel-content nve-layout="column gap:md">
        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">Release</label>
          <p nve-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">Date</label>
          <p nve-text="label semibold sm">2021-08-18</p>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">State</label>
          <nve-badge status="finished">Indexed</nve-badge>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">Tag</label>
          <nve-tag>topic-tag</nve-tag>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">Driver</label>
          <p nve-text="label semibold sm">Kenjiro Ono</p>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">Copilot</label>
          <p nve-text="label semibold sm">Kenichi Yoshii</p>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">GVS</label>
          <a href="#" nve-text="link body sm">http://testbot/testbot/view/content...</a>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">Session ID</label>
          <a href="#" nve-text="link body sm">Experiment 12345</a>
        </div>
      </nve-panel-content>
    </nve-panel>
  `
}


export const PanelAccordion = {
  render: () => html`
    <style>
      nve-accordion {
        --background: var(--nve-sys-layer-overlay-background);
      }
    </style>

    <nve-panel behavior-expand expanded style="width:280px; height:550px">
      <nve-panel-header>
        <div slot="title">Details</div>
      </nve-panel-header>

      <nve-panel-content nve-layout="column gap:sm align:horizontal-stretch">
        <nve-search rounded>
          <input type="search" aria-label="search" placeholder="Search for xyz" />
        </nve-search>

        <nve-accordion-group container="inset" behavior-expand>
          <nve-accordion>
            <nve-accordion-header>
              <div slot="title">Heading 1</div>
            </nve-accordion-header>
            <nve-accordion-content>
              Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </nve-accordion-content>
          </nve-accordion>

          <nve-accordion>
            <nve-accordion-header>
              <div slot="title">Heading 2</div>
            </nve-accordion-header>
            <nve-accordion-content>
              Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </nve-accordion-content>
          </nve-accordion>

          <nve-accordion>
            <nve-accordion-header>
              <div slot="title">Heading 3</div>
            </nve-accordion-header>
            <nve-accordion-content>
              Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </nve-accordion-content>
          </nve-accordion>
        </nve-accordion-group>
      </nve-panel-content>
    </nve-panel>
  `
}


export const PanelTabbedHeader = {
  render: () => html`
    <nve-panel behavior-expand expanded style="width:280px; height:550px">
      <!-- Custom Panel Header -->
      <div class="custom-panel-header" slot="header" nve-layout="pad-left:sm pad-top:xxs pad-right:xxl">
        <nve-tabs>
          <nve-tabs-item>Tab 1</nve-tabs-item>
          <nve-tabs-item selected>Tab 2</nve-tabs-item>
          <nve-tabs-item>Tab 3</nve-tabs-item>
          <nve-tabs-item>Tab 4</nve-tabs-item>
        </nve-tabs>
      </div>

      <nve-panel-content nve-layout="column gap:md">
        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">Release</label>
          <p nve-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">Date</label>
          <p nve-text="label semibold sm">2021-08-18</p>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">State</label>
          <nve-badge status="finished">Indexed</nve-badge>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">Tag</label>
          <nve-tag>topic-tag</nve-tag>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">Driver</label>
          <p nve-text="label semibold sm">Kenjiro Ono</p>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">Copilot</label>
          <p nve-text="label semibold sm">Kenichi Yoshii</p>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">GVS</label>
          <a href="#" nve-text="link body sm">http://testbot/testbot/view/content...</a>
        </div>

        <div nve-layout="column gap:xs">
          <label nve-text="body sm medium muted">Session ID</label>
          <a href="#" nve-text="link body sm">Experiment 12345</a>
        </div>
      </nve-panel-content>
    </nve-panel>
  `
}

export const PanelNotificationStack = {
  render: () => html`
    <nve-panel behavior-expand expanded closable style="width:370px">
      <nve-panel-header>
        <div slot="title">5 Notifications</div>
      </nve-panel-header>

      <nve-panel-content style="--padding: none;">
        <div nve-layout="row pad:sm gap:sm">
          <nve-search rounded>
            <input type="search" aria-label="search" placeholder="Search for xyz" />
          </nve-search>
          <nve-icon-button icon-name="filter"></nve-icon-button>
          <nve-icon-button icon-name="gear"></nve-icon-button>
        </div>

        <nve-notification closable container="flat">
          <h3 nve-text="label">Notification</h3>
          <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
        </nve-notification>
        <nve-notification status="accent" container="flat" closable>
          <h3 nve-text="label">Notification</h3>
          <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
        </nve-notification>
        <nve-notification status="success" container="flat" closable>
          <h3 nve-text="label">Notification</h3>
          <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
        </nve-notification>
        <nve-notification status="warning" container="flat" closable>
          <h3 nve-text="label">Notification</h3>
          <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
        </nve-notification>
        <nve-notification status="danger" container="flat" closable>
          <h3 nve-text="label">Notification</h3>
          <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
        </nve-notification>
      </nve-panel-content>

      <nve-panel-footer>
        <div nve-layout="grid gap:sm span-items:6">
          <nve-button interaction="flat-destructive" >Clear All</nve-button>
          <nve-button>Mark All as Read</nve-button>
        </div>
      </nve-panel-footer>
    </nve-panel>
  `
}
