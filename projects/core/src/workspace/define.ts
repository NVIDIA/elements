// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import {
  Workspace,
  WorkspacePanel,
  WorkspacePanelHeader,
  WorkspacePanelContent,
  WorkspacePanelFooter
} from '@nvidia-elements/core/workspace';

define(WorkspacePanelHeader);
define(WorkspacePanelContent);
define(WorkspacePanelFooter);
define(WorkspacePanel);

define(Workspace);

declare global {
  interface HTMLElementTagNameMap {
    'nve-workspace': Workspace;
    'nve-workspace-panel': WorkspacePanel;
    'nve-workspace-panel-header': WorkspacePanelHeader;
    'nve-workspace-panel-content': WorkspacePanelContent;
    'nve-workspace-panel-footer': WorkspacePanelFooter;
  }
}
