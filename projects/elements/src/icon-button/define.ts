import { IconButton } from '@elements/elements/icon-button';
import '@elements/elements/icon/define.js';

customElements.get('nve-icon-button') || customElements.define('nve-icon-button', IconButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon-button': IconButton;
  }
}
