// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/caret.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Tree, TreeNode } from '@nvidia-elements/core/tree';

define(Tree);
define(TreeNode);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tree': Tree;
    'nve-tree-node': TreeNode;
  }
}
