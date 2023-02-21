import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { ControlGroup } from '@elements/elements/forms';
import styles from './checkbox-group.css?inline';

/**
 * @alpha
 * @element nve-checkbox-group
 */
export class CheckboxGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);

  static readonly metadata = {
    tag: 'nve-checkbox-group',
    version: 'PACKAGE_VERSION'
  };
}
