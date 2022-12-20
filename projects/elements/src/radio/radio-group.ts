import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { ControlGroup } from '@elements/elements/forms';
import styles from './radio-group.css?inline';

/**
 * @alpha
 * @element nve-radio-group
 */
export class RadioGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);
}
