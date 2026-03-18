import { html } from 'lit';
import '@nvidia-elements/core/accordion/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/notification/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/tag/define.js';

/* eslint-disable @nvidia-elements/lint/no-missing-popover-trigger */

export default {
  title: 'Patterns/Examples',
  component: 'nve-patterns'
};
/**
 * @summary Use for displaying metadata like release info, dates, status badges, and links in a side panel with labeled key-value pairs.
 * @tags pattern
 */
export const KeyValue = {
  render: () => html`
    <nve-page>
      <nve-page-panel slot="left" size="sm">
        <nve-page-panel-header>
          <h3 nve-text="heading medium sm">Details</h3>
        </nve-page-panel-header>

        <nve-page-panel-content>
          <div nve-layout="column gap:md">
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
          </div>
        </nve-page-panel-content>
      </nve-page-panel>
      <main nve-layout="column gap:lg pad:lg">
        <h1 nve-text="heading">Main Content</h1>
      </main>
    </nve-page>
  `
}

/**
 * @summary Use for organizing filterable, collapsible content groups in a panel with search input and expandable accordion sections.
 * @tags pattern
 */
export const Accordion = {
  render: () => html`
    <style>
      nve-accordion {
        --background: var(--nve-sys-layer-overlay-background);
      }
    </style>

    <nve-page>
      <nve-page-panel slot="left" size="sm">
        <nve-page-panel-header>
          <h3 nve-text="heading medium sm">Details</h3>
        </nve-page-panel-header>

        <nve-page-panel-content>
          <div nve-layout="column gap:sm align:horizontal-stretch">
            <nve-search rounded>
              <input type="search" aria-label="search" placeholder="search" />
            </nve-search>

            <nve-accordion-group container="inset" behavior-expand>
              <nve-accordion>
                <nve-accordion-header>
                  <h2 nve-text="heading xs medium" slot="prefix">Heading 1</h2>
                </nve-accordion-header>
                <nve-accordion-content>
                  Adjust workspace preferences and project configurations to customize your experience.
                </nve-accordion-content>
              </nve-accordion>

              <nve-accordion>
                <nve-accordion-header>
                  <h2 nve-text="heading xs medium" slot="prefix">Heading 2</h2>
                </nve-accordion-header>
                <nve-accordion-content>
                  Adjust workspace preferences and project configurations to customize your experience.
                </nve-accordion-content>
              </nve-accordion>

              <nve-accordion>
                <nve-accordion-header>
                  <h2 nve-text="heading xs medium" slot="prefix">Heading 3</h2>
                </nve-accordion-header>
                <nve-accordion-content>
                  Adjust workspace preferences and project configurations to customize your experience.
                </nve-accordion-content>
              </nve-accordion>
            </nve-accordion-group>
          </div>
        </nve-page-panel-content>
      </nve-page-panel>
      <main nve-layout="column gap:lg pad:lg">
        <h1 nve-text="heading">Main Content</h1>
      </main>
    </nve-page>
  `
}

/**
 * @summary Use for switching between categorized detail views with tabbed navigation in the panel header.
 * @tags pattern
 */
export const TabbedHeader = {
  render: () => html`
    <nve-page>
      <nve-page-panel slot="left" size="sm">
        <nve-page-panel-header style="--padding: var(--nve-ref-size-100) var(--nve-ref-size-200)">
          <nve-tabs>
            <nve-tabs-item>Tab 1</nve-tabs-item>
            <nve-tabs-item selected>Tab 2</nve-tabs-item>
            <nve-tabs-item>Tab 3</nve-tabs-item>
            <nve-tabs-item>Tab 4</nve-tabs-item>
          </nve-tabs>
        </nve-page-panel-header>

        <nve-page-panel-content>
          <div nve-layout="column gap:md">
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
          </div>
        </nve-page-panel-content>
      </nve-page-panel>
      <main nve-layout="column gap:lg pad:lg">
        <h1 nve-text="heading">Main Content</h1>
        <p nve-text="body">Select the panel to view details.</p>
      </main>
    </nve-page>
  `
}

/**
 * @summary Use for notification drawers with stacked alerts, search/filter controls, and bulk action buttons in the footer.
 * @tags pattern test-case
 */
export const NotificationStack = {
  render: () => html`
    <nve-page>
      <nve-page-panel slot="left" size="md" closable>
        <nve-page-panel-header>
          <h3 nve-text="heading medium sm">5 Notifications</h3>
        </nve-page-panel-header>

        <nve-page-panel-content style="--padding: 0">
          <div nve-layout="row pad:sm gap:sm">
            <nve-search rounded>
              <input type="search" aria-label="search" placeholder="search" />
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
        </nve-page-panel-content>

        <nve-page-panel-footer>
          <div nve-layout="grid gap:sm span-items:6">
            <nve-button interaction="destructive" container="flat">Clear All</nve-button>
            <nve-button>Mark All as Read</nve-button>
          </div>
        </nve-page-panel-footer>
      </nve-page-panel>
      <main nve-layout="column gap:lg pad:lg">
        <h1 nve-text="heading">Main Content</h1>
        <p nve-text="body">View notifications in the panel.</p>
      </main>
    </nve-page>
  `
}
