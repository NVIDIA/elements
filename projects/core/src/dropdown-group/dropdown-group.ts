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
 * @documentation https://nvidia.github.io/elements/docs/elements/dropdown-group/
 * @since 1.30.1
 * @entrypoint \@nvidia-elements/core/dropdown-group
 * @slot - default slot for dropdown content
 * @event open - Dispatched when a dropdown in the group opens
 * @event close - Dispatched when a dropdown in the group closes
 * @cssprop --arrow-transform - Transform applied to the popover arrow
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
@audit()
export class DropdownGroup extends LitElement {
  static styles = useStyles([]);

  static readonly metadata = {
    tag: 'nve-dropdown-group',
    version: '0.0.0',
    children: ['nve-dropdown']
  };

  @queryAssignedElements({ selector: 'nve-dropdown' }) protected dropdowns!: Dropdown[];

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${this.#syncDropdowns}></slot>
      </div>
    `;
  }

  #_pointerup = (e: PointerEvent) => this.#pointerup(e);
  #triggers = new WeakMap<Dropdown, HTMLElement>();

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
    this.removeEventListener('keydown', this.#keydown);
    this.removeEventListener('open', this.#onOpen as EventListener);
    this.removeEventListener('close', this.#onClose as EventListener);
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
    const target = event.composedPath()[0];
    if (!(target instanceof HTMLElement)) return;

    if (event.code === 'Escape') {
      this.close();
      return;
    }

    const rtl = getComputedStyle(this).direction === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';

    if (event.code === forward) this.#openSubmenu(target, event);
    if (event.code === backward) this.#closeSubmenu(target, event);
  }

  #openSubmenu(target: HTMLElement, event: KeyboardEvent) {
    const trigger = target.closest('nve-menu-item');
    if (!trigger || trigger.disabled) return;
    const dropdown = this.dropdowns.find(item => item === trigger.popoverTargetElement);
    if (dropdown) {
      event.preventDefault();
      event.stopPropagation();
      dropdown.showPopover({ source: trigger });
    }
  }

  #closeSubmenu(target: HTMLElement, event: KeyboardEvent) {
    if (!isSimpleFocusable(target)) return;
    const dropdown = this.dropdowns.find(item => item === target.closest('nve-dropdown'));
    if (dropdown) {
      event.preventDefault();
      event.stopPropagation();
      dropdown.hidePopover();
    }
  }

  #onOpen(event: CustomEvent<{ trigger?: HTMLElement }>) {
    const dropdown = this.dropdowns.find(item => item === event.composedPath()[0]);
    if (dropdown) {
      if (event.detail?.trigger instanceof HTMLElement) {
        this.#triggers.set(dropdown, event.detail.trigger);
      }
      getFlattenedFocusableItems(dropdown)[0]?.focus();
    }
  }

  #onClose(event: CustomEvent) {
    const dropdown = this.dropdowns.find(item => item === event.composedPath()[0]);
    if (dropdown) {
      const trigger = this.#triggers.get(dropdown);
      if (trigger?.isConnected) trigger.focus();
      this.#triggers.delete(dropdown);
    }
  }

  /** Closes every descendant dropdown in the group. */
  close() {
    this.querySelectorAll('nve-dropdown').forEach(d => d.hidePopover());
  }
}
