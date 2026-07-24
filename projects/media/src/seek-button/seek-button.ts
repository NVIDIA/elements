// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ButtonFormControlMixin, type ButtonType } from '@nvidia-elements/forms/mixins';
import { attachInternals, I18nController, scopedRegistry, useStyles } from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import { mediaCommands, type MediaCommand, type MediaSeekAction } from '../internal/media-command.js';
import mediaButtonStyles from '../internal/media-button.css?inline';
import styles from './seek-button.css?inline';

/**
 * @element nve-media-seek-button
 * @description Sends absolute or relative seek commands without adding form submission state.
 * @documentation https://nvidia.github.io/elements/docs/media/seek-button/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/media/seek-button
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
export class MediaSeekButton extends ButtonFormControlMixin(LitElement) {
  static styles = useStyles([mediaButtonStyles, styles]);

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  static readonly metadata = {
    tag: 'nve-media-seek-button',
    version: '0.0.0'
  };

  @property({ type: String, reflect: true }) action: MediaSeekAction = 'forward';

  override value = '10';

  #hasExplicitCommand = false;

  #syncingDerivedCommand = false;

  #derivedCommand: MediaCommand = mediaCommands.seekForward;

  get valueAsNumber() {
    return Number(this.value);
  }

  set valueAsNumber(value: number) {
    this.value = `${value}`;
  }

  override type: ButtonType = 'button';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables updating internal string values for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  render() {
    return html`
      <div internal-host interaction-state focus-within aria-hidden="true">
        <slot>
          <nve-icon .name=${this.#iconName} .direction=${this.#iconDirection} aria-hidden="true" part="icon"></nve-icon>
        </slot>
      </div>
    `;
  }

  get #iconName() {
    return getSeekIcon(this.action, this.valueAsNumber);
  }

  get #iconDirection() {
    return this.action === 'end' ? 'down' : undefined;
  }

  get #defaultAriaLabel() {
    return getSeekLabel(this.action, this.valueAsNumber, this.i18n);
  }

  override connectedCallback() {
    this.#derivedCommand = getSeekCommand(this.action);
    this.#hasExplicitCommand ||=
      this.hasAttribute('command') || Boolean(this.command && this.command !== this.#derivedCommand);
    if (!this.#hasExplicitCommand) {
      this.#syncDerivedCommand();
    }
    super.connectedCallback();
  }

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties);

    if (
      changedProperties.has('command') &&
      !changedProperties.has('action') &&
      !this.#syncingDerivedCommand &&
      this.command !== this.#derivedCommand
    ) {
      this.#hasExplicitCommand = true;
    }

    if (
      !this.#hasExplicitCommand &&
      (changedProperties.has('action') || this.command !== getSeekCommand(this.action))
    ) {
      this.#syncDerivedCommand();
    }
  }

  override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);
    this.#syncDefaultAriaLabel();
  }

  #syncDefaultAriaLabel() {
    attachInternals(this);
    this._internals.ariaLabel = this.#defaultAriaLabel;
  }

  #syncDerivedCommand() {
    this.#derivedCommand = getSeekCommand(this.action);
    this.#syncingDerivedCommand = true;
    this.command = this.#derivedCommand;
    this.#syncingDerivedCommand = false;
  }
}

function getSeekCommand(action: MediaSeekAction) {
  return {
    start: mediaCommands.seekToStart,
    backward: mediaCommands.seekBackward,
    forward: mediaCommands.seekForward,
    end: mediaCommands.seekToEnd
  }[action];
}

function getSeekIcon(action: MediaSeekAction, value: number) {
  if (action === 'backward') {
    return value === 10 ? 'rewind-10' : 'rewind';
  }

  if (action === 'forward') {
    return value === 10 ? 'fast-forward-10' : 'fast-forward';
  }

  return 'start';
}

function getSeekLabel(action: MediaSeekAction, value: number, i18n: MediaSeekButton['i18n']) {
  return (
    {
      start: i18n.seekToStart,
      backward: i18n.seekBackward?.replace('{value}', `${value}`),
      forward: i18n.seekForward?.replace('{value}', `${value}`),
      end: i18n.seekToEnd
    }[action] ?? null
  );
}
