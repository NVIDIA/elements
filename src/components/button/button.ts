import { html, LitElement } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { IconNames } from '../svg-icon/svg-icon';
import styleSheet from './button.css';

export enum ButtonVariants { Primary = 'primary', Secondary = 'secondary', Destructive = 'destructive', Tertiary = 'tertiary' }
export enum IconPlacements { Trailing = 'trailing', Leading = 'leading' }

const componentStyling = new CSSStyleSheet();
componentStyling.replace(styleSheet);


@customElement('mlv-button')
export class Button extends LitElement {
  static styles = componentStyling;

  /**  Label text for the button */
  @property({ type: String }) label = 'button';
  /** If 'disabled' attribute present on element, set disabled state on button */
  @property({ type: Boolean }) disabled = false;
  /** Color Variant of the Button */
  @property({ type: String, reflect: true }) variant: ButtonVariants = ButtonVariants.Primary;
  /** If present use icon for name of icon to show. For Icon Button leave off label */
  @property({ type: String }) icon: IconNames;
  /**  Tooltip text for the Icon Button, strongly recommended for icon only buttons */
  @property({ type: String }) iconButtonTooltip: string;
  /** Left or right placement of the icon, defaults to 'trailing' */
  @property({ type: String }) iconPlacement: IconPlacements = IconPlacements.Trailing;

  @state() private _hover = false; // No longer used but left for testing/demoing private field exclusion from Storybook API Docs

  render() {
    return html`
      <button ?disabled=${this.disabled} ?icon-only=${!this.label && this.icon} title="${!this.label && this.icon ? this.iconButtonTooltip : ''}" >
        ${this.label}
        <slot></slot>
        ${when(this.icon, () => html`<mlv-svg-icon variant="current" name="${this.icon}"></mlv-svg-icon>`)}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mlv-button': Button,
  }
}