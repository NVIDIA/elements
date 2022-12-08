import { Dropdown } from '@elements/elements/dropdown';
import '@elements/elements/icon-button/define.js';

customElements.get('mlv-dropdown') || customElements.define('mlv-dropdown', Dropdown);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-dropdown': Dropdown;
  }
}
