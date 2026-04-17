// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/star-rating/define.js';
import '@nvidia-elements/core/forms/define.js';

export default {
  title: 'Elements/Star Rating',
  component: 'nve-star-rating'
};

/**
 * @summary Basic star rating using a range input. Use for collecting user feedback, product reviews, or satisfaction scores in forms.
 */
export const Default = {
  render: () => html`
<nve-star-rating>
  <label>rate this input</label>
  <input id="range" type="range" max="5" value="3" min="0" />
  <nve-control-message>message</nve-control-message>
</nve-star-rating>`
};

/**
 * @summary Disabled star rating for display-only contexts. Use when showing existing ratings that users cannot change.
 * @tags test-case
 */
export const Disabled = {
  render: () => html`
<nve-star-rating>
  <label>disabled</label>
  <input type="range" max="5" value="3" min="0" disabled />
  <nve-control-message>message</nve-control-message>
</nve-star-rating>`
};

/**
 * @summary Half-star increments using step="0.5" for more granular ratings. Ideal when detailed feedback requires finer rating precision.
 */
export const HalfStar = {
  render: () => html`
<nve-star-rating>
  <label>Half-star rating</label>
  <input id="half-star-input" type="range" max="5" value="3.5" min="0" step="0.5" />
  <nve-control-message>message</nve-control-message>
</nve-star-rating>`
};

/**
 * @summary Single star toggle for favorite/bookmark functionality. Use with max="1" for binary on/off states like wishlists or bookmarks.
 */
export const Toggle = {
  render: () => html`
<nve-star-rating>
  <label>toggle/favorite</label>
  <input type="range" max="1" value="0" min="0" />
</nve-star-rating>
<script type="module">
  const input = document.querySelector('#range');
  input.addEventListener('input', () => console.log('input', input.valueAsNumber));
  input.addEventListener('change', () => console.log('change', input.valueAsNumber));
</script>`
};
