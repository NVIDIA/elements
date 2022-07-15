import { html, unsafeCSS, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import styleSheet from './button.css?inline';

export enum ButtonVariants {
  Primary = 'primary',
  Secondary = 'secondary',
  Destructive = 'destructive',
  Tertiary = 'tertiary'
}
export enum IconSlotPlacements {
  Trailing = 'trailing',
  Leading = 'leading'
}

const componentStyling = unsafeCSS(styleSheet);

/**
 * @element nve-button
 * @slot Default - Default slot for button text content or icon, icon placement determined by whether <nve-icon> is inserted before or after text content.
 */
export class Button extends LitElement {
  static styles = componentStyling;

  /** If 'disabled' attribute present on element, set disabled state on button */
  @property({ type: Boolean }) disabled = false;
  /** Color Variant of the Button */
  @property({ type: String, reflect: true }) variant: ButtonVariants | string = 'primary';

  @state() private _hiddenProp = false; // No longer used but left for testing private field exclusion from Storybook Docs

  render() {
    return html`
      <button ?disabled=${this.disabled} >
        <slot></slot>
      </button>
    `;
  }
}
