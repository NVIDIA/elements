import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@elements/elements/internal';
import { ICON_NAMES } from './icon-names.js';
import styles from './icon.css?inline';

export type IconNames = typeof ICON_NAMES[number];

/**
 * @element mlv-icon
 * @cssprop --color
 * @cssprop --width
 * @cssprop --height
 */
export class Icon extends LitElement {
  static styles = useStyles([styles]);

  /** The color variant of the icon */
  @property({ type: String, reflect: true }) variant?: 'inherit';

  @property({ type: String, reflect: true }) status: 'warning' | 'danger' | 'success' | 'accent';

  /** The name of the icon SVG sprite */
  @property({ type: String }) name: IconNames;

  render() {
    return html`
      <div internal-host>
        <svg>
          <use href="/assets/icons.svg#${this.name}"></use>
        </svg>
      </div>
    `;
  }
}
