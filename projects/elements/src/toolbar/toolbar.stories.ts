import { html } from 'lit';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/combobox/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/progressive-filter-chip/define.js';
import '@nvidia-elements/core/input/define.js';

export default {
  title: 'Elements/Toolbar',
  component: 'nve-toolbar',
};

/**
 * @summary Basic toolbar with action buttons and a settings icon in the suffix slot.
 */
export const Default = {
  render: () => html`
    <nve-toolbar>
      <nve-button container="inline"><nve-icon name="add"></nve-icon> create</nve-button>
      <nve-button container="inline"><nve-icon name="delete"></nve-icon> delete</nve-button>
      <nve-icon-button container="inline" icon-name="gear" slot="suffix" aria-label="settings"></nve-icon-button>
    </nve-toolbar>
  `
};

/**
 * @summary Toolbar with flat container styling for a more subtle appearance.
 */
export const ContainerFlat = {
  render: () => html`
    <nve-toolbar container="flat">
      <nve-button container="inline"><nve-icon name="add"></nve-icon> create</nve-button>
      <nve-button container="inline"><nve-icon name="delete"></nve-icon> delete</nve-button>
      <nve-icon-button container="flat" icon-name="gear" slot="suffix" aria-label="settings"></nve-icon-button>
    </nve-toolbar>
  `
};

/**
 * @summary Toolbar with inset container styling and constrained width for contained layouts.
 */
export const ContainerInset = {
  render: () => html`
    <nve-toolbar container="inset" style="--width: 300px">
      <nve-button container="inline"><nve-icon name="add"></nve-icon> create</nve-button>
      <nve-button container="inline"><nve-icon name="delete"></nve-icon> delete</nve-button>
      <nve-icon-button container="inline" icon-name="gear" slot="suffix" aria-label="settings"></nve-icon-button>
    </nve-toolbar>
  `
};

/**
 * @summary Toolbar with full container styling that spans the entire width.
 */
export const ContainerFull = {
  render: () => html`
    <nve-toolbar container="full">
      <nve-button container="inline"><nve-icon name="add"></nve-icon> create</nve-button>
      <nve-button container="inline"><nve-icon name="delete"></nve-icon> delete</nve-button>
      <nve-icon-button container="flat" icon-name="gear" slot="suffix" aria-label="settings"></nve-icon-button>
    </nve-toolbar>
  `
};

/**
 * @summary Complex toolbar with grouped controls including select dropdowns, button groups, and dividers for text editing scenarios.
 */
export const Groups = {
  render: () => html`
    <nve-toolbar>
      <nve-select fit-text>
        <select aria-label="element type">
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="p">Paragraph</option>
        </select>
        <div slot="option-1">
          <span nve-text="heading">Heading 1</span>
        </div>
        <div slot="option-2">
          <span nve-text="heading sm">Heading 2</span>
        </div>
        <div slot="option-3">
          <span nve-text="body sm">Paragraph</span>
        </div>
      </nve-select>

      <nve-divider></nve-divider>

      <nve-button-group>
        <nve-icon-button pressed icon-name="bars-3-bottom-left"></nve-icon-button>
        <nve-icon-button icon-name="bars-3-bottom-right"></nve-icon-button>
        <nve-icon-button icon-name="bars-4"></nve-icon-button>
      </nve-button-group>

      <nve-divider></nve-divider>

      <nve-button-group>
        <nve-icon-button icon-name="bold" size="sm"></nve-icon-button>
        <nve-icon-button icon-name="italic" size="sm"></nve-icon-button>
        <nve-icon-button icon-name="strikethrough" size="sm"></nve-icon-button>
      </nve-button-group>

      <nve-divider></nve-divider>

      <nve-button-group>
        <nve-icon-button icon-name="code"></nve-icon-button>
        <nve-icon-button icon-name="fork"></nve-icon-button>
        <nve-icon-button icon-name="merge"></nve-icon-button>
      </nve-button-group>

      <nve-button slot="suffix" container="flat">Save</nve-button>
    </nve-toolbar>
  `
};

/**
 * @summary Vertical toolbar orientation with button groups and dividers for sidebar layouts.
 */
export const Vertical = {
  render: () => html`
    <nve-toolbar orientation="vertical">
      <nve-button-group>
        <nve-icon-button pressed icon-name="bars-3-bottom-left"></nve-icon-button>
        <nve-icon-button icon-name="bars-3-bottom-right"></nve-icon-button>
        <nve-icon-button icon-name="bars-4"></nve-icon-button>
      </nve-button-group>

      <nve-divider></nve-divider>

      <nve-button-group>
        <nve-icon-button icon-name="bold" size="sm"></nve-icon-button>
        <nve-icon-button icon-name="italic" size="sm"></nve-icon-button>
        <nve-icon-button icon-name="strikethrough"></nve-icon-button>
      </nve-button-group>
    </nve-toolbar>
  `
};

/**
 * @summary Toolbar with filter functionality including progressive filter chips and search combobox for data filtering scenarios.
 */
export const Filter = {
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
        <input type="search" placeholder="Add Filter" />
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
 * @summary Toolbar with multiple filter chips and date inputs demonstrating horizontal scrolling behavior when content overflows.
 */
export const Scroll = {
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
        <input type="search" placeholder="Add Filter" />
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
 */
export const Wrap = {
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
        <input type="search" placeholder="Add Filter" />
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
 * @summary Toolbar with status styling showing selection state with accent status and default status variants for bulk actions.
 */
export const Status = {
  render: () => html`
    <div nve-layout="column gap:lg align:horizontal-stretch full">
      <nve-toolbar status="accent">
        <nve-icon-button icon-name="cancel" slot="prefix"></nve-icon-button>  
        <p nve-text="body">123 selected</p>
        <nve-button slot="suffix">delete</nve-button>
        <nve-icon-button icon-name="more-actions" slot="suffix"></nve-icon-button>
      </nve-toolbar>

      <nve-toolbar>
        <nve-icon-button icon-name="cancel" slot="prefix"></nve-icon-button>  
        <p nve-text="body">123 selected</p>
        <nve-button slot="suffix">delete</nve-button>
        <nve-icon-button icon-name="more-actions" slot="suffix"></nve-icon-button>
      </nve-toolbar>
    </div>
  `
}
