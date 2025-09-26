import { html } from 'lit';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/divider/define.js';

export default {
  title: 'Elements/Alert',
  component: 'nve-alert'
};

/**
 * @summary Basic alert component for displaying informational messages to users
 */
export const Default = {
  render: () => html`<nve-alert>alert message</nve-alert>`
};

/**
 * @summary Demonstrates different alert status variants (accent, warning, success, danger) for contextual messaging
 */
export const Status = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-alert>Standard</nve-alert>
  <nve-alert status="accent">Accent</nve-alert>
  <nve-alert status="warning">Warning</nve-alert>
  <nve-alert status="success">Success</nve-alert>
  <nve-alert status="danger">Danger</nve-alert>
</div>
  `
}

/**
 * @summary Demonstrates task-specific status variants for workflow and process state communication
 */
export const TaskStatus = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-alert status="scheduled">Scheduled</nve-alert>
  <nve-alert status="queued">Queued</nve-alert>
  <nve-alert status="finished">Finished</nve-alert>
  <nve-alert status="failed">Failed</nve-alert>
  <nve-alert status="unknown">Unknown</nve-alert>
  <nve-alert status="pending">Pending</nve-alert>
  <nve-alert status="starting">Starting</nve-alert>
  <nve-alert status="running">Running</nve-alert>
  <nve-alert status="restarting">Restarting</nve-alert>
  <nve-alert status="stopping">Stopping</nve-alert>
  <nve-alert status="ignored">Ignored</nve-alert>
</div>
  `
}

/**
 * @summary Demonstrates alert grouping for organizing related messages together
 */
export const AlertGroupDefault = {
  render: () => html`
  <nve-alert-group>
    <nve-alert>alert message</nve-alert>
  </nve-alert-group>
  `
};

/**
 * @summary Shows alert groups with different status variants for contextual message grouping
 */
export const AlertGroupStatus = {
  render: () => html`
  <div nve-layout="column gap:md">
    <nve-alert-group>
      <nve-alert>Standard</nve-alert>
      <nve-alert>Standard</nve-alert>
    </nve-alert-group>

    <nve-alert-group status="accent">
      <nve-alert>Accent</nve-alert>
      <nve-alert>Accent</nve-alert>
    </nve-alert-group>

    <nve-alert-group status="warning">
      <nve-alert>Warning</nve-alert>
      <nve-alert>Warning</nve-alert>
    </nve-alert-group>

    <nve-alert-group status="success">
      <nve-alert>Success</nve-alert>
      <nve-alert>Success</nve-alert>
    </nve-alert-group>

    <nve-alert-group status="danger">
      <nve-alert>Danger</nve-alert>
      <nve-alert>Danger</nve-alert>
    </nve-alert-group>
  </div>
  `
}

/**
 * @summary Demonstrates closable alerts within groups for dismissible notification patterns
 */
export const Closable = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert-group>
        <nve-alert closable>Standard</nve-alert>
        <nve-alert closable>Standard</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="accent">
        <nve-alert closable>Accent</nve-alert>
        <nve-alert closable>Accent</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert closable>Warning</nve-alert>
        <nve-alert closable>Warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert closable>Success</nve-alert>
        <nve-alert closable>Success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert closable>Danger</nve-alert>
        <nve-alert closable>Danger</nve-alert>
      </nve-alert-group>
    </div>
  `
}

/**
 * @summary Shows alerts with action buttons for interactive notification patterns
 */
export const Actions = {
  render: () => html`
  <div nve-layout="column gap:md">
    <nve-alert-group>
      <nve-alert>
        Standard <nve-button slot="actions" container="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="accent">
      <nve-alert>
        Standard <nve-button slot="actions" container="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="warning">
      <nve-alert>
        Warning <nve-button slot="actions" container="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="success">
      <nve-alert>
        Success <nve-button slot="actions" container="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="danger">
      <nve-alert>
        Danger <nve-button slot="actions" container="flat">action</nve-button>
      </nve-alert>
    </nve-alert-group>
  </div>
  `
}

/**
 * @summary Demonstrates high-prominence alerts for banner-style notifications with emphasis styling
 */
export const Prominence = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert-group prominence="emphasis" container="full">
        <nve-alert closable><span slot="prefix">Standard</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></nve-alert>
      </nve-alert-group>

      <nve-alert-group status="accent" prominence="emphasis" container="full">
        <nve-alert closable><span slot="prefix">Accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning" prominence="emphasis" container="full">
        <nve-alert closable><span slot="prefix">Warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success" prominence="emphasis" container="full">
        <nve-alert closable><span slot="prefix">Success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger" prominence="emphasis" container="full">
        <nve-alert closable><span slot="prefix">Danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a></nve-alert>
      </nve-alert-group>
    </div>
  `
}

/**
 * @summary Demonstrates complex alert content with structured layouts and detailed information display
 */
export const Multiline = {
  render: () => html`
    <nve-alert-group status="danger">
      <nve-alert>
        Session Paused:
        <div slot="content" nve-layout="column gap:sm align:stretch">
          <p nve-text="body sm emphasis">Failed to verify drives.</p>
          <pre nve-text="sm emphasis" style="background: transparent !important; margin: 0;">
10:06:01 AM [verify] update /virtual:/verify/
10:06:11 AM [build] update /virtual:/build/
10:06:22 AM [error] update /virtual:/error/ - failed to connect to remote</pre>
        </div>
        <nve-button slot="actions" container="flat">Collapse Details</nve-button>
      </nve-alert>
    </nve-alert-group>
  `
}

/**
 * @summary Shows custom color variants for brand-specific alert styling and visual differentiation
 * @tags test-case
 */
export const CustomColors = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert-group color="red-cardinal">
        <nve-alert>red-cardinal</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="gray-slate">
        <nve-alert>gray-slate</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="gray-denim">
        <nve-alert>gray-denim</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="blue-indigo">
        <nve-alert>blue-indigo</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="blue-cobalt">
        <nve-alert>blue-cobalt</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="blue-sky">
        <nve-alert>blue-sky</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="teal-cyan">
        <nve-alert>teal-cyan</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="green-mint">
        <nve-alert>green-mint</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="teal-seafoam">
        <nve-alert>teal-seafoam</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="green-grass">
        <nve-alert>green-grass</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="yellow-amber">
        <nve-alert>yellow-amber</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="orange-pumpkin">
        <nve-alert>orange-pumpkin</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="red-tomato">
        <nve-alert>red-tomato</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="pink-magenta">
        <nve-alert>pink-magenta</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="purple-plum">
        <nve-alert>purple-plum</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="purple-violet">
        <nve-alert>purple-violet</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="purple-lavender">
        <nve-alert>purple-lavender</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="pink-rose">
        <nve-alert>pink-rose</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="green-jade">
        <nve-alert>green-jade</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="lime-pear">
        <nve-alert>lime-pear</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="yellow-nova">
        <nve-alert>yellow-nova</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="brand-green">
        <nve-alert>brand-green</nve-alert>
      </nve-alert-group>
    </div>
  `
}


/**
 * @summary Demonstrates combining custom colors with status and prominence for advanced alert customization
 * @tags test-case
 */
export const CustomColorCombinations = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert-group color="blue-indigo">
        <nve-alert closable>Custom <code>color</code> will theme the <code>closable</code> icon.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="teal-seafoam">
        <nve-alert>
          Custom <code>color</code> is compatible with <code>actions</code> button.
          <nve-button slot="actions" container="flat">action</nve-button>
        </nve-alert>
      </nve-alert-group>

      <nve-alert-group color="pink-rose" status="accent">
        <nve-alert>Combining custom <code>color="pink-rose"</code> with <code>status</code> yields the status icon with custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="pink-rose" status="success">
        <nve-alert>Combining custom <code>color="pink-rose"</code> with <code>status</code> yields the status icon with custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="pink-rose" status="warning">
        <nve-alert>Combining custom <code>color="pink-rose"</code> with <code>status</code> yields the status icon with custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="pink-rose" status="danger">
        <nve-alert>Combining custom <code>color="pink-rose"</code> with <code>status</code> yields the status icon with custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="blue-indigo" status="accent" prominence="emphasis">
        <nve-alert>Combining custom <code>color="blue-indigo"</code> with <code>status</code> and <code>prominence</code> yields the status icon with an <em>emphasized</em> custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="blue-indigo" status="success" prominence="emphasis">
        <nve-alert>Combining custom <code>color="blue-indigo"</code> with <code>status</code> and <code>prominence</code> yields the status icon with an <em>emphasized</em> custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="blue-indigo" status="warning" prominence="emphasis">
        <nve-alert>Combining custom <code>color="blue-indigo"</code> with <code>status</code> and <code>prominence</code> yields the status icon with an <em>emphasized</em> custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="blue-indigo" status="danger" prominence="emphasis">
        <nve-alert>Combining custom <code>color="blue-indigo"</code> with <code>status</code> and <code>prominence</code> yields the status icon with an <em>emphasized</em> custom alert color.</nve-alert>
      </nve-alert-group>
    </div>
  `
}