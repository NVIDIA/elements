import { Tooltip } from '@elements/elements/tooltip';

customElements.get('mlv-tooltip') || customElements.define('mlv-tooltip', Tooltip);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-tooltip': Tooltip;
  }
}
