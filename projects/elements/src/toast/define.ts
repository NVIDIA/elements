import { Toast } from '@elements/elements/toast';

customElements.get('nve-toast') || customElements.define('nve-toast', Toast);

declare global {
  interface HTMLElementTagNameMap {
    'nve-toast': Toast;
  }
}
