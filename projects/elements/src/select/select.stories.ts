import { LitElement, html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/logo/define.js';

export default {
  title: 'Elements/Select/Examples',
  component: 'mlv-select',
};

export const Select = {
  render: () => html`
<mlv-select>
  <label>label</label>
  <select>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
  <mlv-control-message>message</mlv-control-message>
</mlv-select>`
};

export const CustomOptionRender = {
  render: () => html`
<mlv-select>
  <label>label</label>
  <select id="complex">
    <option value="1">
      Debugger
    </option>
    <option value="2">
      Task Manager
    </option>
    <option value="3">
      CI Services
    </option>
  </select>
    <div slot="option-1" mlv-layout="row gap:xs align:vertical-center">
      <mlv-logo color="pink-rose">Db</mlv-logo>
      <p mlv-layout="column gap:xs">
        <span mlv-text="label">Debugger</span>
        <span mlv-text="body muted">some details on option 1</span>
      </p>
    </div>
    <div slot="option-2" mlv-layout="row gap:xs align:vertical-center">
      <mlv-logo color="blue-cobalt">TM</mlv-logo>
      <p mlv-layout="column gap:xs">
        <span mlv-text="label">Task Manager</span>
        <span mlv-text="body muted">some details on option 2</span>
      </p>
    </div>
    <div slot="option-3" mlv-layout="row gap:xs align:vertical-center">
      <mlv-logo color="green-mint">CI</mlv-logo>
      <p mlv-layout="column gap:xs">
        <span mlv-text="label">CI Services</span>
        <span mlv-text="body muted">some details on option 3</span>
      </p>
    </div>
  <mlv-control-message>message</mlv-control-message>
</mlv-select>
  `
}

export const Prefix = {
  render: () => html`
  <mlv-select>
    <mlv-button interaction="flat" readonly>location</mlv-button>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
  </mlv-select>
  `
};

export const Flat = {
  render: () => html`
<div mlv-layout="column gap:xl align:stretch">
  <mlv-select container="flat">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-select container="flat">
    <label>multiple</label>
    <select multiple>
      <option selected value="1">Option 1</option>
      <option selected value="2">Option 2</option>
      <option selected value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>
</div>`
};

export const Vertical = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-select>
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-select>
    <label>disabled</label>
    <select disabled>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-select>
    <label>success</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-select>

  <mlv-select>
    <label>error</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-select>
</div>`
};

export const Horizontal = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-select layout="horizontal">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-select layout="horizontal">
    <label>disabled</label>
    <select disabled>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-select layout="horizontal">
    <label>success</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-select>

  <mlv-select layout="horizontal">
    <label>error</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-select>
</div>`
};

export const Multiple = {
  render: () => html`
<mlv-select>
  <label>label</label>
  <select multiple>
    <option value="1">Option 1</option>
    <option value="2" selected>Option 2</option>
    <option value="3" selected>Option 3</option>
    <option value="4" selected>Option 4</option>
    <option value="5">Option 5</option>
  </select>
  <mlv-control-message>message</mlv-control-message>
</mlv-select>`
};

export const MultipleOverflow = {
  render: () => html`
<mlv-select style="--width: 250px">
  <label>label</label>
  <select multiple>
    <option value="1">Option 1</option>
    <option value="2" selected>Option 2</option>
    <option value="3" selected>Option 3</option>
    <option value="4" selected>Option 4</option>
    <option value="5" selected>Option 5</option>
  </select>
  <mlv-control-message>message</mlv-control-message>
</mlv-select>`
};

export const Size = {
  render: () => html`
<div mlv-layout="column gap:xl">
  <mlv-select>
    <label>label</label>
    <select size="3">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>
  <hr />
  <mlv-select layout="horizontal">
    <label>label</label>
    <select size="3">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>
</div>`
};

export const Height = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-select style="--scroll-height: 150px">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
      <option value="6">Option 6</option>
      <option value="7">Option 7</option>
      <option value="8">Option 8</option>
      <option value="9">Option 9</option>
      <option value="10">Option 10</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-select>
    <label>label</label>
    <select>
      ${new Array(100).fill('').map((_, i) => html`<option>Option ${i + 1}</option>`)}
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>
</div>`
};

export const FitText = {
  render: () => html`
<mlv-select fit-text>
  <label>label</label>
  <select>
    <option value="1">Option 1</option>
    <option value="2">Option 1234</option>
    <option value="3">Option 1234567809</option>
  </select>
  <mlv-control-message>message</mlv-control-message>
</mlv-select>`
};

export const FitContent = {
  render: () => html`
<div mlv-layout="column gap:lg">
  <mlv-select fit-content>
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 1234</option>
      <option value="3">Option 1234567809</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-select fit-content layout="horizontal">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 1234</option>
      <option value="3">Option 1234567809</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>
</div>`
};

export const Performance = {
  render: () => html`<mlv-select-performance-demo></mlv-select-performance-demo>`
}

class SelectPerformanceDemo extends LitElement {
  render() {
    return html`
  <mlv-select>
    <label>1000 options</label>
    <select>
      ${new Array(1000).fill('').map((_, i) => html`<option value="${i}">${i} item</option>`)}
    </select>
  </mlv-select>
    `;
  }
}

customElements.get('mlv-select-performance-demo') || customElements.define('mlv-select-performance-demo', SelectPerformanceDemo);