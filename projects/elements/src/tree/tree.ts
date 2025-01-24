import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { KeynavListConfig } from '@nvidia-elements/core/internal';
import {
  appendRootNodeStyle,
  attachInternals,
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
 * @description A tree view widget presents a hierarchical list. Any item in the hierarchy may have child items, and items that have children may be expanded or collapsed to show or hide the children.
 * @since 1.2.0
 * @slot - tree nodes
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-tree-documentation--docs
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog?node-id=30-30&t=TiwKVvP1YHl3NylZ-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
 * @stable false
 */
@keyNavigationList<Tree>()
export class Tree extends LitElement {
  /**
   * Determines whether all nodes can be in a selected state. Nodes can be in a single or multi select state.
   */
  @property({ type: String }) selectable: 'single' | 'multi';

  /**
   * Determines whether or not the tree nodes should handle auto-expanding behavior.
   */
  @property({ type: Boolean, attribute: 'behavior-expand' }) behaviorExpand = false;

  /**
   * Determines whether or not the tree nodes should handle auto-select behavior.
   */
  @property({ type: Boolean, attribute: 'behavior-select' }) behaviorSelect = false;

  /**
   * Determines if node depth border is rendered.
   */
  @property({ type: Boolean, reflect: true }) border = false;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-tree',
    version: '0.0.0'
  };

  _internals: ElementInternals;

  get nodes() {
    return Array.from(this.querySelectorAll<TreeNode>(TreeNode.metadata.tag));
  }

  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      items: this.openNodes.map(node => node.shadowRoot.querySelector('[part="node-header"]')),
      layout: 'vertical'
    };
  }

  /** @private */
  get openNodes(): TreeNode[] {
    return this.nodes.filter(
      node => node.expanded || (node.parentNode as any).expanded || (node.parentNode as any) === this
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
