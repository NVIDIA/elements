import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon/define.js';

@customElement('nvd-glassmorphic-card')
export class GlassmorphicCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .glassmorphic {
      height: 180px;
      padding: var(--nve-ref-size-600);
      display: flex;
      flex-direction: column;
      gap: var(--nve-ref-size-400);
      align-items: stretch;
      position: relative;
      border-radius: var(--nve-ref-border-radius-xl);
      border: var(--nve-ref-border-width-sm) solid rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    .glassmorphic::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 150px;
      height: 150px;
      background: url(var(--before-bg)) center/contain no-repeat;
      transform: translate(-50%, -50%);
      filter: blur(7px);
      opacity: 0.7;
      z-index: -1;
    }

    .header {
      display: flex;
      align-items: center;
    }

    .entity-logo {
      display: flex;
    }

    .entity-logo img {
      height: 40px;
      width: 40px;
    }

    .glass-button {
      margin-left: auto;
      --background: rgba(255, 255, 255, 0.4);
      --color: black;
      --border: var(--nve-ref-border-width-sm) solid rgba(255, 255, 255, 0.15);
      transition: background 0.3s;
    }

    .glass-button ::slotted(nve-icon) {
      --color: black;
    }

    .glassmorphic-title {
      font-weight: var(--nve-ref-font-weight-medium);
    }
  `;

  @property({ attribute: 'logo-src' })
  logoSrc = '';

  @property({ attribute: 'logo-alt' })
  logoAlt = '';

  @property()
  title = '';

  @property({ attribute: 'before-bg' })
  beforeBg = '';

  @property()
  background = '';

  // Using instance property to hold a reference to our style element
  _styleElement = null;

  firstUpdated() {
    // Create a style element for dynamic styles on first update
    this._styleElement = document.createElement('style');
    this.shadowRoot.appendChild(this._styleElement);
    this._updateStyles();
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('beforeBg') || changedProperties.has('background')) {
      this._updateStyles();
    }
  }

  _updateStyles() {
    if (this._styleElement) {
      // Using direct CSS rules with the specific card's shadow DOM
      this._styleElement.textContent = `
        .glassmorphic {
          background: ${this.background};
        }
        .glassmorphic::before {
          background-image: url('${this.beforeBg}');
        }
      `;
    }
  }

  render() {
    return html`
      <div class="glassmorphic">
        <div class="header">
          <div class="entity-logo">
            <img src="${this.logoSrc}" alt="${this.logoAlt}" />
          </div>
            <slot name="suffix">
            <nve-button class="glass-button">

              Clone template<nve-icon name="arrow-angle" size="sm"></nve-icon>
              </nve-button>

            </slot>
        </div>
        <div class="glassmorphic-title">${this.title}</div>
      </div>
    `;
  }
}
