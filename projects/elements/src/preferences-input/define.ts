import { define } from '@nvidia-elements/core/internal';
import { PreferencesInput } from '@nvidia-elements/core/preferences-input';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/switch/define.js';

define(PreferencesInput);

declare global {
  interface HTMLElementTagNameMap {
    'nve-preferences-input': PreferencesInput;
  }
}
