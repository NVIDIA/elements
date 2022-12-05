import { useStyles } from '@elements/elements/internal';
import { ControlGroup } from '@elements/elements/forms';
import styles from './switch-group.css?inline';

export class SwitchGroup extends ControlGroup {
  static styles = useStyles([...ControlGroup.styles, styles]);
}
