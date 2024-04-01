import { define } from '@nvidia-elements/core/internal';
import { ButtonGroup } from '@nvidia-elements/core/button-group';

define(ButtonGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-button-group': ButtonGroup;
  }
}
