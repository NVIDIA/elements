import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { KeynavListConfig } from '@nvidia-elements/core/internal';
import {
  appendRootNodeStyle,
  attachInternals,
  audit,
  keyNavigationList,
  onChildListMutation,
  useStyles
} from '@nvidia-elements/core/internal';
import { updateNodeSelection } from './utils.js';
import { TreeNode } from './tree-node.js';
import styles from './tree.css?inline';
import globalStyles from './tree.global.css?inline';

/**
 * @element nve-tree
 * @description A tree view widget presents a hierarchical list. Any item in the hierarchy may have child items, and items that have children can expand or collapse to show or hide the children.
 * @since 1.2.0
 * @entrypoint \@nvidia-elements/core/tree
 * @slot - tree nodes
 * @cssprop --max-width
 * @cssprop --node-border - Border style for tree node depth indicator
 * @event open - Dispatched from a child nve-tree-node when opened.
 * @event close - Dispatched from a child nve-tree-node when closed.
 * @event select - Dispatched from a child nve-tree-node when its selection state changes.
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
 *
 */
@audit()
@keyNavigationList<Tree>()
export class Tree extends LitElement {
  /**
   * Determines whether all nodes can be in a selected state. Nodes can be in a single or multi select state.
   */
  @property({ type: String }) selectable: 'single' | 'multi';

  /**
   * Determines whether the tree nodes should handle auto-expanding behavior.
   */
  @property({ type: Boolean, attribute: 'behavior-expand' }) behaviorExpand = false;

  /**
   * Determines whether the tree nodes should handle auto-select behavior.
   */
  @property({ type: Boolean, attribute: 'behavior-select' }) behaviorSelect = false;

  /**
   * Determines if the node depth border renders.
   */
  @property({ type: Boolean, reflect: true }) border = false;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-tree',
    version: '0.0.0',
    children: ['nve-tree-node']
  };

  _internals: ElementInternals;

  get nodes() {
    return Array.from(this.querySelectorAll<TreeNode>(TreeNode.metadata.tag));
  }

  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      items: this.openNodes
        .map(node => node.shadowRoot!.querySelector('[part="_node-header"]'))
        .filter((el): el is HTMLElement => el !== null),
      layout: 'vertical'
    };
  }

  /** @private */
  get openNodes(): TreeNode[] {
    return this.nodes.filter(
      node => node.expanded || (node.parentNode as TreeNode).expanded || (node.parentNode as Tree) === this
    );
  }

  render() {
    return html`
      <div internal-host>
        <slot name="nodes"></slot>
      </div>
    `;
  }

  #observers: MutationObserver[] = [];

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    appendRootNodeStyle(this, globalStyles);
    this._internals.role = 'tree';

    this.#observers.push(
      onChildListMutation(
        this,
        () => {
          this.#syncNodes();
        },
        { subtree: true }
      )
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observers.forEach(o => o.disconnect());
  }

  async updated(props: PropertyValues<this>) {
    super.updated(props);
    await this.updateComplete;
    this.#syncNodes();
  }

  #syncNodes() {
    this.#syncNodeOptions();
    this.#syncNodeSelections();
  }

  #syncNodeOptions() {
    this.nodes.forEach(node => {
      node.selectable = this.selectable;
      node.behaviorExpand = this.behaviorExpand;
      node.behaviorSelect = this.behaviorSelect;
    });
  }

  #syncNodeSelections() {
    if (this.behaviorSelect && this.selectable === 'multi') {
      this.nodes.forEach(node => updateNodeSelection(node));
    }
  }
}
