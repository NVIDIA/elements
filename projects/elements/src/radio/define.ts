import { Radio, RadioGroup } from '@elements/elements/radio';
import '@elements/elements/forms/define.js';

customElements.get('mlv-radio') || customElements.define('mlv-radio', Radio);
customElements.get('mlv-radio-group') || customElements.define('mlv-radio-group', RadioGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-radio': Radio;
    'mlv-radio-group': RadioGroup;
  }
}
