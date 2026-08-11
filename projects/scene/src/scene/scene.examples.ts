// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/scene/define.js';

export default {
  title: 'Elements/Scene',
  component: 'nve-scene',
};

/**
 * @summary Basic scene component.
 */
export const Default = {
  render: () => html`
<nve-scene></nve-scene>
  `
};
