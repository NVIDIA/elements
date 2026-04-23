// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import { IconButton } from '@nvidia-elements/core/icon-button';
import type { PopoverAlign, PopoverPosition, PopoverType } from '@nvidia-elements/core/internal';
import {
  audit,
  excessiveInstanceLimit,
  I18nController,
  popoverStyles,
  scopedRegistry,
  TypeNativePopoverController,
  useStyles
} from '@nvidia-elements/core/internal';
import styles from './dropdown.css?inline';

/**
 * @element nve-dropdown
 * @description Generic dropdown element for rendering a variety of different content such as interactive navigation or form controls. [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
 * @since 0.6.0
 * @entrypoint \@nvidia-elements/core/dropdown
 * @event beforetoggle - Dispatched on a popover just before showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforetoggle_event)
 * @event toggle - Dispatched on a popover element just after showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event)
 * @event open - Dispatched when the dropdown opens.
 * @event close - Dispatched when the dropdown closes.
 * @slot - default slot for dropdown content
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --width
 * @cssprop --min-width
 * @cssprop --gap
 * @cssprop --arrow-transform - Transform applied to the popover arrow
 * @cssprop --animation-duration - Duration of dropdown open/close animations
 * @csspart icon-button - The close icon button element
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
@audit({ excessiveInstanceLimit })
@scopedRegistry()
export class Dropdown extends LitElement {
  static styles = useStyles([popoverStyles, styles]);

  static readonly metadata = {
    tag: 'nve-dropdown',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  /**
   * (optional) By default the popover will automatically anchor itself relative to the trigger element.
   * Pass an optional custom anchor element as an idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) anchor: string | HTMLElement;

  /**
   * @deprecated Use the popover API instead.
   * The trigger defines what element triggers an `open` interaction event.
   * A trigger can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) trigger: string | HTMLElement;

  /**
   * Sets the side position of the popover relative to the provided anchor element.
   */
  @property({ type: String, reflect: true }) position: PopoverPosition = 'bottom';

  /**
   * Sets the alignment of the popover relative to the provided anchor element.
   * If an arrow exists the alginment will be relative to the arrow against the anchor.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign = 'start';

  /**
   * @deprecated Use the popover API instead.
   * Determines if popover visibility behavior should be automatically controlled by the trigger.
   */
  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger: boolean;

  /**
   * Determines if a close button should render within dropdown. Non-closable
   * dropdowns suit menu or selection patterns.
   */
  @property({ type: Boolean }) closable = false;

  /**
   * Determines if an arrow renders.
   */
  @property({ type: Boolean }) arrow = false;

  /** @private */
  @property({ type: Boolean, reflect: true }) modal = true;

  /** @private */
  @property({ type: String, attribute: 'popover-type' }) popoverType: PopoverType = 'auto';

  @query('.arrow') popoverArrow: HTMLElement;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  protected typeNativePopoverController = new TypeNativePopoverController<Dropdown>(this);

  /** @private */
  get popoverDismissible() {
    return this.modal;
  }

  /**
   * Enables internal string values to update for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  render() {
    return html`
    <div internal-host>
      <slot name="header"></slot>
      ${this.closable ? html`<nve-icon-button part="icon-button" exportparts="icon:icon-button-icon" @click=${this.hidePopover} icon-name="cancel" container="flat" size="sm" .ariaLabel=${this.i18n.close}></nve-icon-button>` : ''}
      <slot></slot>
      <slot name="footer"></slot>
      ${this.arrow ? html`<div class="arrow"></div>` : ''}
    </div>
  `;
  }
}
