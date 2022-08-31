import { css, html } from 'lit';
import { MlvBaseButton } from '@elements/elements/internal';

export default {
  title: 'Elements/Internal/Controllers'
}

/**
 * Example of custom element button using the base button and controllers.
 * When a custom element extends the base button it will inherit all the
 * nessesary button behaviors and states.
 */
export const baseButton = () => {
  class UIButton extends MlvBaseButton {
    static styles = [css`
      :host {
        --background: hsl(0, 0%, 90%);
        --color: hsl(0, 0%, 0%);
        --cursor: pointer;
        display: inline-flex;
        position: relative;
      }

      [internal-host] {
        background: var(--background);
        color: var(--color);
        cursor: var(--cursor);
        padding: 8px 12px;
        min-width: 75px;
        text-align: center;
      }

      /* element states */
      :host(:hover) {
        --background: hsl(0, 0%, 95%);
      }

      :host(:--active) {
        --background: hsl(0, 0%, 85%);
      }

      :host(:--pressed) {
        --background: hsl(0, 0%, 85%);
      }

      :host(:--expanded) {
        --background: hsl(0, 0%, 85%);
      }

      :host(:--disabled) {
        --background: hsl(0, 0%, 80%);
        --color: hsl(0, 0%, 60%);
        --cursor: not-allowed;
      }

      :host(:--readonly) {
        --cursor: initial;
        --color: blue;
      }

      /* anchor styles */
      [internal-host]:focus-within {
        outline: Highlight solid 2px;
        outline: 5px auto -webkit-focus-ring-color;
      }

      ::slotted(a) {
        color: var(--color) !important;
        text-decoration: none !important;
        outline: 0 !important;
      }

      ::slotted(a)::after {
        position: absolute;
        content: '';
        inset: 0;
        display: block;
      }
    `]
  }

  customElements.get('ui-button') || customElements.define('ui-button', UIButton);

  return html`
<ui-button>button</ui-button>
<ui-button pressed>pressed</ui-button>
<ui-button expanded>expanded</ui-button>
<ui-button disabled>disabled</ui-button>
<ui-button><a href="#">link</a></ui-button>

<form onsubmit="alert('submit!'); return false;" style="display: inline-flex;">
  <ui-button type="submit">submit</ui-button>
</form>`;
};
