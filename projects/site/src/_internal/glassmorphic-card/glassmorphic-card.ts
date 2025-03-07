import { html, css, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators.js';

import layout from '@nvidia-elements/styles/layout.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';
import responsive from '@nvidia-elements/styles/responsive.css?inline';

import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon/define.js';

@customElement('nvd-glassmorphic-card')
export class GlassmorphicCard extends LitElement {
  static styles = [
    unsafeCSS(layout),
    unsafeCSS(typography),
    unsafeCSS(responsive),
    css`
    :host {
      height: 180px;
      padding: var(--nve-ref-size-600);
      display: flex;
      flex-direction: column;
      gap: var(--nve-ref-size-400);
      position: relative;
      border-radius: var(--nve-ref-border-radius-xl);
      border: var(--nve-ref-border-width-sm) solid rgba(255, 255, 255, 0.08);
      background: var(--background);
    }

    :host::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 150px;
      height: 150px;
      background: var(--background-logo) center/contain no-repeat;
      transform: translate(-50%, -50%);
      filter: blur(5px);
      opacity: 0.75;
    }

    .header {
      display: flex;
      align-items: center;
    }

    .logo img {
      height: 40px;
      width: 40px;
    }

    nve-button {
      margin-left: auto;
      --background: rgba(255, 255, 255, 0.4);
      --color: black;
      --border: var(--nve-ref-border-width-sm) solid rgba(255, 255, 255, 0.15);
    }

    nve-button nve-icon {
      --color: black;
    }

    h3 {
      font-weight: var(--nve-ref-font-weight-medium);
    }
  `
  ];

  @property({ attribute: 'logo-src' }) logoSrc = '';

  @property({ attribute: 'logo-alt' }) logoAlt = '';

  @property() title = '';

  render() {
    return html`
      <div class="header">
        <div class="logo" nve-layout="hide show@xs">
          <img src="${this.logoSrc}" alt="${this.logoAlt}" />
        </div>

        <nve-button>
          <a href="https://NVIDIA.github.io/elements/starters/" target="_blank">
            Clone template<nve-icon name="arrow-angle" size="sm"></nve-icon>
          </a>
        </nve-button>
      </div>

      <h3>${this.title}</h3>
    `;
  }
}
