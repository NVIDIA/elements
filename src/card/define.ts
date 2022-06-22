import { Card } from '@elements/elements/card';

customElements.get('nve-card') || customElements.define('nve-card', Card);

declare global {
  interface HTMLElementTagNameMap {
    'nve-card': Card;
  }
}
