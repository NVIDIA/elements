import { MetadataProject } from '@internals/metadata';
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';

@customElement('nvd-metrics-carousel')
export class MetricsCarousel extends LitElement {
  static styles = css`
    :host {
      font-family: inherit;
    }

    .carousel-container {
      overflow: hidden;
      pointer-events: none;
    }

    .carousel-track {
      display: flex;
      width: calc(248px * 3); /* Card width * number of duplicates */
      animation: scroll 90s linear infinite;
      gap: var(--nve-ref-size-400);
      position: relative;
      pointer-events: auto;
    }

    .carousel-card {
      display: grid;
      grid-template-rows: 1fr auto;
      align-items: center;
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
      font-size: var(--nve-ref-font-size-100);
      color: var(--nve-sys-text-muted-color);
      font-weight: var(--nve-ref-font-weight-semibold);
    }

    .label {
      font-size: var(--nve-ref-font-size-200);
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
        transform: translateX(calc(-250px * 30)); /* Card width * (number of unique cards) */
      }
    }
  `;

  @state() metrics: any[] = [];

  render() {
    return html`
      <div class="carousel-container">
        <div class="carousel-track">
          ${this.metrics.map(
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
          </a>`
          )}
        </div>
      </div>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();
    const metrics = await this.#getMetrics();
    // naively duplicate the metrics to fill the carousel, ideally should rotate through the metrics
    this.metrics = [...metrics, ...metrics, ...metrics];
  }

  async #getMetrics() {
    const { MetadataService } = await import('@internals/metadata');
    const metrics = await MetadataService.getMetadata();
    const elementsMetrics = await MetadataService.getMaglevMetadata();
    const projects = Object.keys(metrics)
      .filter(key => key.startsWith('@nve'))
      .map(key => metrics[key as keyof typeof metrics] as MetadataProject);
    const totalElements = projects.reduce((acc, project) => acc + project.elements.length, 0);
    const totalParentElements = projects.reduce(
      (acc, project) => acc + [...new Set(project.elements.map((el: any) => el.name.split('-')[1]))].length + 2,
      0
    );
    const elementsTestCoverage = metrics['@nvidia-elements/core'].tests.coverageTotal.branches.pct;
    const totalLighthouseTests = totalParentElements + projects.length; // one for each element + project bundle
    const totalUnitTests = projects.reduce((acc, project) => acc + (project.tests?.unitTestsTotal ?? 0), 0);
    const totalAxeTests = projects.reduce((acc, project) => acc + (project.tests?.axeTestsTotal ?? 0), 0);
    const totalVisualTests = projects.reduce((acc, project) => acc + (project.tests?.visualTestsTotal ?? 0), 0);
    const totalSsrTests = projects.reduce((acc, project) => acc + (project.tests?.ssrTestsTotal ?? 0), 0);
    const totalAutomatedTests =
      totalUnitTests + totalAxeTests + totalVisualTests + totalSsrTests + totalLighthouseTests;

    return [
      {
        href: '/elements/docs/metrics/',
        title: 'Available Components',
        label: 'Browse our component offerings',
        metricCount: totalParentElements
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
      },
      {
        href: '/elements/docs/metrics/elements/',
        title: 'Instances in MagLev',
        label: 'View Maglev adoption metrics',
        metricCount: elementsMetrics.projects.reduce((acc, project) => acc + project.instanceTotal, 0)
      }
    ];
  }
}
