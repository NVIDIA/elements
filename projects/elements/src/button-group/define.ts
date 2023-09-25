import { define } from '@elements/elements/internal';
import { ButtonGroup } from '@elements/elements/button-group';

define(ButtonGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-button-group': ButtonGroup;
  }
}
