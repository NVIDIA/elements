import { Dropdown } from '@elements/elements/dropdown';

customElements.get('mlv-dropdown') || customElements.define('mlv-dropdown', Dropdown);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-dropdown': Dropdown;
  }
}
