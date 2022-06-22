import { Card } from '@elements/elements/card';

customElements.get('mlv-card') || customElements.define('mlv-card', Card);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-card': Card;
  }
}
