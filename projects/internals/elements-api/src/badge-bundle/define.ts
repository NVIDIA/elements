import { define } from '@nvidia-elements/core/internal';
import { BadgeBundle } from './badge-bundle.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/tooltip/define.js';

define(BadgeBundle);

declare global {
  interface HTMLElementTagNameMap {
    'nve-api-badge-bundle': BadgeBundle;
  }
}
