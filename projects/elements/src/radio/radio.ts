import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './radio.css?inline';

/**
 * @alpha
 * @element nve-radio
 * @cssprop --width
 * @cssprop --height
 * @cssprop --cursor
 */
export class Radio extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-radio',
    version: 'PACKAGE_VERSION'
  };
}
