import { html, LitElement } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { IconNames, IconVariants } from '../icon/icon';
import styleSheet from './button.css';

export enum ButtonVariants { Primary = 'primary', Secondary = 'secondary', Destructive = 'destructive', Tertiary = 'tertiary' }
export enum IconPlacements { Trailing = 'trailing', Leading = 'leading', IconOnly = 'icononly' }

const componentStyling = new CSSStyleSheet();
componentStyling.replace(styleSheet);


@customElement('nve-button')
export class Button extends LitElement {
  static styles = componentStyling;

  /** If 'disabled' attribute present on element, set disabled state on button */
  @property({ type: Boolean }) disabled = false;
  /** Color Variant of the Button */
  @property({ type: String, reflect: true }) variant: ButtonVariants = ButtonVariants.Primary;
  /** If present use icon for name of icon to show. For Icon Button leave off label */
  @property({ type: String }) icon: IconNames;
  /** Left or right placement of the icon, defaults to 'trailing' */
  @property({ type: String }) iconplacement: IconPlacements = IconPlacements.Trailing;

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

declare global {
  interface HTMLElementTagNameMap {
    'nve-button': Button,
  }
}