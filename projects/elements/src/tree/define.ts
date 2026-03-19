// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Tree, TreeNode } from '@nvidia-elements/core/tree';

define(Tree);
define(TreeNode);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tree': Tree;
    'nve-tree-node': TreeNode;
  }
}
