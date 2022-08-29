import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './textarea.css?inline';

/**
 * @alpha
 * @element nve-textarea
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border
 */
export class Textarea extends Control {
  static styles = useStyles([...Control.styles, styles]);
}
