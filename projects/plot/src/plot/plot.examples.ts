// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/plot/plot/define.js';

export default {
  title: 'Elements/Plot',
  component: 'nve-plot',
};

/**
 * @summary Basic plot component.
 */
export const Default = {
  render: () => html`
<nve-plot></nve-plot>
  `
};
