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
  title: 'Patterns/Examples',
  component: 'patterns'
};

export const PanelKeyValue = {
  render: () => html`
    <mlv-panel behavior-expand expanded style="width:280px; height:550px">
      <mlv-panel-header>
        <div slot="title">Details</div>
      </mlv-panel-header>

      <mlv-panel-content mlv-layout="column gap:md">
        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">Release</label>
          <p mlv-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">Date</label>
          <p mlv-text="label semibold sm">2021-08-18</p>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">State</label>
          <mlv-badge status="finished">Indexed</mlv-badge>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">Tag</label>
          <mlv-tag>topic-tag</mlv-tag>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">Driver</label>
          <p mlv-text="label semibold sm">Kenjiro Ono</p>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">Copilot</label>
          <p mlv-text="label semibold sm">Kenichi Yoshii</p>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">GVS</label>
          <a href="#" mlv-text="link body sm">http://testbot/testbot/view/content...</a>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">Session ID</label>
          <a href="#" mlv-text="link body sm">Experiment 12345</a>
        </div>
      </mlv-panel-content>
    </mlv-panel>
  `
}


export const PanelAccordion = {
  render: () => html`
    <style>
      mlv-accordion {
        --background: var(--mlv-sys-layer-overlay-background);
      }
    </style>

    <mlv-panel behavior-expand expanded style="width:280px; height:550px">
      <mlv-panel-header>
        <div slot="title">Details</div>
      </mlv-panel-header>

      <mlv-panel-content mlv-layout="column gap:sm align:horizontal-stretch">
        <mlv-search rounded>
          <input type="search" aria-label="search" placeholder="Search for xyz" />
        </mlv-search>

        <!-- <mlv-divider></mlv-divider>

        <div>
          <mlv-tabs behavior-select>
            <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
            <mlv-tabs-item>Tab 2</mlv-tabs-item>
            <mlv-tabs-item>Tab 3</mlv-tabs-item>
            <mlv-tabs-item>Tab 4</mlv-tabs-item>
          </mlv-tabs>

          <mlv-divider></mlv-divider>
        </div> -->

        <mlv-accordion-group container="inset" behavior-expand>
          <mlv-accordion>
            <mlv-accordion-header>
              <div slot="title">Heading 1</div>
            </mlv-accordion-header>
            <mlv-accordion-content>
              Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </mlv-accordion-content>
          </mlv-accordion>

          <mlv-accordion>
            <mlv-accordion-header>
              <div slot="title">Heading 2</div>
            </mlv-accordion-header>
            <mlv-accordion-content>
              Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </mlv-accordion-content>
          </mlv-accordion>

          <mlv-accordion>
            <mlv-accordion-header>
              <div slot="title">Heading 3</div>
            </mlv-accordion-header>
            <mlv-accordion-content>
              Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </mlv-accordion-content>
          </mlv-accordion>
        </mlv-accordion-group>
      </mlv-panel-content>
    </mlv-panel>
  `
}


export const PanelTabbedHeader = {
  render: () => html`
    <mlv-panel behavior-expand expanded style="width:280px; height:550px">
      <!-- Custom Panel Header -->
      <div class="custom-panel-header" slot="header" mlv-layout="pad-left:sm pad-top:xxs pad-right:xxl">
        <mlv-tabs>
          <mlv-tabs-item>Tab 1</mlv-tabs-item>
          <mlv-tabs-item selected>Tab 2</mlv-tabs-item>
          <mlv-tabs-item>Tab 3</mlv-tabs-item>
          <mlv-tabs-item>Tab 4</mlv-tabs-item>
        </mlv-tabs>
      </div>

      <mlv-panel-content mlv-layout="column gap:md">
        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">Release</label>
          <p mlv-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">Date</label>
          <p mlv-text="label semibold sm">2021-08-18</p>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">State</label>
          <mlv-badge status="finished">Indexed</mlv-badge>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">Tag</label>
          <mlv-tag>topic-tag</mlv-tag>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">Driver</label>
          <p mlv-text="label semibold sm">Kenjiro Ono</p>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">Copilot</label>
          <p mlv-text="label semibold sm">Kenichi Yoshii</p>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">GVS</label>
          <a href="#" mlv-text="link body sm">http://testbot/testbot/view/content...</a>
        </div>

        <div mlv-layout="column gap:xs">
          <label mlv-text="body sm medium muted">Session ID</label>
          <a href="#" mlv-text="link body sm">Experiment 12345</a>
        </div>
      </mlv-panel-content>
    </mlv-panel>
  `
}

export const PanelNotificationStack = {
  render: () => html`
    <mlv-panel behavior-expand expanded closable style="width:370px">
      <mlv-panel-header>
        <div slot="title">5 Notifications</div>
      </mlv-panel-header>

      <mlv-panel-content style="--padding: none;">
        <div mlv-layout="row pad:sm gap:sm">
          <mlv-search rounded>
            <input type="search" aria-label="search" placeholder="Search for xyz" />
          </mlv-search>
          <mlv-icon-button icon-name="filter"></mlv-icon-button>
          <mlv-icon-button icon-name="gear"></mlv-icon-button>
        </div>

        <mlv-notification closable container="flat">
          <h3 mlv-text="label">Notification</h3>
          <p mlv-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
        </mlv-notification>
        <mlv-notification status="accent" container="flat" closable>
          <h3 mlv-text="label">Notification</h3>
          <p mlv-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
        </mlv-notification>
        <mlv-notification status="success" container="flat" closable>
          <h3 mlv-text="label">Notification</h3>
          <p mlv-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
        </mlv-notification>
        <mlv-notification status="warning" container="flat" closable>
          <h3 mlv-text="label">Notification</h3>
          <p mlv-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
        </mlv-notification>
        <mlv-notification status="danger" container="flat" closable>
          <h3 mlv-text="label">Notification</h3>
          <p mlv-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
        </mlv-notification>
      </mlv-panel-content>

      <mlv-panel-footer>
        <div mlv-layout="grid gap:sm span-items:6">
          <mlv-button interaction="ghost-destructive" >Clear All</mlv-button>
          <mlv-button>Mark All as Read</mlv-button>
        </div>
      </mlv-panel-footer>
    </mlv-panel>
  `
}
