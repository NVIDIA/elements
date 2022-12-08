import { Toast } from '@elements/elements/toast';
import '@elements/elements/icon-button/define.js';

customElements.get('mlv-toast') || customElements.define('mlv-toast', Toast);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-toast': Toast;
  }
}
