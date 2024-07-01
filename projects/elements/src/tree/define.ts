import { define } from '@nvidia-elements/core/internal';
import { Tree, TreeNode } from '@nvidia-elements/core/tree';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/checkbox/define.js';

define(Tree);
define(TreeNode);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tree': Tree;
    'nve-tree-node': TreeNode;
  }
}
