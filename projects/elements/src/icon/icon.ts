import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { useStyles } from '@elements/elements/internal';
import { ICON_IMPORTS, IconName } from './icons.js';
import styles from './icon.css?inline';

export type { IconName, IconNames } from './icons.js';

/**
 * @element mlv-icon
 * @cssprop --color
 * @cssprop --width
 * @cssprop --height
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-icon-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=77-5741&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 */
export class Icon extends LitElement {
  /** SVG status color */
  @property({ type: String, reflect: true }) status?: 'warning' | 'danger' | 'success' | 'accent';

  /** SVG size */
  @property({ type: String, reflect: true }) size?: 'sm' | 'lg';

  /**
   * Sets the direction of the icon.
   * Only supported by expand-panel/collapse-panel (horizontal axis) and arrow/caret/chevron icons (4-directions)
   */
  @property({ type: String, reflect: true }) direction?: 'up' | 'down' | 'left' | 'right';

  /** The name of the icon SVG sprite */
  @property({ type: String, reflect: true }) name: IconName;

  @state() svg: string;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-icon',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <div internal-host .innerHTML=${this.svg ?? ''}></div>
    `;
  }

  async updated(props: PropertyValues<this>) {
    super.updated(props);
    if (ICON_IMPORTS[this.name]) {
      this.svg = (await ICON_IMPORTS[this.name]()).default;
    }
  }
}
