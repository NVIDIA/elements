import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';

// repeat the carousel items to create the illusion of infinite scrolling
const REPETITIONS = 2;

interface MetricsCarouselItem {
  href: string;
  title: string;
  label: string;
  metricCount: number | string;
}

@customElement('nvd-metrics-carousel')
export class MetricsCarousel extends LitElement {
  static styles = css`
    :host {
      --carousel-item-count: 0;
      --carousel-item-width: 314px;
      --carousel-item-height: 400px;
      --carousel-item-gap: 16px;
      --carousel-track-width: calc(var(--carousel-item-count) * (var(--carousel-item-width) + var(--carousel-item-gap)));

      font-family: inherit;
    }

    .carousel-container {
      overflow: hidden;
      pointer-events: none;
      mask-image: linear-gradient(to right,
        rgba(0, 0, 0, 0) 0px,
        rgba(0, 0, 0, 1) 32px,
        rgba(0, 0, 0, 1) calc(100% - 32px),
        rgba(0, 0, 0, 0) 100%
      );
    }

    .carousel-track {
      display: flex;
      width: var(--carousel-track-width);
      gap: var(--carousel-item-gap);

      animation: scroll 60s linear infinite;
      will-change: transform;      
     
      pointer-events: auto;

      &:hover {
        animation-play-state: paused;
      }
    }

    .carousel-link {
      text-decoration: none;
      cursor: pointer;
    }

    .carousel-card {
      position: relative;
      box-sizing: border-box;
      display: grid;
      grid-template-rows: 1fr auto;
      align-items: center;
      justify-items: center;

      width: var(--carousel-item-width);
      height: var(--carousel-item-height);

      color: var(--nve-sys-text-emphasis-color);
      font-size: var(--nve-ref-font-size-600);
      padding: 68px var(--nve-ref-size-800) var(--nve-ref-size-800) var(--nve-ref-size-800);
      overflow: hidden;
      background: rgba(24, 26, 32, 0.6); 
    backdrop-filter: blur(6px); 
    box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.1), 0 0 6px rgba(0, 0, 0, 0.5); 
      border-radius: var(--nve-ref-border-radius-lg);
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

    .text-container {
      display: grid;
      gap: var(--nve-ref-size-100);
      grid-row: span 1;
      width: 100%;
      text-align: left;
      align-items: left;
      font-weight: var(--nve-ref-font-weight-semibold);

      .title {
        color: var(--nve-sys-text-muted-color);
        font-size: var(--nve-ref-font-size-100);
      }

      .label {
        color: var(--nve-sys-text-emphasis-color);
        font-size: var(--nve-ref-font-size-200);
      }
    }

    .arrow-button {
      position: absolute;
      bottom: var(--nve-ref-size-800);
      right: var(--nve-ref-size-400);
      --background: transparent;
      border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
      border-radius: var(--nve-ref-border-radius-full);
    }
    
    @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(calc(-1 * var(--carousel-track-width)));
      }
    }
  `;

  @state() metrics: MetricsCarouselItem[] = [];

  async connectedCallback() {
    super.connectedCallback();

    this.metrics = await this.#getMetrics();
    this.style.setProperty('--carousel-item-count', this.metrics.length.toString());
  }

  render() {
    return html`
      <div class="carousel-container">
        <div class="carousel-track">
          ${map(range(REPETITIONS), () => this.metrics.map(this.renderCarouselItem))}
        </div>
      </div>
    `;
  }

  renderCarouselItem(item: MetricsCarouselItem) {
    return html`
      <a href="${item.href}" target="_blank" class="carousel-link">
        <div class="carousel-card">
          <div class="big-number">${item.metricCount}</div>
          <div class="text-container">
            <div class="title">${item.title}</div>
            <div class="label">${item.label}</div>
          </div>
          <nve-icon-button class="arrow-button" icon-name="arrow-angle" size="sm"></nve-icon-button>
        </div>
      </a>`;
  }

  async #getMetrics(): Promise<MetricsCarouselItem[]> {
    // todo: 11ty should compute this at build time, not at runtime, as this is a node library atm
    const { TestsService } = await import('@internals/metadata/services/tests.service.js');
    const { ApiService } = await import('@internals/metadata/services/api.service.js');
    const tests = await TestsService.getData();
    const elements = await ApiService.getData();
    const totalElements = elements.data.elements.length;
    const elementsTestCoverage = tests.projects['@nvidia-elements/core'].coverage.total.branches.pct;
    const totalUnitTests = Object.values(tests.projects)
      .flatMap(report => report.unit.numTotalTests ?? 0)
      .reduce((acc, curr) => acc + curr, 0);
    const totalAxeTests = Object.values(tests.projects)
      .flatMap(report => report.axe)
      .flatMap(result => result.testResults).length;
    const totalVisualTests = Object.values(tests.projects)
      .flatMap(report => report.visual)
      .flatMap(result => result.testResults).length;
    const totalSsrTests = Object.values(tests.projects)
      .flatMap(report => report.ssr)
      .flatMap(result => result.testResults).length;
    const totalLighthouseTests = Object.values(tests.projects).flatMap(report =>
      Object.values(report.lighthouse.testResults)
    ).length;
    const totalAutomatedTests =
      totalUnitTests + totalAxeTests + totalVisualTests + totalSsrTests + totalLighthouseTests;

    return [
      {
        href: '/elements/docs/metrics/',
        title: 'Available Components',
        label: 'Browse our component offerings',
        metricCount: totalElements
      },
      {
        href: '/elements/docs/metrics/',
        title: 'Total Web Components',
        label: 'Browse our component offerings',
        metricCount: totalElements
      },
      {
        href: '/elements/docs/metrics/testing-and-performance/',
        title: 'Total Automated Tests',
        label: 'View automated test results',
        metricCount: totalAutomatedTests
      },
      {
        href: '/elements/docs/metrics/testing-and-performance/',
        title: 'Unit Tests',
        label: 'View our unit test suite',
        metricCount: totalUnitTests
      },
      {
        href: '/elements/docs/metrics/testing-and-performance/',
        title: '% Test Coverage',
        label: 'View our test coverage',
        metricCount: `${Math.round(elementsTestCoverage)}%`
      },
      {
        href: '/elements/docs/metrics/testing-and-performance/',
        title: 'Axe Tests',
        label: 'View Axe accessibility test results',
        metricCount: totalAxeTests
      },
      {
        href: '/elements/docs/metrics/testing-and-performance/',
        title: 'Lighthouse Test Suites',
        label: 'View Lighthouse test results',
        metricCount: totalLighthouseTests
      },
      {
        href: '/elements/docs/metrics/testing-and-performance/',
        title: 'Visual Regression Tests',
        label: 'View visual test results',
        metricCount: totalVisualTests
      },
      {
        href: '/elements/docs/metrics/testing-and-performance/',
        title: 'SSR Tests',
        label: 'View SSR test results',
        metricCount: totalSsrTests
      }
    ];
  }
}
