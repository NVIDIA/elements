import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './checkbox.css?inline';

/**
 * @alpha
 * @element mlv-checkbox
 * @cssprop --width
 * @cssprop --height
 * @cssprop --cursor
 */
export class Checkbox extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-checkbox',
    version: 'PACKAGE_VERSION'
  };
}
