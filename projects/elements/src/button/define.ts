import { Button } from '@elements/elements/button';

customElements.get('mlv-button') || customElements.define('mlv-button', Button);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-button': Button;
  }
}
