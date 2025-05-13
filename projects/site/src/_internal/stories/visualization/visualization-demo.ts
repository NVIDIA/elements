import { html, LitElement, unsafeCSS } from 'lit';
import { state } from 'lit/decorators/state.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { getThemeTokens } from '@nvidia-elements/core';
import Chart from 'chart.js/auto';
import type { ChartTypeRegistry } from 'chart.js';

/* eslint-disable no-inline-css/no-restricted-imports */
import layout from '@nvidia-elements/styles/layout.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';

import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/select/define.js';

// Define Chart type interface
interface ChartInstance {
  config: {
    type: string;
    data: Record<string, unknown>;
  };
  resize: () => void;
  update: (mode?: string) => void;
  destroy: () => void;
}

@customElement('visualization-demo')
export class VisualizationDemo extends LitElement {
  static styles = [unsafeCSS(layout), unsafeCSS(typography)];

  @state() private chartType = 'line';
  private chart: ChartInstance | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  firstUpdated() {
    // Wait for the DOM to be fully ready
    setTimeout(() => {
      this.canvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      if (this.canvas) {
        this.initChart();

        // Set up resize observer to handle responsive behavior
        this.resizeObserver = new ResizeObserver(() => {
          if (this.chart) {
            this.chart.resize();
          }
        });
        this.resizeObserver.observe(this.canvas);
      }
    }, 0);
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('chartType') && this.chart) {
      this.updateChart();
    }
  }

  disconnectedCallback() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    super.disconnectedCallback();
  }

  initChart() {
    const tokens = getThemeTokens();

    try {
      // Make sure canvas is not null before creating chart
      if (!this.canvas) return;

      // Use directly imported Chart instead of window.Chart
      this.chart = new Chart(this.canvas, {
        type: this.chartType as keyof ChartTypeRegistry,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: tokens['--nve-sys-text-muted-color'],
                boxWidth: 25
              }
            }
          },
          scales: {
            y: {
              suggestedMin: 0,
              suggestedMax: 100,
              ticks: {
                color: tokens['--nve-sys-text-muted-color']
              },
              grid: {
                color: tokens['--nve-ref-border-color-muted']
              }
            },
            x: {
              ticks: {
                color: tokens['--nve-sys-text-muted-color']
              },
              grid: {
                color: tokens['--nve-ref-border-color-muted']
              }
            }
          }
        },
        data: this.getData(this.chartType)
      }) as unknown as ChartInstance;
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  }

  updateChart() {
    if (!this.chart) return;

    try {
      this.chart.config.type = this.chartType;
      this.chart.config.data = this.getData(this.chartType);

      // First resize the chart to fit container
      this.chart.resize();

      // Remove 'none' parameter to enable animations
      this.chart.update();
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }

  getData(type: string) {
    return {
      labels: Array(7)
        .fill('')
        .map((_, i) => 2017 + i),
      datasets: [
        'cyan',
        'seafoam',
        'grass',
        'pear',
        'nova',
        'amber',
        'pumpkin',
        'red',
        'rose',
        'lavender',
        'violet'
      ].map(label => {
        const color = getComputedStyle(globalThis.document.body).getPropertyValue(
          '--nve-sys-visualization-categorical-' + label
        );
        function applyOpacityToColor(color: string, opacity: number) {
          return 'color-mix(in oklch, ' + color + ', transparent ' + (100 - opacity * 100) + '%)';
        }

        const opacity = type === 'line' || type === 'bar' || type === 'bubble' ? 1 : 0.5;

        return {
          label: label,
          data: Array(7)
            .fill('')
            .map(() => Math.floor(Math.random() * (90 - 10 + 1) + 10)),
          backgroundColor: applyOpacityToColor(color, opacity),
          borderColor: applyOpacityToColor(color, opacity)
        };
      })
    };
  }

  #handleChartTypeChange(e: Event) {
    this.chartType = (e.target as HTMLSelectElement).value;
  }

  render() {
    return html`
      <nve-card>
        <nve-card-header>
          <h2 slot="title">Design Tokens + HTML Canvas</h2>
          <h3 slot="subtitle" nve-text="body sm muted">Demo of ChartJS consuming design tokens</h3>
        </nve-card-header>
        <nve-card-content nve-layout="column gap:md align:stretch">
          <nve-select>
            <select id="chart-type" @change=${this.#handleChartTypeChange} .value=${this.chartType}>
              <option value="line">line</option>
              <option value="bar">bar</option>
              <option value="bubble">bubble</option>
              <option value="pie">pie</option>
              <option value="polarArea">polar</option>
              <option value="radar">radar</option>
            </select>
          </nve-select>
          <div style="width: 100%; height: 400px;">
            <canvas style="display: block; width: 100%; height: 100%;"></canvas>
          </div>
        </nve-card-content>
      </nve-card>
    `;
  }
}
