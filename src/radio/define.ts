import { Radio, RadioGroup } from '@elements/elements/radio';
import '@elements/elements/forms/define.js';

customElements.get('nve-radio') || customElements.define('nve-radio', Radio);
customElements.get('nve-radio-group') || customElements.define('nve-radio-group', RadioGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-radio': Radio;
    'nve-radio-group': RadioGroup;
  }
}
