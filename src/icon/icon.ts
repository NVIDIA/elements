import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { useStyles } from '@elements/elements/internal';
import { ICON_NAMES } from './icon-names.js';
import styles from './icon.css?inline';

export enum IconVariants {
  Inherit = 'inherit',
  Lighter = 'lighter'
}
export type IconNames = typeof ICON_NAMES[number];

/**
 * @element nve-icon
 * @cssprop --color
 * @cssprop --width
 * @cssprop --height
 */
export class Icon extends LitElement {
  static styles = useStyles([styles]);

  /** The color variant of the icon */
  @property({ type: String, reflect: true }) variant: IconVariants;

  @property({ type: String, reflect: true }) status: 'warning' | 'danger' | 'success' | 'info';

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
