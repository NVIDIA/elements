import { useStyles } from '@elements/elements/internal';
import { ControlGroup } from '@elements/elements/forms';
import styles from './radio-group.css?inline';

/**
 * @alpha
 * @element mlv-radio-group
 */
export class RadioGroup extends ControlGroup {
  static styles = useStyles([...ControlGroup.styles, styles]);
}
