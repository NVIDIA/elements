// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/foundations/foundations/define.js';

export default {
  title: 'Elements/Foundations',
  component: 'nve-foundations',
};

/**
 * @summary Display content inside a slotted container.
 */
export const Default = {
  render: () => html`
<nve-foundations>Container content</nve-foundations>
  `
};
