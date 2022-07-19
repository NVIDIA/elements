import { IconButton } from '@elements/elements/icon-button';

customElements.get('nve-icon-button') || customElements.define('nve-icon-button', IconButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon-button': IconButton;
  }
}
