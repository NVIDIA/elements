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
  component: 'mlv-combobox',
};

export const Default = () => {
  return html`
  <mlv-combobox>
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
    <mlv-control-message>message</mlv-control-message>
  </mlv-combobox>
  `
};

export const Vertical = () => {
  return html`
<div mlv-layout="column gap:lg">
  <mlv-combobox>
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
    <mlv-control-message>message</mlv-control-message>
  </mlv-combobox>

  <mlv-combobox>
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
    <mlv-control-message>message</mlv-control-message>
  </mlv-combobox>

  <mlv-combobox>
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
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-combobox>

  <mlv-combobox>
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
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-combobox>
</div>`
};

export const Horizontal = () => {
  return html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-combobox layout="horizontal">
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
    <mlv-control-message>message</mlv-control-message>
  </mlv-combobox>

  <mlv-combobox layout="horizontal">
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
    <mlv-control-message>message</mlv-control-message>
  </mlv-combobox>

  <mlv-combobox layout="horizontal">
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
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-combobox>

  <mlv-combobox layout="horizontal">
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
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-combobox>
</div>`
};

export const Flat = () => {
  return html`
  <mlv-combobox container="flat">
    <mlv-icon name="filter" slot="prefix-icon"></mlv-icon>
    <input type="search">
    <datalist>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </datalist>
  </mlv-combobox>
  `
};

export const Select = () => {
  return html`
<mlv-combobox>
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
  <mlv-control-message>message</mlv-control-message>
</mlv-combobox>
  `
};

export const MultiSelect = () => {
  return html`
  <mlv-combobox>
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
    <mlv-control-message>message</mlv-control-message>
  </mlv-combobox>
  `
};

export const Label = () => {
  return html`
  <mlv-combobox>
    <label>label</label>
    <input type="search">
    <select>
      <option value="status">Status</option>
      <option value="priority">Priority</option>
      <option value="date">Date</option>
      <option value="session">Session</option>
      <option value="configuration">Configuration</option>
      <option value="contains">Contains</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-combobox>
  `
};

export const Overflow = () => {
  return html`
  <mlv-combobox style="width: 250px">
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
    <mlv-control-message>message</mlv-control-message>
  </mlv-combobox>
  `
};

export const PopoverOverflow = () => {
  return html`
  <mlv-combobox style="width: 100px">
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
    <mlv-control-message>message</mlv-control-message>
  </mlv-combobox>
  `
};

export const Reset = () => {
  return html`
  <mlv-combobox style="width: 500px; --scroll-height: 220px">
    <label>label</label>
    <input type="search">
    <select multiple>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </select>
    <mlv-icon-button id="combobox-reset" aria-label="clear selection" icon-name="cancel" interaction="flat"></mlv-icon-button>
    <mlv-control-message>message</mlv-control-message>
  </mlv-combobox>
  <script type="module">
    document.querySelector('#combobox-reset').addEventListener('click', e => e.target.parentElement.reset());
  </script>
  `
};

export const Footer = () => {
  return html`
  <mlv-combobox style="width: 500px; --scroll-height: 200px">
    <label>label</label>
    <input type="search">
    <select multiple>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
      <option value="includes"></option>
      <option value="user"></option>
      <option value="progress"></option>
    </select>
    <mlv-button slot="footer" interaction="flat">action</mlv-button>
    <mlv-control-message>message</mlv-control-message>
  </mlv-combobox>
  `
};

export const SelectAll = () => {
  return html`
  <mlv-combobox id="combobox-select-all" style="width: 500px; --scroll-height: 200px">
    <label>label</label>
    <input type="search">
    <select multiple>
      <option value="status"></option>
      <option value="priority"></option>
      <option value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
      <option value="includes"></option>
      <option value="user"></option>
      <option value="progress"></option>
    </select>
    <div slot="footer" mlv-layout="row align:stretch full">
      <mlv-button interaction="flat">Select All</mlv-button>
      <mlv-button interaction="flat">Deselect All</mlv-button>
    </div>
    <mlv-control-message>message</mlv-control-message>
  </mlv-combobox>
  <script type="module">
    const combobox = document.querySelector('#combobox-select-all');
    const [selectAll, deselectAll] = Array.from(combobox.querySelectorAll('mlv-button'));

    selectAll.addEventListener('click', () => combobox.selectAll());
    deselectAll.addEventListener('click', () => combobox.reset());
    combobox.addEventListener('change', e => console.log(e.target.selectedOptions));
  </script>
  `
};

export const Performance = () => {
  return html`<mlv-combobox-performance-demo></mlv-combobox-performance-demo>`
}

class ComboboxPerformanceDemo extends LitElement {
  render() {
    return html`
  <mlv-combobox>
    <input type="search">
    <datalist>
      ${new Array(1000).fill('').map((_, i) => html`<option value="${i} item"></option>`)}
    </datalist>
  </mlv-combobox>
    `;
  }
}

customElements.get('mlv-combobox-performance-demo') || customElements.define('mlv-combobox-performance-demo', ComboboxPerformanceDemo);

export const FilterDemo = {
  render: () => html`<mlv-combobox-demo></mlv-combobox-demo>`
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
      <mlv-button id="filter-btn" ?pressed=${this.value.filter(v => v.name.length).length}><mlv-icon name="filter"></mlv-icon> </mlv-icon>filters</mlv-button>
      <mlv-dropdown id="one" hidden trigger="filter-btn" anchor="filter-btn" @open=${e => e.target.hidden = false} @close=${e => e.target.hidden = true} style="--min-width: 400px; --min-height: 500px;">
        <mlv-progressive-filter-demo @change=${e => this.value = e.detail} .value=${this.value} .schema=${schema}></mlv-progressive-filter-demo>
      </mlv-dropdown>
      <pre style="margin-top: 300px">${JSON.stringify(this.value.filter(v => v.name.length), null, 2)}</pre>
    `;
  }
}

customElements.get('mlv-combobox-demo') || customElements.define('mlv-combobox-demo', ComboboxDemo);

class ProgressiveFilterDemo extends LitElement {
  static styles = [unsafeCSS(`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--mlv-ref-space-xs);
    }

    mlv-progressive-filter-chip {
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
      <mlv-progressive-filter-chip closable @close=${() => this.#removeFilter(filter)}>
        <mlv-combobox>
          <span slot="prefix-icon"></span>
          <input type="search" placeholder="filter" .value=${filter.name} @change=${e => this.#createfilter(e.target.value, filter)} />
          <datalist>${this.#unusedFilters.map(([key]) => html`<option .value=${key}>${key}</option>`)}</datalist>
        </mlv-combobox>
        ${choose(this.schema[filter.name]?.type, [
          ['text', () => html`<mlv-combobox><input type="text" @change=${e => this.#updateFilter(e.target.value, filter)} .value=${filter.value} placeholder="value" /></mlv-combobox>`],
          ['number', () => html`<mlv-combobox><input type="number" @change=${e => this.#updateFilter(e.target.value, filter)} .value=${filter.value} /></mlv-combobox>`],
          ['date', () => html`<mlv-date><input type="date" @change=${e => this.#updateFilter(e.target.value, filter)} .value=${filter.value} /></mlv-date>`],
          ['select', () => html`<mlv-select><select @change=${e => this.#updateFilter(e.target.value, filter)} value=${filter.value}>${this.schema[filter.name]?.options?.map(v => html`<option value="${v}">${v}</option>`)}</select></mlv-select>`]
        ], () => html`<mlv-combobox><input type="text" placeholder="value" disabled /></mlv-combobox>`)}
      </mlv-progressive-filter-chip>`)}
      <mlv-button interaction="flat" @click=${this.#addFilter} .disabled=${this.#unusedFilters.length === 0 || this.value.find(v => v.name === '')} style="align: center; margin-top: 12px;">
        <mlv-icon name="add"></mlv-icon> Add Filter
      </mlv-button>
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

customElements.get('mlv-progressive-filter-demo') || customElements.define('mlv-progressive-filter-demo', ProgressiveFilterDemo);
