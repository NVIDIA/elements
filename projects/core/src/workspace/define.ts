// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Workspace, WorkspacePanel } from '@nvidia-elements/core/workspace';

define(WorkspacePanel);

define(Workspace);

declare global {
  interface HTMLElementTagNameMap {
    'nve-workspace': Workspace;
    'nve-workspace-panel': WorkspacePanel;
  }
}
