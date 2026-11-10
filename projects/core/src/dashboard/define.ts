// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';

import {
  Dashboard,
  DashboardPanel,
  DashboardPanelContent,
  DashboardPanelFooter,
  DashboardPanelHeader
} from '@nvidia-elements/core/dashboard';

define(DashboardPanelHeader);
define(DashboardPanelContent);
define(DashboardPanelFooter);
define(DashboardPanel);
define(Dashboard);
declare global {
  interface HTMLElementTagNameMap {
    'nve-dashboard': Dashboard;
    'nve-dashboard-panel': DashboardPanel;
    'nve-dashboard-panel-header': DashboardPanelHeader;
    'nve-dashboard-panel-content': DashboardPanelContent;
    'nve-dashboard-panel-footer': DashboardPanelFooter;
  }
}
