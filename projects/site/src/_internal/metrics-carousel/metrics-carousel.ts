import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';

@customElement('nvd-metrics-carousel')
export class MetricsCarousel extends LitElement {
  static styles = css`
    .carousel-container {
      overflow: hidden;
      pointer-events: none;
    }

    .carousel-track {
      display: flex;
      width: calc(248px * 3); /* Card width * number of duplicates */
      animation: scroll 20s linear infinite;
      gap: var(--nve-ref-size-400);
      position: relative;
      pointer-events: auto;
    }

    .carousel-card {
      display: grid;
      grid-template-rows: 1fr auto;
      align-items: start;
      justify-items: center;
      width: 248px;
      height: 300px;
      color: var(--nve-sys-text-emphasis-color);
      font-size: var(--nve-ref-font-size-600);
      background-color: var(--nve-sys-layer-shell-accent-background);
      border-radius: var(--nve-ref-border-radius-lg);
      padding: 68px var(--nve-ref-size-800) var(--nve-ref-size-800) var(--nve-ref-size-800);
      position: relative;
      overflow: hidden;
      border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
    }

    .big-number {
      text-align: center;
      font-size: 76px;
      font-weight: var(--nve-ref-font-weight-semibold);
      line-height: 100%;
      letter-spacing: -1.8px;
      background: linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0.35) 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .arrow-button {
      position: absolute;
      bottom: var(--nve-ref-size-800);
      right: var(--nve-ref-size-400);
      --background: transparent;
      border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
      border-radius: var(--nve-ref-border-radius-full);
    }

    .carousel-link {
      text-decoration: none;
      cursor: pointer;
    }

    .carousel-track:hover {
      animation-play-state: paused;
    }

    .title {
      font-family: Inter;
      font-size: var(--nve-ref-font-size-100);
      font-style: normal;
      color: var(--nve-sys-text-muted-color);
      font-weight: var(--nve-ref-font-weight-semibold);
    }

    .label {
      font-family: Inter;
      font-size: var(--nve-ref-font-size-200);
      font-style: normal;
      color: var(--nve-sys-text-emphasis-color);
      font-weight: var(--nve-ref-font-weight-semibold);
    }

    .text-container {
      display: grid;
      gap: var(--nve-ref-size-100);
      grid-row: span 1;
      width: 100%;
      text-align: left;
      align-items: left;
    }
    
    /* Animations */
    @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(calc(-250px * 6)); /* Card width * (number of unique cards) */
      }
    }
  `;

  render() {
    return html`
      <div class="carousel-container">
        <div class="carousel-track">
          ${this.renderCarouselItems()}
        </div>
      </div>
    `;
  }

  renderCarouselItems() {
    const items = [
      {
        href: 'https://NVIDIA.github.io/elements/api/?path=/docs/about-metrics--docs',
        title: 'Parent Elements',
        label: 'Browse our component offerings',
        metricCount: 58
      },
      {
        href: 'https://NVIDIA.github.io/elements/api/?path=/docs/about-metrics--docs',
        title: 'Total Web Components',
        label: 'Browse our component offerings',
        metricCount: 102
      },
      {
        href: 'https://NVIDIA.github.io/elements/api/?path=/docs/about-metrics--docs',
        title: 'Lighthouse Tests',
        label: 'Browse our component offerings',
        metricCount: 73
      },
      {
        href: 'https://NVIDIA.github.io/elements/api/?path=/docs/about-metrics--docs',
        title: 'Unit Tests',
        label: 'Browse our component offerings',
        metricCount: 1584
      },
      {
        href: 'https://NVIDIA.github.io/elements/api/?path=/docs/about-metrics--docs',
        title: '% Test Coverage',
        label: 'Browse our component offerings',
        metricCount: 99
      },
      {
        href: 'https://NVIDIA.github.io/elements/api/?path=/docs/about-metrics--docs',
        title: 'Instances in MagLev',
        label: 'Browse our component offerings',
        metricCount: 1795
      }
    ];

    return items.map(
      item => html`
      <a href="${item.href}" target="_blank" class="carousel-link">
        <div class="carousel-card">
          <div class="big-number">${item.metricCount}</div>

          <div class="text-container">
            <div class="title">${item.title}</div>
            <div class="label">${item.label}</div>
          </div>

          <nve-icon-button class="arrow-button" icon-name="arrow-angle" size="sm"></nve-icon-button>
        </div>
      </a>
    `
    );
  }
}
