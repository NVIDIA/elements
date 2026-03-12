import { html } from 'lit';

export default {
  title: 'Patterns/Search',
  component: 'nve-patterns'
};

/**
 * @summary Search toolbar with filter functionality including progressive filter chips and search combobox for data filtering scenarios.
 * @tags pattern
 */
export const FilterToolbar = {
  render: () => html`
    <nve-toolbar container="flat">
      <nve-icon-button readonly icon-name="filter" container="flat" slot="prefix"></nve-icon-button>
      <nve-progressive-filter-chip closable>
        <select aria-label="dataset">
          <option selected>status</option>
          <option>workload</option>
        </select>
        <select aria-label="condition">
          <option selected>filter by</option>
          <option>sort by</option>
        </select>
        <select multiple aria-label="filter">
          <option selected>progress</option>
          <option>pending</option>
          <option>success</option>
          <option>failed</option>
        </select>
      </nve-progressive-filter-chip>
      <nve-combobox container="flat">
        <input type="search" placeholder="Add Filter" aria-label="add filter" />
        <datalist>
          <option value="Status"></option>
          <option value="Priority"></option>
          <option value="Date"></option>
          <option value="Session"></option>
          <option value="Configuration"></option>
          <option value="Contains"></option>
        </datalist>
      </nve-combobox>
      <nve-icon-button container="flat" aria-label="clear filters" icon-name="cancel" slot="suffix"></nve-icon-button>
      <nve-button slot="suffix">Save Filters</nve-button>
    </nve-toolbar>
  `
};

/**
 * @summary Toolbar with many filter chips and date inputs showing horizontal scrolling behavior when content overflows.
 * @tags pattern test-case
 */
export const FilterToolbarScroll = {
  render: () => html`
    <nve-toolbar container="flat">
      <nve-icon-button readonly icon-name="filter" container="flat" slot="prefix"></nve-icon-button>
      <nve-progressive-filter-chip closable>
        <select aria-label="dataset">
          <option>workload</option>
          <option selected>instance</option>
        </select>
        <select aria-label="condition">
          <option>sort by</option>
          <option selected>filter by</option>
        </select>
        <select aria-label="filter">
          <option selected>utilization</option>
          <option>status</option>
        </select>
      </nve-progressive-filter-chip>
      <nve-progressive-filter-chip closable>
        <select aria-label="dataset">
          <option selected>status</option>
          <option>workload</option>
        </select>
        <select aria-label="condition">
          <option selected>filter by</option>
          <option>sort by</option>
        </select>
        <select multiple aria-label="filter">
          <option selected>progress</option>
          <option>pending</option>
          <option>success</option>
          <option>failed</option>
        </select>
      </nve-progressive-filter-chip>
      <nve-progressive-filter-chip>
        <select aria-label="date type">
          <option>recording date</option>
          <option>process date</option>
        </select>
        <input type="date" value="2022-05-11" aria-label="start date" />
        <input type="date" value="2022-12-07" aria-label="end date" />
      </nve-progressive-filter-chip>
      <nve-combobox container="flat">
        <input type="search" placeholder="Add Filter" aria-label="add filter" />
        <datalist>
          <option value="Status"></option>
          <option value="Priority"></option>
          <option value="Date"></option>
          <option value="Session"></option>
          <option value="Configuration"></option>
          <option value="Contains"></option>
        </datalist>
      </nve-combobox>
      <nve-icon-button container="flat" aria-label="clear filters" icon-name="cancel" slot="suffix"></nve-icon-button>
      <nve-button slot="suffix">Save Filters</nve-button>
    </nve-toolbar>
  `
};

/**
 * @summary Toolbar with content wrapping enabled to handle overflow by wrapping items to new lines instead of scrolling.
 * @tags pattern test-case
 */
export const FilterToolbarWrap = {
  render: () => html`
    <nve-toolbar container="flat" content="wrap">
      <nve-icon-button readonly icon-name="filter" container="flat" slot="prefix"></nve-icon-button>
      <nve-progressive-filter-chip closable>
        <select aria-label="dataset">
          <option>workload</option>
          <option selected>instance</option>
        </select>
        <select aria-label="condition">
          <option>sort by</option>
          <option selected>filter by</option>
        </select>
        <select aria-label="filter">
          <option selected>utilization</option>
          <option>status</option>
        </select>
      </nve-progressive-filter-chip>
      <nve-progressive-filter-chip closable>
        <select aria-label="dataset">
          <option selected>status</option>
          <option>workload</option>
        </select>
        <select aria-label="condition">
          <option selected>filter by</option>
          <option>sort by</option>
        </select>
        <select multiple aria-label="filter">
          <option selected>progress</option>
          <option>pending</option>
          <option>success</option>
          <option>failed</option>
        </select>
      </nve-progressive-filter-chip>
      <nve-progressive-filter-chip>
        <select aria-label="date type">
          <option>recording date</option>
          <option>process date</option>
        </select>
        <input type="date" value="2022-05-11" aria-label="start date" />
        <input type="date" value="2022-12-07" aria-label="end date" />
      </nve-progressive-filter-chip>
      <nve-combobox container="flat">
        <input type="search" placeholder="Add Filter" aria-label="add filter" />
        <datalist>
          <option value="Status"></option>
          <option value="Priority"></option>
          <option value="Date"></option>
          <option value="Session"></option>
          <option value="Configuration"></option>
          <option value="Contains"></option>
        </datalist>
      </nve-combobox>
      <nve-icon-button container="flat" aria-label="clear filters" icon-name="cancel" slot="suffix"></nve-icon-button>
      <nve-button slot="suffix">Save Filters</nve-button>
    </nve-toolbar>
  `
};