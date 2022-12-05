import { Icon } from '@elements/elements/icon';

customElements.get('mlv-icon') || customElements.define('mlv-icon', Icon);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-icon': Icon;
  }
}
