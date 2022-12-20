import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { ControlGroup } from '@elements/elements/forms';
import styles from './input-group.css?inline';

/**
 * @alpha
 * @element nve-input-group
 */
export class InputGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);
  
  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;
    const controls = Array.from(this.querySelectorAll('[nve-control]'));
    controls[0].setAttribute('first-control', '');
    controls[controls.length - 1].setAttribute('last-control', '');
  }
}
