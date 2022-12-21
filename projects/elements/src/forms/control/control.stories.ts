import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import 'emoji-picker-element';
import '@elements/elements/forms/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/search/define.js';
import '@elements/elements/range/define.js';
import '@elements/elements/textarea/define.js';
import '@elements/elements/checkbox/define.js';

export default {
  title: 'Foundations/Forms/Examples',
  parameters: { badges: ['beta'] }
}

export const Control = () => {
  return html`
<nve-control>
  <label>label</label>
  <input />
  <nve-control-message>message</nve-control-message>
</nve-control>`;
};

export const Responsive = () => {
  return html`
  <div nve-layout="column gap:lg" style="padding: 12px; border: 1px solid #ccc; overflow-y: auto; resize: horizontal; max-width: 600px;">
    <nve-input layout="horizontal">
      <label>text label</label>
      <input />
      <nve-control-message>message</nve-control-message>
    </nve-input>
    <nve-select layout="horizontal">
      <label>select label</label>
      <select>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </select>
      <nve-control-message>message</nve-control-message>
    </nve-select>
    <nve-search layout="horizontal-inline">
      <label>search label</label>
      <input type="search" placeholder="search" />
    </nve-search>
    <nve-checkbox-group layout="horizontal-inline">
      <label>checkbox label</label>
      <nve-checkbox>
        <label>local</label>
        <input type="checkbox" name="checkbox-group" value="1" checked />
      </nve-checkbox>
      <nve-checkbox>
        <label>staging</label>
        <input type="checkbox" name="checkbox-group" value="2" />
      </nve-checkbox>
      <nve-checkbox>
        <label>production</label>
        <input type="checkbox" name="checkbox-group" value="3" />
      </nve-checkbox>
      <nve-control-message>message</nve-control-message>
    </nve-checkbox-group>
    <nve-range layout="horizontal-inline">
      <label>label</label>
      <input type="range" />
      <nve-control-message>message</nve-control-message>
    </nve-range>
    <nve-textarea layout="horizontal-inline">
      <label>label</label>
      <textarea></textarea>
    </nve-textarea>
  </div>
  `;
};

export const ControlLayout = () => {
  return html`
<style>
  div {
    display: flex;
    gap: 48px;
    flex-direction: column;
  }

  nve-control {
    outline: 1px solid red;
  }

  nve-control-group {
    outline: 1px solid blue;
  }
</style>
<div style="">
  <nve-control>
    <label>vertical</label>
    <input />
  </nve-control>

  <nve-control>
    <label>vertical</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-control>

  <nve-control layout="horizontal">
    <label>horizontal</label>
    <input />
  </nve-control>

  <nve-control layout="horizontal">
    <label>horizontal</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-control>

  <nve-control-group layout="vertical">
    <label>vertical</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
    <nve-control-message>message</nve-control-message>
  </nve-control-group>

  <nve-control-group layout="vertical">
    <label>vertical</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
  </nve-control-group>

  <nve-control-group layout="vertical-inline">
    <label>vertical-inline</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
    <nve-control-message>message</nve-control-message>
  </nve-control-group>

  <nve-control-group layout="vertical-inline">
    <label>vertical-inline</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
  </nve-control-group>

  <nve-control-group layout="horizontal">
    <label>horizontal</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
    <nve-control-message>message</nve-control-message>
  </nve-control-group>

  <nve-control-group layout="horizontal">
    <label>horizontal</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
  </nve-control-group>

  <nve-control-group layout="horizontal-inline">
    <label>horizontal-inline</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
    <nve-control-message>message</nve-control-message>
  </nve-control-group>

  <nve-control-group layout="horizontal-inline">
    <label>horizontal-inline</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
  </nve-control-group>
</div>`;
};

export const ControlValidation = () => {
  return html`
<nve-control>
  <label>validation</label>
  <input required />
  <nve-control-message>message</nve-control-message>
  <nve-control-message error="valueMissing">required</nve-control-message>
</nve-control>`;
}

export const NoLabelControl = () => {
  return html`
<nve-control>
  <input type="search" aria-label="search" placeholder="search" />
</nve-control>`;
}

export const inlineControl = () => {
  return html`
<nve-control>
  <label>enable logging</label>
  <input type="checkbox" checked />
</nve-control>`;
}

export const controlGroup = () => {
  return html`
<nve-control-group>
  <label>environment</label>
  <nve-control>
    <label>local</label>
    <input type="radio" name="radio-group" value="1" checked />
  </nve-control>
  <nve-control>
    <label>staging</label>
    <input type="radio" name="radio-group" value="2" />
  </nve-control>
  <nve-control>
    <label>production</label>
    <input type="radio" name="radio-group" value="3" />
  </nve-control>
  <nve-control-message>message</nve-control-message>
</nve-control-group>

<br />

<nve-control-group>
  <label>environment</label>
  <nve-control>
    <label>local</label>
    <input type="checkbox" name="checkbox-group" value="1" checked />
  </nve-control>
  <nve-control>
    <label>staging</label>
    <input type="checkbox" name="checkbox-group" value="2" />
  </nve-control>
  <nve-control>
    <label>production</label>
    <input type="checkbox" name="checkbox-group" value="3" />
  </nve-control>
  <nve-control-message>message</nve-control-message>
</nve-control-group>
`;
}

export const DateControl = () => {
  return html`
<nve-control>
  <label>date</label>
  <input type="date" />
  <nve-control-message>message</nve-control-message>
</nve-control>`;
};

export const TextareaControl = () => {
  return html`
<nve-control>
  <label>about</label>
  <textarea></textarea>
  <nve-control-message>message</nve-control-message>
</nve-control>`;
}

export const Datalist = () => {
  return html`
<nve-control>
  <label>search</label>
  <input type="search" />
  <datalist>
    <option value="option 1"></option>
    <option value="option 2"></option>
    <option value="option 3"></option>
  </datalist>
</nve-control>`;
};

export const Status = () => {
  return html`
<nve-control>
  <label>label</label>
  <input />
  <nve-control-message>message</nve-control-message>
</nve-control>

<br />

<nve-control>
  <label>disabled</label>
  <input disabled />
  <nve-control-message>message</nve-control-message>
</nve-control>

<br />

<nve-control>
  <label>success</label>
  <input />
  <nve-control-message status="success">message</nve-control-message>
</nve-control>

<br />

<nve-control>
  <label>error</label>
  <input />
  <nve-control-message status="error">message</nve-control-message>
</nve-control>`;
};

declare global {
  interface HTMLElementTagNameMap {
    "selectmenu": HTMLInputElement;
  }
}

export const SelectmenuExperimental = () => {
  return html`
<nve-control layout="vertical">
  <label>selectmenu</label>
  <selectmenu>
    <div slot="button" behavior="button">
      <button behavior="selected-value">Chrome</button>
    </div>
    <option value="edge" checked="">Edge</option>
    <option value="chrome">Chrome</option>
    <option value="firefox">Firefox</option>
    <option value="safari">Safari</option>
  </selectmenu>
  <nve-control-message>message</nve-control-message>
</nve-control>
<style>
  selectmenu {
    width: 100%;
  }

  selectmenu button {
    background: var(--nve-sys-interaction-default-background);
    color: var(--nve-sys-interaction-default-color);
    border-radius: var(--nve-ref-border-radius-sm);
    width: 100%;
    border: 0;
    height: 32px;
    text-align: left;
  }

  selectmenu option {
    cursor: pointer;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    color: var(--nve-sys-interaction-default-color);
    border: 0;
    padding: 12px;
  }

  selectmenu option:hover {
    background: var(--nve-sys-interaction-default-hover-background);
  }

  selectmenu option::before {
    content: '';
    width: 1rem;
    height: 1rem;
    background-repeat: no-repeat;
    background-size: contain;
  }

  selectmenu::part(listbox) {
    background: var(--nve-sys-interaction-default-background);
    padding: 0;
    border: 0;
  }

  selectmenu option[value="firefox"]::before {
    background-image: url("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Firefox_logo%2C_2019.svg/1200px-Firefox_logo%2C_2019.svg.png");
  }

  selectmenu option[value="chrome"]::before {
    background-image: url("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Chrome_icon_%28September_2014%29.svg/1200px-Google_Chrome_icon_%28September_2014%29.svg.png");
  }

  selectmenu option[value="safari"]::before {
    background-image: url("https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Safari_browser_logo.svg/1200px-Safari_browser_logo.svg.png");
  }

  selectmenu option[value="edge"]::before {
    background-image: url("https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Microsoft_Edge_logo_%282019%29.svg/1200px-Microsoft_Edge_logo_%282019%29.svg.png");
  }
</style>
  `;
}

@customElement('my-emoji')
class EmojiDemo extends LitElement {
  @property({ type: String }) value = '';

  static formAssociated = true;

  #internals = this.attachInternals();

  render() {
    return html`
      <emoji-picker class="dark" style="height: 250px; width: 350px; --background: var(--nve-sys-layer-container-background);"></emoji-picker>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();
    this.setAttribute('ui-control', '');
    Object.defineProperty(this, 'form', { get: () => this.#internals.form });
    Object.defineProperty(this, 'name', { get: () => this.getAttribute('name') });
    Object.defineProperty(this, 'type', { get: () => this.localName });
    Object.defineProperty(this, 'validity', { get: () => this.#internals.validity });
    Object.defineProperty(this, 'validationMessage', { get: () => this.#internals.validationMessage });
    Object.defineProperty(this, 'willValidate', { get: () => this.#internals.willValidate });

    await this.updateComplete;
    this.shadowRoot.querySelector('emoji-picker').addEventListener('emoji-click', e => {
      this.value = e.detail.unicode;
      this.#internals.setFormValue(this.value);
      console.log(this.value);
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    });
  }

  checkValidity() {
    this.#internals.checkValidity();
  }

  reportValidity() {
    this.#internals.reportValidity();
  }
}

export const Custom = () => {
  return html`
<nve-control>
  <label>custom emoji label</label>
  <my-emoji nve-control></my-emoji>
  <nve-control-message>message <span id="emoji"></span></nve-control-message>
</nve-control>
<script>
  document.querySelector('my-emoji').addEventListener('change', e => {
    document.querySelector('#emoji').textContent = e.target.value;
  });
</script>
`;
};
