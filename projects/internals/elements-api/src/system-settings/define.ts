import { define } from '@nvidia-elements/core/internal';
import { SystemSettings } from './system-settings.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/switch/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/icon-button/define.js';

define(SystemSettings);

declare global {
  interface HTMLElementTagNameMap {
    'nve-api-system-settings': SystemSettings;
  }
}
