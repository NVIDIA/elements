import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { useStyles } from '@elements/elements/internal';
import { ICON_IMPORTS, IconNames } from './icons.js';
import styles from './icon.css?inline';

export type { IconNames } from './icons.js';

/**
 * @element mlv-icon
 * @cssprop --color
 * @cssprop --width
 * @cssprop --height
 */
export class Icon extends LitElement {
  /** The color variant of the icon */
  @property({ type: String, reflect: true }) variant?: 'inherit';

  /** SVG status color */
  @property({ type: String, reflect: true }) status: 'warning' | 'danger' | 'success' | 'accent';

  /** SVG size */
  @property({ type: String, reflect: true }) size: 'sm' | 'lg';

  /** SVG rotation direction */
  @property({ type: String, reflect: true }) direction: 'up' | 'down' | 'left' | 'right';

  /** The name of the icon SVG sprite */
  @property({ type: String }) name: IconNames;

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
