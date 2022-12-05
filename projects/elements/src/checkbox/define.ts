import { Checkbox, CheckboxGroup } from '@elements/elements/checkbox';
import '@elements/elements/forms/define.js';

customElements.get('mlv-checkbox') || customElements.define('mlv-checkbox', Checkbox);
customElements.get('mlv-checkbox-group') || customElements.define('mlv-checkbox-group', CheckboxGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-checkbox': Checkbox;
    'mlv-checkbox-group': CheckboxGroup;
  }
}
