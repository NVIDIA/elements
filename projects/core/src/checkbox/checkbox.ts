import type { CSSResult } from 'lit';
import { audit, hostAttr, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import styles from './checkbox.css?inline';

/**
 * @element nve-checkbox
 * @description A checkbox is a control that enables users to choose between two distinct mutually exclusive options (checked or unchecked, on or off) through a single click or tap.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/checkbox
 * @cssprop --cursor
 * @cssprop --width
 * @cssprop --height
 * @cssprop --border-width
 * @cssprop --border-radius
 * @cssprop --border-color
 * @cssprop --background
 * @cssprop --check-color
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
 */
@audit()
export class Checkbox extends Control {
  @hostAttr({ attribute: 'nve-control' }) protected nveControl = 'inline';

  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  /** @private - disable for inline control */
  declare fitText: boolean;

  /** @private - disable for inline control */
  declare fitContent: boolean;

  static readonly metadata = {
    tag: 'nve-checkbox',
    version: '0.0.0',
    children: ['label', 'input', 'nve-control-message']
  };
}
