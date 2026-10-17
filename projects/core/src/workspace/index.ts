// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export * from './workspace.js';

export * from './panel/panel.js';

export type { WorkspaceLayout, WorkspaceNode, WorkspaceGroup, WorkspaceSplit } from './utils/workspace-layout.utils.js';

export type {
  WorkspacePlacement,
  WorkspaceSide,
  WorkspaceCommandContext,
  WorkspaceCommandSource
} from './utils/workspace-command.utils.js';

export * from './panel-header/panel-header.js';
export * from './panel-content/panel-content.js';
export * from './panel-footer/panel-footer.js';

export type { WorkspaceAnimationOptions } from './controllers/workspace-restoration.controller.js';
