// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { ButtonFormControlMixin, type ButtonType } from '@nvidia-elements/forms/mixins';
import { attachInternals, I18nController, scopedRegistry, useStyles } from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import { MediaStateController } from '../internal/controllers/media-state.controller.js';
import { mediaCommands } from '../internal/media-command.js';
import type { MediaState } from '../internal/media-state.js';
import mediaButtonStyles from '../internal/media-button.css?inline';
import styles from './pip-button.css?inline';

/**
 * @element nve-media-pip-button
 * @description Requests picture-in-picture changes for the controlled video.
 * @documentation https://nvidia.github.io/elements/docs/media/pip-button/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/media/pip-button
 * @slot - Optional custom icon content.
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --height
 * @cssprop --width
 * @cssprop --padding
 * @csspart icon - The fallback icon element.
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/button/
 * @stable false
 */
@scopedRegistry()
export class MediaPipButton extends ButtonFormControlMixin(LitElement) {
  static styles = useStyles([mediaButtonStyles, styles]);

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  static readonly metadata = {
    tag: 'nve-media-pip-button',
    version: '0.0.0'
  };

  override command: string = mediaCommands.togglePip;

  override type: ButtonType = 'button';

  @property({ type: Boolean, reflect: true }) pressed = false;

  #pipAvailable = false;

  override get disabled(): boolean {
    return super.disabled || (!this.#pipAvailable && !this.pressed);
  }

  override set disabled(value: boolean) {
    super.disabled = value;
  }

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables updating internal string values for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  #mediaStateController = new MediaStateController(this, mediaState => this.#syncMediaState(mediaState));

  render() {
    return html`
      <div internal-host interaction-state focus-within aria-hidden="true">
        <slot>
          <nve-icon name="picture-in-picture" aria-hidden="true" part="icon"></nve-icon>
        </slot>
      </div>
    `;
  }

  get #defaultAriaLabel() {
    return (this.pressed ? this.i18n.exitPip : this.i18n.enterPip) ?? null;
  }

  override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);
    this.#syncDefaultAriaLabel();
  }

  #syncDefaultAriaLabel() {
    attachInternals(this);
    this._internals.ariaLabel = this.#defaultAriaLabel;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#syncMediaState(null);
  }

  #syncMediaState = (state: MediaState | null) => {
    this.#pipAvailable = state?.pipAvailable ?? false;
    this.pressed = state?.pip ?? false; // eslint-disable-line local/stateless-property -- PiP button mirrors the target controller state.
    this.requestUpdate();
  };
}
