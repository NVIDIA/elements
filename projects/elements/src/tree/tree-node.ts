import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import {
  I18nController,
  TypeExpandableController,
  TypeSelectableController,
  attachInternals,
  getFlattenedFocusableItems,
  hostAttr,
  stateExpanded,
  stateHighlighted,
  stateSelected,
  typeAnchor,
  typeSSR,
  useStyles
} from '@nvidia-elements/core/internal';
import type { Tree } from './tree.js';
import styles from './tree-node.css?inline';
import { updateNodeSelection } from './utils.js';

/**
 * @element nve-tree-node
 * @description A tree view widget presents a hierarchical list. Any item in the hierarchy may have child items, and items that have children may be expanded or collapsed to show or hide the children.
 * @since 1.2.0
 * @event open - Dispatched when the node is opened.
 * @event close - Dispatched when the node is closed.
 * @slot - node content and tree nodes
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --font-size
 * @cssprop --min-height
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-tree-documentation--docs
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog?node-id=30-30&t=TiwKVvP1YHl3NylZ-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
 * @stable false
 */
@typeSSR()
@typeAnchor()
@stateSelected()
@stateExpanded()
@stateHighlighted()
export class TreeNode extends LitElement {
  /**
   * Determines if node is in an expanded state.
   */
  @property({ type: Boolean, reflect: true }) expanded = false;

  /**
   * Determines whether if node is in a selected state.
   */
  @property({ type: Boolean, reflect: true }) selected = false;

  /**
   * Determines whether a node can be expandable. Expandable by default if slotted nodes exist.
   */
  @property({ type: Boolean }) expandable = false;

  /**
   * Determines whether a node can be in a selected state. Nodes can be in a single or multi select state.
   */
  @property({ type: String }) selectable: 'single' | 'multi';

  /**
   * Determines the highlighted state of the element. Highlighted states are for non-interactive selections where nodes may be related to other selected portions of the UI.
   */
  @property({ type: Boolean }) highlighted = false;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /** @private */
  @hostAttr() slot = 'nodes';

  get #tree() {
    return this.closest<Tree>('nve-tree');
  }

  /**
   * Returns list of child nodes
   */
  @queryAssignedElements({ slot: 'nodes' }) readonly nodes!: TreeNode[];

  /* @private */
  @state() indeterminate = false;

  /* @private */
  @state() behaviorExpand = false;

  /* @private */
  @state() behaviorSelect = false;

  #typeExpandableController = new TypeExpandableController(this);

  #typeSelectableController = new TypeSelectableController(this);

  get #isExpandable() {
    return this.expandable || this.expanded || !!this.nodes?.length;
  }

  static metadata = {
    tag: 'nve-tree-node',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host @slotchange=${this.#nodeUpdate}>
        <div part="_node">
          ${
            this.#isExpandable
              ? html`
            <nve-icon-button @pointerup=${this.#toggleExpand} role="presentation" tabindex="-1" size="sm" container="inline" nofocus>
              <nve-icon name="caret" direction=${this.expanded ? 'down' : 'right'} size="sm"></nve-icon>
            </nve-icon-button>`
              : nothing
          }
          ${
            this.selectable === 'multi'
              ? html`
            <nve-checkbox nofocus>
              <input type="checkbox" @change=${this.#toggleMultiSelection} .checked=${this.selected} .indeterminate=${this.indeterminate} .ariaLabel=${this.i18n.expand} tabindex="-1" />
            </nve-checkbox>`
              : nothing
          }
          <div tabindex="0" part="node-header">
            <slot tabindex="0" class="node-title" @click=${this.#nodeHeaderClick}></slot>
            <slot name="content" part="_content"></slot>
          </div>
        </div>
        <div role="group" part="_nodes"><slot name="nodes"></slot></div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'treeitem';
    this.#setupKeyNavInteractions();
    this.#nodeUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#nodeUpdate();
  }

  /** opens and sets the expanded state automatically if behaviorExpand is true */
  open() {
    this.#typeExpandableController.open();
  }

  /** closes and sets the expanded state automatically if behaviorExpand is true */
  close() {
    this.#typeExpandableController.close();
  }

  #nodeUpdate() {
    this.requestUpdate();
    this.#toggleExpandableState();
    this.dispatchEvent(new CustomEvent('_node-update', { bubbles: true }));
  }

  #toggleExpandableState() {
    this.#isExpandable ? this._internals.states.add('is-expandable') : this._internals.states.delete('is-expandable');
  }

  #setupKeyNavInteractions() {
    this.addEventListener('keyup', e => {
      if (this.#isExpandable && e.code === 'ArrowLeft' && e.target === this) {
        this.close();
      }

      if (this.#isExpandable && e.code === 'ArrowRight' && e.target === this) {
        this.open();
      }

      if (e.code === 'Space' && e.target === this && this.selectable) {
        e.preventDefault();
        this.#toggleSelection();
      }
    });
  }

  #nodeHeaderClick(e) {
    const hasFocusableElements = getFlattenedFocusableItems(e.currentTarget).length;
    if (this.#isExpandable && !this.selectable && !hasFocusableElements) {
      this.#toggleExpand();
    }

    if (this.selectable && (!hasFocusableElements || e.target.localName === 'a')) {
      this.#toggleSelection();
    }
  }

  #toggleExpand() {
    this.#typeExpandableController.toggle();
  }

  #toggleSelection() {
    if (this.selectable === 'single') {
      this.#toggleSingleSelection();
    }

    if (this.selectable === 'multi') {
      this.#toggleMultiSelection();
    }
  }

  #toggleSingleSelection() {
    this.#typeSelectableController.toggle();
    if (this.behaviorSelect) {
      this.#tree.nodes.filter(n => n !== this).forEach(n => (n.selected = false));
    }
  }

  #toggleMultiSelection() {
    this.#typeSelectableController.toggle();

    if (this.behaviorSelect) {
      this.nodes.forEach(n => {
        n.selected = this.selected;
        n.indeterminate = false;
      });
      this.#tree.nodes.forEach(node => updateNodeSelection(node));
    }
  }
}
