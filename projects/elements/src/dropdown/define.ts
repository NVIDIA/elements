import { Dropdown } from '@elements/elements/dropdown';

customElements.get('nve-dropdown') || customElements.define('nve-dropdown', Dropdown);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dropdown': Dropdown;
  }
}
