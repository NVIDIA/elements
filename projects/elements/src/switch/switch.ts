import type { CSSResult } from 'lit';
import { audit, hostAttr, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import styles from './switch.css?inline';

/**
 * @element nve-switch
 * @description A switch is a control that enables users to switch between two mutually exclusive options (on or off, checked or unchecked) through a single click or tap.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/switch
 * @cssprop --cursor
 * @cssprop --border-radius
 * @cssprop --border-width
 * @cssprop --border
 * @cssprop --background
 * @cssprop --width
 * @cssprop --height
 * @cssprop --anchor-width
 * @cssprop --anchor-height
 * @cssprop --anchor-border-radius
 * @cssprop --anchor-background
 * @cssprop --padding
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 */
@audit()
export class Switch extends Control {
  @hostAttr({ attribute: 'nve-control' }) protected nveControl = 'inline';

  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-switch',
    version: '0.0.0',
    children: ['label', 'input', 'nve-control-message']
  };
}
