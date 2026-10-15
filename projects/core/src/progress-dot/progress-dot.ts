// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Size } from '@nvidia-elements/core/internal';
import { attachInternals, I18nController, useStyles } from '@nvidia-elements/core/internal';
import styles from './progress-dot.css?inline';

/**
 * @element nve-progress-dot
 * @description An inline visual indicator that shows the progress of an ongoing task with an unknown completion percentage.
 * @documentation https://nvidia.github.io/elements/docs/elements/progress-dot/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/progress-dot
 * @cssprop --color - Dot color. Defaults to the inherited text color.
 * @cssprop --width - Indicator width.
 * @cssprop --height - Indicator height.
 * @cssprop --animation-duration - Duration of one animation cycle. Set to 0s for static dots.
 * @aria https://www.w3.org/TR/wai-aria-1.2/#progressbar
 */
export class ProgressDot extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-progress-dot',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  /** Controls the indicator size. */
  @property({ type: String, reflect: true }) size: Size = 'md';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables updating the default loading label for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  render() {
    return html`
      <div internal-host>
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="5" cy="18" r="3"></circle>
          <circle cx="18" cy="18" r="3"></circle>
          <circle cx="31" cy="18" r="3"></circle>
        </svg>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'progressbar';
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this._internals.ariaLabel = this.i18n.loading ?? null;
  }
}
