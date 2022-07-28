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
 * @element mlv-icon
 */
export class Icon extends LitElement {
  static styles = useStyles([styles]);

  /** The color variant of the icon */
  @property({ type: String, reflect: true }) variant: IconVariants;

  /** The name of the icon SVG sprite */
  @property({ type: String }) name: IconNames;

  render() {
    return html`
      <svg width="1em" height="1em">
        <use href="/assets/icons.svg#${this.name}"></use>
      </svg>
    `;
  }
}
