import { html, LitElement } from 'lit';
import '@elements/elements/forms/define.js';
import 'emoji-picker-element';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';

export default {
  title: 'Forms/Control/Examples'
}

export const control = () => {
  return html`
<mlv-control>
  <label>label</label>
  <input />
  <mlv-control-message>message</mlv-control-message>
</mlv-control>`;
};

export const responsive = () => {
  return html`
  <div style="padding: 12px; border: 1px solid #ccc; overflow-y: auto; resize: horizontal;">
    <mlv-control-group layout="horizontal-inline">
      <label>label</label>
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
  </div>
  `;
};

export const controlLayout = () => {
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

export const controlValidation = () => {
  return html`
<mlv-control>
  <label>validation</label>
  <input required />
  <mlv-control-message>message</mlv-control-message>
  <mlv-control-message error="valueMissing">required</mlv-control-message>
</mlv-control>`;
}

export const noLabelControl = () => {
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

export const dateControl = () => {
  return html`
<mlv-control>
  <label>date</label>
  <input type="date" />
  <mlv-control-message>message</mlv-control-message>
</mlv-control>`;
};

export const textareaControl = () => {
  return html`
<mlv-control>
  <label>about</label>
  <textarea></textarea>
  <mlv-control-message>message</mlv-control-message>
</mlv-control>`;
}

export const datalist = () => {
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

export const status = () => {
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

export const selectmenuExperimental = () => {
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
    background: var(--mlv-sys-interaction-default-background);
    color: var(--mlv-sys-interaction-default-color);
    border-radius: var(--mlv-ref-border-radius-sm);
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
    color: var(--mlv-sys-interaction-default-color);
    border: 0;
    padding: 12px;
  }

  selectmenu option:hover {
    background: var(--mlv-sys-interaction-default-hover-background);
  }

  selectmenu option::before {
    content: '';
    width: 1rem;
    height: 1rem;
    background-repeat: no-repeat;
    background-size: contain;
  }

  selectmenu::part(listbox) {
    background: var(--mlv-sys-interaction-default-background);
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
class Emoji extends LitElement {
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

export const custom = () => {
  return html`
<mlv-control layout="horizontal">
  <label>custom emoji</label>
  <my-emoji mlv-control></my-emoji>
  <mlv-control-message status="error">message</mlv-control-message>
</mlv-control>

<p id="emoji"></p>

<script>
  document.querySelector('my-emoji').addEventListener('change', e => {
    document.querySelector('#emoji').textContent = e.target.value;
  });
</script>
`;
};
