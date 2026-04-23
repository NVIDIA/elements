// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define, TransitionService } from '@nvidia-elements/core/internal';
import { Page, PagePanel, PagePanelContent, PagePanelFooter, PagePanelHeader } from '@nvidia-elements/core/page';

define(Page);
define(PagePanel);
define(PagePanelFooter);
define(PagePanelHeader);
define(PagePanelContent);

TransitionService.enable();

declare global {
  interface HTMLElementTagNameMap {
    'nve-page': Page;
    'nve-page-panel': PagePanel;
    'nve-page-panel-footer': PagePanelFooter;
    'nve-page-panel-header': PagePanelHeader;
    'nve-page-panel-content': PagePanelContent;
  }
}
