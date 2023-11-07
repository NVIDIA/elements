import { define } from '@elements/elements/internal';
import { Icon, mergeIcons } from '@elements/elements/icon';

define(Icon);
mergeIcons(customElements.get('nve-icon') as typeof Icon);

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon': Icon;
  }
}
