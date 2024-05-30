import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/radio/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/icon/define.js';

export default {
  title: 'Elements/Dropdown/Examples',
  component: 'mlv-dropdown'
};

export const Default = {
  render: () => html`
    <div style="height: 250px; width: 100%; display: flex; align-items:center; justify-content: center;">
      <mlv-dropdown anchor="btn"><p mlv-text="body">dropdown content</p></mlv-dropdown>
      <mlv-button id="btn">button</mlv-button>
    </div>
  `
};

export const Interactive = {
  inline: false,
  render: () => html`
<mlv-button id="dropdown-btn">open</mlv-button>
<mlv-dropdown anchor="dropdown-btn" trigger="dropdown-btn" hidden>
  <p mlv-text="body">hello there</p>
</mlv-dropdown>
<script>
  const dropdown = document.querySelector('mlv-dropdown');
  dropdown.addEventListener('open', () => dropdown.hidden = false);
  dropdown.addEventListener('close', () => dropdown.hidden = true);
</script>
  `
};

export const DynamicTrigger = {
  render: () => html`
<div id="dynamic-trigger-demo" mlv-layout="row align:center" style="height: 250px">
  <mlv-dropdown behavior-trigger hidden>hello there</mlv-dropdown>
  <mlv-button>button</mlv-button>
  <mlv-button>button</mlv-button>
  <mlv-button>button</mlv-button>
  <script type="module">
    const dropdown = document.querySelector('#dynamic-trigger-demo mlv-dropdown');
    document.querySelector('#dynamic-trigger-demo').addEventListener('mousedown', e => {
      if (e.target.tagName === 'MLV-BUTTON') {
        dropdown.anchor = e.target;
        dropdown.trigger = e.target;
      }
    });
  </script>
</div>
  `
};

export const BehaviorTrigger = {
  inline: false,
  render: () => html`
<mlv-button id="dropdown-btn">open</mlv-button>
<mlv-dropdown anchor="dropdown-btn" trigger="dropdown-btn" behavior-trigger hidden>
  <p mlv-text="body">hello there</p>
</mlv-dropdown>
  `
};

export const Content = {
  render: () => html`
<mlv-dropdown anchor="btn">
  <mlv-search rounded>
    <input type="search" placeholder="Search" />
  </mlv-search>
  <mlv-alert>some text content in a dropdown</mlv-alert>
</mlv-dropdown>
<mlv-button id="btn">button</mlv-button>
  `
};

export const RadioGroup = {
  render: () => html`
<mlv-dropdown anchor="btn">
  <mlv-radio-group style="width: 250px">
    <label>Sort By</label>
    <mlv-radio>
      <label>Completed</label>
      <input type="radio" checked />
      <mlv-control-message>latest completed tasks</mlv-control-message>
    </mlv-radio>
    <mlv-radio>
      <label>Failing</label>
      <input type="radio" />
      <mlv-control-message>latest failing tasks</mlv-control-message>
    </mlv-radio>
    <mlv-radio>
      <label>Status</label>
      <input type="radio" />
      <mlv-control-message>task status priority</mlv-control-message>
    </mlv-radio>
  </mlv-radio-group>
</mlv-dropdown>
<mlv-button id="btn" mlv-control>completed <mlv-icon name="caret" direction="down" size="sm"></mlv-icon></mlv-button>
  `
};

const options = [
  { id: '1', label: 'completed', message: 'latest completed tasts' },
  { id: '2', label: 'failing', message: 'latest failing tasks' },
  { id: '3', label: 'status', message: 'task status priority' }
];

@customElement('radio-group-interactive-demo')
class RadioGroupInteractiveDemo extends LitElement { /* eslint no-unused-vars: 0 */
  @state() private show = false;
  @state() private selected = options[0];

  render() {
    return html`
<mlv-button id="btn" mlv-control>${this.selected.label} <mlv-icon name="caret" direction="down" size="sm"></mlv-icon></mlv-button>
<mlv-dropdown anchor="btn" trigger="btn" .hidden=${!this.show} @open=${() => this.show = true} @close=${() => this.show = false}>
  <mlv-radio-group style="width: 250px">
    <label>Sort By</label>
    ${options.map(option => html`
    <mlv-radio @pointerup=${() => this.show = false}>
      <label>${option.label}</label>
      <input type="radio" .value=${option.id} ?checked=${option.id === this.selected.id} @input=${() => this.selected = option} />
      <mlv-control-message>${option.message}</mlv-control-message>
    </mlv-radio>`)}
  </mlv-radio-group>
</mlv-dropdown>
    `
  }
}

export function RadioGroupInteractive() {
  return html`<radio-group-interactive-demo></radio-group-interactive-demo>`
}

export const CheckboxGroup = {
  render: () => html`
<mlv-dropdown anchor="btn">
  <mlv-checkbox-group style="width: 250px">
    <label>Test Suites</label>
    <mlv-checkbox>
      <label>Local</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-checkbox>
      <label>Nightly</label>
      <input type="checkbox" checked />
    </mlv-checkbox>
    <mlv-checkbox>
      <label>Remote</label>
      <input type="checkbox" />
    </mlv-checkbox>
  </mlv-checkbox-group>
</mlv-dropdown>
<mlv-button id="btn" mlv-control>test suites <mlv-icon name="caret" direction="down" size="sm"></mlv-icon></mlv-button>
  `
};

const checkboxes = [
  { id: '1', label: 'local', message: 'latest local' },
  { id: '2', label: 'nightly', message: 'latest nightly builds' },
  { id: '3', label: 'remote', message: 'pending remote builds' }
];

@customElement('checkbox-group-interactive-demo')
class CheckboxGroupInteractiveDemo extends LitElement { /* eslint no-unused-vars: 0 */
  @state() private show = false;
  @state() private suites = { '1': true, '2': false, '3': false };

  render() {
    return html`
<mlv-button id="btn" mlv-control>test suites <mlv-icon name="caret" direction="down" size="sm"></mlv-icon></mlv-button>
<mlv-dropdown anchor="btn" trigger="btn" .hidden=${!this.show} @open=${() => this.show = true} @close=${() => this.show = false}>
  <mlv-checkbox-group style="width: 250px">
    <label>Sort By</label>
    ${checkboxes.map(checkbox => html`
    <mlv-checkbox>
      <label>${checkbox.label}</label>
      <input type="checkbox" .value=${checkbox.id} ?checked=${this.suites[checkbox.id]} @input=${e => this.suites = { ...this.suites, [checkbox.id]: e.target.checked }} />
      <mlv-control-message>${checkbox.message}</mlv-control-message>
    </mlv-checkbox>`)}
  </mlv-checkbox-group>
</mlv-dropdown>
<pre>${checkboxes.map(c => html`${c.label}: ${this.suites[c.id]}\n`)}</pre>
    `
  }
}

export const CheckboxGroupInteractive = {
  render: () => html`<checkbox-group-interactive-demo></checkbox-group-interactive-demo>`
};

export const Closable = {
  render: () => html`
<mlv-dropdown anchor="btn" closable>
  <h3 mlv-text="label">Title</h3>
  <p mlv-text="body">some text content in a closable dropdown</p>
</mlv-dropdown>
<mlv-button id="btn">button</mlv-button>
  `
};

export const Arrow = {
  render: () => html`
<div mlv-layout="row align:center" style="height: 200px">
  <mlv-dropdown anchor="btn" arrow>
    <h3 mlv-text="label">Title</h3>
    <p mlv-text="body">some text content in a closable dropdown</p>
  </mlv-dropdown>
  <mlv-button id="btn">button</mlv-button>
</div>
  `
};

export const Position = {
  render: () => html`
<div mlv-theme mlv-layout="row align:center" style="width: 100%; height: 400px;">
  <mlv-dropdown anchor="card" position="top" alignment="center" closable>
    <h3 mlv-text="label">Top</h3>
    <p mlv-text="body">dropdown positioned top</p>
  </mlv-dropdown>
  <mlv-dropdown anchor="card" position="right" alignment="center" closable>
    <h3 mlv-text="label">Right</h3>
    <p mlv-text="body">dropdown positioned right</p>
  </mlv-dropdown>
  <mlv-dropdown anchor="card" position="bottom" alignment="center" closable>
    <h3 mlv-text="label">Bottom</h3>
    <p mlv-text="body">dropdown positioned bottom</p>
  </mlv-dropdown>
  <mlv-dropdown anchor="card" position="left" alignment="center" closable>
    <h3 mlv-text="label">Left</h3>
    <p mlv-text="body">dropdown positioned left</p>
  </mlv-dropdown>
  <mlv-card id="card" style="width: 250px; height: 200px;"></mlv-card>
</div>
  `
};

export const Alignment = {
  render: () => html`
<div mlv-theme mlv-layout="row align:center">
  <mlv-dropdown anchor="card" position="top" alignment="start">top start</mlv-dropdown>
  <mlv-dropdown anchor="card" position="top" alignment="center">top center</mlv-dropdown>
  <mlv-dropdown anchor="card" position="top" alignment="end">top end</mlv-dropdown>

  <mlv-dropdown anchor="card" position="right" alignment="start">right start</mlv-dropdown>
  <mlv-dropdown anchor="card" position="right" alignment="center">right center</mlv-dropdown>
  <mlv-dropdown anchor="card" position="right" alignment="end">right end</mlv-dropdown>

  <mlv-dropdown anchor="card" position="bottom" alignment="start">bottom start</mlv-dropdown>
  <mlv-dropdown anchor="card" position="bottom" alignment="center">bottom center</mlv-dropdown>
  <mlv-dropdown anchor="card" position="bottom" alignment="end">bottom end</mlv-dropdown>

  <mlv-dropdown anchor="card" position="left" alignment="start">left start</mlv-dropdown>
  <mlv-dropdown anchor="card" position="left" alignment="center">left center</mlv-dropdown>
  <mlv-dropdown anchor="card" position="left" alignment="end">left end</mlv-dropdown>

  <mlv-card id="card" style="width: 450px; height: 300px;"></mlv-card>
</div>
  `
};

export const HeaderFooter = {
  render: () => html `
<mlv-dropdown anchor="btn" closable>
  <mlv-dropdown-header>
    <h3 mlv-text="heading semibold sm">heading</h3>
  </mlv-dropdown-header>
  <p mlv-text="body">some text content in a closable dropdown</p>
  <mlv-dropdown-footer>
    <p mlv-text="body">footer</p>
  </mlv-dropdown-footer>
</mlv-dropdown>
<mlv-button id="btn">button</mlv-button>
`
}