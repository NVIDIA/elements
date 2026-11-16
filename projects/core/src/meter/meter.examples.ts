// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/format-bytes/define.js';
import '@nvidia-elements/core/meter/define.js';

export default { title: 'Elements/Meter', component: 'nve-meter' };

/**
 * @summary Show storage usage against a known capacity, with an accessible label and units that explain the measurement.
 */
export const Default = {
  render: () => html`
    <nve-meter value="58" max="128" aria-label="Storage used" aria-valuetext="58 GB of 128 GB used"></nve-meter>
  `
};

/**
 * @summary Break down storage capacity into named segments, including available space as an explicit meter so the track represents the full capacity.
 */
export const Group = {
  render: () => html`
    <nve-meter-group aria-label="Storage">
      <nve-meter value="16" max="128" color="blue-cobalt" aria-label="Apps" aria-valuetext="16 GB of 128 GB"></nve-meter>
      <nve-meter value="8" max="128" color="purple-violet" aria-label="Messages" aria-valuetext="8 GB of 128 GB"></nve-meter>
      <nve-meter value="24" max="128" color="teal-cyan" aria-label="Media" aria-valuetext="24 GB of 128 GB"></nve-meter>
      <nve-meter value="10" max="128" color="yellow-amber" aria-label="System" aria-valuetext="10 GB of 128 GB"></nve-meter>
      <nve-meter value="70" max="128" color="gray-slate" aria-label="Available" aria-valuetext="70 GB of 128 GB"></nve-meter>
    </nve-meter-group>
  `
};

/**
 * @summary Show partial resource allocation on a shared scale, leaving the unused track visible rather than expanding segments to fill it.
 */
export const PartialCapacity = {
  render: () => html`
    <nve-meter-group aria-label="Resource allocation">
      <nve-meter value="20" color="blue-cobalt" aria-label="Training" aria-valuetext="20 percent allocated"></nve-meter>
      <nve-meter value="30" color="teal-cyan" aria-label="Inference" aria-valuetext="30 percent allocated"></nve-meter>
    </nve-meter-group>
  `
};

/**
 * @summary Use a labeled meter with percentage display to communicate measurement status.
 * @tags pattern
 */
export const Labeled = {
  render: () => html`
<div nve-layout="column gap:xs">
  <div nve-layout="row align:space-between">
    <label id="storage-used-label" for="storage-used" nve-text="label sm">Storage Used</label>
    <p nve-text="label emphasis sm">80%</p>
  </div>
  <nve-meter id="storage-used" aria-labelledby="storage-used-label" status="accent" value="80"></nve-meter>
</div>
  `
};

/**
 * @summary Show a storage breakdown with a matching badge legend so users can identify each category, its capacity in GB, and available space.
 */
export const Legend = {
  render: () => html`
    <div nve-layout="column gap:sm">
      <label id="storage-legend-label" nve-text="label">Storage</label>
      <nve-meter-group aria-labelledby="storage-legend-label">
        <nve-meter aria-labelledby="apps-label" value="16" max="128" color="blue-cobalt"></nve-meter>
        <nve-meter aria-labelledby="messages-label" value="8" max="128" color="purple-violet"></nve-meter>
        <nve-meter aria-labelledby="media-label" value="24" max="128" color="teal-cyan"></nve-meter>
        <nve-meter aria-labelledby="system-label" value="10" max="128" color="yellow-amber"></nve-meter>
        <nve-meter aria-labelledby="available-label" value="70" max="128" color="gray-slate"></nve-meter>
      </nve-meter-group>
      <div nve-layout="column gap:xs">
        <label id="apps-label" nve-text="label sm" nve-layout="row gap:xs align:center">
          <nve-dot shape="square" color="blue-cobalt"></nve-dot>Apps: <nve-format-bytes>16000000000</nve-format-bytes>
        </label>
        <label id="messages-label" nve-text="label sm" nve-layout="row gap:xs align:center">
          <nve-dot shape="square" color="purple-violet"></nve-dot>Messages: <nve-format-bytes>8000000000</nve-format-bytes>
        </label>
        <label id="media-label" nve-text="label sm" nve-layout="row gap:xs align:center">
          <nve-dot shape="square" color="teal-cyan"></nve-dot>Media: <nve-format-bytes>24000000000</nve-format-bytes>
        </label>
        <label id="system-label" nve-text="label sm" nve-layout="row gap:xs align:center">
          <nve-dot shape="square" color="yellow-amber"></nve-dot>System: <nve-format-bytes>10000000000</nve-format-bytes>
        </label>
        <label id="available-label" nve-text="label sm" nve-layout="row gap:xs align:center">
          <nve-dot shape="square" color="gray-slate"></nve-dot>Available: <nve-format-bytes>70000000000</nve-format-bytes>
        </label>
      </div>
    </div>
  `
};

/**
 * @summary Highlight measurement conditions with explicit semantic statuses. Include the condition in accessible value text so color is not the only signal.
 */
export const Status = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-meter value="25" status="accent" aria-label="Memory" aria-valuetext="25 percent allocated"></nve-meter>
      <nve-meter value="50" status="success" aria-label="Storage" aria-valuetext="50 percent used, healthy"></nve-meter>
      <nve-meter value="85" status="warning" aria-label="Storage" aria-valuetext="85 percent used, nearly full"></nve-meter>
      <nve-meter value="98" status="danger" aria-label="Storage" aria-valuetext="98 percent used, critically low space"></nve-meter>
    </div>
  `
};

/**
 * @summary Compare every named palette fill in one segmented track, with accessible names identifying each color.
 */
export const Color = {
  render: () => html`
    <nve-meter-group aria-label="Color palette">
      <nve-meter value="1" max="22" color="red-cardinal" aria-label="Red cardinal"></nve-meter>
      <nve-meter value="1" max="22" color="gray-slate" aria-label="Gray slate"></nve-meter>
      <nve-meter value="1" max="22" color="gray-denim" aria-label="Gray denim"></nve-meter>
      <nve-meter value="1" max="22" color="blue-indigo" aria-label="Blue indigo"></nve-meter>
      <nve-meter value="1" max="22" color="blue-cobalt" aria-label="Blue cobalt"></nve-meter>
      <nve-meter value="1" max="22" color="blue-sky" aria-label="Blue sky"></nve-meter>
      <nve-meter value="1" max="22" color="teal-cyan" aria-label="Teal cyan"></nve-meter>
      <nve-meter value="1" max="22" color="green-mint" aria-label="Green mint"></nve-meter>
      <nve-meter value="1" max="22" color="teal-seafoam" aria-label="Teal seafoam"></nve-meter>
      <nve-meter value="1" max="22" color="green-grass" aria-label="Green grass"></nve-meter>
      <nve-meter value="1" max="22" color="yellow-amber" aria-label="Yellow amber"></nve-meter>
      <nve-meter value="1" max="22" color="orange-pumpkin" aria-label="Orange pumpkin"></nve-meter>
      <nve-meter value="1" max="22" color="red-tomato" aria-label="Red tomato"></nve-meter>
      <nve-meter value="1" max="22" color="pink-magenta" aria-label="Pink magenta"></nve-meter>
      <nve-meter value="1" max="22" color="purple-plum" aria-label="Purple plum"></nve-meter>
      <nve-meter value="1" max="22" color="purple-violet" aria-label="Purple violet"></nve-meter>
      <nve-meter value="1" max="22" color="purple-lavender" aria-label="Purple lavender"></nve-meter>
      <nve-meter value="1" max="22" color="pink-rose" aria-label="Pink rose"></nve-meter>
      <nve-meter value="1" max="22" color="green-jade" aria-label="Green jade"></nve-meter>
      <nve-meter value="1" max="22" color="lime-pear" aria-label="Lime pear"></nve-meter>
      <nve-meter value="1" max="22" color="yellow-nova" aria-label="Yellow nova"></nve-meter>
      <nve-meter value="1" max="22" color="brand-green" aria-label="Brand green"></nve-meter>
    </nve-meter-group>
  `
};

/**
 * @tags theme
 * @summary Customize a measurement's height, track background, and fill through CSS properties when application styling requires explicit overrides.
 */
export const Customization = {
  render: () => html`
    <nve-meter value="58" max="128" aria-label="Storage used" aria-valuetext="58 GB of 128 GB used"
      style="--height: 8px; --background: lightgray; --accent-color: #76b900;"></nve-meter>
  `
};

/**
 * @summary Display a temperature on a range that crosses zero. The fill starts at the minimum while the accessible value retains the temperature scale.
 */
export const NonzeroRange = {
  render: () => html`
    <nve-meter min="-20" max="80" value="30" aria-label="Temperature" aria-valuetext="30 degrees Celsius"></nve-meter>
  `
};
