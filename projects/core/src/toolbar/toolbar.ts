// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

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
   * Determines the container styles of component. Flat applies when nesting elements within other containers or for a more muted style. Full applies when the element expands the full width of the viewport.
   */
  @property({ type: String, reflect: true }) container?: 'flat' | 'inset' | 'full';

  /**
   * Determines the primary content overflow behavior.
   */
  @property({ type: String, reflect: true }) content?: 'scroll' | 'wrap' = 'scroll';

  /**
   * Determines the orientation direction of the toolbar. Vertical toolbars support icon buttons only.
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
    return this.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])');
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
    if (hasHorizontalScrollBar(this.#scrollbox as HTMLElement)) {
      this._internals.states.add('scrollbar');
    } else {
      this._internals.states.delete('scrollbar');
    }
  }

  #updateContainers() {
    const slottedElements = this.#slottedElements as (HTMLElement & { container: string })[];
    slottedElements
      .filter(e =>
        e.matches(
          'nve-button-group, nve-input, nve-search, nve-combobox, nve-button, nve-select, nve-icon-button, nve-copy-button'
        )
      )
      .forEach(e => (e.container = 'flat'));
  }

  #updateOrientation() {
    const slottedElements = this.#slottedElements as (HTMLElement & { orientation: string })[];
    slottedElements
      .filter(e => e.matches('nve-divider, nve-divider'))
      .forEach(divider => (divider.orientation = this.orientation === 'horizontal' ? 'vertical' : 'horizontal'));
    slottedElements
      .filter(e => e.matches('nve-button-group, nve-button-group'))
      .forEach(group => (group.orientation = this.orientation!));
  }
}
