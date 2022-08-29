import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './range.css?inline';

/**
 * @alpha
 * @element nve-range
 */
export class Range extends Control {
  static styles = useStyles([...Control.styles, styles]);
}
