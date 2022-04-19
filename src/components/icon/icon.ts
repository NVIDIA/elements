import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ICON_NAMES } from './icon-names';
import styleSheet from './icon.css?inline';

const componentStyling = new CSSStyleSheet();
componentStyling.replace(styleSheet);

export enum IconVariants { Inherit = 'inherit', Default = 'default', Lighter = 'lighter' }
export type IconNames = typeof ICON_NAMES[number];


@customElement('mlv-icon')
export class Icon extends LitElement {
  static styles = componentStyling;

  /** The color variant of the icon */
  @property({ type: String }) variant: IconVariants | string = 'default';
  /** The name of the icon SVG sprite */
  @property({ type: String }) name: IconNames;
  /**  Manually specify the color of the icon */
  @property({ type: String }) color: string;

  render() {
    return html`
      <svg width="1em" height="1em" color="${this.color}">
        <use href="/assets/icons.svg#${this.name}"></use>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mlv-icon': Icon,
  }
}