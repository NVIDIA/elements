import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/select/define.js';
import { getThemeTokens } from '@nvidia-elements/core';
import Chart from 'chart.js/auto';

export default {
  title: 'Foundations/Visualization/Examples'
};

// expose libraries to script modules as SB does not resolve module imports in script tags
(window as any).__tokens = getThemeTokens();
(window as any).__Chart = Chart;

export const Utils = {
  render: () => html`
    <style>body { padding: 0 !important; }</style>
    <div mlv-layout="column gap:md align:stretch">
      <mlv-select>
        <select id="visualization-demo-select">
          <option value="line">line</option>
          <option value="bar">bar</option>
          <option value="bubble">bubble</option>
          <option value="pie">pie</option>
          <option value="polarArea">polar</option>
          <option value="radar">radar</option>
          <!-- <option value="scatter">scatter</option> -->
        </select>
      </mlv-select>
      <mlv-card>
        <mlv-card-header>
          <h2 slot="title">Design Tokens + HTML Canvas</h2>
          <h3 slot="subtitle" mlv-text="body sm muted">Demo of ChartJS consuming design tokens</h3>
        </mlv-card-header>
        <mlv-card-content>
          <canvas width="100%" style="display: block; max-height: 70vh"></canvas>
        </mlv-card-content>
      </mlv-card>
    </div>
    <script type="module">
      const tokens = window.__tokens; // import { getThemeTokens } from '@nvidia-elements/core';
      const Chart = window.__Chart; // import Chart from 'chart.js/auto';
      const select = document.querySelector('#visualization-demo-select');
      const canvas = document.querySelector('canvas');

      const chart = new Chart(document.querySelector('canvas'), {
        type: 'line',
        options: {
          plugins: {
            legend: {
              labels: {
                color: tokens['--mlv-sys-text-muted-color'],
                boxWidth: 25
              },
            },
          },
          scales: {
            y: {
              suggestedMin: 0,
              suggestedMax: 100,
              ticks: {
                color: tokens['--mlv-sys-text-muted-color'],
              },
              grid: {
                color: tokens['--mlv-ref-border-color-muted'],
              },
            },
            x: {
              ticks: {
                color: tokens['--mlv-sys-text-muted-color'],
              },
              grid: {
                color: tokens['--mlv-ref-border-color-muted'],
              },
            },
          },
        },
        data: getData('line')
      });

      function getData(type) {
        return {
          labels: Array(7).fill('').map((_, i) => 2017 + i),
          datasets: ['cyan', 'seafoam', 'grass', 'pear', 'nova', 'amber', 'pumpkin', 'red', 'rose', 'lavender', 'violet'].map(label => {
            const color = getComputedStyle(document.body).getPropertyValue('--mlv-sys-visualization-categorical-' + label);
            function hexToRGB(hex, alpha = 1) {
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              if (alpha) {
                return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
              } else {
                return "rgb(" + r + ", " + g + ", " + b + ")";
              }
            }

            const alpha = (type === 'line' || type === 'bar' || type === 'bubble') ? 1 : 0.5;

            return {
              label: label,
              data: Array(7).fill('').map((_, i) => Math.floor(Math.random() * (90 - 10 + 1) + 10)),
              backgroundColor: hexToRGB(color, alpha),
              borderColor: hexToRGB(color, alpha)
            };
          }),
        };
      }

      select.addEventListener('change', (e) => {
        chart.config.type = e.target.value;
        chart.config.data = getData(e.target.value);
        chart.resize();
        chart.update();
      });
    </script>
  `
}
