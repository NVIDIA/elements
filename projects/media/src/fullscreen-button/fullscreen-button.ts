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
import styles from './fullscreen-button.css?inline';

/**
 * @element nve-media-fullscreen-button
 * @description Requests controller full-screen changes without adding form submission state.
 * @documentation https://nvidia.github.io/elements/docs/media/fullscreen-button/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/media/fullscreen-button
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
 */
@scopedRegistry()
export class MediaFullscreenButton extends ButtonFormControlMixin(LitElement) {
  static styles = useStyles([mediaButtonStyles, styles]);

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  static readonly metadata = {
    tag: 'nve-media-fullscreen-button',
    version: '0.0.0'
  };

  override command: string = mediaCommands.toggleFullscreen;

  override type: ButtonType = 'button';

  @property({ type: Boolean, reflect: true }) pressed = false;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables updating internal string values for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  #mediaStateController = new MediaStateController(this, mediaState => this.#syncPressedState(mediaState));

  render() {
    return html`
      <div internal-host interaction-state focus-within aria-hidden="true">
        <slot>
          <nve-icon .name=${this.#iconName} aria-hidden="true" part="icon"></nve-icon>
        </slot>
      </div>
    `;
  }

  get #iconName() {
    return this.pressed ? 'minimize' : 'maximize';
  }

  get #defaultAriaLabel() {
    return (this.pressed ? this.i18n.exitFullscreen : this.i18n.enterFullscreen) ?? null;
  }

  override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);
    this.#syncDefaultAriaLabel();
  }

  #syncDefaultAriaLabel() {
    attachInternals(this);
    this._internals.ariaLabel = this.#defaultAriaLabel;
  }

  #syncPressedState = (state: MediaState | null) => {
    if (state) {
      this.pressed = state.fullscreen; // eslint-disable-line local/stateless-property -- Full-screen button mirrors the target controller state.
    }
  };
}
