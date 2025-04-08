import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/logo/define.js';

export default {
  title: 'Elements/Select/Examples',
  component: 'nve-select',
};

export const Default = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

export const CustomOptionRender = {
  render: () => html`
<nve-select>
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
    <div slot="option-1" nve-layout="row gap:xs align:vertical-center">
      <nve-logo color="pink-rose">Db</nve-logo>
      <p nve-layout="column gap:xs">
        <span nve-text="label">Debugger</span>
        <span nve-text="body muted">some details on option 1</span>
      </p>
    </div>
    <div slot="option-2" nve-layout="row gap:xs align:vertical-center">
      <nve-logo color="blue-cobalt">TM</nve-logo>
      <p nve-layout="column gap:xs">
        <span nve-text="label">Task Manager</span>
        <span nve-text="body muted">some details on option 2</span>
      </p>
    </div>
    <div slot="option-3" nve-layout="row gap:xs align:vertical-center">
      <nve-logo color="green-mint">CI</nve-logo>
      <p nve-layout="column gap:xs">
        <span nve-text="label">CI Services</span>
        <span nve-text="body muted">some details on option 3</span>
      </p>
    </div>
  <nve-control-message>message</nve-control-message>
</nve-select>
  `
}

export const Prefix = {
  render: () => html`
  <nve-select>
    <nve-button container="flat" readonly>location</nve-button>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
  </nve-select>
  `
};

export const Flat = {
  render: () => html`
<div nve-layout="column gap:xl align:stretch">
  <nve-select container="flat">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select container="flat">
    <label>multiple</label>
    <select multiple>
      <option selected value="1">Option 1</option>
      <option selected value="2">Option 2</option>
      <option selected value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
</div>`
};

export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-select>
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>disabled</label>
    <select disabled>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>success</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message status="success">message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>error</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message status="error">message</nve-control-message>
  </nve-select>
</div>`
};

export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-select layout="horizontal">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select layout="horizontal">
    <label>disabled</label>
    <select disabled>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select layout="horizontal">
    <label>success</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message status="success">message</nve-control-message>
  </nve-select>

  <nve-select layout="horizontal">
    <label>error</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message status="error">message</nve-control-message>
  </nve-select>
</div>`
};

export const Multiple = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select multiple>
    <option value="1">Option 1</option>
    <option value="2" selected>Option 2</option>
    <option value="3" selected>Option 3</option>
    <option value="4" selected>Option 4</option>
    <option value="5">Option 5</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

export const MultipleDisabled = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select multiple disabled>
    <option value="1">Option 1</option>
    <option value="2" selected>Option 2</option>
    <option value="3" selected>Option 3</option>
    <option value="4" selected>Option 4</option>
    <option value="5">Option 5</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

export const MultipleOverflow = {
  render: () => html`
<nve-select style="--width: 250px">
  <label>label</label>
  <select multiple>
    <option value="1">Option 1</option>
    <option value="2" selected>Option 2</option>
    <option value="3" selected>Option 3</option>
    <option value="4" selected>Option 4</option>
    <option value="5" selected>Option 5</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

export const Size = {
  render: () => html`
<div nve-layout="column gap:xl">
  <nve-select>
    <label>label</label>
    <select size="5">
      <option value="1">Option 1</option>
      <option value="2" selected>Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>label</label>
    <select size="3">
      <option value="1">Option 1</option>
      <option value="2" selected>Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
</div>`
};

export const Height = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-select style="--scroll-height: 150px">
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
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>label</label>
    <select>
      ${new Array(100).fill('').map((_, i) => html`<option>Option ${i + 1}</option>`)}
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
</div>`
};

export const FitText = {
  render: () => html`
<nve-select fit-text>
  <label>label</label>
  <select>
    <option value="1">Option 1</option>
    <option value="2">Option 1234</option>
    <option value="3">Option 1234567809</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

export const FitContent = {
  render: () => html`
<div nve-layout="column gap:lg">
  <nve-select fit-content>
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 1234</option>
      <option value="3">Option 1234567809</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select fit-content layout="horizontal">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 1234</option>
      <option value="3">Option 1234567809</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
</div>`
};

export const Placeholder = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select>
    <option value="" selected disabled hidden>Select Option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

export const PlaceholderMultiple = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select multiple>
    <option value="" selected disabled hidden>Select Option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

export const Disabled = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select>
    <option value="1">Option 1</option>
    <option value="2" disabled>Option 2</option>
    <option value="3">Option 3</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

export const ViewportOverflow = {
  render: () => html`
<nve-select layout="horizontal-inline" style="margin: 30vh 0 0 60vw; max-width: 500px">
  <label>label</label>
  <select>
    <option value="1">Option 1 asfd asdf asdf asdf asdf asdf asdfasdf asdf asdf asdf asdf asdf asdf asdf</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
</nve-select>
<nve-select layout="horizontal-inline" style="margin: 55vh 0 0 60vw; max-width: 500px">
  <label>label</label>
  <select>
    <option value="1">Option 1 asfd asdf asdf asdf asdf asdf asdfasdf asdf asdf asdf asdf asdf asdf asdf</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
</nve-select>`
};

export const Performance = {
  render: () => html`
  <nve-select id="performance-select">
    <label>1000 options</label>
    <select></select>
  </nve-select>
  <script type="module">
    const select = document.querySelector('#performance-select select');
    const options = new Array(1000).fill('').map((_, i) => {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i + ' item';
      return option;
    });
    select.append(...options);
  </script>
  `
}
