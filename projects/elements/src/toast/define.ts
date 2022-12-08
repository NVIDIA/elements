import { Toast } from '@elements/elements/toast';
import '@elements/elements/icon-button/define.js';

customElements.get('nve-toast') || customElements.define('nve-toast', Toast);

declare global {
  interface HTMLElementTagNameMap {
    'nve-toast': Toast;
  }
}
