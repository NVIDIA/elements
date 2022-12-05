import { Button } from '@elements/elements/button';

customElements.get('nve-button') || customElements.define('nve-button', Button);

declare global {
  interface HTMLElementTagNameMap {
    'nve-button': Button;
  }
}
