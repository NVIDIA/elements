import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { ControlGroup } from '@elements/elements/forms';
import styles from './input-group.css?inline';

/**
 * @element mlv-input-group
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-input-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-43&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
 */
export class InputGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-input-group',
    version: 'PACKAGE_VERSION'
  };

  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;
    const controls = Array.from(this.querySelectorAll('[mlv-control]'));
    controls[0].setAttribute('first-control', '');
    controls[controls.length - 1].setAttribute('last-control', '');
  }
}
