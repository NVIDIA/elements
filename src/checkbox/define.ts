import { Checkbox, CheckboxGroup } from '@elements/elements/checkbox';
import '@elements/elements/forms/define.js';

customElements.get('nve-checkbox') || customElements.define('nve-checkbox', Checkbox);
customElements.get('nve-checkbox-group') || customElements.define('nve-checkbox-group', CheckboxGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-checkbox': Checkbox;
    'nve-checkbox-group': CheckboxGroup;
  }
}
