import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { MlvBaseButton, useStyles } from '@elements/elements/internal';
import styles from './button.css?inline';

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

/**
 * @element mlv-button
 * @slot Default - Default slot for button text content or icon, icon placement determined by whether <mlv-icon> is inserted before or after text content.
 */
export class Button extends MlvBaseButton {
  static styles = useStyles([styles]);

  /** Color Variant of the Button */
  @property({ type: String, reflect: true }) variant: ButtonVariants | string = 'primary';

  @state() private _hiddenProp = false; // No longer used but left for testing private field exclusion from Storybook Docs

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }
}
