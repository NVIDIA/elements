import type { CSSResult } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, appendRootNodeStyle } from '@elements/elements/internal';
import { ControlGroup } from '@elements/elements/forms';
import globalStyles from './input-group.global.css?inline';
import styles from './input-group.css?inline';

/**
 * @element nve-input-group
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-input-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-43&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
 */
export class InputGroup extends ControlGroup {
  /**
   * @deprecated
   * (0.19.0) use `nve-progressive-filter-chip` instead
   */
  @property({ type: String, reflect: true }) type?: 'filter';

  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);

  static readonly metadata = {
    tag: 'nve-input-group',
    version: 'PACKAGE_VERSION'
  };

  async connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
    await this.updateComplete;
    const controls = Array.from(this.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])').assignedElements());
    controls[0].setAttribute('first-control', '');
    controls[controls.length - 1].setAttribute('last-control', '');
  }
}
