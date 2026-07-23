// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Size } from '@nvidia-elements/core/internal';
import {
  appendRootNodeStyle,
  attachInternals,
  audit,
  I18nController,
  TypeExpandableController,
  useStyles
} from '@nvidia-elements/core/internal';
import styles from './page-panel.css?inline';
import globalStyles from './page-panel.global.css?inline';

/**
 * @element nve-page-panel
 * @description Child panel for embedded panels within the page component. Typically used for left/right/bottom page slot positions.
 * @documentation https://nvidia.github.io/elements/docs/elements/page/
 * @entrypoint \@nvidia-elements/core/page
 * @since 1.15.0
 * @event open - Dispatched after an invoker command removes `hidden` and opens the panel.
 * @event close - Dispatched after an invoker command sets `hidden` and closes the panel.
 * @slot - `nve-page-panel-content` elements that provide the panel body.
 * @slot actions - slot for action / dismiss buttons
 * @command --open - Removes `hidden` and dispatches `open`.
 * @command --close - Sets `hidden` and dispatches `close`.
 * @command --toggle - Toggles `hidden` and dispatches `open` or `close`.
 * @cssprop --background
 * @cssprop --border
 * @cssprop --color
 * @cssprop --gap
 * @cssprop --padding
 * @cssprop --height
 * @cssprop --width
 * @cssprop --max-width
 * @cssprop --max-height
 * @cssprop --animation-duration - Duration of panel open/close animations
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role
 *
 */
@audit()
export class PagePanel extends LitElement {
  /**
   * Sets the max size of the panel.
   */
  @property({ type: String, reflect: true }) size?: Size;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables updating internal string values for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-page-panel',
    version: '0.0.0',
    parents: ['nve-page']
  };

  constructor() {
    super();
    new TypeExpandableController(this, { useHidden: true });
  }

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
    <div internal-host>
      <div part="_header">
        <slot name="header"></slot>
        <slot name="actions"></slot>
      </div>
      <div class="content">
        <slot></slot>
      </div>
      <div>
        <slot name="footer"></slot>
      </div>
    </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    appendRootNodeStyle(this, globalStyles);
    this._internals.role = 'region';
  }
}
