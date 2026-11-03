// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import {
  clickOutsideElementBounds,
  appendRootNodeStyle,
  getFlattenedFocusableItems,
  getActiveElement,
  useStyles,
  audit
} from '@nvidia-elements/core/internal';
import type { Dropdown } from '@nvidia-elements/core/dropdown';
import globalStyles from './dropdown-group.global.css?inline';

/**
 * @element nve-dropdown-group
 * @description A dropdown group coordinates linked dropdowns and cascading submenus.
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

  #openingTriggers = new WeakMap<Dropdown, HTMLElement>();
  #rootDropdown?: Dropdown;

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
    globalThis.document?.addEventListener('pointerup', this.#pointerup);
    this.addEventListener('keydown', this.#keydown);
    this.addEventListener('beforetoggle', this.#onBeforeToggle, true);
    this.addEventListener('open', this.#onOpen as EventListener);
    this.addEventListener('close', this.#onClose as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    globalThis.document?.removeEventListener('pointerup', this.#pointerup);
    this.removeEventListener('keydown', this.#keydown);
    this.removeEventListener('beforetoggle', this.#onBeforeToggle, true);
    this.removeEventListener('open', this.#onOpen as EventListener);
    this.removeEventListener('close', this.#onClose as EventListener);
  }

  #syncDropdowns() {
    this.dropdowns.forEach(dropdown => {
      dropdown.popoverType = 'manual';
    });
  }

  #pointerup = (event: PointerEvent) => {
    const dropdowns = this.dropdowns.filter(dropdown => dropdown.matches(':popover-open'));
    if (dropdowns.length && dropdowns.every(dropdown => clickOutsideElementBounds(event, dropdown))) {
      this.close();
    }
  };

  #keydown(event: KeyboardEvent) {
    const isNavigationKey = event.code === 'Escape' || event.code === 'ArrowLeft' || event.code === 'ArrowRight';
    if (event.defaultPrevented || !isNavigationKey) return;
    const path = event.composedPath();
    const boundary = this.#findDropdownBoundary(path);
    const dropdown = this.#findOwnedDropdown(boundary);
    if (!dropdown && boundary !== this) return;

    if (event.code === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    }
    if (dropdown) this.#navigate(event, path, dropdown);
  }

  #findDropdownBoundary(path: EventTarget[]) {
    return path.find(
      node =>
        node instanceof HTMLElement && (node.localName === 'nve-dropdown' || node.localName === 'nve-dropdown-group')
    );
  }

  #navigate(event: KeyboardEvent, path: EventTarget[], dropdown: Dropdown) {
    const target = getActiveElement(this.ownerDocument);
    if (!(target instanceof HTMLElement) || !path.includes(target)) return;
    const rtl = getComputedStyle(this).direction === 'rtl';
    const openKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const closeKey = rtl ? 'ArrowRight' : 'ArrowLeft';

    if (event.code === openKey) {
      this.#openSubmenu(target, event);
      return;
    }

    if (event.code === closeKey && target.localName === 'nve-menu-item') {
      event.preventDefault();
      event.stopPropagation();
      dropdown.hidePopover();
    }
  }

  #openSubmenu(trigger: HTMLElement, event: KeyboardEvent) {
    if (trigger.matches('[disabled]') || !('popoverTargetElement' in trigger)) return;
    const target = trigger.popoverTargetElement;
    const submenu = this.#findOwnedDropdown(target);
    if (!submenu) return;
    event.preventDefault();
    event.stopPropagation();
    submenu.showPopover({ source: trigger });
  }

  #findOwnedDropdown(target: unknown): Dropdown | undefined {
    return this.dropdowns.find(dropdown => dropdown === target);
  }

  #onOpen(event: CustomEvent<{ trigger?: HTMLElement }>) {
    const dropdown = this.#findOwnedDropdown(event.composedPath()[0]);
    if (dropdown) {
      if (!this.#rootDropdown?.matches(':popover-open')) {
        this.#rootDropdown = dropdown;
      }
      this.#openingTriggers.delete(dropdown);
      if (event.detail?.trigger instanceof HTMLElement) {
        this.#openingTriggers.set(dropdown, event.detail.trigger);
      }
      getFlattenedFocusableItems(dropdown)[0]?.focus();
    }
  }

  #onBeforeToggle(event: ToggleEvent) {
    const dropdown = this.#findOwnedDropdown(event.composedPath()[0]);
    if (dropdown && event.newState === 'closed' && !dropdown.matches(':focus-within')) {
      this.#openingTriggers.delete(dropdown);
    }
  }

  #onClose(event: CustomEvent) {
    const dropdown = this.#findOwnedDropdown(event.composedPath()[0]);
    if (dropdown) {
      const trigger = this.#openingTriggers.get(dropdown);
      if (dropdown === this.#rootDropdown) {
        this.#rootDropdown = undefined;
      }
      this.#openingTriggers.delete(dropdown);
      const activeElement = this.ownerDocument.activeElement;
      const focusLost = !activeElement || activeElement === this.ownerDocument.body;
      const restoreFocus = focusLost || dropdown.matches(':focus-within');
      if (restoreFocus && trigger?.isConnected) {
        trigger.focus();
      }
    }
  }

  /** Closes every descendant dropdown in the group. */
  close() {
    const trigger = this.#rootDropdown ? this.#openingTriggers.get(this.#rootDropdown) : undefined;
    this.#rootDropdown = undefined;
    this.#openingTriggers = new WeakMap();
    const dropdowns = Array.from(this.querySelectorAll('nve-dropdown'));
    dropdowns.forEach(dropdown => dropdown.hidePopover());
    const activeElement = this.ownerDocument.activeElement;
    const focusLost = !activeElement || activeElement === this.ownerDocument.body;
    const restoreFocus = focusLost || dropdowns.some(item => item.matches(':focus-within'));
    if (restoreFocus && trigger?.isConnected) {
      trigger.focus();
    }
  }
}
