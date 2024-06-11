import type { CSSResult } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import { ControlGroup } from '@nvidia-elements/core/forms';
import styles from './switch-group.css?inline';

export class SwitchGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);

  static readonly metadata = {
    tag: 'nve-switch-group',
    version: '0.0.0'
  };
}
