import type { CSSResult } from 'lit';
import { useStyles, appendRootNodeStyle } from '@nvidia-elements/core/internal';
import { ControlGroup } from '@nvidia-elements/core/forms';
import globalStyles from './input-group.global.css?inline';
import styles from './input-group.css?inline';

/**
 * @element nve-input-group
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/input
 * @storybook https://NVIDIA.github.io/elements/docs/elements/input-group/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-43&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
 */
export class InputGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);

  static readonly metadata = {
    tag: 'nve-input-group',
    version: '0.0.0'
  };

  async connectedCallback() {
    appendRootNodeStyle(this, globalStyles);
    super.connectedCallback();
    await this.updateComplete;
    const controls = Array.from(this.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])').assignedElements());
    controls[0].setAttribute('first-control', '');
    controls[controls.length - 1].setAttribute('last-control', '');
  }
}
