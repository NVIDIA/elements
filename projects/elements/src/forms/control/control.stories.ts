import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import 'emoji-picker-element';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/textarea/define.js';
import '@nvidia-elements/core/checkbox/define.js';

export default {
  title: 'Foundations/Forms/Examples',
}

export const Control = () => {
  return html`
<mlv-control>
  <label>label</label>
  <input />
  <mlv-control-message>message</mlv-control-message>
</mlv-control>`;
};

export const Responsive = () => {
  return html`
  <div mlv-layout="column gap:lg" style="padding: 12px; border: 1px solid #ccc; overflow-y: auto; resize: horizontal; max-width: 600px;">
    <mlv-input layout="horizontal">
      <label>text label</label>
      <input />
      <mlv-control-message>message</mlv-control-message>
    </mlv-input>
    <mlv-select layout="horizontal">
      <label>select label</label>
      <select>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </select>
      <mlv-control-message>message</mlv-control-message>
    </mlv-select>
    <mlv-search layout="horizontal-inline">
      <label>search label</label>
      <input type="search" placeholder="search" />
    </mlv-search>
    <mlv-checkbox-group layout="horizontal-inline">
      <label>checkbox label</label>
      <mlv-checkbox>
        <label>local</label>
        <input type="checkbox" name="checkbox-group" value="1" checked />
      </mlv-checkbox>
      <mlv-checkbox>
        <label>staging</label>
        <input type="checkbox" name="checkbox-group" value="2" />
      </mlv-checkbox>
      <mlv-checkbox>
        <label>production</label>
        <input type="checkbox" name="checkbox-group" value="3" />
      </mlv-checkbox>
      <mlv-control-message>message</mlv-control-message>
    </mlv-checkbox-group>
    <mlv-range layout="horizontal-inline">
      <label>label</label>
      <input type="range" />
      <mlv-control-message>message</mlv-control-message>
    </mlv-range>
    <mlv-textarea layout="horizontal-inline">
      <label>label</label>
      <textarea></textarea>
    </mlv-textarea>
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

  mlv-control {
    outline: 1px solid red;
  }

  mlv-control-group {
    outline: 1px solid blue;
  }
</style>
<div style="">
  <mlv-control>
    <label>vertical</label>
    <input />
  </mlv-control>

  <mlv-control>
    <label>vertical</label>
    <input />
    <mlv-control-message>message</mlv-control-message>
  </mlv-control>

  <mlv-control layout="horizontal">
    <label>horizontal</label>
    <input />
  </mlv-control>

  <mlv-control layout="horizontal">
    <label>horizontal</label>
    <input />
    <mlv-control-message>message</mlv-control-message>
  </mlv-control>

  <mlv-control-group layout="vertical">
    <label>vertical</label>
    <mlv-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </mlv-control>
    <mlv-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </mlv-control>
    <mlv-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </mlv-control>
    <mlv-control-message>message</mlv-control-message>
  </mlv-control-group>

  <mlv-control-group layout="vertical">
    <label>vertical</label>
    <mlv-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </mlv-control>
    <mlv-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </mlv-control>
    <mlv-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </mlv-control>
  </mlv-control-group>

  <mlv-control-group layout="vertical-inline">
    <label>vertical-inline</label>
    <mlv-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </mlv-control>
    <mlv-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </mlv-control>
    <mlv-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </mlv-control>
    <mlv-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </mlv-control>
    <mlv-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </mlv-control>
    <mlv-control-message>message</mlv-control-message>
  </mlv-control-group>

  <mlv-control-group layout="vertical-inline">
    <label>vertical-inline</label>
    <mlv-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </mlv-control>
    <mlv-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </mlv-control>
    <mlv-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </mlv-control>
  </mlv-control-group>

  <mlv-control-group layout="horizontal">
    <label>horizontal</label>
    <mlv-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </mlv-control>
    <mlv-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </mlv-control>
    <mlv-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </mlv-control>
    <mlv-control-message>message</mlv-control-message>
  </mlv-control-group>

  <mlv-control-group layout="horizontal">
    <label>horizontal</label>
    <mlv-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </mlv-control>
    <mlv-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </mlv-control>
    <mlv-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </mlv-control>
  </mlv-control-group>

  <mlv-control-group layout="horizontal-inline">
    <label>horizontal-inline</label>
    <mlv-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </mlv-control>
    <mlv-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </mlv-control>
    <mlv-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </mlv-control>
    <mlv-control-message>message</mlv-control-message>
  </mlv-control-group>

  <mlv-control-group layout="horizontal-inline">
    <label>horizontal-inline</label>
    <mlv-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </mlv-control>
    <mlv-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </mlv-control>
    <mlv-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </mlv-control>
  </mlv-control-group>
</div>`;
};

export const ControlValidation = () => {
  return html`
<mlv-control>
  <label>validation</label>
  <input required />
  <mlv-control-message>message</mlv-control-message>
  <mlv-control-message error="valueMissing">required</mlv-control-message>
</mlv-control>`;
}

export const NoLabelControl = () => {
  return html`
<mlv-control>
  <input type="search" aria-label="search" placeholder="search" />
</mlv-control>`;
}

export const inlineControl = () => {
  return html`
<mlv-control>
  <label>enable logging</label>
  <input type="checkbox" checked />
</mlv-control>`;
}

export const controlGroup = () => {
  return html`
<mlv-control-group>
  <label>environment</label>
  <mlv-control>
    <label>local</label>
    <input type="radio" name="radio-group" value="1" checked />
  </mlv-control>
  <mlv-control>
    <label>staging</label>
    <input type="radio" name="radio-group" value="2" />
  </mlv-control>
  <mlv-control>
    <label>production</label>
    <input type="radio" name="radio-group" value="3" />
  </mlv-control>
  <mlv-control-message>message</mlv-control-message>
</mlv-control-group>

<br />

<mlv-control-group>
  <label>environment</label>
  <mlv-control>
    <label>local</label>
    <input type="checkbox" name="checkbox-group" value="1" checked />
  </mlv-control>
  <mlv-control>
    <label>staging</label>
    <input type="checkbox" name="checkbox-group" value="2" />
  </mlv-control>
  <mlv-control>
    <label>production</label>
    <input type="checkbox" name="checkbox-group" value="3" />
  </mlv-control>
  <mlv-control-message>message</mlv-control-message>
</mlv-control-group>
`;
}

export const DateControl = () => {
  return html`
<mlv-control>
  <label>date</label>
  <input type="date" />
  <mlv-control-message>message</mlv-control-message>
</mlv-control>`;
};

export const TextareaControl = () => {
  return html`
<mlv-control>
  <label>about</label>
  <textarea></textarea>
  <mlv-control-message>message</mlv-control-message>
</mlv-control>`;
}

export const Datalist = () => {
  return html`
<mlv-control>
  <label>search</label>
  <input type="search" />
  <datalist>
    <option value="option 1"></option>
    <option value="option 2"></option>
    <option value="option 3"></option>
  </datalist>
</mlv-control>`;
};

export const Status = () => {
  return html`
<mlv-control>
  <label>label</label>
  <input />
  <mlv-control-message>message</mlv-control-message>
</mlv-control>

<br />

<mlv-control>
  <label>disabled</label>
  <input disabled />
  <mlv-control-message>message</mlv-control-message>
</mlv-control>

<br />

<mlv-control>
  <label>success</label>
  <input />
  <mlv-control-message status="success">message</mlv-control-message>
</mlv-control>

<br />

<mlv-control>
  <label>error</label>
  <input />
  <mlv-control-message status="error">message</mlv-control-message>
</mlv-control>`;
};

export const SelectmenuExperimental = () => {
  return html`
<mlv-control layout="vertical">
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
  <mlv-control-message>message</mlv-control-message>
</mlv-control>
<style>
  selectmenu {
    width: 100%;
  }

  selectmenu button {
    background: var(--mlv-sys-interaction-background);
    color: var(--mlv-sys-interaction-color);
    border-radius: var(--mlv-ref-border-radius-sm);
    width: 100%;
    border: 0;
    height: 32px;
    text-align: left;
  }

  selectmenu option {
    --background: var(--mlv-sys-interaction-background);
    --mlv-sys-interaction-state-base: var(--mlv-sys-interaction-background);
    cursor: pointer;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    color: var(--mlv-sys-interaction-color);
    border: 0;
    padding: 12px;
  }

  selectmenu option::before {
    content: '';
    width: 1rem;
    height: 1rem;
    background-repeat: no-repeat;
    background-size: contain;
  }

  selectmenu option {
    background-image: linear-gradient(color-mix(in oklab, var(--mlv-sys-interaction-state-base) 100%, var(--mlv-sys-interaction-state-mix) var(--mlv-sys-interaction-state-ratio)) 0 0) !important;
  }

  selectmenu option:hover{
    --mlv-sys-interaction-state-ratio: var(--mlv-sys-interaction-state-ratio-hover);
  }

  selectmenu option:active {
    --mlv-sys-interaction-state-ratio: var(--mlv-sys-interaction-state-ratio-active);
  }

  selectmenu::part(listbox) {
    background: var(--mlv-sys-interaction-background);
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
      <emoji-picker class="dark" style="height: 250px; width: 350px; --background: var(--mlv-sys-layer-container-background);"></emoji-picker>
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
<mlv-control>
  <label>custom emoji label</label>
  <my-emoji nve-control></my-emoji>
  <mlv-control-message>message <span id="emoji"></span></mlv-control-message>
</mlv-control>
<script>
  document.querySelector('my-emoji').addEventListener('change', e => {
    document.querySelector('#emoji').textContent = e.target.value;
  });
</script>
`;
};
