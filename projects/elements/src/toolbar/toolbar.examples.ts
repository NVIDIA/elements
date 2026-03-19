// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

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
      <nve-button><nve-icon name="add"></nve-icon> create</nve-button>
      <nve-button><nve-icon name="delete"></nve-icon> delete</nve-button>
      <nve-icon-button icon-name="gear" slot="suffix" aria-label="settings"></nve-icon-button>
    </nve-toolbar>
  `
};

/**
 * @summary Toolbar with flat container styling for a more subtle appearance.
 */
export const ContainerFlat = {
  render: () => html`
    <nve-toolbar container="flat">
      <nve-button><nve-icon name="add"></nve-icon> create</nve-button>
      <nve-button><nve-icon name="delete"></nve-icon> delete</nve-button>
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
      <nve-button><nve-icon name="add"></nve-icon> create</nve-button>
      <nve-button><nve-icon name="delete"></nve-icon> delete</nve-button>
      <nve-icon-button icon-name="gear" slot="suffix" aria-label="settings"></nve-icon-button>
    </nve-toolbar>
  `
};

/**
 * @summary Toolbar with full container styling that spans the entire width.
 */
export const ContainerFull = {
  render: () => html`
    <nve-toolbar container="full">
      <nve-button><nve-icon name="add"></nve-icon> create</nve-button>
      <nve-button><nve-icon name="delete"></nve-icon> delete</nve-button>
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


/**
 * @summary Example of toolbar containers and their different appearances with varying prominence levels.
 * @tags test-case
 */
export const Container = {
  render: () => html`
    <div nve-layout="column gap:lg">
      <nve-toolbar>
        <nve-button><nve-icon name="copy"></nve-icon> copy</nve-button>
        <nve-button><nve-icon name="copy"></nve-icon></nve-button>
        <nve-icon-button icon-name="copy"></nve-icon-button>
        <nve-copy-button></nve-copy-button>
        <nve-switch prominence="muted">
          <input type="checkbox" checked aria-label="switch" />
        </nve-switch>
        <nve-checkbox prominence="muted">
          <input type="checkbox" checked aria-label="checkbox" />
        </nve-checkbox>
        <nve-input>
          <input aria-label="input" />
        </nve-input>
      </nve-toolbar>

      <nve-toolbar container="flat">
        <nve-button><nve-icon name="copy"></nve-icon> copy</nve-button>
        <nve-button><nve-icon name="copy"></nve-icon></nve-button>
        <nve-icon-button icon-name="copy"></nve-icon-button>
        <nve-copy-button></nve-copy-button>
        <nve-switch prominence="muted">
          <input type="checkbox" checked aria-label="switch" />
        </nve-switch>
        <nve-checkbox prominence="muted">
          <input type="checkbox" checked aria-label="checkbox" />
        </nve-checkbox>
        <nve-input>
          <input aria-label="input" />
        </nve-input>
      </nve-toolbar>

      <nve-toolbar container="inset">
        <nve-button><nve-icon name="copy"></nve-icon> copy</nve-button>
        <nve-button><nve-icon name="copy"></nve-icon></nve-button>
        <nve-icon-button icon-name="copy"></nve-icon-button>
        <nve-copy-button></nve-copy-button>
        <nve-switch prominence="muted">
          <input type="checkbox" checked aria-label="switch" />
        </nve-switch>
        <nve-checkbox prominence="muted">
          <input type="checkbox" checked aria-label="checkbox" />
        </nve-checkbox>
        <nve-input>
          <input aria-label="input" />
        </nve-input>
      </nve-toolbar>
    </div>
  `
};