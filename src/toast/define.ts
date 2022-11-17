import { Toast } from '@elements/elements/toast';

customElements.get('mlv-toast') || customElements.define('mlv-toast', Toast);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-toast': Toast;
  }
}
