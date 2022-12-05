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
  static styles = useStyles([...Control.styles, styles]);
}
