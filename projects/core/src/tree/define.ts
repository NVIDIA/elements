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
