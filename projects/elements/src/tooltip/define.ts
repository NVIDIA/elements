import { Tooltip } from '@elements/elements/tooltip';

customElements.get('nve-tooltip') || customElements.define('nve-tooltip', Tooltip);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tooltip': Tooltip;
  }
}
