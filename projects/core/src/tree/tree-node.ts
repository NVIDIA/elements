import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import {
  I18nController,
  TypeExpandableController,
  TypeSelectableController,
  attachInternals,
  audit,
  getFlattenedFocusableItems,
  hostAttr,
  scopedRegistry,
  stateExpanded,
  stateHighlighted,
  stateSelected,
  typeAnchor,
  typeSSR,
  useStyles
} from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Icon } from '@nvidia-elements/core/icon';
import { Checkbox } from '@nvidia-elements/core/checkbox';
import type { Tree } from './tree.js';
import styles from './tree-node.css?inline';
import { updateNodeSelection } from './utils.js';

/**
 * @element nve-tree-node
 * @description A tree view widget presents a hierarchical list. Any item in the hierarchy may have child items, and items that have children can expand or collapse to show or hide the children.
 * @since 1.2.0
 * @entrypoint \@nvidia-elements/core/tree
 * @event open - Dispatched when the node opens.
 * @event close - Dispatched when the node closes.
 * @event select - Dispatched when the node selection state changes.
 * @command --select - use to select the node
 * @command --deselect - use to deselect the node
 * @command --toggle-select - use to toggle the node selection state
 * @command --open - use to open the node
 * @command --close - use to close the node
 * @command --toggle - use to toggle open / closed state of the node
 * @slot - Use default slot for basic text content or nested <nve-tree-node> elements.
 * @slot content - Use for extended long form content containing interactive elements or form inputs.
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --font-size
 * @cssprop --min-height
 * @cssprop --text-wrap
 * @cssprop --font-weight
 * @cssprop --width

 * @csspart icon-button - The icon button element
 * @csspart icon - The icon element
 * @csspart checkbox - The checkbox element

 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
 *
 */
@audit()
@typeSSR({ log: false }) // warning about ssr mismatch disabled as tree node will never be a 1:1 match in ssr due to performance constraints and slot complexity
@typeAnchor()
@stateSelected()
@stateExpanded()
@scopedRegistry()
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
   * Determines the highlighted state of the element. Highlighted states serve non-interactive selections where nodes may relate to other selected portions of the UI.
   */
  @property({ type: Boolean }) highlighted = false;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Updates internal string values for internationalization.
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
    version: '0.0.0',
    parents: ['nve-tree', 'nve-tree-node']
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton,
    [Icon.metadata.tag]: Icon,
    [Checkbox.metadata.tag]: Checkbox
  };

  static styles = useStyles([styles]);

  declare _internals: ElementInternals;

  /* eslint-disable @nvidia-elements/lint/no-missing-control-label */
  render() {
    return html`
      <div internal-host @slotchange=${this.#nodeUpdate}>
        <div part="_node">
          ${
            this.#isExpandable
              ? html`
            <nve-icon-button part="icon-button" exportparts="icon:icon-button-icon" @pointerup=${this.#toggleExpand} role="presentation" tabindex="-1" size="sm" container="inline" nofocus>
              <nve-icon part="icon" name="caret" direction=${this.expanded ? 'down' : 'right'} size="sm"></nve-icon>
            </nve-icon-button>`
              : nothing
          }
          ${
            this.selectable === 'multi'
              ? html`
            <nve-checkbox part="checkbox" nofocus>
              <input type="checkbox" @change=${this.#toggleMultiSelection} .checked=${this.selected} .indeterminate=${this.indeterminate} .ariaLabel=${this.i18n.expand} tabindex="-1" />
            </nve-checkbox>`
              : nothing
          }
          <div tabindex="0" part="_node-header">
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

  #nodeHeaderClick(e: Event) {
    const hasFocusableElements = getFlattenedFocusableItems(e.currentTarget as HTMLElement).length;
    if (this.#isExpandable && !this.selectable && !hasFocusableElements) {
      this.#toggleExpand();
    }

    if (this.selectable && (!hasFocusableElements || (e.target as HTMLElement).localName === 'a')) {
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
      this.#tree!.nodes.filter(n => n !== this).forEach(n => (n.selected = false));
    }
  }

  #toggleMultiSelection() {
    this.#typeSelectableController.toggle();

    if (this.behaviorSelect) {
      this.nodes.forEach(n => {
        n.selected = this.selected;
        n.indeterminate = false;
      });
      this.#tree!.nodes.forEach(node => updateNodeSelection(node));
    }
  }
}
