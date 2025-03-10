import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/badge/define.js';

@customElement('nvd-svg-trend')
export class SvgTrend extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--nve-ref-size-200);
      width: 100%;
    }

    .trend-container {
      display: flex;
      flex-direction: column;
      gap: var(--nve-ref-size-100);
    }

    .trend-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .trend-label {
      color: var(--nve-sys-text-muted-color);
      font-size: var(--nve-ref-font-size-sm);
      font-weight: var(--nve-ref-font-weight-medium);
    }

    .trend-value-container {
      display: flex;
      align-items: center;
      gap: var(--nve-ref-size-100);
    }

    .trend-value {
      font-size: var(--nve-ref-font-size-lg);
      font-weight: var(--nve-ref-font-weight-medium);
      color: var(--nve-sys-text-emphasis-color);
    }

    .trend-comparison {
      display: flex;
      align-items: center;
      gap: var(--nve-ref-size-100);
      font-size: var(--nve-ref-font-size-sm);
      color: var(--nve-sys-text-muted-color);
    }

    .trend-graph {
      width: 100%;
      height: 40px;
      position: relative;
      overflow: visible;
    }

    .trend-graph svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .value-separator {
      margin: 0 var(--nve-ref-size-100);
      color: var(--nve-sys-text-subtle-color);
    }

    nve-icon.positive {
      --color: var(--nve-sys-success-color);
    }

    nve-icon.negative {
      --color: var(--nve-sys-error-color);
    }
  `;

  @property({ attribute: 'label' }) label = '';

  @property({ type: String }) value = '';

  @property({ type: String, attribute: 'previous-value' }) previousValue = '';

  @property({ type: String, attribute: 'svg-path' }) svgPath = '';

  @property({ type: String, attribute: 'baseline-path' }) baselinePath = '';

  // Calculate comparison value based on current and previous values
  get comparisonValue() {
    if (!this.value || !this.previousValue) return '';

    const currentVal = parseFloat(this.value);
    const previousVal = parseFloat(this.previousValue);

    if (isNaN(currentVal) || isNaN(previousVal)) return '';

    const diff = currentVal - previousVal;

    // Format with sign
    return diff >= 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;
  }

  // Determine if trend is positive
  get isPositive() {
    if (!this.value || !this.previousValue) return true;

    const currentVal = parseFloat(this.value);
    const previousVal = parseFloat(this.previousValue);

    if (isNaN(currentVal) || isNaN(previousVal)) return true;

    return currentVal >= previousVal;
  }

  render() {
    const arrowDirection = this.isPositive ? 'up' : 'down';
    const badgeColor = this.isPositive ? 'green-grass' : 'red-cardinal';

    return html`
      <div class="trend-container">
        <div class="trend-header">
          <div class="trend-label">${this.label}</div>
          <div class="trend-value-container">
            <div class="trend-value">${this.value}</div>
            <div class="trend-comparison">
              <span class="value-separator">/</span>
              ${this.previousValue}
              <span class="value-separator">/</span>
              <nve-badge color="${badgeColor}">
                ${this.comparisonValue}
                <nve-icon slot="suffix-icon" name="arrow" direction="${arrowDirection}" size="sm"></nve-icon>
              </nve-badge>
            </div>
          </div>
        </div>
        
        <div class="trend-graph">
          <svg viewBox="0 0 300 40" preserveAspectRatio="none">
            <!-- Baseline path (dashed line) -->
            <path 
              d="${this.baselinePath}" 
              stroke="var(--nve-sys-text-muted-color)" 
              stroke-width="1.5" 
              fill="none" 
              stroke-dasharray="4 2"
            />
            
            <!-- Main trend line -->
            <path 
              d="${this.svgPath}" 
              stroke="var(--nve-sys-text-emphasis-color)" 
              stroke-width="1.5" 
              fill="none"
            />
            
            <!-- Vertical marker line -->
            <line 
              x1="150" y1="0" 
              x2="150" y2="40" 
              stroke="var(--nve-sys-error-color)" 
              stroke-width="1"
            />
          </svg>
        </div>
      </div>
    `;
  }
}
