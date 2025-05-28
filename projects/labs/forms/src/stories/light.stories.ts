import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { FormControlMixin } from '@nvidia-elements/forms/mixin';
import './light.stories.js';

export default {
  title: 'Labs/Forms/Examples'
};

export const Light = {
  render: () => html`
<form nve-layout="column gap:lg pad:lg">
  <ui-light-card value='{"status": "on", "dim": 75}' name="office-light"></ui-light-card>
  <pre id="light-card-value"></pre>
</form>

<script type="module">
  const form = document.querySelector('form');
  const pre = document.querySelector('#light-card-value');
  const lightCard = document.querySelector('ui-light-card[name="office-light"]');
  pre.textContent = JSON.stringify(lightCard.value, null, 2);

  form.addEventListener('change', (e) => {
    pre.textContent = JSON.stringify(lightCard.value, null, 2);
    console.log('change', e.target.value, Object.fromEntries(new FormData(form)));
  });

  form.addEventListener('input', (e) => {
    pre.textContent = JSON.stringify(lightCard.value, null, 2);
    console.log('input', e.target.value, Object.fromEntries(new FormData(form)));
  });
</script>
`
};

export const Events = {
  render: () => html`
<form id="novalidate-form" nve-layout="column gap:lg pad:lg">
  <ui-light-card novalidate name="novalidate-light" value='{"status": "on", "dim": 75}'></ui-light-card>
  <pre></pre>
  <div nve-layout="row gap:sm">
    <button type="button">set invalid value</button>
    <button type="reset">reset</button>
    <button type="submit">submit</button>
  </div>
</form>

<script type="module">
  const form = document.querySelector('#novalidate-form');
  const pre = form.querySelector('pre');
  const button = form.querySelector('button');
  const light = form.querySelector('[name="novalidate-light"]');
  pre.textContent = JSON.stringify(light.value, null, 2);

  button.addEventListener('click', () => {
    light.value = { status: 'invalid', dim: -1 };
  });

  form.addEventListener('change', (e) => {
    pre.textContent = JSON.stringify(light.value, null, 2);
    console.log('change', e.target.value);
  });

  form.addEventListener('input', (e) => {
    pre.textContent = JSON.stringify(light.value, null, 2);
    console.log('input', e.target.value);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    pre.textContent = JSON.stringify(light.value, null, 2);
    console.log('submit', Object.fromEntries(new FormData(form)));
  });

  form.addEventListener('reset', (e) => {
    // reset event fires before the value is reset
    setTimeout(() => {
      pre.textContent = JSON.stringify(light.value, null, 2);
      console.log('reset', Object.fromEntries(new FormData(form)));
    });
  });

  light.addEventListener('invalid', (e) => {
    pre.textContent = JSON.stringify(light.value, null, 2);
    console.log('invalid', Object.fromEntries(new FormData(form)));
  });
</script>
`
};

const styles = /* css */ `
:host,
*,
*:before,
*:after {
  box-sizing: border-box;
}

:host {
  display: block;
  max-width: 240px;
}

:host(:invalid) {
  outline: 2px dashed red;
}

form {
  position: relative;
  min-width: 50px;
  min-height: 50px;
  display: flex;
  align-items: center;
  gap: var(--nve-ref-space-xs);
  background: var(--nve-sys-interaction-background-200);
  padding: var(--nve-ref-size-300);
  border-radius: var(--nve-ref-border-radius-lg);
}

nve-icon {
  position: absolute;
  top: 16px;
  left: 16px;
  pointer-events: none;
  z-index: 99;
}

input[name='status'] {
  opacity: 0;
  height: 20px;
  width: 20px;
}
`;

export interface LightCardValue {
  status: 'off' | 'on';
  dim: number;
}

/**
 * Example of a custom element that uses the FormControlMixin with LitElement
 */
export class LightCard extends FormControlMixin<typeof LitElement, LightCardValue>(LitElement) {
  static readonly metadata = {
    tag: 'ui-light-card',
    version: '0.0.0',
    strict: false,
    valueSchema: {
      type: 'object' as const,
      properties: {
        status: {
          type: 'enum' as const,
          enum: ['off', 'on']
        },
        dim: {
          type: 'number' as const,
          minimum: 0,
          maximum: 100
        }
      },
      required: ['status', 'dim']
    }
  };

  static styles = unsafeCSS(styles);

  render() {
    return this.value
      ? html`
    <form @input=${this.#updateValue} @change=${this.#updateValue}>
      <nve-icon size="lg" name="lightbulb" style="--color: ${this.value.status === 'on' ? 'var(--nve-ref-color-yellow-nova-900)' : 'initial'}; opacity: ${this.value.status === 'on' ? this.value.dim / 100 + 0.3 : 0.5};"></nve-icon>
      ${
        this.readOnly
          ? nothing
          : html`
        <input type="checkbox" name="status" .checked=${this.value.status === 'on'} ?disabled=${this.readOnly} aria-label="Light Status">
        <input type="range" name="dim" .valueAsNumber=${this.value.dim} ?disabled=${this.readOnly} min=${LightCard.metadata.valueSchema.properties.dim.minimum ?? 0} max=${LightCard.metadata.valueSchema.properties.dim.maximum ?? 100} aria-label="Light Dim">
      `
      }
    </form>`
      : nothing;
  }

  constructor() {
    super();
    this.value = { status: 'off', dim: 50 };
  }

  #updateValue(event: Event) {
    const form = this.shadowRoot?.querySelector('form') as HTMLFormElement;
    this.value = { status: form.status.checked ? 'on' : 'off', dim: form.dim.valueAsNumber };
    this.dispatchUpdateEvent(event.type as 'input' | 'change');
  }
}

customElements.get('ui-light-card') ?? customElements.define('ui-light-card', LightCard);