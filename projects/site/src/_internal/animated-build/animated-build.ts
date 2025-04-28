import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';

import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/page/define.js';

@customElement('nvd-animated-build')
export class AnimatedBuild extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    #hero-scene-wrapper {
      perspective: 2000px;
      perspective-origin: 50% 50%;
      transform-origin: 0 0;
    }

    #hero-scene {
      transform: scale(0.80) rotateX(0deg) rotateY(-30deg) rotateZ(0deg) translateX(-7%);
      transform-origin: center;
    }
    
    #hero-scene-wrapper,
    #hero-scene,
    #page-wrapper,
    nve-page {
      width: 1280px;
      height: 720px;
    }

    nve-page {
      border-radius: var(--nve-ref-border-radius-md);

      img {
        display: block;
      }

      main {
        overflow: hidden;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        nve-card {
          position: absolute;
          top: 20px;
          right: 20px;
        }
      }

      > nve-page-panel {
        --gap: 0;
        --height: auto;
        --padding: 0px;

        > nve-page-panel-content {
          overflow: hidden;
          --padding: 0px;
        }
      }
    }

    #page-wrapper {
      backdrop-filter: blur(20px);
      background: rgba(24, 26, 32, 0.11);
      border-radius: 16px;
      padding: 8px;
      box-shadow: inset 0 1px 1px 0 rgba(72, 78, 88, 0.2), inset 0 24px 48px 0 rgba(40, 46, 54, 0.02);
    }

    .layer {
      opacity: 0;
      transform: scale(0);
      transform-origin: center;
      animation: build 600ms ease-out forwards;
      animation-delay: var(--delay, 0ms);
      animation-timing-function: cubic-bezier(0.65, -0.2, 0.35, 1.2);
      will-change: transform, opacity;
    }

    @keyframes build {
      from {
        opacity: 0;
        transform: scale(0);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* When the reset is triggered, immediately reset all layers */
    #hero-scene-wrapper[data-reset="true"] .layer {
      animation: none;
      opacity: 0;
      transform: scale(0);
    }
  `;

  private resetInterval: number | undefined;
  private resizeObserver?: ResizeObserver;

  #internals = this.attachInternals();

  connectedCallback() {
    super.connectedCallback();
    this.setupAnimationReset();
    this.setupResizeObserver();
    this.#internals.role = 'img';
    this.#internals.ariaLabel = 'Animation of a web application being built with Elements';
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.resetInterval) {
      globalThis.clearInterval(this.resetInterval);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.scaleToFit();
    });
    this.resizeObserver.observe(this);
  }

  private scaleToFit() {
    const wrapper = this.shadowRoot?.getElementById('hero-scene-wrapper');
    if (!wrapper) return;

    const outlineSize = 8 * 2;

    const intrinsicWidth = 1280 + outlineSize;
    const intrinsicHeight = 720 + outlineSize;

    // Calculate scale based on container width, with a max scale of 1
    const scale = Math.min(this.clientWidth / intrinsicWidth, 1);

    // Apply the scale transform while preserving the existing perspective
    wrapper.style.transform = `scale(${scale})`;

    // Update the host height to match the scaled content
    this.style.height = `${intrinsicHeight * scale}px`;
  }

  private setupAnimationReset() {
    // Wait for the component to be rendered
    requestAnimationFrame(() => {
      const wrapper = this.shadowRoot?.getElementById('hero-scene-wrapper');
      if (!wrapper) return;

      // Find the element with the longest delay
      const layers = wrapper.querySelectorAll('.layer');
      let maxDelay = 0;

      layers.forEach(layer => {
        const delayStr = globalThis.getComputedStyle(layer).getPropertyValue('--delay') || '0ms';
        // Convert delay to milliseconds
        const delayValue = delayStr.includes('ms') ? parseInt(delayStr) : parseInt(delayStr) * 1000;
        maxDelay = Math.max(maxDelay, delayValue);
      });

      // Total cycle time = max delay + animation duration + display time
      const animationDuration = 600; // animation duration
      const displayTime = 2000; // how long to display before resetting
      const totalCycleTime = maxDelay + animationDuration + displayTime;

      // Set up the reset cycle
      this.resetInterval = globalThis.setInterval(() => {
        // Reset all animations
        wrapper.setAttribute('data-reset', 'true');

        // Force reflow
        void wrapper.offsetWidth;

        // Remove reset attribute after a brief moment
        setTimeout(() => {
          wrapper.removeAttribute('data-reset');
        }, 50);
      }, totalCycleTime);
    });
  }

  render() {
    return html`
      <div id="hero-scene-wrapper" inert>
        <div id="hero-scene">
          <div id="page-wrapper" class="layer">
            <nve-page class="layer">
              <nve-page-header slot="header" class="layer" style="--delay: 0.7s">
                <nve-logo slot="prefix" size="sm"></nve-logo>
                <h2 slot="prefix">Scenario Management</h2>
                <nve-button container="flat">Scenario Catalog</nve-button>
                <nve-button selected container="flat">Browse Clips</nve-button>
                <nve-icon-button slot="suffix" container="flat" icon-name="share"></nve-icon-button>
                <nve-icon-button slot="suffix" container="flat" icon-name="search"></nve-icon-button>
                <nve-icon-button slot="suffix" container="flat" icon-name="chat-bubble"></nve-icon-button>
                <nve-icon-button slot="suffix" container="flat" icon-name="bell"></nve-icon-button>
                <nve-icon-button slot="suffix" container="flat" icon-name="switch-apps"></nve-icon-button>
                <nve-icon-button slot="suffix" interaction="emphasis" size="sm">EL</nve-icon-button>
              </nve-page-header>

              <nve-page-panel slot="header" class="layer" style="--delay: 2.7s">
                <nve-page-panel-content>
                  <div class="layer" style="--delay: 3.5s">
                    <img style="width: 1280px; height: 74px;" src="https://cdn-prod.nvidia.com/assets/elements/hero/header.svg" alt="example of a header component" />
                  </div>
                </nve-page-panel-content>
              </nve-page-panel>

              <main class="layer" style="--delay: 1.7s">
                <img loading="lazy" style="width: 913px; height: 300px;" src="https://cdn-prod.nvidia.com/assets/elements/hero/voxels-avif.avif" alt="example of a voxel viewer"  />

                <nve-card class="layer" style="--delay: 4s">
                  <nve-card-content>
                    <img style="width: 100px; height: 136px;" src="https://cdn-prod.nvidia.com/assets/elements/splash/hero/car-avif.avif" alt="example of a camera rig" />
                  </nve-card-content>
                </nve-card>
              </main>

              <nve-page-panel slot="right-aside" class="layer" style="--delay: 2.7s">
                <nve-page-panel-content>
                  <div class="layer" style="--delay: 3.5s">
                    <img style="width: 366px; height: 598px;" src="https://cdn-prod.nvidia.com/assets/elements/hero/panel.svg" alt="example of a panel component" />
                  </div>
                </nve-page-panel-content>
              </nve-page-panel>

              <nve-page-panel slot="subfooter" class="layer" style="--delay: 2.7s">
                <nve-page-panel-content>
                  <div class="layer" style="--delay: 3.5s">
                    <img style="width: 914px; height: 296px;" src="https://cdn-prod.nvidia.com/assets/elements/hero/timeline.svg" alt="example of a timeline component" />
                  </div>
                </nve-page-panel-content>
              </nve-page-panel>
            </nve-page>
          </div>
        </div>
      </div>
    `;
  }
}
