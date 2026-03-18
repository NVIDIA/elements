import { html } from 'lit';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/grid/define.js';

export default {
  title: 'Patterns/Feedback',
  component: 'nve-patterns'
};

/**
 * @summary Data grid empty state with retry action. Use when requested data is not found and a retry action is available.
 * @tags pattern
 */
export const DataGridRetry = {
  render: () => html`
<nve-grid style="min-height: 400px">
  <nve-grid-header>
    <nve-grid-column></nve-grid-column>
  </nve-grid-header>
  <nve-grid-placeholder>
    <div nve-layout="column gap:lg align:center">
      <nve-icon name="search" size="lg"></nve-icon>
      <h2 nve-text="heading lg">No Results Found</h2>
      <p nve-text="body">Try adjusting filter settings or try again later.</p>
      <div nve-layout="row gap:xs align:center">
        <nve-button container="flat">Clear Filters</nve-button>
        <nve-button>Retry Query</nve-button>
      </div>
    </div>
  </nve-grid-placeholder>
  <nve-grid-footer>
    <time nve-text="body sm muted" datetime="2026-01-28T12:00:00Z">Last updated: 15 minutes ago</time>
  </nve-grid-footer>
</nve-grid>
  `
};

/**
 * @summary Use for first-time or empty collection states with an illustration and call-to-action to guide users.
 * @tags pattern
 */
export const EmptyData = {
  render: () => html`
    <div nve-layout="column gap:lg pad:lg align:center">
      <nve-icon name="exclamation-triangle" size="xl"></nve-icon>
      <h2 nve-text="heading lg">No Devices Found</h2>
      <p nve-text="body muted center" style="max-width: 400px">Your fleet is empty. Add your first autonomous robot or vehicle to start monitoring and managing operations.</p>
      <nve-button>Add Device</nve-button>
    </div>
  `
};

/**
 * @summary Use when no search results match to suggest refining filters or clearing search criteria.
 * @tags pattern
 */
export const NoResults = {
  render: () => html`
    <div nve-layout="column gap:lg pad:lg align:center">
      <nve-icon name="search" size="xl"></nve-icon>
      <h2 nve-text="heading lg">No Results Found</h2>
      <p nve-text="body muted center">Try adjusting filter settings or try again later.</p>
      <div nve-layout="row gap:xs align:center">
        <nve-button container="flat">Clear Filters</nve-button>
        <nve-button>Retry Query</nve-button>
      </div>
    </div>
  `
};

/**
 * @summary Use to show offline mode with information about limited functionality and last sync time.
 * @tags pattern
 */
export const OfflineMode = {
  render: () => html`
    <div nve-layout="column gap:lg pad:lg align:center">
      <nve-icon name="wifi" size="xl"></nve-icon>
      <h2 nve-text="heading lg">You're Offline</h2>
      <p nve-text="body muted center" style="max-width: 400px;">You're viewing cached data. Some features are unavailable until connection is restored.</p>
      <nve-button>Reconnect</nve-button>
    </div>
  `
};
