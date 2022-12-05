import { Icon } from '@elements/elements/icon';

customElements.get('nve-icon') || customElements.define('nve-icon', Icon);

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon': Icon;
  }
}
