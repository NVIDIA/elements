import { define } from '@nvidia-elements/core/internal';
import { BadgeAxe } from './badge-axe.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/badge/define.js';

define(BadgeAxe);

declare global {
  interface HTMLElementTagNameMap {
    'nve-api-badge-axe': BadgeAxe;
  }
}
