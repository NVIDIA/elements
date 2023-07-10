import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { MlvBaseButton, TypePopoverController, PopoverPosition, spread, PopoverAlign, popoverBaseStyles, animationFade, I18nController } from '@elements/elements/internal';
import { I18nService } from '@elements/elements';
import '@elements/elements/card/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

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
<ui-button selected>selected</ui-button>
<ui-button disabled>disabled</ui-button>
<ui-button><a href="#">link</a></ui-button>

<form onsubmit="alert('submit!'); return false;" style="display: inline-flex;">
  <ui-button type="submit">submit</ui-button>
</form>`;
};

class PopoverDemo extends LitElement {
  @property({ type: String, reflect: true }) anchor: string | HTMLElement;

  @property({ type: String, reflect: true }) position: PopoverPosition;

  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  @property({ type: String, reflect: true, attribute: 'popover-type' }) popoverType: 'auto' | 'manual' | 'hint' = 'hint';

  @property({ type: Boolean, reflect: true }) arrow = true;

  @property({ type: Boolean, reflect: true }) closable = false;

  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  get popoverArrow() {
    return this.shadowRoot.querySelector<HTMLElement>('.arrow');
  }

  get popoverElement() {
    return this.shadowRoot.querySelector<HTMLElement>('dialog');
  }

  protected typePopoverController = new TypePopoverController<PopoverDemo>(this);

  static styles = [popoverBaseStyles, css`
    :host {
      --mlv-sys-layer-popover-arrow-padding: 6px;
      --mlv-sys-layer-popover-arrow-offset: 2px;
      --mlv-sys-layer-popover-offset: 2px;
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
      <dialog ${animationFade(this)}>
        <slot></slot>
        ${this.arrow ? html`<div class="arrow"></div>` : ''}
        ${this.closable ? html`<mlv-icon-button @click=${() => this.typePopoverController.close()} icon-name="cancel" interaction="flat" aria-label="close"></mlv-icon-button>` : ''}
      </dialog>
    `;
  }
}
customElements.get('ui-popover') || customElements.define('ui-popover', PopoverDemo);

export const PopoverController = {
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

    <ui-popover ${spread(args)} style="--mlv-sys-layer-popover-offset: ${args.offset}px">popover</ui-popover>
    <mlv-card id="card">
      <mlv-card-content mlv-layout="align:center" style="width: 450px; height: 300px;">
        <mlv-button id="button">toggle</mlv-button>
      </mlv-card-content>
    </mlv-card>
    <script type="module">
      const button = document.querySelector('#button');
      const popover = document.querySelector('ui-popover');
      button.addEventListener('click', () => popover.hidden = false);
      popover.addEventListener('close', () => popover.hidden = true);
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
    popoverType: {
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

export const PopoverControllerAlignment = {
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
  <ui-popover anchor="card" popover-type="manual" position="top" alignment="start">top start</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="top">top center</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="top" alignment="end">top end</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="right" alignment="start">right start</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="right">right center</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="right" alignment="end">right end</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="bottom" alignment="start">bottom start</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="bottom">bottom center</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="bottom" alignment="end">bottom end</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="left" alignment="start">left start</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="left">left center</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="left" alignment="end">left end</ui-popover>

  <ui-popover popover-type="manual" position="center">center</ui-popover>
  <ui-popover popover-type="manual" position="top" alignment="start">top start</ui-popover>
  <ui-popover popover-type="manual" position="top">top center</ui-popover>
  <ui-popover popover-type="manual" position="top" alignment="end">top end</ui-popover>
  <ui-popover popover-type="manual" position="right" alignment="start">right start</ui-popover>
  <ui-popover popover-type="manual" position="right">right center</ui-popover>
  <ui-popover popover-type="manual" position="right" alignment="end">right end</ui-popover>
  <ui-popover popover-type="manual" position="bottom" alignment="start">bottom start</ui-popover>
  <ui-popover popover-type="manual" position="bottom">bottom center</ui-popover>
  <ui-popover popover-type="manual" position="bottom" alignment="end">bottom end</ui-popover>
  <ui-popover popover-type="manual" position="left" alignment="start">left start</ui-popover>
  <ui-popover popover-type="manual" position="left">left center</ui-popover>
  <ui-popover popover-type="manual" position="left" alignment="end">left end</ui-popover>
  `
}


class I18nItem extends LitElement {
  #i18nController: I18nController<this> = new I18nController<this>(this);
  @property({ type: Object, attribute: 'mlv-i18n' }) i18n = this.#i18nController.i18n;

  render() {
    return html`<mlv-card><pre style="padding: 24px">${JSON.stringify(this.i18n, null, 2)}</pre></mlv-card>`
  }
}
customElements.get('i18n-item') || customElements.define('i18n-item', I18nItem);

class I18nDemo extends LitElement {
  render() {
    return html`
    <div mlv-layout="column gap:md">
      <div mlv-layout="row gap:sm">
        <mlv-button @click=${() => this.#english()}>English</mlv-button>
        <mlv-button @click=${() => this.#french()}>French</mlv-button>
      </div>
      
      <div mlv-layout="grid span-items:6 gap:sm">
        <i18n-item .i18n=${{ "close": "dismiss task failure warning" }}></i18n-item>
        <i18n-item></i18n-item>
      </div>
    </div>
    `
  }

  createRenderRoot() {
    return this;
  }

  #french() {
    I18nService.update({
      close: 'fermer',
      expand: 'étendre',
      sort: 'classer',
      show: 'montrer',
      hide: 'cacher',
      loading: 'bourrage'
    });
  }

  #english() {
    I18nService.update({
      close: 'close',
      expand: 'expand',
      sort: 'sort',
      show: 'show',
      hide: 'hide',
      loading: 'loading'
    });
  }
}
customElements.get('i18n-demo') || customElements.define('i18n-demo', I18nDemo);

export const I18nControllerDemo = {
  render: () => html`<i18n-demo></i18n-demo>`
}
