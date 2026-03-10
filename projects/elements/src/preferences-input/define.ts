import { define } from '@nvidia-elements/core/internal';
import { PreferencesInput } from '@nvidia-elements/core/preferences-input';

define(PreferencesInput);

declare global {
  interface HTMLElementTagNameMap {
    'nve-preferences-input': PreferencesInput;
  }
}
