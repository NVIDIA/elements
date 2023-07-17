import { define } from '@elements/elements/internal';
import { Icon } from '@elements/elements/icon';

define(Icon);

Icon.alias({
  'chevron': 'chevron-up',
  'fast-foward': 'fast-forward'
});

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon': Icon;
  }
}
