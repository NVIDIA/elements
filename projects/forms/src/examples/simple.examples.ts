import { css, html, LitElement, nothing } from 'lit';
import { FormControlMixin } from '@nvidia-elements/forms/mixin';

export default {
  title: 'Labs/Forms/Examples'
};

/**
 * @summary Quality control form with checkbox inputs and schema-based validation.
 * @tags test-case
 */
export const QualityCheck = {
  render: () => html`
<form nve-layout="column gap:lg pad:lg">
  <ui-quality-control value='{"good": true, "fast": true, "cheap": false}' name="quality"></ui-quality-control>
  <pre id="quality-control-value"></pre>
</form>

<script type="module">
  const form = document.querySelector('form');
  const pre = document.querySelector('#quality-control-value');
  const qualityControl = document.querySelector('ui-quality-control[name="quality"]');
  pre.textContent = JSON.stringify(qualityControl.value, null, 2);

  form.addEventListener('change', (e) => {
    pre.textContent = JSON.stringify(qualityControl.value, null, 2);
    console.log('change', e.target.value, Object.fromEntries(new FormData(form)));
  });

  form.addEventListener('input', (e) => {
    pre.textContent = JSON.stringify(qualityControl.value, null, 2);
    console.log('input', e.target.value, Object.fromEntries(new FormData(form)));
  });
</script>
`
};

/**
 * @summary Quality control form events with strict mode toggle and invalid state handling.
 * @tags test-case
 */
export const Events = {
  render: () => html`
<form id="simple-events-form" nve-layout="column gap:lg pad:lg">
  <ui-quality-control name="quality" value='{"good": true, "fast": true, "cheap": false}'></ui-quality-control>
  <pre></pre>
  <div nve-layout="row gap:sm">
    <button type="button">set invalid value</button>
    <button type="reset">reset</button>
    <button type="submit">submit</button>
    <label>
      <input type="checkbox" name="strict" checked />
      strict mode
    </label>
  </div>
</form>

<script type="module">
  const form = document.querySelector('#simple-events-form');
  const pre = form.querySelector('pre');
  const button = form.querySelector('button');
  const qualityControl = form.querySelector('[name="quality"]');
  const strict = form.querySelector('[name="strict"]');
  pre.textContent = JSON.stringify(qualityControl.value, null, 2);

  strict.addEventListener('change', (e) => {
    qualityControl.constructor.metadata.strict = e.target.checked;
  });

  button.addEventListener('click', () => {
    qualityControl.value = { good: true, fast: true, cheap: true };
    console.log('click', qualityControl.value);
  });

  form.addEventListener('change', (e) => {
    pre.textContent = JSON.stringify(qualityControl.value, null, 2);
    console.log('change', e.target.value);
  });

  form.addEventListener('input', (e) => {
    pre.textContent = JSON.stringify(qualityControl.value, null, 2);
    console.log('input', e.target.value);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    pre.textContent = JSON.stringify(qualityControl.value, null, 2);
    console.log('submit', Object.fromEntries(new FormData(form)));
  });

  form.addEventListener('reset', (e) => {
    // reset event fires before the value is reset
    setTimeout(() => {
      pre.textContent = JSON.stringify(qualityControl.value, null, 2);
      console.log('reset', Object.fromEntries(new FormData(form)));
    });
  });

  qualityControl.addEventListener('invalid', (e) => {
    console.log('invalid', Object.fromEntries(new FormData(form)));
  });
</script>
`
};

export interface QualityControlValue {
  good: boolean;
  fast: boolean;
  cheap: boolean;
}

function qualityValidator(value: unknown) {
  const v = value as QualityControlValue;
  if (v.good && v.fast && v.cheap) {
    return {
      validity: { badInput: true },
      message: 'at least one value must be false'
    };
  }
  return { validity: { } };
}

/**
 * Custom element integrating the FormControlMixin with LitElement for form validation.
 */
export class QualityControl extends FormControlMixin<typeof LitElement, QualityControlValue>(LitElement) {
  static styles = [
    css`
    :host {
      display: block;
    }

    :host(:invalid) {
      outline: 2px dashed red;
    }
    `
  ];

  static readonly metadata = {
    tag: 'ui-quality-control',
    version: '0.0.0',
    strict: true,
    validators: [qualityValidator],
    valueSchema: {
      type: 'object' as const,
      properties: {
        good: {
          type: 'boolean' as const
        },
        fast: {
          type: 'boolean' as const
        },
        cheap: {
          type: 'boolean' as const
        }
      },
      required: ['good', 'fast', 'cheap']
    }
  };

  render() {
    return this.value
      ? html`
    <form @input=${this.#updateValue} @change=${this.#updateValue}>
      <label>
        <input type="checkbox" name="good" .checked=${this.value.good} ?disabled=${this.disabled || this.readOnly} aria-label="Good">
        Good
      </label>
      <label>
        <input type="checkbox" name="fast" .checked=${this.value.fast} ?disabled=${this.disabled || this.readOnly} aria-label="Fast">
        Fast
      </label>
      <label>
        <input type="checkbox" name="cheap" .checked=${this.value.cheap} ?disabled=${this.disabled || this.readOnly} aria-label="Cheap">
        Cheap
      </label>
    </form>`
      : nothing;
  }

  constructor() {
    super();
    this.value = { good: true, fast: true, cheap: true };
  }

  #updateValue(event: Event) {
    const form = this.shadowRoot?.querySelector('form') as HTMLFormElement;
    this.value = { good: form.good.checked, fast: form.fast.checked, cheap: form.cheap.checked };
    this.dispatchUpdateEvent(event.type as 'input' | 'change');
  }
}

customElements.get('ui-quality-control') ?? customElements.define('ui-quality-control', QualityControl);