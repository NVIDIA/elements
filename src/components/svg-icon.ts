import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export const ICON_VARIANTS = ['current', 'default', 'lighter'];
export const ICON_NAMES = ['arrow', 'calendar', 'copy', 'pin'];
export type IconVariants = typeof ICON_VARIANTS[number];
export type IconNames = typeof ICON_NAMES[number];


@customElement('nve-svg-icon')
export class SvgIcon extends LitElement {
  static styles = [
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      :host([variant="current"]) {
        color: currentColor;
      }

      :host([variant="default"]) {
        color: var(--nve-color-neutral-500);
      }

      :host([variant="lighter"]) {
        color: var(--nve-color-neutral-300);
      }
    `
  ];


  @property({ attribute: 'variant', reflect: true })
  variant: IconVariants = 'default';

  @property({ attribute: 'name', reflect: true })
  name: IconNames;

  render() {
    return html`
      <svg width="1em" height="1em" fill="currentColor">
        <use href="./src/assets/icons.svg#${this.name}"></use>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nve-svg-icon': SvgIcon,
  }
}