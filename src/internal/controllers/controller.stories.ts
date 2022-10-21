import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { animate } from '@lit-labs/motion';
import { MlvBaseButton, TypePopupController, PopupPosition, spread, PopupAlign, popupBaseStyles } from '@elements/elements/internal';

export default {
  title: 'Internal/Controllers'
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

class PopupDemo extends LitElement {
  @property({ type: String, reflect: true }) anchor: string | HTMLElement;

  @property({ type: String, reflect: true }) position: PopupPosition;

  @property({ type: String, reflect: true }) alignment: PopupAlign;;

  @property({ type: String, reflect: true, attribute: 'popup-type' }) popupType: 'auto' | 'manual' | 'hint' = 'hint';

  @property({ type: Boolean, reflect: true }) arrow = true;

  @property({ type: Boolean, reflect: true }) closable = false;

  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  get popupArrow() {
    return this.shadowRoot.querySelector<HTMLElement>('.arrow');
  }

  get popupElement() {
    return this.shadowRoot.querySelector<HTMLElement>('dialog');
  }

  protected typePopupController = new TypePopupController<PopupDemo>(this);

  static styles = [popupBaseStyles, css`
    :host {
      --mlv-sys-layer-popup-arrow-padding: 6px;
      --mlv-sys-layer-popup-arrow-offset: 2px;
      --mlv-sys-layer-popup-offset: 2px;
    }

    dialog {
      filter: drop-shadow(0 0 0.2rem #ccc);
      padding: 18px;
      min-width: 80px;
      text-align: center;
      background: #fff;
      color: #2d2d2d;
    }

    dialog::backdrop {
      background: #00000082;
    }

    .arrow {
      width: 12px;
      height: 12px;
      background: #fff;
      position: absolute;
    }

    mlv-icon-button {
      --color: #000 !important;
      position: absolute;
      top: 0;
      right: 0;
    }

    :host(:not([anchor])) .arrow,
    :host([anchor*='body']) .arrow,
    :host([position*='center']) .arrow {
      display: none;
    }
  `];

  render() {
    return html`
      <dialog ${animate({ keyframeOptions: { duration: 200, easing: 'ease-in-out' } })}>
        <slot></slot>
        ${this.arrow ? html`<div class="arrow"></div>` : ''}
        ${this.closable ? html`<mlv-icon-button @click=${() => this.typePopupController.close()} icon-name="cancel" interaction="ghost" aria-label="close"></mlv-icon-button>` : ''}
      </dialog>
    `;
  }
}
customElements.get('ui-popup') || customElements.define('ui-popup', PopupDemo);

export const PopupController = {
  render: (args) => html`
    <style>
      #root-inner {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 100%;
        height: 100vh;
      }
    </style>

    <ui-popup ${spread(args)} style="--mlv-sys-layer-popup-offset: ${args.offset}px">popup</ui-popup>
    <mlv-card id="card">
      <mlv-card-content mlv-layout="align:center" style="width: 450px; height: 300px;">
        <mlv-button id="button">toggle</mlv-button>
      </mlv-card-content>
    </mlv-card>
    <script type="module">
      const button = document.querySelector('#button');
      const popup = document.querySelector('ui-popup');
      button.addEventListener('click', () => popup.hidden = false);
      popup.addEventListener('close', () => popup.hidden = true);
    </script>
  `,
  argTypes: {
    position: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left', 'center'],
      defaultValue: 'top'
    },
    alignment: {
      control: 'inline-radio',
      options: ['start', 'center', 'end']
    },
    anchor: {
      control: 'inline-radio',
      options: ['button', 'card', 'body'],
      defaultValue: 'button'
    },
    popupType: {
      control: 'inline-radio',
      options: ['auto', 'manual', 'hint'],
      defaultValue: 'hint'
    },
    arrow: {
      control: 'boolean',
      options: [true, false],
      defaultValue: true
    },
    closable: {
      control: 'boolean',
      options: [true, false],
      defaultValue: false
    },
    offset: {
      control: 'number',
      defaultValue: 2
    }
  }
};

export const PopupControllerAlignment = {
  render: () => html`
    <style>
    #root-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      width: 100%;
      height: 100vh;
    }
  </style>

  <mlv-card id="card" style="width: 450px; height: 300px;"></mlv-card>
  <ui-popup anchor="card" popup-type="manual" position="top" alignment="start">top start</ui-popup>
  <ui-popup anchor="card" popup-type="manual" position="top">top center</ui-popup>
  <ui-popup anchor="card" popup-type="manual" position="top" alignment="end">top end</ui-popup>
  <ui-popup anchor="card" popup-type="manual" position="right" alignment="start">right start</ui-popup>
  <ui-popup anchor="card" popup-type="manual" position="right">right center</ui-popup>
  <ui-popup anchor="card" popup-type="manual" position="right" alignment="end">right end</ui-popup>
  <ui-popup anchor="card" popup-type="manual" position="bottom" alignment="start">bottom start</ui-popup>
  <ui-popup anchor="card" popup-type="manual" position="bottom">bottom center</ui-popup>
  <ui-popup anchor="card" popup-type="manual" position="bottom" alignment="end">bottom end</ui-popup>
  <ui-popup anchor="card" popup-type="manual" position="left" alignment="start">left start</ui-popup>
  <ui-popup anchor="card" popup-type="manual" position="left">left center</ui-popup>
  <ui-popup anchor="card" popup-type="manual" position="left" alignment="end">left end</ui-popup>

  <ui-popup popup-type="manual" position="center">center</ui-popup>
  <ui-popup popup-type="manual" position="top" alignment="start">top start</ui-popup>
  <ui-popup popup-type="manual" position="top">top center</ui-popup>
  <ui-popup popup-type="manual" position="top" alignment="end">top end</ui-popup>
  <ui-popup popup-type="manual" position="right" alignment="start">right start</ui-popup>
  <ui-popup popup-type="manual" position="right">right center</ui-popup>
  <ui-popup popup-type="manual" position="right" alignment="end">right end</ui-popup>
  <ui-popup popup-type="manual" position="bottom" alignment="start">bottom start</ui-popup>
  <ui-popup popup-type="manual" position="bottom">bottom center</ui-popup>
  <ui-popup popup-type="manual" position="bottom" alignment="end">bottom end</ui-popup>
  <ui-popup popup-type="manual" position="left" alignment="start">left start</ui-popup>
  <ui-popup popup-type="manual" position="left">left center</ui-popup>
  <ui-popup popup-type="manual" position="left" alignment="end">left end</ui-popup>
  `
}