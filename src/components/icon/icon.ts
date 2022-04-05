import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ICON_NAMES } from '../../generated-icons/icon-names';
import styleSheet from './icon.css';

const componentStyling = new CSSStyleSheet();
componentStyling.replace(styleSheet);

export enum IconVariants { Inherit = 'inherit', Default = 'default', Lighter = 'lighter' }
export type IconNames = typeof ICON_NAMES[number];


@customElement('nve-icon')
export class Icon extends LitElement {
  static styles = componentStyling;

  /** The color variant of the icon */
  @property({ type: String }) variant: IconVariants = IconVariants.Default
  /** The name of the icon SVG sprite */
  @property({ type: String }) name: IconNames;
  /**  Manually specify the color of the icon */
  @property({ type: String }) color: string;

  render() {
    return html`
      <svg width="1em" height="1em" color="${this.color}">
        <use href="./src/generated-icons/icons.svg#${this.name}"></use>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon': Icon,
  }
}