// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import {
  clickOutsideElementBounds,
  appendRootNodeStyle,
  getFlattenedFocusableItems,
  isSimpleFocusable,
  useStyles,
  audit
} from '@nvidia-elements/core/internal';
import type { Dropdown } from '@nvidia-elements/core/dropdown';
import globalStyles from './dropdown-group.global.css?inline';

/**
 * @element nve-dropdown-group
 * @description A Dropdown Group streamlines the management of linked dropdowns and supports nested dropdowns for a more organized and intuitive user experience
 * @since 1.30.1
 * @entrypoint \@nvidia-elements/core/dropdown-group
 * @slot - default slot for dropdown content
 * @event open - Dispatched when a dropdown in the group opens
 * @event close - Dispatched when a dropdown in the group closes
 * @cssprop --nve-dropdown-group-spacing
 * @cssprop --nve-dropdown-group-transition
 * @cssprop --arrow-transform - Transform applied to the popover arrow
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 * @stable false
 */
@audit()
export class DropdownGroup extends LitElement {
  static styles = useStyles([]);

  static readonly metadata = {
    tag: 'nve-dropdown-group',
    version: '0.0.0',
    children: ['nve-dropdown']
  };

  @queryAssignedElements() protected dropdowns!: Dropdown[];

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${this.#syncDropdowns}></slot>
      </div>
    `;
  }

  #_pointerup = (e: PointerEvent) => this.#pointerup(e);

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
    globalThis.document?.addEventListener('pointerup', this.#_pointerup);
    this.addEventListener('keydown', this.#keydown);
    this.addEventListener('open', this.#onOpen as EventListener);
    this.addEventListener('close', this.#onClose as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    globalThis.document?.removeEventListener('pointerup', this.#_pointerup);
  }

  #syncDropdowns() {
    this.dropdowns.forEach(dropdown => {
      dropdown.popoverType = 'manual';
    });
  }

  #pointerup(event: PointerEvent) {
    const multipleDropdownsOpen = this.dropdowns.some(dropdown => dropdown.matches(':popover-open'));
    const pointerIsOutsideGroup = this.dropdowns.every(dropdown => clickOutsideElementBounds(event, dropdown));
    if (multipleDropdownsOpen && pointerIsOutsideGroup) {
      this.close();
    }
  }

  #keydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (event.code === 'Escape') {
      this.close();
    }
    if (event.code === 'ArrowRight') {
      const targetId = target.getAttribute('popovertarget');
      const dropdown = this.dropdowns.find(dropdown => dropdown.id === targetId);
      dropdown?.showPopover();
    }
    if (event.code === 'ArrowLeft' && isSimpleFocusable(event.target as HTMLElement)) {
      target.closest('nve-dropdown')?.hidePopover();
    }
  }

  #onOpen(event: CustomEvent) {
    const dropdown = event.target as HTMLElement;
    const isLocalDropdown = dropdown.localName === 'nve-dropdown' && this.dropdowns.find(d => d === dropdown);
    if (isLocalDropdown) {
      getFlattenedFocusableItems(dropdown)[0]?.focus();
    }
  }

  #onClose(event: CustomEvent) {
    const element = event.target as HTMLElement;
    const isLocalDropdown = element.localName === 'nve-dropdown' && this.dropdowns.find(d => d === element);
    if (isLocalDropdown) {
      // _activeTrigger is a popover controller internal API
      const dropdown = element as Dropdown & { _activeTrigger?: HTMLElement };
      dropdown._activeTrigger?.focus();
    }
  }

  close() {
    this.querySelectorAll('nve-dropdown').forEach(d => d.hidePopover());
  }
}
