import { html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { choose } from 'lit/directives/choose.js';
import '@nvidia-elements/core/progressive-filter-chip/define.js';
import '@nvidia-elements/core/combobox/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/tag/define.js';
import '@nvidia-elements/core/date/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/dropdown/define.js';

export default {
  title: 'Elements/Combobox',
  component: 'nve-combobox',
};

/**
 * @summary Basic combobox with search input and datalist options for filtering and selection.
 */
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

/**
 * @summary Vertical layout showing different combobox states (normal, disabled, success, error) stacked for comparison.
 * @tags test-case
 */
export const Vertical = () => {
  return html`
<div nve-layout="column gap:lg full">
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
    <input type="search" disabled />
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

/**
 * @summary Horizontal layout showing different combobox states (normal, disabled, success, error) for inline form layouts.
 */
export const Horizontal = () => {
  return html`
<div nve-layout="column gap:lg full">
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
    <input type="search" disabled />
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

/**
 * @summary Flat container style with prefix icon for compact inline filtering interfaces.
 */
export const Flat = () => {
  return html`
  <nve-combobox container="flat">
    <nve-icon name="filter" slot="prefix-icon"></nve-icon>
    <input type="search" aria-label="search">
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

/**
 * @summary Single select allows users only to select from a predefined list
 * of options. Invalid input is automatically cleared. All options are visible
 * on focus until typing begins for filtering.
 */
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

/**
 * @summary Multi select allows users to select many options from a
 * predefined list. The select `value` will only reflect the first selected value.
 * To get all selected options check the `selected` property on each `<option>`
 * or the select property `selectedOptions`.
 * On focus all options will show until the user starts typing. Select is the
 * selection value of the combobox. The input is the filter value.
 */
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

/**
 * @summary Combobox with an empty initial value using a disabled placeholder option. Use when no default selection exists and the user must make an explicit choice.
 */
export const EmptyDefault = () => {
  return html`
<nve-combobox>
  <label>label</label>
  <input type="search">
  <select>
    <option disabled selected></option>
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

/**
 * @summary Combobox options with display labels that differ from underlying values. Use when option values are IDs or codes but users need to see human-readable text in the input.
 */
export const Label = () => {
  return html`
  <nve-combobox>
    <label>label</label>
    <input type="search">
    <select>
      <option value="1">Status</option>
      <option value="2">Priority</option>
      <option value="3">Date</option>
      <option value="4">Session</option>
      <option value="5">Configuration</option>
      <option value="6">Contains</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>
  `
};

/**
 * @summary Multi-select with labeled options where display text differs from option values.
 */
export const LabelMultiSelect = () => {
  return html`
  <nve-combobox>
    <label>label</label>
    <input type="search">
    <select multiple>
      <option value="1">Status</option>
      <option value="2">Priority</option>
      <option value="3">Date</option>
      <option value="4">Session</option>
      <option value="5">Configuration</option>
      <option value="6">Contains</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>
  `
};

/**
 * @summary Overflow behavior where many tags collapse into a simple text label when the parent container is too narrow.
 * @tags test-case
 */
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

/**
 * @summary Combobox handling of long option text in constrained width containers.
 * @tags test-case
 */
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

/**
 * @summary Multi-select with reset functionality via icon button and footer button to clear all selections.
 */
export const Reset = () => {
  return html`
  <nve-combobox id="combobox-reset" style="width: 500px; --scroll-height: 220px">
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
    <nve-icon-button aria-label="clear selection" icon-name="cancel" container="inline"></nve-icon-button>
    <nve-button slot="footer" aria-label="clear selection" container="flat">reset</nve-button>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>
  <script type="module">
    document.querySelector('#combobox-reset nve-icon-button').addEventListener('click', e => e.target.parentElement.reset());
    document.querySelector('#combobox-reset nve-button').addEventListener('click', e => e.target.parentElement.reset());
  </script>
  `
};

/**
 * @summary Multi-select with footer action button for extra operations on selected items.
 */
export const Footer = () => {
  return html`
  <nve-combobox style="width: 500px; --scroll-height: 200px">
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
    <nve-button slot="footer" container="flat">action</nve-button>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>
  `
};

/**
 * @summary Multi-select with bulk selection controls (Select All/Deselect All) in footer for efficient mass operations.
 */
export const SelectAll = () => {
  return html`
  <nve-combobox id="combobox-select-all" style="width: 500px; --scroll-height: 200px">
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
    <div slot="footer" nve-layout="row align:stretch full">
      <nve-button container="flat">Select All</nve-button>
      <nve-button container="flat">Deselect All</nve-button>
    </div>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>
  <script type="module">
    const combobox = document.querySelector('#combobox-select-all');
    const [selectAll, deselectAll] = Array.from(combobox.querySelectorAll('nve-button'));

    selectAll.addEventListener('click', () => combobox.selectAll());
    deselectAll.addEventListener('click', () => combobox.reset());
    combobox.addEventListener('change', e => console.log(e.target.selectedOptions));
  </script>
  `
};

/**
 * @summary Multi-select with disabled options to show unavailable choices while maintaining visual context.
 */
export const DisabledOptions = () => {
  return html`
  <nve-combobox>
    <label>label</label>
    <input type="search">
    <select multiple>
      <option value="status" disabled></option>
      <option value="priority" disabled></option>
      <option value="date" disabled></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>
  `
};

/**
 * @summary Multi-select without built-in tags, using external tag management for custom selection display.
 */
export const NoTags = () => {
  return html`
  <form id="notags" nve-layout="column gap:lg align:stretch">
    <nve-combobox notags>
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
    </nve-combobox>
    <div id="tags" nve-layout="row gap:xs">
    </div>
  </form>
  <script type="module">
    const form = document.querySelector('#notags');
    const select = form.querySelector('select');
    const tags = form.querySelector('#tags');
    updateTags();
    select.addEventListener('change', e => updateTags());
    tags.addEventListener('close', e => {
      Array.from(select.options).find(o => o.value === e.target.value).selected = false;
      updateTags();
    });
    function updateTags() {
      tags.innerHTML = '';
      Array.from(select.selectedOptions).forEach(o => tags.innerHTML += '<nve-tag closable value="' + o.value + '">' + o.value + '</nve-tag>');
    }
  </script>
  `
};

/**
 * @summary Complete form integration showing combobox with form submission, reset, and programmatic value setting.
 */
export const Form = () => {
  return html`
<form nve-layout="column gap:lg align:stretch">
  <nve-combobox style="--scroll-height: 220px">
    <label>label</label>
    <input type="search" name="input">
    <select multiple name="select" value="priority">
      <option value="status"></option>
      <option selected value="priority"></option>
      <option selected value="date"></option>
      <option value="session"></option>
      <option value="configuration"></option>
      <option value="contains"></option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-combobox>

  <div nve-layout="row gap:xs">
    <nve-button type="button">set</nve-button>
    <nve-button type="reset">reset</nve-button>
    <nve-button type="submit">submit</nve-button>
  </div>
</form>

<script type="module">
  const form = document.querySelector('form');
  const select = document.querySelector('select');
  const input = document.querySelector('input');
  const btn = document.querySelector('[type=button]');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(form);
    console.log('input: ', formData.get('input'));
    console.log('select: ', formData.get('select'));
    console.log('selectedOptions: ', Array.from(select.selectedOptions).map(o => o.value));
  });

  btn.addEventListener('click', () => {
    select.value = 'status';
    select.options[0].selected = true;
    input.value = 'test';
  });
</script>
  `
};

/**
 * @summary Fetches options asynchronously as the user types, cancelling stale requests with AbortController. Use for server-backed search where the full option set is too large to load up front.
 * @tags pattern
 */
export const DynamicTypeaheadSearch = () => {
  return html`
<nve-combobox id="combobox">
  <label>GPU Search</label>
  <input type="search" placeholder="Type to search…" />
  <datalist>
    <option disabled selected></option>
  </datalist>
</nve-combobox>

<script type="module">
  const combobox = document.getElementById('combobox');
  const input = combobox.querySelector('input');
  const datalist = combobox.querySelector('datalist');

  let controller = null;
  input.addEventListener('input', async () => {
    if (controller) controller.abort();
    controller = new AbortController();

    const query = input.value.trim();
    if (!query) {
      datalist.innerHTML = '';
      return;
    }
    try {
      const results = await mockFetch(query, controller.signal);
      datalist.innerHTML = results.map((v) => '<option value="' + v + '">').join('');
    } catch (err) {
      if (err.name !== 'AbortError') datalist.innerHTML = '';
    }
  });

  function mockFetch(query, signal) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve(['A100 GPU', 'H100 GPU', 'H200 GPU', 'DGX A100', 'DGX H100', 'CUDA Toolkit'].filter((v) => v.toLowerCase().startsWith(query.toLowerCase())));
      }, 500);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  }
</script>
  `
}

/**
 * @summary Performance test with 1000 options to show filtering efficiency with large datasets.
 * @tags test-case performance
 */
export const Performance = () => {
  return html`
<nve-combobox id="performance-combobox">
  <input type="search" aria-label="performance test">
  <datalist></datalist>
</nve-combobox>
<script type="module">
  const datalist = document.querySelector('#performance-combobox datalist');
  const options = new Array(1000).fill('').map((_, i) => {
    const option = document.createElement('option');
    option.value = i + ' item';
    return option;
  });
  datalist.append(...options);
</script>`
}

/* eslint-disable @nvidia-elements/lint/no-missing-slotted-elements */
/**
 * @summary Performance test with 1000 options to show filtering efficiency with large datasets.
 * @tags test-case performance
 */
export const PerformanceSelect = () => {
  return html`
<div nve-layout="pad:lg">
  <nve-combobox id="performance-combobox">
    <input type="search" aria-label="performance test">
    <select multiple></select>
  </nve-combobox>
</div>
<script type="module">
  const select = document.querySelector('#performance-combobox select');
  const options = new Array(1000).fill('').map((_, i) => {
    const option = document.createElement('option');
    option.value = i + ' item';
    return option;
  });
  select.append(...options);
</script>`
}

/**
 * @summary Dynamic options with datalist and select variants of combobox.
 * @tags test-case
 */
export const DynamicOptions = () => {
  return html`
<nve-combobox id="dynamic-options-combobox">
  <input type="search" aria-label="performance test" />
  <datalist>
    <option>default</option>
  </datalist>
</nve-combobox>
<script type="module">
  let i = 0;
  setInterval(function() {
    if (i > 100) clearInterval(interval);
    const datalist = document.querySelector("#dynamic-options-combobox datalist");
    const option = document.createElement("option");
    option.value = i + " item";
    datalist.append(option);
    i++;
    console.log('append');
  }, 1000);
</script>
  `
}

/**
 * @summary Interactive demo showing progressive filter chips with dynamic combobox creation for complex filtering interfaces.
 * @tags test-case
 */
export const FilterDemo = {
  render: () => html`<combobox-demo></combobox-demo>`
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

  // todo
  /* eslint-disable @nvidia-elements/lint/no-deprecated-popover-attributes */
  render() {
    return html`
      <nve-button id="filter-btn" ?pressed=${!!this.value.filter(v => v.name.length).length}><nve-icon name="filter"></nve-icon> </nve-icon>filters</nve-button>
      <nve-dropdown id="one" hidden trigger="filter-btn" anchor="filter-btn" @open=${e => e.target.hidden = false} @close=${e => e.target.hidden = true} style="--min-width: 400px; --min-height: 500px;">
        <progressive-filter-demo @change=${e => this.value = e.detail} .value=${this.value} .schema=${schema}></progressive-filter-demo>
      </nve-dropdown>
      <pre style="margin-top: 300px">${JSON.stringify(this.value.filter(v => v.name.length), null, 2)}</pre>
    `;
  }
}

customElements.get('combobox-demo') || customElements.define('combobox-demo', ComboboxDemo);

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

  @property({ type: Object }) schema = {};

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
          <input type="search" placeholder="filter" .value=${filter.name} @change=${e => this.#createfilter(e.target.value, filter)} aria-label="filter" />
          <datalist>${this.#unusedFilters.map(([key]) => html`<option .value=${key}>${key}</option>`)}</datalist>
        </nve-combobox>
        ${choose(this.schema[filter.name]?.type, [
      ['text', () => html`<nve-combobox><input type="text" @change=${e => this.#updateFilter(e.target.value, filter)} .value=${filter.value} placeholder="value" aria-label="filter value" /></nve-combobox>`],
      ['number', () => html`<nve-combobox><input type="number" @change=${e => this.#updateFilter(e.target.value, filter)} .value=${filter.value} aria-label="filter value" /></nve-combobox>`],
      ['date', () => html`<nve-date><input type="date" @change=${e => this.#updateFilter(e.target.value, filter)} .value=${filter.value} aria-label="filter value" /></nve-date>`],
      ['select', () => html`<nve-select><select @change=${e => this.#updateFilter(e.target.value, filter)} value=${filter.value} aria-label="filter value">${this.schema[filter.name]?.options?.map(v => html`<option value=${v}>${v}</option>`)}</select></nve-select>`]
    ], () => html`<nve-combobox><input type="text" placeholder="value" disabled aria-label="filter value" /></nve-combobox>`)}
      </nve-progressive-filter-chip>`)}
      <nve-button container="flat" @click=${this.#addFilter} .disabled=${this.#unusedFilters.length === 0 || !!this.value.find(v => v.name === '')} style="align: center; margin-top: 12px;">
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

  #updateFilter(value: string, filter: { name: string, value: string }) {
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

customElements.get('progressive-filter-demo') || customElements.define('progressive-filter-demo', ProgressiveFilterDemo);
