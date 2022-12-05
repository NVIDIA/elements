import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './switch.css?inline';

/**
 * @alpha
 * @element mlv-switch
 * @cssprop --cursor
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --width
 * @cssprop --height
 * @cssprop --anchor-width
 * @cssprop --anchor-height
 * @cssprop --anchor-border-radius
 * @cssprop --anchor-background
 */
export class Switch extends Control {
  static styles = useStyles([...Control.styles, styles]);
}
