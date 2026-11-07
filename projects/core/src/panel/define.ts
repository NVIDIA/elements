// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/double-chevron.js';
import '@nvidia-elements/core/icon/icons/cancel.js';
import '@nvidia-elements/core/icon-button/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Panel, PanelHeader, PanelContent, PanelFooter } from '@nvidia-elements/core/panel';

define(Panel);
define(PanelHeader);
define(PanelContent);
define(PanelFooter);

declare global {
  interface HTMLElementTagNameMap {
    'nve-panel': Panel;
    'nve-panel-header': PanelHeader;
    'nve-panel-content': PanelContent;
    'nve-panel-footer': PanelFooter;
  }
}
