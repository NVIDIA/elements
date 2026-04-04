// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/divider/define.js';

export default {
  title: 'Elements/Button Group',
  component: 'nve-button-group',
};

/**
 * @summary Basic button group for organizing related actions into a unified control with connected visual appearance.
 */
export const Default = {
  render: () => html`
    <nve-button-group>
      <nve-icon-button selected icon-name="copy"></nve-icon-button>
      <nve-icon-button icon-name="add-comment"></nve-icon-button>
      <nve-icon-button icon-name="download"></nve-icon-button>
    </nve-button-group>
  `
};

/**
 * @summary Button group with single selection behavior for mutually exclusive options like view modes or formatting.
 */
export const SingleSelect = {
  render: () => html`
  <nve-button-group behavior-select="single">
    <nve-icon-button pressed container="flat" icon-name="bars-3-bottom-left"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="bars-3-bottom-right"></nve-icon-button>
    <nve-icon-button container="flat" icon-name="bars-4"></nve-icon-button>
  </nve-button-group>
  `
};

/**
 * @summary Button group with multi-selection behavior for toggling many options simultaneously like text formatting.
 */
export const MultiSelect = {
  render: () => html`
    <nve-button-group behavior-select="multi">
      <nve-icon-button pressed container="flat" icon-name="bold" size="sm"></nve-icon-button>
      <nve-icon-button container="flat" icon-name="italic" size="sm"></nve-icon-button>
      <nve-icon-button pressed container="flat" icon-name="strikethrough" size="sm"></nve-icon-button>
    </nve-button-group>
  `
};

/**
 * @summary Button group in disabled state for indicating unavailable actions or read-only contexts.
 */
export const Disabled = {
  render: () => html`
    <nve-button-group container="rounded">
      <nve-button disabled>button</nve-button>
      <nve-divider orientation="vertical"></nve-divider>
      <nve-icon-button icon-name="caret" size="sm" direction="down" disabled></nve-icon-button>
    </nve-button-group>
  `
};

/**
 * @summary Button group with flat container styling for minimal visual appearance and reduced emphasis.
 */
export const Flat = {
  render: () => html`
    <nve-button-group container="flat">
      <nve-icon-button pressed icon-name="split-vertical"></nve-icon-button>
      <nve-icon-button icon-name="split-horizontal"></nve-icon-button>
      <nve-icon-button icon-name="split-none"></nve-icon-button>
    </nve-button-group>
  `
};

/**
 * @summary Button group for clustering related action buttons with cohesive visual treatment.
 */
export const Action = {
  render: () => html`
    <nve-button-group>
      <nve-icon-button icon-name="copy"></nve-icon-button>
      <nve-icon-button icon-name="add-comment"></nve-icon-button>
      <nve-icon-button icon-name="download"></nve-icon-button>
    </nve-button-group>
  `
};

/**
 * @summary Split button groups with different interaction styles for primary actions with dropdown alternatives.
 */
export const ActionSplit = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-button-group>
        <nve-button>button</nve-button>
        <nve-divider orientation="vertical"></nve-divider>
        <nve-icon-button icon-name="caret" size="sm" direction="down"></nve-icon-button>
      </nve-button-group>
      
      <nve-button-group interaction="emphasis">
        <nve-button>button</nve-button>
        <nve-divider orientation="vertical"></nve-divider>
        <nve-icon-button icon-name="caret" size="sm" direction="down"></nve-icon-button>
      </nve-button-group>
      
      <nve-button-group interaction="destructive">
        <nve-button>button</nve-button>
        <nve-divider orientation="vertical"></nve-divider>
        <nve-icon-button icon-name="caret" size="sm" direction="down"></nve-icon-button>
      </nve-button-group>
    </div>
  `
};

/**
 * @summary Split button groups with rounded container styling for softer visual appearance and modern aesthetics.
 */
export const ActionSplitRounded = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-button-group container="rounded">
        <nve-button>button</nve-button>
        <nve-divider orientation="vertical"></nve-divider>
        <nve-icon-button icon-name="caret" size="sm" direction="down"></nve-icon-button>
      </nve-button-group>
      
      <nve-button-group container="rounded" interaction="emphasis">
        <nve-button>button</nve-button>
        <nve-divider orientation="vertical"></nve-divider>
        <nve-icon-button icon-name="caret" size="sm" direction="down"></nve-icon-button>
      </nve-button-group>
      
      <nve-button-group container="rounded"  interaction="destructive">
        <nve-button>button</nve-button>
        <nve-divider orientation="vertical"></nve-divider>
        <nve-icon-button icon-name="caret" size="sm" direction="down"></nve-icon-button>
      </nve-button-group>
    </div>
  `
};

/**
 * @summary Rounded button group with single selection for segmented controls and filter options with pill-style buttons.
 */
export const Rounded = {
  render: () => html`
    <nve-button-group container="rounded" behavior-select="single">
      <nve-button pressed>All Time</nve-button>
      <nve-button>30 Days</nve-button>
      <nve-button>90 Days</nve-button>
    </nve-button-group>
  `
};

/**
 * @summary Rounded button group with icon buttons for compact view switchers and mode toggles.
 */
export const RoundedIcon = {
  render: () => html`
    <nve-button-group container="rounded" behavior-select="single">
      <nve-icon-button icon-name="table"></nve-icon-button>
      <nve-icon-button icon-name="image"></nve-icon-button>
    </nve-button-group>
  `
};

/**
 * @summary Button group with vertical orientation for sidebars, toolbars, or vertical navigation contexts.
 */
export const OrientationVertical = {
  render: () => html`
    <nve-button-group orientation="vertical">
      <nve-icon-button icon-name="copy"></nve-icon-button>
      <nve-icon-button icon-name="add-comment"></nve-icon-button>
      <nve-icon-button icon-name="download"></nve-icon-button>
    </nve-button-group>
  `
};
