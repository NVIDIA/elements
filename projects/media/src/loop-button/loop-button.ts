// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { ButtonFormControlMixin } from '@nvidia-elements/forms/mixins';
import { attachInternals, I18nController, scopedRegistry, useStyles } from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import { MediaStateController } from '../internal/controllers/media-state.controller.js';
import { mediaCommands } from '../internal/media-command.js';
import type { MediaState } from '../internal/media-state.js';
import mediaButtonStyles from '../internal/media-button.css?inline';
import styles from './loop-button.css?inline';

/**
 * @element nve-media-loop-button
 * @description Requests continuous looping changes for the controlled media.
 * @documentation https://nvidia.github.io/elements/docs/media/loop-button/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/media/loop-button
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
export class MediaLoopButton extends ButtonFormControlMixin(LitElement) {
  static styles = useStyles([mediaButtonStyles, styles]);

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  static readonly metadata = {
    tag: 'nve-media-loop-button',
    version: '0.0.0'
  };

  override command: string = mediaCommands.toggleLoop;

  @property({ type: Boolean, reflect: true, noAccessor: true }) declare pressed: boolean;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables updating internal string values for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  #mediaStateController = new MediaStateController(this, mediaState => this.#syncPressedState(mediaState));

  constructor() {
    super();
    this.type = 'button';
    this.pressed = false;
  }

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
    return this.pressed ? 'looping' : 'looping-off';
  }

  get #defaultAriaLabel() {
    return (this.command === mediaCommands.disableLoop ? this.i18n.disableLoop : this.i18n.enableLoop) ?? null;
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
    this.#syncPressedState(null);
  }

  #syncPressedState = (state: MediaState | null) => {
    this.pressed = state?.loop ?? false; // eslint-disable-line local/stateless-property -- Loop button mirrors the target controller state.
  };
}
