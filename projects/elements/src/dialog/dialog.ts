// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { PopoverAlign, PopoverPosition, PopoverType, Size } from '@nvidia-elements/core/internal';
import {
  audit,
  excessiveInstanceLimit,
  I18nController,
  popoverStyles,
  TypeNativePopoverController,
  useStyles,
  attachInternals,
  appendRootNodeStyle,
  scopedRegistry
} from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';
import globalStyles from './dialog.global.css?inline';
import styles from './dialog.css?inline';

/**
 * @element nve-dialog
 * @description Dialog is a component that appears above main content. A modal dialog displays critical information that requires user attention and interrupts user flow. [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
 * @since 0.6.0
 * @entrypoint \@nvidia-elements/core/dialog
 * @event beforetoggle - Dispatched on a popover just before showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforetoggle_event)
 * @event toggle - Dispatched on a popover element just after showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event)
 * @event open - Dispatched when the dialog opens.
 * @event close - Dispatched when the dialog closes.
 * @slot - default content slot
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --gap
 * @cssprop --max-width
 * @cssprop --min-height
 * @cssprop --max-height
 * @cssprop --animation-duration - Duration of dialog open/close animations
 * @csspart close-button - The inner template reference for the close button of the dialog.
 * @csspart icon-button - The icon button element
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
@audit({ excessiveInstanceLimit })
@scopedRegistry()
export class Dialog extends LitElement {
  /**
   * Sets the side position of the popover relative to the provided anchor element.
   * For dialog the anchor defaults to the document body.
   */
  @property({ type: String, reflect: true }) position: PopoverPosition = 'center';

  /**
   * Sets the alignment of the popover relative to the provided anchor element.
   * If an arrow exists the alignment will be relative to the arrow against the anchor.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign = 'center';

  /**
   * Sets the max size of the dialog.
   */
  @property({ type: String, reflect: true }) size?: Size;

  /**
   * Determines if a close button should render within dialog. Non-closable
   * dialogs suit dialogs that require user confirmation steps.
   */
  @property({ type: Boolean }) closable: boolean;

  /**
   * Determines if a dialog should have a modal backdrop that visually overlays the UI.
   */
  @property({ type: Boolean, reflect: true }) modal: boolean;

  /**
   * (optional) By default the popover will automatically anchor itself relative to the trigger element.
   * Pass an optional custom anchor element as an idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) anchor: string | HTMLElement = globalThis.document?.body;

  /**
   * @deprecated Use the popover API instead.
   * The trigger defines what element triggers an `open` interaction event.
   * A trigger can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) trigger: string | HTMLElement;

  /**
   * @deprecated Use the popover API instead.
   * Determines if popover visibility behavior should be automatically controlled by the trigger.
   */
  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger: boolean;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to update for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /** @private */
  get popoverType(): PopoverType {
    return this.modal ? 'auto' : 'manual';
  }

  /** @private */
  get popoverDismissible() {
    return !!this.closable;
  }

  protected typeNativePopoverController = new TypeNativePopoverController<Dialog>(this);

  static styles = useStyles([popoverStyles, styles]);

  static readonly metadata = {
    tag: 'nve-dialog',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
    <div internal-host part="_host">
      <div class="header">
        ${this.closable ? html`<nve-icon-button part="close-button icon-button" exportparts="icon:icon-button-icon" size="sm" @click=${this.hidePopover} icon-name="cancel" .ariaLabel=${this.i18n.close}></nve-icon-button>` : ''}
        <slot name="header"></slot>
      </div>
      <div class="content" part="_content">
        <slot></slot>
      </div>
      <slot name="footer"></slot>
    </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'dialog';
    appendRootNodeStyle(this, globalStyles);
  }
}
