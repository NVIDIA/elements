import { html } from 'lit';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/divider/define.js';

export default {
  title: 'Elements/Alert',
  component: 'nve-alert'
};

/**
 * @summary Basic alert for inline informational messages. Use alerts for persistent feedback that doesn't auto-dismiss, ideal for system status updates, or contextual information that users may need to reference while completing tasks.
 */
export const Default = {
  render: () => html`<nve-alert>alert message</nve-alert>`
};

/**
 * @summary Alert status variants for semantic messaging. Use accent for informational updates, warning for cautionary messages requiring attention, success for confirmations, and danger for errors or critical issues that may block user progress.
 */
export const SupportStatus = {
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
 * @summary Extended status variants for workflow and process state communication. Use these specialized states (scheduled, queued, running, failed, etc.) in dashboards, build pipelines, or task management interfaces where users need detailed visibility into process lifecycle stages.
 */
export const Status = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-alert>Standard</nve-alert>
  <nve-alert status="accent">Accent</nve-alert>
  <nve-alert status="warning">Warning</nve-alert>
  <nve-alert status="success">Success</nve-alert>
  <nve-alert status="danger">Danger</nve-alert>

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
 * @summary Alert group for visually organizing related messages with shared styling. Use alert groups to present many related messages as a cohesive unit, improving scannability and visual hierarchy.
 */
export const GroupDefault = {
  render: () => html`
  <nve-alert-group>
    <nve-alert>alert message</nve-alert>
  </nve-alert-group>
  `
};

/**
 * @summary Alert groups with inherited status styling for all children. Applying status at the group level ensures visual consistency across related messages, perfect for form validation where many fields share the same error context.
 */
export const GroupStatus = {
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
 * @summary Dismissible alerts using the Invoker Command API for declarative close behavior. Use `commandfor` and `command="--close"` on action buttons to dismiss individual alerts without custom JavaScript event handling.
 */
export const InvokerCommand = {
  render: () => html`
<nve-alert-group>
  <nve-alert id="alert-1">
    Alert Notification Message 1
    <nve-icon-button commandfor="alert-1" command="--close" slot="actions" container="flat" icon-name="cancel" size="sm" aria-label="close"></nve-icon-button>
  </nve-alert>
  <nve-alert id="alert-2">
    Alert Notification Message 2
    <nve-icon-button commandfor="alert-2" command="--close" slot="actions" container="flat" icon-name="cancel" size="sm" aria-label="close"></nve-icon-button>
  </nve-alert>
</nve-alert-group>`
};

/**
 * @summary Closable alerts that users can dismiss. Use closable alerts for messages that become irrelevant after reading (like onboarding tips, one-time announcements, or acknowledged warnings), but avoid for critical errors that need to remain visible until resolved.
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
 * @summary Alerts with action buttons for immediate user response. Include actions when the alert requires user decision-making (like "Retry", "View Details", or "Undo"), making the next step clear and reducing friction in error recovery or task completion flows.
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
 * @summary High-prominence alerts with emphasis styling for full-width banners. Use prominence="emphasis" for system-wide announcements like maintenance windows, feature launches, or critical security updates that need max visibility and impact across the entire interface.
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
 * @summary Alert with complex structured content including expandable details. Use the content slot for rich information like stack traces, validation summaries, or detailed error logs where users need both the high-level message and access to technical details for debugging or reporting.
 */
export const Content = {
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
 * @summary Custom color variants for brand-specific styling or extra visual differentiation beyond standard status colors. Use custom colors when standard semantic colors don't match your use case, such as category labels, team assignments, or brand-specific messaging.
 * @tags test-case
 */
export const Color = {
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
 * @summary Custom color combinations with status icons and prominence for advanced theming. Custom colors interact with status icons and emphasis styling, useful for maintaining brand consistency while preserving semantic meaning through status indicators.
 * @tags test-case
 */
export const CustomColorCombinations = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert-group color="blue-indigo">
        <nve-alert closable>Custom <code nve-text="code">color</code> will theme the <code nve-text="code">closable</code> icon.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="teal-seafoam">
        <nve-alert>
          Custom <code nve-text="code">color</code> is compatible with <code nve-text="code">actions</code> button.
          <nve-button slot="actions" container="flat">action</nve-button>
        </nve-alert>
      </nve-alert-group>

      <nve-alert-group color="pink-rose" status="accent">
        <nve-alert>Combining custom <code nve-text="code">color="pink-rose"</code> with <code nve-text="code">status</code> yields the status icon with custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="pink-rose" status="success">
        <nve-alert>Combining custom <code nve-text="code">color="pink-rose"</code> with <code nve-text="code">status</code> yields the status icon with custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="pink-rose" status="warning">
        <nve-alert>Combining custom <code nve-text="code">color="pink-rose"</code> with <code nve-text="code">status</code> yields the status icon with custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="pink-rose" status="danger">
        <nve-alert>Combining custom <code nve-text="code">color="pink-rose"</code> with <code nve-text="code">status</code> yields the status icon with custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="blue-indigo" status="accent" prominence="emphasis">
        <nve-alert>Combining custom <code nve-text="code">color="blue-indigo"</code> with <code nve-text="code">status</code> and <code nve-text="code">prominence</code> yields the status icon with an <em>emphasized</em> custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="blue-indigo" status="success" prominence="emphasis">
        <nve-alert>Combining custom <code nve-text="code">color="blue-indigo"</code> with <code nve-text="code">status</code> and <code nve-text="code">prominence</code> yields the status icon with an <em>emphasized</em> custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="blue-indigo" status="warning" prominence="emphasis">
        <nve-alert>Combining custom <code nve-text="code">color="blue-indigo"</code> with <code nve-text="code">status</code> and <code nve-text="code">prominence</code> yields the status icon with an <em>emphasized</em> custom alert color.</nve-alert>
      </nve-alert-group>

      <nve-alert-group color="blue-indigo" status="danger" prominence="emphasis">
        <nve-alert>Combining custom <code nve-text="code">color="blue-indigo"</code> with <code nve-text="code">status</code> and <code nve-text="code">prominence</code> yields the status icon with an <em>emphasized</em> custom alert color.</nve-alert>
      </nve-alert-group>
    </div>
  `
}