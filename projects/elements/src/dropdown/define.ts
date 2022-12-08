import { Dropdown } from '@elements/elements/dropdown';
import '@elements/elements/icon-button/define.js';

customElements.get('nve-dropdown') || customElements.define('nve-dropdown', Dropdown);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dropdown': Dropdown;
  }
}
