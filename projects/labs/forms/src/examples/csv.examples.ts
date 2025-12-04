import { css, html, LitElement, nothing } from 'lit';
import type { ValidatorResult } from '@nvidia-elements/forms';
import { FormControlMixin } from '@nvidia-elements/forms/mixin';
import '@nvidia-elements/core/textarea/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/grid/define.js';
import './csv.stories.js';

export default {
  title: 'Labs/Forms/Examples',
  component: ['forms']
};

/**
 * @tags test-case
 */
export const CSV = {
  render: () => html`
    <style>
      ui-csv-grid:invalid {
        outline: 2px dashed red;
      }
    </style>
    <form nve-layout="grid span:6 gap:lg pad:lg align:stretch align:center" style="min-width: 1000px;">
      <nve-textarea style="width: max-content">
        <label>CSV</label>
        <textarea name="input" rows="20" cols="50">${csv}</textarea>
      </nve-textarea>
      <nve-divider orientation="vertical"></nve-divider>
      <ui-csv-grid name="csv"></ui-csv-grid>
    </form>
    <script type="module">
      const form = document.querySelector('form');
      form.elements.csv.value = form.elements.input.value;
      form.addEventListener('input', (e) => {
        form.elements.csv.value = form.elements.input.value;
      });
    </script>
  `
};

const csv = `
resource_id,cpu_usage_percent,memory_usage_gb,storage_used_tb,network_traffic_gb
instance-001,45.2,8.5,2.3,156.7
instance-002,78.9,12.3,4.1,289.4
instance-003,23.4,4.2,1.5,89.3
instance-004,92.1,16.7,5.8,412.6
instance-005,34.7,6.8,2.9,178.2
instance-006,67.8,10.1,3.7,256.9
instance-007,12.5,2.9,0.8,45.6
instance-008,88.3,14.5,4.9,378.1
instance-009,56.4,9.2,3.2,198.5
instance-010,41.2,7.6,2.5,167.8`.trim();

export type CSVValue = string;

export class CSVExample extends FormControlMixin<typeof LitElement, CSVValue>(LitElement) {
  static readonly metadata = {
    tag: 'ui-csv-grid',
    version: '0.0.0',
    validators: [csvStringValidator],
    valueSchema: {
      type: 'string' as const
    },
  };

  static styles = [
    css`:host {
    display: block;
    width: 100%;
  }`
  ];

  get #getCSV() {
    const rows = this.value.trim().split('\n');
    return {
      columns: rows[0].split(','),
      rows: rows.slice(1).map(row => row.split(','))
    };
  }

  render() {
    return this.value
      ? html`
      <nve-grid>
        <nve-grid-header>
          ${this.#getCSV.columns.map(column => html`<nve-grid-column>${column}</nve-grid-column>`)}
        </nve-grid-header>
        ${this.#getCSV.rows.map(row => html`<nve-grid-row>${row.map(cell => html`<nve-grid-cell>${cell}</nve-grid-cell>`)}</nve-grid-row>`)}
      </nve-grid>
    `
      : nothing;
  }
}

customElements.get('ui-csv-grid') || customElements.define('ui-csv-grid', CSVExample);

function csvStringValidator(value: string): ValidatorResult {
  const message = isValidCSV(value);
  if (message !== true) {
    return { validity: { badInput: true }, message };
  } else {
    return { validity: {} };
  }
}

function isValidCSV(csvString: string): true | string {
  if (!csvString || csvString.trim().length === 0) {
    return 'empty';
  }

  const lines = csvString.split('\n');
  const firstLine = lines[0];
  const columnCount = (firstLine.match(/,/g) || []).length + 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim().length === 0) {
      continue;
    }

    // Check for unclosed quotes
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        // Check for escaped quotes
        if (j > 0 && line[j - 1] === '\\') {
          continue;
        }
        inQuotes = !inQuotes;
      }
    }

    if (inQuotes) {
      return 'csv contains unclosed quotes';
    }

    // Check if the number of columns matches the first line
    const currentColumnCount = (line.match(/,/g) || []).length + 1;
    if (currentColumnCount !== columnCount) {
      return 'csv contains invalid column count';
    }
  }

  return true;
}
