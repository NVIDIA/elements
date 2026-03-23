import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { ContainerElement } from '@nvidia-elements/core/internal';
import { scopedRegistry, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { inputStyles } from '@nvidia-elements/core/input';
import { IconButton } from '@nvidia-elements/core/icon-button';
import styles from './datetime.css?inline';

/**
 * @element nve-datetime
 * @description A datetime picker is a control that enables users to choose a datetime value.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/datetime
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --border-bottom
 * @cssprop --cursor
 * @cssprop --font-weight
 * @cssprop --width
 * @cssprop --max-width
 * @cssprop --min-width
 * @csspart icon-button - The calendar icon button element
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local
 */
@scopedRegistry()
export class Datetime extends Control implements ContainerElement {
  /**
   * Reduces the visual container for a minimal borderless appearance while preserving whitespace bounds.
   * Use when embedding within another container such as a toolbar.
   */
  @property({ type: String, reflect: true }) container?: 'flat';

  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-datetime',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  protected get suffixContent() {
    return html`<nve-icon-button part="icon-button" .ariaLabel=${this.i18n.expand} icon-name="calendar" container="inline" @click=${this.showPicker}></nve-icon-button>`;
  }
}
