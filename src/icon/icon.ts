import { html, unsafeCSS, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { ICON_NAMES } from './icon-names.js';
import styleSheet from './icon.css?inline';

const componentStyling = unsafeCSS(styleSheet);

export enum IconVariants {
  Inherit = 'inherit',
  Lighter = 'lighter'
}
export type IconNames = typeof ICON_NAMES[number];

/**
 * @element nve-icon
 */
export class Icon extends LitElement {
  static styles = componentStyling;

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
