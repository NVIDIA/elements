// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ButtonFormControlMixin, CheckboxFormControlMixin } from '@nvidia-elements/forms/mixins';
import { attachInternals, I18nController, scopedRegistry, useStyles } from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import { MediaStateController } from '../internal/controllers/media-state.controller.js';
import { mediaCommands } from '../internal/media-command.js';
import type { MediaState } from '../internal/media-state.js';
import mediaButtonStyles from '../internal/media-button.css?inline';
import styles from './mute-button.css?inline';

/**
 * @element nve-media-mute-button
 * @description Requests muted changes and submits a checkbox-style value for muted media.
 * @documentation https://nvidia.github.io/elements/docs/media/mute-button/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/media/mute-button
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
export class MediaMuteButton extends CheckboxFormControlMixin(ButtonFormControlMixin(LitElement)) {
  static styles = useStyles([mediaButtonStyles, styles]);

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  static readonly metadata = {
    tag: 'nve-media-mute-button',
    version: '0.0.0'
  };

  override command: string = mediaCommands.toggleMuted;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables updating internal string values for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  #mediaStateController = new MediaStateController(this, mediaState => this.#handleMediaState(mediaState));

  render() {
    return html`
      <div internal-host interaction-state focus-within aria-hidden="true">
        <slot>
          <nve-icon .name=${this.#iconName} aria-hidden="true" part="icon"></nve-icon>
        </slot>
      </div>
    `;
  }

  #onClick = () => this.toggle();

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.#onClick, true);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#onClick, true);
  }

  override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);
    this.#syncDefaultAriaLabel();
  }

  get #iconName() {
    return this.checked ? 'volume-muted' : 'volume';
  }

  get #defaultAriaLabel() {
    return (this.checked ? this.i18n.unmuteMedia : this.i18n.muteMedia) ?? null;
  }

  #syncDefaultAriaLabel() {
    attachInternals(this);
    this._internals.ariaLabel = this.#defaultAriaLabel;
  }

  #handleMediaState = (state: MediaState | null) => {
    if (state) {
      this.checked = state.muted;
    }
  };
}
