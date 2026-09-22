// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/alert-group/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/control-message/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/password/define.js';

export default {
  title: 'Patterns/Authentication',
  component: 'nve-patterns'
};

/**
 * @summary Use for permission denied states informing users of access restrictions with a contact option.
 * @tags pattern
 */
export const NoAccess = {
  render: () => html`
    <div nve-layout="column gap:lg pad:lg align:center">
      <nve-icon name="lock" size="xl"></nve-icon>
      <div nve-layout="column align:center gap:sm">
        <h2 nve-text="heading lg">Access Restricted</h2>
        <p nve-text="body muted center" style="max-width: 400px">
          You don't have permission to view this configuration. Contact your administrator to request access.
        </p>
      </div>
      <nve-button >Request Access</nve-button>
    </div>
  `
};
