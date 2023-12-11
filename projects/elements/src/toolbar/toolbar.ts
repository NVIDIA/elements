import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import { useStyles, statusStateStyles, supportStateStyles, colorStateStyles, ContainerElement, attachInternals, applySlotContentStates, hasHorizontalScrollBar } from '@elements/elements/internal';
import type { IconButton } from '@elements/elements/icon-button';
import type { ButtonGroup } from '@elements/elements/button-group';
import type { Divider } from '@elements/elements/divider';
import type { Button } from '@elements/elements/button';
import type { Control } from '@elements/elements/forms';
import styles from './toolbar.css?inline';

/**
 * @element mlv-toolbar
 * @description A toolbar is a container for grouping a set of controls, such as buttons, icon buttons and combobox search.
 * @since 0.19.0
 * @slot - default slot for content
 * @slot prefix - slot for prefix content
 * @slot suffix - slot for suffix content
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --min-height
 * @cssprop --border-radius
 * @cssprop --gap
 * @cssprop --border-bottom
 * @cssprop --box-shadow
 * @cssprop --width
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-toolbar-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=208%3A27566&mode=dev
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
 */
export class Toolbar extends LitElement implements ContainerElement {
  static styles = useStyles([styles, statusStateStyles, supportStateStyles, colorStateStyles]);

  static readonly metadata = {
    tag: 'mlv-toolbar',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = { };

  /**
   * Determines the container styles of component. Flat is used for nesting elements within other containers or more muted style. Full is used when the element expands the full width of the viewport.
   */
  @property({ type: String, reflect: true }) container?: 'flat' | 'inset' | 'full';

  /**
   * Determines the primary content overflow behavior.
   */
  @property({ type: String, reflect: true }) content?: 'scroll' | 'wrap' = 'scroll';

  /**
   * Determines the orientation direction of the toolbar. Vertical toolbars are limited to icon buttons only.
   */
  @property({ type: String, reflect: true }) orientation?: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Visual treatment to represent accent color for interactive selections
   */
  @property({ type: String, reflect: true }) status: 'accent';

  /** @private */
  declare _internals: ElementInternals;

  #observers: (MutationObserver | ResizeObserver)[] = [];

  get #scrollbox() {
    return this.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])');
  }

  @queryAssignedElements({ slot: 'prefix' }) private prefixElements!: HTMLElement[];

  @queryAssignedElements({ slot: 'suffix' }) private suffixElements!: HTMLElement[];

  @queryAssignedElements() private defaultElements!: HTMLElement[];

  get #slottedElements() {
    return [...this.prefixElements, ...this.defaultElements, ...this.suffixElements];
  }

  render() {
    return html`
      <div internal-host @slotchange=${this.#slotchange}>
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'toolbar';
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.#setupScrollbarListener();
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this.#updateContainers();
    this.#updateOrientation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observers.forEach(observer => observer.disconnect());
  }

  #slotchange(e: Event) {
    applySlotContentStates(e.target as HTMLSlotElement, this);
    this.#updateContainers();
    this.#updateOrientation();
  }

  #setupScrollbarListener() {
    this.#setScrollbarState();
    const observer = new ResizeObserver(() => this.#setScrollbarState());
    this.#observers.push(observer);
    observer.observe(this);
  }

  #setScrollbarState() {
    if (hasHorizontalScrollBar(this.#scrollbox)) {
      this._internals.states.add('--scrollbar');
    } else {
      this._internals.states.delete('--scrollbar');
    }
  }

  #updateContainers() {
    if (this.container !== 'flat' && this.container !== 'inset') {
      const groups = this.#slottedElements.filter(e => e.tagName.toLowerCase().includes('mlv-button-group')) as ButtonGroup[];
      groups.forEach(group => group.container = 'flat');

      const controls = this.#slottedElements.filter(e => e.hasAttribute('mlv-control')) as (Control & { container: string })[];
      controls.forEach(control => control.container = 'flat');

      const buttons= this.#slottedElements.filter(e => e.tagName.toLowerCase().includes('mlv-button') || e.tagName.toLowerCase().includes('mlv-icon-button')) as (Button | IconButton)[];
      buttons.forEach(button => button.interaction = 'flat');
    }
  }

  #updateOrientation() {
    const dividers = this.#slottedElements.filter(e => e.tagName.toLowerCase().includes('mlv-divider')) as Divider[];
    dividers.forEach(divider => (divider.orientation = this.orientation === 'horizontal' ? 'vertical' : 'horizontal'));

    const groups = this.#slottedElements.filter(e => e.tagName.toLowerCase().includes('mlv-button-group')) as ButtonGroup[];
    groups.forEach(group => group.orientation = this.orientation);
  }
}
