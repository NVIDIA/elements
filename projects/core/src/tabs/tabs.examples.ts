import { html } from 'lit';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/icon/define.js';

export default {
  title: 'Elements/Tabs',
  component: 'nve-tabs'
};

/**
 * @summary Basic tabs component for organizing content into selectable sections with disabled state support.
 */
export const Default = {
  render: () => html`
<nve-tabs behavior-select>
  <nve-tabs-item selected>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3</nve-tabs-item>
  <nve-tabs-item>Tab 4</nve-tabs-item>
  <nve-tabs-item disabled>Disabled</nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Borderless tabs variant for minimal visual styling without border emphasis.
 * @tags test-case
 */
export const BorderlessTabs = {
  render: () => html`
<nve-tabs borderless behavior-select>
  <nve-tabs-item selected>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3 </nve-tabs-item>
  <nve-tabs-item disabled>Disabled</nve-tabs-item>
  <nve-tabs-item>Tab 5</nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Tabs with custom border background styling for brand-specific visual customization.
 * @tags test-case
 */
export const BorderBackground = {
  render: () => html`
<nve-tabs behavior-select style="--indicator-background: var(--nve-ref-color-brand-green-900); --indicator-border-radius: none;">
  <nve-tabs-item selected>
    Tab 1
  </nve-tabs-item>
  <nve-tabs-item>
    Tab 2
  </nve-tabs-item>
  <nve-tabs-item>
    Tab 3
  </nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Tabs with notification dots for indicating unread content or alerts within tab sections.
 */
export const WithDots = {
  render: () => html`
<nve-tabs behavior-select>
  <nve-tabs-item>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3 </nve-tabs-item>
  <nve-tabs-item selected>
    Tab 4
    <nve-dot aria-label="10 notifications">10</nve-dot>
  </nve-tabs-item>
  <nve-tabs-item>Tab 5</nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Vertical tabs layout for sidebar navigation and vertical content organization patterns.
 */
export const VerticalTabs = {
  render: () => html`
<nve-tabs vertical behavior-select style="width: 250px">
  <nve-tabs-item selected>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3</nve-tabs-item>
  <nve-tabs-item disabled>Disabled</nve-tabs-item>
  <nve-tabs-item>Tab 5</nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Borderless vertical tabs with icons for enhanced visual navigation and minimal styling.
 * @tags test-case
 */
export const BorderlessVerticalTabs = {
  render: () => html`
<nve-tabs vertical borderless behavior-select style="width: 250px">
  <nve-tabs-item>
    <nve-icon name="gear"></nve-icon> Tab 1
  </nve-tabs-item>
  <nve-tabs-item>
    <nve-icon name="person"></nve-icon> Tab 2
  </nve-tabs-item>
  <nve-tabs-item selected>
    <nve-icon name="beaker"></nve-icon> Tab 3
  </nve-tabs-item>
  <nve-tabs-item>
    <nve-icon name="add-grid"></nve-icon> Tab 4
  </nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Stateless tabs for external state management without built-in selection behavior.
 */
export const StatelessTabs = {
  render: () => html`
<nve-tabs>
  <nve-tabs-item selected>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3</nve-tabs-item>
  <nve-tabs-item>Tab 4</nve-tabs-item>
  <nve-tabs-item disabled>Disabled</nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Tabs with link navigation for routing-based tab switching and page navigation.
 */
export const Links = {
  render: () => html`
<nve-tabs>
  <nve-tabs-item selected>
    <a href="./docs/elements/tabs/#links">Tab 1</a>
  </nve-tabs-item>
  <nve-tabs-item>
    <a href="./docs/elements/tabs/#links">Tab 2</a>
  </nve-tabs-item>
  <nve-tabs-item>
    <a href="/docs/elements/tabs/#links">Tab 3</a>
  </nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Tabs with overflow handling for managing large numbers of tabs with scrolling behavior.
 * @tags test-case
 */
export const OverflowTabs = {
  render: () => html`
<nve-tabs behavior-select>
  <nve-tabs-item selected>Tab 1</nve-tabs-item>
  <nve-tabs-item>Tab 2</nve-tabs-item>
  <nve-tabs-item>Tab 3</nve-tabs-item>
  <nve-tabs-item>Tab 4</nve-tabs-item>
  <nve-tabs-item>Tab 5</nve-tabs-item>
  <nve-tabs-item>Tab 6</nve-tabs-item>
  <nve-tabs-item>Tab 7</nve-tabs-item>
  <nve-tabs-item>Tab 8</nve-tabs-item>
  <nve-tabs-item>Tab 9</nve-tabs-item>
  <nve-tabs-item>Tab 10</nve-tabs-item>
  <nve-tabs-item>Tab 11</nve-tabs-item>
  <nve-tabs-item>Tab 12</nve-tabs-item>
  <nve-tabs-item>Tab 13</nve-tabs-item>
  <nve-tabs-item>Tab 14</nve-tabs-item>
  <nve-tabs-item>Tab 15</nve-tabs-item>
  <nve-tabs-item>Tab 16</nve-tabs-item>
  <nve-tabs-item>Tab 17</nve-tabs-item>
  <nve-tabs-item>Tab 18</nve-tabs-item>
  <nve-tabs-item>Tab 19</nve-tabs-item>
  <nve-tabs-item>Tab 20</nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Tabs selection state and a popover working together without any CSS Anchor Positioning collisions.
 * @tags test-case
 */
export const WithTooltips = {
  render: () => html`
<nve-tooltip id="tab1">Tooltip for tab 1</nve-tooltip>
<nve-tooltip id="tab2">Tooltip for tab 2</nve-tooltip>
<nve-tooltip id="tab3">Tooltip for tab 3</nve-tooltip>
<nve-tabs behavior-select>
  <nve-tabs-item selected popovertarget="tab1">Tab 1</nve-tabs-item>
  <nve-tabs-item popovertarget="tab2">Tab 2</nve-tabs-item>
  <nve-tabs-item id="tab-item-3" popovertarget="tab3">Tab 3</nve-tabs-item>
</nve-tabs>`
};

/**
 * @summary Group tabs with slot-matched panels and structured card content when one selected value should control both the tab state and revealed details.
 */
export const GroupPanels = {
  render: () => html`
<nve-tabs-group id="tab-group">
  <nve-tabs>
    <nve-tabs-item selected command="--toggle" commandfor="tab-group" value="overview">Overview</nve-tabs-item>
    <nve-tabs-item command="--toggle" commandfor="tab-group" value="details">Details</nve-tabs-item>
    <nve-tabs-item command="--toggle" commandfor="tab-group" value="settings">Settings</nve-tabs-item>
  </nve-tabs>
  <div slot="overview">
    <nve-card style="width: min(100%, 520px)">
      <nve-card-header>
        <div nve-layout="column gap:xs">
          <h2 nve-text="heading sm bold">Overview</h2>
          <p nve-text="body sm muted">High-level release status and current priorities.</p>
        </div>
      </nve-card-header>
      <nve-card-content>
        <dl nve-layout="grid gap:sm">
          <dt nve-layout="span:4" nve-text="body muted medium">Status</dt>
          <dd nve-layout="span:8" nve-text="body">Ready for review</dd>
          <dt nve-layout="span:4" nve-text="body muted medium">Audience</dt>
          <dd nve-layout="span:8" nve-text="body">Design and product owners</dd>
          <dt nve-layout="span:4" nve-text="body muted medium">Next step</dt>
          <dd nve-layout="span:8" nve-text="body">Validate the tab labels and panel order</dd>
        </dl>
      </nve-card-content>
    </nve-card>
  </div>
  <div slot="details">
    <nve-card style="width: min(100%, 520px)">
      <nve-card-header>
        <div nve-layout="column gap:xs">
          <h2 nve-text="heading sm bold">Details</h2>
          <p nve-text="body sm muted">Supporting context for teams that need implementation specifics.</p>
        </div>
      </nve-card-header>
      <nve-card-content>
        <dl nve-layout="grid gap:sm">
          <dt nve-layout="span:4" nve-text="body muted medium">Owner</dt>
          <dd nve-layout="span:8" nve-text="body">Elements design system</dd>
          <dt nve-layout="span:4" nve-text="body muted medium">Coverage</dt>
          <dd nve-layout="span:8" nve-text="body">Unit, SSR, and accessibility checks</dd>
          <dt nve-layout="span:4" nve-text="body muted medium">Focus</dt>
          <dd nve-layout="span:8" nve-text="body">Selection sync and panel wiring</dd>
        </dl>
      </nve-card-content>
    </nve-card>
  </div>
  <div slot="settings">
    <nve-card style="width: min(100%, 520px)">
      <nve-card-header>
        <div nve-layout="column gap:xs">
          <h2 nve-text="heading sm bold">Settings</h2>
          <p nve-text="body sm muted">Configuration notes for authors and downstream consumers.</p>
        </div>
      </nve-card-header>
      <nve-card-content>
        <dl nve-layout="grid gap:sm">
          <dt nve-layout="span:4" nve-text="body muted medium">Selection</dt>
          <dd nve-layout="span:8" nve-text="body">Controlled by the active tab value</dd>
          <dt nve-layout="span:4" nve-text="body muted medium">Panels</dt>
          <dd nve-layout="span:8" nve-text="body">Matched by slot name</dd>
          <dt nve-layout="span:4" nve-text="body muted medium">Actions</dt>
          <dd nve-layout="span:8" nve-text="body">External buttons can drive the same group</dd>
        </dl>
      </nve-card-content>
    </nve-card>
  </div>
</nve-tabs-group>`
};

/**
 * @summary Drive the same tabs group from external buttons when layouts need tabs and secondary actions to stay in sync with structured panel content.
 */
export const ExternalControls = {
  render: () => html`
<div nve-layout="column gap:lg">
  <nve-tabs-group id="tab-group-controls">
    <nve-tabs>
      <nve-tabs-item selected command="--toggle" commandfor="tab-group-controls" value="overview">Overview</nve-tabs-item>
      <nve-tabs-item command="--toggle" commandfor="tab-group-controls" value="details">Details</nve-tabs-item>
      <nve-tabs-item command="--toggle" commandfor="tab-group-controls" value="settings">Settings</nve-tabs-item>
    </nve-tabs>
    <div slot="overview">
      <nve-card style="width: min(100%, 520px)">
        <nve-card-header>
          <div nve-layout="column gap:xs">
            <h2 nve-text="heading sm bold">Overview</h2>
            <p nve-text="body sm muted">Quick status for the current tab group.</p>
          </div>
        </nve-card-header>
        <nve-card-content>
          <dl nve-layout="grid gap:sm">
            <dt nve-layout="span:4" nve-text="body muted medium">State</dt>
            <dd nve-layout="span:8" nve-text="body">Overview is active</dd>
            <dt nve-layout="span:4" nve-text="body muted medium">Signal</dt>
            <dd nve-layout="span:8" nve-text="body">Use this tab for a summary of the current workflow</dd>
            <dt nve-layout="span:4" nve-text="body muted medium">Tip</dt>
            <dd nve-layout="span:8" nve-text="body">Pair it with external controls for quick switching</dd>
          </dl>
        </nve-card-content>
      </nve-card>
    </div>
    <div slot="details">
      <nve-card style="width: min(100%, 520px)">
        <nve-card-header>
          <div nve-layout="column gap:xs">
            <h2 nve-text="heading sm bold">Details</h2>
            <p nve-text="body sm muted">Deeper context for follow-up tasks and implementation notes.</p>
          </div>
        </nve-card-header>
        <nve-card-content>
          <dl nve-layout="grid gap:sm">
            <dt nve-layout="span:4" nve-text="body muted medium">State</dt>
            <dd nve-layout="span:8" nve-text="body">Details are available on demand</dd>
            <dt nve-layout="span:4" nve-text="body muted medium">Signal</dt>
            <dd nve-layout="span:8" nve-text="body">Use this tab when readers need extra context</dd>
            <dt nve-layout="span:4" nve-text="body muted medium">Tip</dt>
            <dd nve-layout="span:8" nve-text="body">Keep the content specific to the selected tab</dd>
          </dl>
        </nve-card-content>
      </nve-card>
    </div>
    <div slot="settings">
      <nve-card style="width: min(100%, 520px)">
        <nve-card-header>
          <div nve-layout="column gap:xs">
            <h2 nve-text="heading sm bold">Settings</h2>
            <p nve-text="body sm muted">Preferences and coordination notes for the shared tab group.</p>
          </div>
        </nve-card-header>
        <nve-card-content>
          <dl nve-layout="grid gap:sm">
            <dt nve-layout="span:4" nve-text="body muted medium">State</dt>
            <dd nve-layout="span:8" nve-text="body">Settings remain in sync with the selected value</dd>
            <dt nve-layout="span:4" nve-text="body muted medium">Signal</dt>
            <dd nve-layout="span:8" nve-text="body">Useful for configuration and admin actions</dd>
            <dt nve-layout="span:4" nve-text="body muted medium">Tip</dt>
            <dd nve-layout="span:8" nve-text="body">Use external buttons when the layout needs extra actions</dd>
          </dl>
        </nve-card-content>
      </nve-card>
    </div>
  </nve-tabs-group>

  <div nve-layout="row gap:xs">
    <nve-button command="--toggle" commandfor="tab-group-controls" value="overview">overview</nve-button>
    <nve-button command="--toggle" commandfor="tab-group-controls" value="details">details</nve-button>
    <nve-button command="--toggle" commandfor="tab-group-controls" value="settings">settings</nve-button>
  </div>
</div>`
};
