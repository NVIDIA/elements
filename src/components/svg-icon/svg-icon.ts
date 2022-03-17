import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ICON_NAMES } from '../../generated/icon-names';
import styleSheet from './svg-icon.css';

const componentStyling = new CSSStyleSheet();
componentStyling.replace(styleSheet);

export enum IconVariants { Current = 'current', Default = 'default', Lighter = 'lighter' }
export type IconNames = typeof ICON_NAMES[number];


@customElement('mlv-svg-icon')
export class SvgIcon extends LitElement {
  static styles = componentStyling;

  /** The color variant of the icon */
  @property({ type: String }) variant: IconVariants = IconVariants.Default
  /** The name of the icon SVG sprite */
  @property({ type: String }) name: IconNames;

  render() {
    return html`
      <svg width="1em" height="1em">
        <use href="./src/generated/icons.svg#${this.name}"></use>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mlv-svg-icon': SvgIcon,
  }
}