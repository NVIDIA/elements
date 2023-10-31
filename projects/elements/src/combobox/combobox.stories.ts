import { html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { choose } from 'lit/directives/choose.js';
import '@elements/elements/progressive-filter-chip/define.js';
import '@elements/elements/combobox/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/tag/define.js';
import '@elements/elements/date/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/dropdown/define.js';

export default {
  title: 'Elements/Combobox/Examples',
  component: 'nve-combobox',
};

export const Default = () => {
  return html`
  <nve-combobox>
    <label>label</label>
    <input type="search">
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>
  `
};

export const Vertical = () => {
  return html`
<div nve-layout="column gap:lg">
  <nve-combobox>
    <label>label</label>
    <input type="search" />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>

  <nve-combobox>
    <label>disabled</label>
    <input disabled />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>

  <nve-combobox>
    <label>success</label>
    <input type="search" />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message status="success">message</nve-control-message>
  </nve-combobox>

  <nve-combobox>
    <label>error</label>
    <input type="search" />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message status="error">message</nve-control-message>
  </nve-combobox>
</div>`
};

export const Horizontal = () => {
  return html`
<div nve-layout="column gap:lg align:stretch">
  <nve-combobox layout="horizontal">
    <label>label</label>
    <input type="search" />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>

  <nve-combobox layout="horizontal">
    <label>disabled</label>
    <input disabled />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>

  <nve-combobox layout="horizontal">
    <label>success</label>
    <input type="search" />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message status="success">message</nve-control-message>
  </nve-combobox>

  <nve-combobox layout="horizontal">
    <label>error</label>
    <input type="search" />
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
    <nve-control-message status="error">message</nve-control-message>
  </nve-combobox>
</div>`
};

export const Flat = () => {
  return html`
  <nve-combobox container="flat">
    <nve-icon name="filter" slot="prefix-icon"></nve-icon>
    <input type="search">
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
  </nve-combobox>
  `
};

export const Select = () => {
  return html`
<nve-combobox>
  <label>label</label>
  <input type="search">
  <select>
    <option value="status"></option>
    <option value="priority"></option>
    <option value="date"></option>
    <option value="session"></option>
    <option value="configuration"></option>
    <option value="contains"></option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-combobox>
  `
};

export const MultiSelect = () => {
  return html`
  <nve-combobox>
    <label>label</label>
    <input type="search">
    <select multiple>
      <option selected value="status"></option>
      <option selected value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>
  `
};

export const Overflow = () => {
  return html`
  <nve-combobox style="width: 250px">
    <label>label</label>
    <input type="search">
    <select multiple>
      <option selected value="status"></option>
      <option selected value="priority"></option>
      <option selected value="date"></option>
      <option selected value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>
  `
};

export const PopoverOverflow = () => {
  return html`
  <nve-combobox style="width: 100px">
    <label>label</label>
    <input type="search">
    <select>
      <option value="really-long-text-option-that-keeps-going"></option>  
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>
  `
};

export const Performance = () => {
  return html`<nve-combobox-performance-demo></nve-combobox-performance-demo>`
}

class ComboboxPerformanceDemo extends LitElement {
  render() {
    return html`
  <nve-combobox>
    <input type="search">
    <datalist>
      ${new Array(1000).fill('').map((_, i) => html`<option value="${i} item"></option>`)}
    </datalist>
  </nve-combobox>
    `;
  }
}

customElements.get('nve-combobox-performance-demo') || customElements.define('nve-combobox-performance-demo', ComboboxPerformanceDemo);

export const FilterDemo = {
  render: () => html`<nve-combobox-demo></nve-combobox-demo>`
}

const schema = {
  status: {
    type: 'select',
    options: ['success', 'failure', 'processing'],
    initial: 'success'
  },
  priority: {
    type: 'select',
    options: ['high', 'medium', 'low'],
    initial: 'high'
  },
  created: {
    type: 'date',
    initial: new Date()
  },
  progress: {
    type: 'number',
    initial: 0
  },
  sessionId: {
    type: 'text',
    initial: ''
  }
};

class ComboboxDemo extends LitElement {  
  @state() private value = [{ name: '', value: '' }];

  render() {
    return html`
      <nve-button id="filter-btn" ?pressed=${this.value.filter(v => v.name.length).length}><nve-icon name="filter"></nve-icon> </nve-icon>filters</nve-button>
      <nve-dropdown id="one" hidden trigger="filter-btn" anchor="filter-btn" @open=${e => e.target.hidden = false} @close=${e => e.target.hidden = true} style="--min-width: 400px; --min-height: 500px;">
        <nve-progressive-filter-demo @change=${e => this.value = e.detail} .value=${this.value} .schema=${schema}></nve-progressive-filter-demo>
      </nve-dropdown>
      <pre style="margin-top: 300px">${JSON.stringify(this.value.filter(v => v.name.length), null, 2)}</pre>
    `;
  }
}

customElements.get('nve-combobox-demo') || customElements.define('nve-combobox-demo', ComboboxDemo);

class ProgressiveFilterDemo extends LitElement {
  static styles = [unsafeCSS(`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--nve-ref-space-xs);
    }

    nve-progressive-filter-chip {
      width: 100%;
    }
  `)];

  @property({ type: Object }) schema = { };

  @property({ type: Array }) value: { name: string, value: string }[] = [{ name: '', value: '' }];

  get #unusedFilters() {
    return Object.entries(this.schema).filter(([key]) => !this.value.find(f => f.name === key));
  }

  render() {
    return html`
      ${this.value.map(filter => html`
      <nve-progressive-filter-chip closable @close=${() => this.#removeFilter(filter)}>
        <nve-combobox>
          <span slot="prefix-icon"></span>
          <input type="search" placeholder="filter" .value=${filter.name} @change=${e => this.#createfilter(e.target.value, filter)} />
          <datalist>${this.#unusedFilters.map(([key]) => html`<option .value=${key}>${key}</option>`)}</datalist>
        </nve-combobox>
        ${choose(this.schema[filter.name]?.type, [
          ['text', () => html`<nve-combobox><input type="text" @change=${e => this.#updateFilter(e.target.value, filter)} .value=${filter.value} placeholder="value" /></nve-combobox>`],
          ['number', () => html`<nve-combobox><input type="number" @change=${e => this.#updateFilter(e.target.value, filter)} .value=${filter.value} /></nve-combobox>`],
          ['date', () => html`<nve-date><input type="date" @change=${e => this.#updateFilter(e.target.value, filter)} .value=${filter.value} /></nve-date>`],
          ['select', () => html`<nve-select><select @change=${e => this.#updateFilter(e.target.value, filter)} value=${filter.value}>${this.schema[filter.name]?.options?.map(v => html`<option value="${v}">${v}</option>`)}</select></nve-select>`]
        ], () => html`<nve-combobox><input type="text" placeholder="value" disabled /></nve-combobox>`)}
      </nve-progressive-filter-chip>`)}
      <nve-button interaction="flat" @click=${this.#addFilter} .disabled=${this.#unusedFilters.length === 0 || this.value.find(v => v.name === '')} style="align: center; margin-top: 12px;">
        <nve-icon name="add"></nve-icon> Add Filter
      </nve-button>
    `;
  }

  #addFilter() {
    this.value = [...this.value, { name: '', value: '' }];
    this.#valueChange();
  }

  #removeFilter(filter: { name: string, value: string }) {
    this.value = this.value.filter(o => o.name !== filter.name);
    this.#valueChange();
  }

  #updateFilter(value: any, filter: { name: string, value: string }) {
    this.value = this.value.map(v => v.name === filter.name ? { ...filter, value } : v);
    this.#valueChange();
  }

  #createfilter(name, filter: { name: string, value: string }) {
    this.value = this.value.map(v => v.name === filter.name ? { name, value: this.schema[name]?.initial ?? '' } : v);
    this.#valueChange();
  }

  #valueChange() {
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }
}

customElements.get('nve-progressive-filter-demo') || customElements.define('nve-progressive-filter-demo', ProgressiveFilterDemo);
