import { html, unsafeCSS, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { IconNames, IconVariants } from '../icon/icon';
import styleSheet from './button.css?inline';

export enum ButtonVariants { Primary = 'primary', Secondary = 'secondary', Destructive = 'destructive', Tertiary = 'tertiary' }
export enum IconPlacements { Trailing = 'trailing', Leading = 'leading', IconOnly = 'icononly' }

const componentStyling = unsafeCSS(styleSheet);

const ELEMENT = 'nve-button';
export class Button extends LitElement {
  static styles = componentStyling;

  /** If 'disabled' attribute present on element, set disabled state on button */
  @property({ type: Boolean }) disabled = false;
  /** Color Variant of the Button */
  @property({ type: String, reflect: true }) variant: ButtonVariants | string = 'primary';
  /** If present use icon for name of icon to show. For Icon Button leave off label */
  @property({ type: String }) icon: IconNames;
  /** Left or right placement of the icon, defaults to 'trailing' */
  @property({ type: String }) iconplacement: IconPlacements | string = 'trailing';

  @state() private _hover = false; // No longer used but left for testing/demoing private field exclusion from Storybook API Docs

  render() {
    return html`
      <button ?disabled=${this.disabled} ?icon-only=${this.iconplacement === IconPlacements.IconOnly && this.icon}>
        ${when(this.iconplacement !== IconPlacements.IconOnly, () => html`<slot></slot>`)}
        ${when(this.icon, () => html`<nve-icon variant=${IconVariants.Inherit} name="${this.icon}"></nve-icon>`)}
      </button>
    `;
  }
}

customElements.get(ELEMENT) || customElements.define(ELEMENT, Button);

declare global {
  interface HTMLElementTagNameMap {
    'nve-button': Button,
  }
}