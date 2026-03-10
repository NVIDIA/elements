import type { CSSResult } from 'lit';
import { audit, hostAttr, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import styles from './radio.css?inline';

/**
 * @element nve-radio
 * @description A radio button is a control that enables users to choose one option from a list of mutually exclusive options.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/radio
 * @cssprop --cursor
 * @cssprop --width
 * @cssprop --height
 * @cssprop --border-width
 * @cssprop --border-radius
 * @cssprop --border-color
 * @cssprop --radio-color
 * @cssprop --background
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/radio/
 */
@audit()
export class Radio extends Control {
  @hostAttr({ attribute: 'nve-control' }) protected nveControl = 'inline';

  /** @private - disable for inline control */
  declare fitText: boolean;

  /** @private - disable for inline control */
  declare fitContent: boolean;

  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-radio',
    version: '0.0.0',
    children: ['label', 'input', 'nve-control-message']
  };
}
