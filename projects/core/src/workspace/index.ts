// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export * from './workspace.js';

export * from './panel/panel.js';

/** @public */
export type { WorkspaceLayout, WorkspaceNode, WorkspaceGroup, WorkspaceSplit } from './utils/model/layout.utils.js';

/** @public */
export type {
  WorkspacePlacement,
  WorkspaceSide,
  WorkspaceCommandContext,
  WorkspaceCommandSource
} from './utils/interaction/command.utils.js';

export * from './panel-header/panel-header.js';
export * from './panel-content/panel-content.js';
export * from './panel-footer/panel-footer.js';

/** @public */
export type { WorkspaceAnimationOptions } from './workspace.types.js';
