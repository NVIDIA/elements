import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import type { ContainerElement } from '@nvidia-elements/core/internal';
import {
  useStyles,
  statusStateStyles,
  supportStateStyles,
  attachInternals,
  applySlotContentStates,
  hasHorizontalScrollBar
} from '@nvidia-elements/core/internal';
import type { IconButton } from '@nvidia-elements/core/icon-button';
import type { ButtonGroup } from '@nvidia-elements/core/button-group';
import type { Divider } from '@nvidia-elements/core/divider';
import type { Button } from '@nvidia-elements/core/button';
import type { Control } from '@nvidia-elements/core/forms';
import styles from './toolbar.css?inline';

/**
 * @element nve-toolbar
 * @description A toolbar is a container for grouping a set of controls, such as buttons, icon buttons and combobox search.
 * @since 0.19.0
 * @entrypoint \@nvidia-elements/core/toolbar
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
 * @storybook https://NVIDIA.github.io/elements/docs/elements/toolbar/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=208%3A27566&mode=dev
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
 */
export class Toolbar extends LitElement implements ContainerElement {
  static styles = useStyles([styles, statusStateStyles, supportStateStyles]);

  static readonly metadata = {
    tag: 'nve-toolbar',
    version: '0.0.0'
  };

  static elementDefinitions = {};

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
    this.#setScrollbarState();
  }

  #setupScrollbarListener() {
    this.#setScrollbarState();
    const observer = new ResizeObserver(() => this.#setScrollbarState());
    this.#observers.push(observer);
    observer.observe(this);
  }

  #setScrollbarState() {
    if (hasHorizontalScrollBar(this.#scrollbox)) {
      this._internals.states.add('scrollbar');
    } else {
      this._internals.states.delete('scrollbar');
    }
  }

  #updateContainers() {
    if (this.container !== 'flat' && this.container !== 'inset') {
      const groups = this.#slottedElements.filter(e =>
        e.matches('nve-button-group, nve-button-group')
      ) as ButtonGroup[];
      groups.forEach(group => (group.container = 'flat'));

      const controls = this.#slottedElements.filter(e => e.matches('[nve-control], [nve-control]')) as (Control & {
        container: string;
      })[];
      controls.forEach(control => (control.container = 'flat'));

      (this.#slottedElements.filter(e => e.matches('nve-button, nve-button')) as Button[]).forEach(
        button => (button.container = 'inline')
      );
      (this.#slottedElements.filter(e => e.matches('nve-icon-button, nve-icon-button')) as IconButton[]).forEach(
        button => (button.container = 'flat')
      );
    }
  }

  #updateOrientation() {
    const dividers = this.#slottedElements.filter(e => e.matches('nve-divider, nve-divider')) as Divider[];
    dividers.forEach(divider => (divider.orientation = this.orientation === 'horizontal' ? 'vertical' : 'horizontal'));

    const groups = this.#slottedElements.filter(e => e.matches('nve-button-group, nve-button-group')) as ButtonGroup[];
    groups.forEach(group => (group.orientation = this.orientation));
  }
}
