import { IconButton } from '@elements/elements/icon-button';

customElements.get('mlv-icon-button') || customElements.define('mlv-icon-button', IconButton);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-icon-button': IconButton;
  }
}
